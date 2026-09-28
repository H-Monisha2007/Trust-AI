import { AuditRecord, OverviewStats, NewAuditPayload } from '../types/audit';

const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchSystemHealth = async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
};

export const fetchOverviewStats = async (): Promise<OverviewStats> => {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

export const fetchLatestAudit = async (): Promise<AuditRecord> => {
    const res = await fetch(`${API_BASE}/audits/latest`);
    if (!res.ok) throw new Error('Failed to fetch latest audit');
    return res.json();
};

export const fetchAuditHistory = async (decisionFilter?: string): Promise<AuditRecord[]> => {
    const url = decisionFilter ? `${API_BASE}/audits?decision=${encodeURIComponent(decisionFilter)}` : `${API_BASE}/audits`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audits');
    return res.json();
};

export const fetchAuditById = async (id: string): Promise<AuditRecord> => {
    const res = await fetch(`${API_BASE}/audits/${id}`);
    if (!res.ok) throw new Error('Failed to fetch audit details');
    return res.json();
};

/** Legacy JSON-body audit (backward compat) */
export const runNewAudit = async (payload: NewAuditPayload): Promise<AuditRecord> => {
    const res = await fetch(`${API_BASE}/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to execute audit');
    return res.json();
};

/** New multipart audit with file upload support */
export const runAuditWithFile = async (
    payload: {
        model_name: string;
        model_type: string;
        prediction: string;
        confidence: number;
        use_case: string;
        audit_mode: string;
        model_evidence: string;
        input_features: Record<string, any>;
    },
    file?: File | null
): Promise<AuditRecord> => {
    const formData = new FormData();
    formData.append('model_name', payload.model_name);
    formData.append('model_type', payload.model_type);
    formData.append('prediction', payload.prediction);
    formData.append('confidence', String(payload.confidence));
    formData.append('use_case', payload.use_case);
    formData.append('audit_mode', payload.audit_mode);
    formData.append('model_evidence', payload.model_evidence);
    formData.append('input_features_json', JSON.stringify(payload.input_features));

    if (file) {
        formData.append('file', file);
    }

    const res = await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || 'Failed to execute audit');
    }
    return res.json();
};
