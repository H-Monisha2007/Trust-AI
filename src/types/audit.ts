export interface AuditPipelineStep {
    passed: boolean;
    score: number;
    detail: string;
}

export interface PipelineBreakdown {
    confidence_check: AuditPipelineStep;
    data_quality_check: AuditPipelineStep;
    ood_check: AuditPipelineStep;
    explainability_check: AuditPipelineStep;
    safety_check: AuditPipelineStep;
}

export interface EvidenceSummary {
    strengths: string[];
    concerns: string[];
}

export interface AuditRecord {
    id: string;
    timestamp: string;
    model_name: string;
    model_type: string;
    use_case: string;
    prediction: string;
    model_confidence: number;
    trust_decision: 'TRUST' | 'REVIEW REQUIRED' | 'UNSAFE';
    decision_score: number;
    data_quality_score: number;
    ood_status: 'IN_DISTRIBUTION' | 'MODERATE_SHIFT' | 'OUT_OF_BOUNDS';
    ood_score: number;
    safety_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    safety_score: number;
    explainability_score: number;
    input_features: Record<string, any>;
    evidence_summary: EvidenceSummary;
    pipeline_breakdown: PipelineBreakdown;
    audit_mode: string;
    findings: string[];
    recommendation: string;
}

export interface OverviewStats {
    audits_today: number;
    trusted_decisions: number;
    review_required: number;
    unsafe_decisions: number;
    trust_rate: number;
}

export interface NewAuditPayload {
    model_name: string;
    model_type: string;
    use_case: string;
    prediction: string;
    model_confidence: number;
    input_features: Record<string, any>;
    audit_mode: string;
    model_evidence?: string;
}

export type ModelType = 'Image Classification' | 'NLP Classification' | 'Tabular Prediction' | 'Other';
export type AuditMode = 'standard' | 'safety-critical';
