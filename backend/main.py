import json
import os
import base64
import sqlite3
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from backend.database import get_db_connection, init_db
from backend.models import AuditRequest, AuditResponse, OverviewStats, EvidenceSummary, PipelineBreakdown
from backend.engine import evaluate_trust

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="TRUST-AI Decision Auditor API",
    description="Trustworthy AI Governance and Decision Auditing Framework",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

def _row_to_response(row) -> AuditResponse:
    """Convert a DB row dict to AuditResponse, handling both old and new schema."""
    return AuditResponse(
        id=row["id"],
        timestamp=row["timestamp"],
        model_name=row["model_name"],
        model_type=row["model_type"] if "model_type" in row.keys() else "Other",
        use_case=row["use_case"],
        prediction=row["prediction"],
        model_confidence=row["model_confidence"],
        trust_decision=row["trust_decision"],
        decision_score=row["decision_score"],
        data_quality_score=row["data_quality_score"],
        ood_status=row["ood_status"],
        ood_score=row["ood_score"],
        safety_risk_level=row["safety_risk_level"],
        safety_score=row["safety_score"],
        explainability_score=row["explainability_score"],
        input_features=json.loads(row["input_features"]),
        evidence_summary=EvidenceSummary(**json.loads(row["evidence_summary"])),
        pipeline_breakdown=PipelineBreakdown(**json.loads(row["pipeline_breakdown"])),
        audit_mode=row["audit_mode"] if "audit_mode" in row.keys() else "standard",
        findings=json.loads(row["findings"]) if "findings" in row.keys() and row["findings"] else [],
        recommendation=row["recommendation"] if "recommendation" in row.keys() else ""
    )

def _save_audit(result: AuditResponse):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO audit_logs (
            id, timestamp, model_name, model_type, use_case, prediction, model_confidence,
            trust_decision, decision_score, data_quality_score, ood_status, ood_score,
            safety_risk_level, safety_score, explainability_score, input_features,
            evidence_summary, pipeline_breakdown, audit_mode, findings, recommendation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        result.id, result.timestamp, result.model_name, result.model_type,
        result.use_case, result.prediction,
        result.model_confidence, result.trust_decision, result.decision_score,
        result.data_quality_score, result.ood_status, result.ood_score,
        result.safety_risk_level, result.safety_score, result.explainability_score,
        json.dumps(result.input_features),
        json.dumps(result.evidence_summary.dict()),
        json.dumps(result.pipeline_breakdown.dict()),
        result.audit_mode,
        json.dumps(result.findings),
        result.recommendation
    ))
    conn.commit()
    conn.close()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "TRUST-AI Audit Engine",
        "api_connected": True,
        "engine_active": True,
        "version": "1.0.0"
    }

@app.get("/api/stats", response_model=OverviewStats)
def get_overview_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM audit_logs")
    total = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as trusted FROM audit_logs WHERE trust_decision = 'TRUST'")
    trusted = cursor.fetchone()["trusted"]
    
    cursor.execute("SELECT COUNT(*) as review FROM audit_logs WHERE trust_decision = 'REVIEW REQUIRED'")
    review = cursor.fetchone()["review"]
    
    cursor.execute("SELECT COUNT(*) as unsafe FROM audit_logs WHERE trust_decision = 'UNSAFE'")
    unsafe = cursor.fetchone()["unsafe"]
    
    conn.close()
    
    trust_rate = round((trusted / total * 100), 1) if total > 0 else 0.0
    
    return OverviewStats(
        audits_today=total,
        trusted_decisions=trusted,
        review_required=review,
        unsafe_decisions=unsafe,
        trust_rate=trust_rate
    )

@app.get("/api/audits", response_model=List[AuditResponse])
def list_audits(
    decision: Optional[str] = Query(None, description="Filter by TRUST, REVIEW REQUIRED, or UNSAFE"),
    limit: int = Query(20, ge=1, le=100)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if decision:
        cursor.execute("SELECT * FROM audit_logs WHERE trust_decision = ? ORDER BY timestamp DESC LIMIT ?", (decision, limit))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
        
    rows = cursor.fetchall()
    conn.close()
    return [_row_to_response(row) for row in rows]

@app.get("/api/audits/latest", response_model=AuditResponse)
def get_latest_audit():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="No audits found")
    return _row_to_response(row)

@app.get("/api/audits/{audit_id}", response_model=AuditResponse)
def get_audit_by_id(audit_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs WHERE id = ?", (audit_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"Audit with ID {audit_id} not found")
    return _row_to_response(row)


# ─── Legacy endpoint (backward-compatible) ──────────────────────
@app.post("/api/audits", response_model=AuditResponse)
def create_audit_legacy(request: AuditRequest):
    result = evaluate_trust(request)
    _save_audit(result)
    return result


# ─── New primary audit endpoint with file upload support ────────
@app.post("/api/audit", response_model=AuditResponse)
async def run_audit(
    model_name: str = Form(...),
    model_type: str = Form("Other"),
    prediction: str = Form(...),
    confidence: float = Form(...),
    use_case: str = Form(""),
    audit_mode: str = Form("standard"),
    model_evidence: str = Form(""),
    input_features_json: str = Form("{}"),
    file: Optional[UploadFile] = File(None)
):
    # Process uploaded file if present
    uploaded_file_info = None
    if file and file.filename:
        file_bytes = await file.read()
        uploaded_file_info = {
            "name": file.filename,
            "size": len(file_bytes),
            "type": file.content_type or "unknown",
        }
        # Save file for audit trail
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as f:
            f.write(file_bytes)

    # Parse input features
    try:
        input_features = json.loads(input_features_json) if input_features_json else {}
    except json.JSONDecodeError:
        input_features = {}

    # Build audit request
    use_case_resolved = use_case if use_case else model_type
    request = AuditRequest(
        model_name=model_name,
        model_type=model_type,
        use_case=use_case_resolved,
        prediction=prediction,
        model_confidence=confidence,
        input_features=input_features,
        audit_mode=audit_mode,
        uploaded_file_info=uploaded_file_info,
        model_evidence=model_evidence if model_evidence else None
    )

    result = evaluate_trust(request)
    _save_audit(result)
    return result
