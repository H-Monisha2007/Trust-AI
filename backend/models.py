from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class AuditRequest(BaseModel):
    model_name: str = Field(..., example="CreditRisk-v4")
    model_type: str = Field("Other", example="Image Classification")
    use_case: str = Field(..., example="Loan Approval")
    prediction: str = Field(..., example="APPROVED")
    model_confidence: float = Field(..., ge=0.0, le=1.0, example=0.92)
    input_features: Dict[str, Any] = Field(default_factory=dict)
    custom_thresholds: Optional[Dict[str, float]] = None
    audit_mode: str = Field("standard", example="standard")  # "standard" | "safety-critical"
    uploaded_file_info: Optional[Dict[str, Any]] = None  # metadata about uploaded file
    model_evidence: Optional[str] = None  # optional free-text evidence / model output

class AuditPipelineStep(BaseModel):
    passed: bool
    score: float
    detail: str

class PipelineBreakdown(BaseModel):
    confidence_check: AuditPipelineStep
    data_quality_check: AuditPipelineStep
    ood_check: AuditPipelineStep
    explainability_check: AuditPipelineStep
    safety_check: AuditPipelineStep

class EvidenceSummary(BaseModel):
    strengths: List[str]
    concerns: List[str]

class AuditResponse(BaseModel):
    id: str
    timestamp: str
    model_name: str
    model_type: str
    use_case: str
    prediction: str
    model_confidence: float
    trust_decision: str  # "TRUST" | "REVIEW REQUIRED" | "UNSAFE"
    decision_score: float
    data_quality_score: float
    ood_status: str  # "IN_DISTRIBUTION" | "MODERATE_SHIFT" | "OUT_OF_BOUNDS"
    ood_score: float
    safety_risk_level: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    safety_score: float
    explainability_score: float
    input_features: Dict[str, Any]
    evidence_summary: EvidenceSummary
    pipeline_breakdown: PipelineBreakdown
    audit_mode: str
    findings: List[str]
    recommendation: str

class OverviewStats(BaseModel):
    audits_today: int
    trusted_decisions: int
    review_required: int
    unsafe_decisions: int
    trust_rate: float
