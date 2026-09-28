import sqlite3
import json
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "trust_ai.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            model_name TEXT NOT NULL,
            model_type TEXT NOT NULL DEFAULT 'Other',
            use_case TEXT NOT NULL,
            prediction TEXT NOT NULL,
            model_confidence REAL NOT NULL,
            trust_decision TEXT NOT NULL,
            decision_score REAL NOT NULL,
            data_quality_score REAL NOT NULL,
            ood_status TEXT NOT NULL,
            ood_score REAL NOT NULL,
            safety_risk_level TEXT NOT NULL,
            safety_score REAL NOT NULL,
            explainability_score REAL NOT NULL,
            input_features TEXT NOT NULL,
            evidence_summary TEXT NOT NULL,
            pipeline_breakdown TEXT NOT NULL,
            audit_mode TEXT NOT NULL DEFAULT 'standard',
            findings TEXT NOT NULL DEFAULT '[]',
            recommendation TEXT NOT NULL DEFAULT ''
        )
    ''')

    # Migrate: add columns if they don't exist (for existing DBs)
    try:
        cursor.execute("ALTER TABLE audit_logs ADD COLUMN model_type TEXT NOT NULL DEFAULT 'Other'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE audit_logs ADD COLUMN audit_mode TEXT NOT NULL DEFAULT 'standard'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE audit_logs ADD COLUMN findings TEXT NOT NULL DEFAULT '[]'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE audit_logs ADD COLUMN recommendation TEXT NOT NULL DEFAULT ''")
    except sqlite3.OperationalError:
        pass
    
    # Check if empty, populate demo data if so
    cursor.execute("SELECT COUNT(*) as count FROM audit_logs")
    row = cursor.fetchone()
    if row["count"] == 0:
        seed_demo_data(cursor)
        
    conn.commit()
    conn.close()

def seed_demo_data(cursor):
    demo_audits = [
        {
            "id": "AUD-2026-9042",
            "timestamp": "2026-09-27T15:10:00Z",
            "model_name": "CreditRisk-v4.2",
            "model_type": "Tabular Prediction",
            "use_case": "Loan Application Approval",
            "prediction": "APPROVED ($45,000 Loan)",
            "model_confidence": 0.94,
            "trust_decision": "TRUST",
            "decision_score": 0.92,
            "data_quality_score": 0.98,
            "ood_status": "IN_DISTRIBUTION",
            "ood_score": 0.04,
            "safety_risk_level": "LOW",
            "safety_score": 0.96,
            "explainability_score": 0.89,
            "input_features": json.dumps({"credit_score": 760, "annual_income": 95000, "dti_ratio": 0.22, "employment_years": 6}),
            "evidence_summary": json.dumps({
                "strengths": ["Data within standard bounds", "High Shapley value alignment", "Low anomaly index"],
                "concerns": []
            }),
            "pipeline_breakdown": json.dumps({
                "confidence_check": {"passed": True, "score": 0.94, "detail": "Confidence above 85% threshold"},
                "data_quality_check": {"passed": True, "score": 0.98, "detail": "0 missing values, perfect schema match"},
                "ood_check": {"passed": True, "score": 0.96, "detail": "Distance score 0.04 from centroid"},
                "explainability_check": {"passed": True, "score": 0.89, "detail": "Top feature income accounts for 42%"},
                "safety_check": {"passed": True, "score": 0.96, "detail": "No demographic bias flagged"}
            }),
            "audit_mode": "standard",
            "findings": json.dumps([
                "Model self-reported confidence is exceptionally high at 94%.",
                "Distribution analysis confirms input is within the model's expected feature space.",
                "No governance policy violations detected."
            ]),
            "recommendation": "The CreditRisk-v4.2 prediction of 'APPROVED ($45,000 Loan)' has passed all five audit stages with a composite trust score of 92/100. This prediction is cleared for automated consumption under current governance policy."
        },
        {
            "id": "AUD-2026-9041",
            "timestamp": "2026-09-27T14:45:00Z",
            "model_name": "MedDiag-Radiology-v2",
            "model_type": "Image Classification",
            "use_case": "Chest X-Ray Anomaly Detection",
            "prediction": "PNEUMONIA DETECTED (High Risk)",
            "model_confidence": 0.78,
            "trust_decision": "REVIEW REQUIRED",
            "decision_score": 0.65,
            "data_quality_score": 0.82,
            "ood_status": "MODERATE_SHIFT",
            "ood_score": 0.42,
            "safety_risk_level": "MEDIUM",
            "safety_score": 0.68,
            "explainability_score": 0.58,
            "input_features": json.dumps({"image_resolution": "1024x1024", "scanner_model": "Siemens-Health-3", "patient_age": 72}),
            "evidence_summary": json.dumps({
                "strengths": ["Model confidence meets minimum threshold"],
                "concerns": ["Scanner artifacts detected in image periphery", "Model saliency map highlights edge noise"]
            }),
            "pipeline_breakdown": json.dumps({
                "confidence_check": {"passed": True, "score": 0.78, "detail": "Confidence meets 75% baseline"},
                "data_quality_check": {"passed": True, "score": 0.82, "detail": "Subtle contrast compression observed"},
                "ood_check": {"passed": False, "score": 0.58, "detail": "Moderate deviation in sensor profile"},
                "explainability_check": {"passed": False, "score": 0.58, "detail": "Heatmap overlap low on lesion region"},
                "safety_check": {"passed": True, "score": 0.68, "detail": "High-stakes domain triggers clinician review"}
            }),
            "audit_mode": "safety-critical",
            "findings": json.dumps([
                "Model confidence at 78% passes minimum audit threshold.",
                "Covariate shift detected — input deviates moderately from training distribution.",
                "Feature attribution analysis shows instability. Decision rationale cannot be reliably traced.",
                "AUDIT MODE: Safety-Critical — stricter thresholds and elevated safety weighting applied."
            ]),
            "recommendation": "The prediction requires human review before action. Flagged areas: distribution analysis, explainability. Composite trust score: 65/100."
        },
        {
            "id": "AUD-2026-9040",
            "timestamp": "2026-09-27T13:20:00Z",
            "model_name": "FraudSentinel-v1",
            "model_type": "Tabular Prediction",
            "use_case": "High-Value Wire Transfer Audit",
            "prediction": "LEGITIMATE TRANSACTION",
            "model_confidence": 0.62,
            "trust_decision": "UNSAFE",
            "decision_score": 0.31,
            "data_quality_score": 0.45,
            "ood_status": "OUT_OF_BOUNDS",
            "ood_score": 0.88,
            "safety_risk_level": "CRITICAL",
            "safety_score": 0.25,
            "explainability_score": 0.35,
            "input_features": json.dumps({"amount": 480000, "source_country": "UNKNOWN_PROXY", "time_delta_sec": 2}),
            "evidence_summary": json.dumps({
                "strengths": [],
                "concerns": ["Severe out-of-distribution feature values", "Missing origin metadata", "Adversarial pattern risk flagged"]
            }),
            "pipeline_breakdown": json.dumps({
                "confidence_check": {"passed": False, "score": 0.62, "detail": "Low confidence for $400k+ transaction"},
                "data_quality_check": {"passed": False, "score": 0.45, "detail": "Source IP geofence missing"},
                "ood_check": {"passed": False, "score": 0.12, "detail": "Extreme outlier Mahalanobis distance"},
                "explainability_check": {"passed": False, "score": 0.35, "detail": "Unstable feature attribution values"},
                "safety_check": {"passed": False, "score": 0.25, "detail": "Violates AML compliance policy standard"}
            }),
            "audit_mode": "safety-critical",
            "findings": json.dumps([
                "ALERT: Model confidence of 62% is below the 75% reliability baseline.",
                "WARNING: Input data quality score 45% indicates potential corruption or missing features.",
                "CRITICAL: Input is far outside the model's training distribution.",
                "BLOCKED: Safety score 25% violates minimum governance threshold. Human review mandatory."
            ]),
            "recommendation": "This prediction is NOT safe for automated use. Composite trust score: 31/100. Critical failures detected in the audit pipeline."
        },
        {
            "id": "AUD-2026-9039",
            "timestamp": "2026-09-27T11:05:00Z",
            "model_name": "RecruitAI-Screening",
            "model_type": "NLP Classification",
            "use_case": "Candidate Resume Ranking",
            "prediction": "TOP TIER RECOMMENDATION",
            "model_confidence": 0.91,
            "trust_decision": "REVIEW REQUIRED",
            "decision_score": 0.68,
            "data_quality_score": 0.95,
            "ood_status": "IN_DISTRIBUTION",
            "ood_score": 0.08,
            "safety_risk_level": "HIGH",
            "safety_score": 0.52,
            "explainability_score": 0.72,
            "input_features": json.dumps({"years_experience": 8, "education": "BS CS", "keywords_matched": 14}),
            "evidence_summary": json.dumps({
                "strengths": ["High technical skill alignment score"],
                "concerns": ["Demographic subgroup variance detected in feature weights"]
            }),
            "pipeline_breakdown": json.dumps({
                "confidence_check": {"passed": True, "score": 0.91, "detail": "Strong model score"},
                "data_quality_check": {"passed": True, "score": 0.95, "detail": "Complete resume metadata"},
                "ood_check": {"passed": True, "score": 0.92, "detail": "Standard resume feature space"},
                "explainability_check": {"passed": True, "score": 0.72, "detail": "Clear keyword attribution"},
                "safety_check": {"passed": False, "score": 0.52, "detail": "Disparate impact ratio requires audit"}
            }),
            "audit_mode": "standard",
            "findings": json.dumps([
                "Excellent model confidence (91%) exceeds governance threshold.",
                "Input vector verified within trained distribution manifold.",
                "ELEVATED RISK: Domain 'Candidate Resume Ranking' triggers enhanced safety review protocol."
            ]),
            "recommendation": "The prediction requires human review before action. Flagged areas: safety governance."
        },
        {
            "id": "AUD-2026-9038",
            "timestamp": "2026-09-27T09:30:00Z",
            "model_name": "ClaimAutomate-v3",
            "model_type": "Tabular Prediction",
            "use_case": "Auto Insurance Claim Processing",
            "prediction": "AUTO-APPROVE ($2,400 repair)",
            "model_confidence": 0.96,
            "trust_decision": "TRUST",
            "decision_score": 0.95,
            "data_quality_score": 0.99,
            "ood_status": "IN_DISTRIBUTION",
            "ood_score": 0.02,
            "safety_risk_level": "LOW",
            "safety_score": 0.98,
            "explainability_score": 0.94,
            "input_features": json.dumps({"claim_amount": 2400, "policy_age_months": 36, "prior_claims": 0}),
            "evidence_summary": json.dumps({
                "strengths": ["Standard claim tier", "100% data fidelity", "High SHAP consistency"],
                "concerns": []
            }),
            "pipeline_breakdown": json.dumps({
                "confidence_check": {"passed": True, "score": 0.96, "detail": "Optimal confidence rating"},
                "data_quality_check": {"passed": True, "score": 0.99, "detail": "Verified invoice & telemetry"},
                "ood_check": {"passed": True, "score": 0.98, "detail": "High historical density match"},
                "explainability_check": {"passed": True, "score": 0.94, "detail": "Low claim amount dominates decision"},
                "safety_check": {"passed": True, "score": 0.98, "detail": "Zero fraud indicators flagged"}
            }),
            "audit_mode": "standard",
            "findings": json.dumps([
                "Model self-reported confidence is exceptionally high at 96%.",
                "Input data integrity verified at 99% quality index.",
                "Input vector verified within trained distribution manifold.",
                "No governance policy violations detected."
            ]),
            "recommendation": "The ClaimAutomate-v3 prediction of 'AUTO-APPROVE ($2,400 repair)' has passed all five audit stages with a composite trust score of 95/100. This prediction is cleared for automated consumption under current governance policy."
        }
    ]
    
    for item in demo_audits:
        cursor.execute('''
            INSERT INTO audit_logs (
                id, timestamp, model_name, model_type, use_case, prediction, model_confidence,
                trust_decision, decision_score, data_quality_score, ood_status, ood_score,
                safety_risk_level, safety_score, explainability_score, input_features,
                evidence_summary, pipeline_breakdown, audit_mode, findings, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item["id"], item["timestamp"], item["model_name"], item["model_type"],
            item["use_case"], item["prediction"],
            item["model_confidence"], item["trust_decision"], item["decision_score"],
            item["data_quality_score"], item["ood_status"], item["ood_score"],
            item["safety_risk_level"], item["safety_score"], item["explainability_score"],
            item["input_features"], item["evidence_summary"], item["pipeline_breakdown"],
            item["audit_mode"], item["findings"], item["recommendation"]
        ))
