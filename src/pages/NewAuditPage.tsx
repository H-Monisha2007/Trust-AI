import React, { useState, useRef, useCallback } from 'react';
import { AuditRecord, ModelType, AuditMode } from '../types/audit';
import { runAuditWithFile } from '../services/api';
import {
    Play, Sparkles, AlertCircle, Code, Upload, X, Image,
    ShieldCheck, ShieldAlert, ChevronDown,
    CheckCircle2, Circle, Loader2, ArrowRight
} from 'lucide-react';

interface NewAuditPageProps {
    onAuditComplete: (result: AuditRecord) => void;
}

const MODEL_TYPES: ModelType[] = [
    'Image Classification',
    'NLP Classification',
    'Tabular Prediction',
    'Other',
];

interface PipelineStage {
    key: string;
    label: string;
    status: 'pending' | 'active' | 'done';
}

const PIPELINE_STAGES: { key: string; label: string }[] = [
    { key: 'receive', label: 'Receiving Model Output' },
    { key: 'confidence', label: 'Checking Confidence' },
    { key: 'quality', label: 'Analyzing Input Quality' },
    { key: 'distribution', label: 'Checking Distribution' },
    { key: 'evidence', label: 'Evaluating Evidence' },
    { key: 'decision', label: 'Generating Trust Decision' },
];

export const NewAuditPage: React.FC<NewAuditPageProps> = ({ onAuditComplete }) => {
    // ─── Form State ──────────────────────────────────────────────
    const [modelName, setModelName] = useState('Vision Classification Model');
    const [modelType, setModelType] = useState<ModelType>('Image Classification');
    const [useCase, setUseCase] = useState('Medical Image Diagnosis');
    const [prediction, setPrediction] = useState('PNEUMONIA DETECTED');
    const [confidence, setConfidence] = useState(0.82);
    const [auditMode, setAuditMode] = useState<AuditMode>('standard');
    const [modelEvidence, setModelEvidence] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    // ─── UI State ────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Presets ─────────────────────────────────────────────────
    const presets = [
        {
            name: 'Medical Imaging (Safety-Critical)',
            model_name: 'MedDiag-Radiology-v2',
            model_type: 'Image Classification' as ModelType,
            use_case: 'Chest X-Ray Anomaly Detection',
            prediction: 'PNEUMONIA DETECTED (High Risk)',
            confidence: 0.78,
            audit_mode: 'safety-critical' as AuditMode,
            evidence: 'Saliency map shows concentrated activation in lower-right lung region.',
        },
        {
            name: 'Credit Risk (Standard)',
            model_name: 'CreditRisk-v4.2',
            model_type: 'Tabular Prediction' as ModelType,
            use_case: 'Loan Application Approval',
            prediction: 'APPROVED ($45,000 Loan)',
            confidence: 0.94,
            audit_mode: 'standard' as AuditMode,
            evidence: '',
        },
        {
            name: 'Fraud Detection (Unsafe Scenario)',
            model_name: 'FraudSentinel-v1',
            model_type: 'Tabular Prediction' as ModelType,
            use_case: 'High-Value Wire Transfer Audit',
            prediction: 'LEGITIMATE TRANSACTION',
            confidence: 0.62,
            audit_mode: 'safety-critical' as AuditMode,
            evidence: 'Transaction amount: $480k. Source country proxy flag.',
        },
        {
            name: 'NLP Sentiment (Low Risk)',
            model_name: 'SentimentNet-v3',
            model_type: 'NLP Classification' as ModelType,
            use_case: 'Customer Feedback Analysis',
            prediction: 'POSITIVE SENTIMENT (Score: 0.91)',
            confidence: 0.91,
            audit_mode: 'standard' as AuditMode,
            evidence: 'Top tokens: "excellent", "recommend", "satisfied".',
        },
    ];

    const handlePresetSelect = (preset: typeof presets[0]) => {
        setModelName(preset.model_name);
        setModelType(preset.model_type);
        setUseCase(preset.use_case);
        setPrediction(preset.prediction);
        setConfidence(preset.confidence);
        setAuditMode(preset.audit_mode);
        setModelEvidence(preset.evidence);
        setUploadedFile(null);
        setFilePreview(null);
    };

    // ─── File Handling ───────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setUploadedFile(file);
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setUploadedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Pipeline Progress Animation ────────────────────────────
    const runPipelineAnimation = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            const stages = PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending' as const }));
            setPipelineStages(stages);

            let idx = 0;
            const tick = () => {
                if (idx >= stages.length) {
                    resolve();
                    return;
                }
                setPipelineStages((prev) =>
                    prev.map((s, i) => ({
                        ...s,
                        status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
                    }))
                );
                idx++;
                // Real-time progression: short delays since actual API call is in-flight
                setTimeout(tick, 180 + Math.random() * 120);
            };
            tick();
        });
    }, []);

    // ─── Submit Handler ──────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Start pipeline animation and API call concurrently
            const [, result] = await Promise.all([
                runPipelineAnimation(),
                runAuditWithFile(
                    {
                        model_name: modelName,
                        model_type: modelType,
                        prediction,
                        confidence,
                        use_case: useCase,
                        audit_mode: auditMode,
                        model_evidence: modelEvidence,
                        input_features: {},
                    },
                    uploadedFile
                ),
            ]);

            // Mark all stages as done
            setPipelineStages((prev) => prev.map((s) => ({ ...s, status: 'done' as const })));
            // Brief pause to show all-green before navigating
            await new Promise((r) => setTimeout(r, 400));

            onAuditComplete(result);
        } catch (err: any) {
            setError(err.message || 'Audit engine returned an error');
            setPipelineStages([]);
        } finally {
            setLoading(false);
        }
    };

    // ─── Confidence color helper ─────────────────────────────────
    const confColor =
        confidence >= 0.85
            ? 'text-emerald-400'
            : confidence >= 0.70
                ? 'text-blue-400'
                : confidence >= 0.50
                    ? 'text-amber-400'
                    : 'text-rose-400';

    // ─── Render ──────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="border-b border-slate-800 pb-5">
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                    Start New AI Audit
                </h2>
                <p className="text-slate-400 text-sm mt-1.5">
                    Submit an AI model output and evaluate its trustworthiness through the TRUST-AI 5-Stage Governance Pipeline.
                </p>
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    Quick Load Scenario Presets
                </span>
                <div className="flex flex-wrap gap-2">
                    {presets.map((p, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handlePresetSelect(p)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ AUDIT FORM ═══ */}
            <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                {error && (
                    <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono flex items-center gap-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Row 1: Model Name + Model Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                            Model Name
                        </label>
                        <input
                            type="text"
                            required
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 font-mono placeholder:text-slate-600"
                            placeholder="e.g. Vision Classification Model"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                            Model Type
                        </label>
                        <div className="relative">
                            <select
                                value={modelType}
                                onChange={(e) => setModelType(e.target.value as ModelType)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 appearance-none cursor-pointer"
                            >
                                {MODEL_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Row 2: Use Case + Prediction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                            Domain / Use Case
                        </label>
                        <input
                            type="text"
                            required
                            value={useCase}
                            onChange={(e) => setUseCase(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-600"
                            placeholder="e.g. Medical Image Diagnosis"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                            Prediction Output
                        </label>
                        <input
                            type="text"
                            required
                            value={prediction}
                            onChange={(e) => setPrediction(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-600"
                            placeholder="e.g. PNEUMONIA DETECTED"
                        />
                    </div>
                </div>

                {/* Row 3: Confidence Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                            Model Confidence
                        </label>
                        <span className={`text-sm font-mono font-bold ${confColor}`}>
                            {Math.round(confidence * 100)}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1.0"
                        step="0.01"
                        value={confidence}
                        onChange={(e) => setConfidence(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Row 4: File Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium flex items-center gap-1.5">
                        <Image size={14} className="text-purple-400" />
                        Input Data (Image Upload)
                    </label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${uploadedFile
                                ? 'border-purple-500/40 bg-purple-950/20'
                                : 'border-slate-700 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-900/50'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {uploadedFile ? (
                            <div className="flex items-center justify-center gap-4">
                                {filePreview && (
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                                    />
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-200 font-mono">{uploadedFile.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {uploadedFile.type} • {(uploadedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Upload size={24} className="mx-auto text-slate-500" />
                                <p className="text-xs text-slate-400">
                                    Click to upload an image • PNG, JPG, WEBP
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                    Optional — Used for data quality & OOD analysis
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 5: Model Evidence (optional textarea) */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium flex items-center gap-1.5">
                            <Code size={14} className="text-purple-400" />
                            Model Output / Evidence
                            <span className="text-[10px] font-normal text-slate-500 ml-1">(Optional)</span>
                        </label>
                    </div>
                    <textarea
                        rows={3}
                        value={modelEvidence}
                        onChange={(e) => setModelEvidence(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-600"
                        placeholder="Paste model logs, saliency maps description, SHAP values, or any supporting evidence..."
                    />
                </div>

                {/* Row 6: Audit Mode Toggle */}
                <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-medium">
                        Audit Mode
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setAuditMode('standard')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${auditMode === 'standard'
                                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300 shadow-md shadow-blue-950/30'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                        >
                            <ShieldCheck size={18} className={auditMode === 'standard' ? 'text-blue-400' : 'text-slate-500'} />
                            <div className="text-left">
                                <div className="font-semibold">Standard Audit</div>
                                <div className="text-[11px] font-normal opacity-70">Balanced evaluation thresholds</div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuditMode('safety-critical')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${auditMode === 'safety-critical'
                                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/30'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                        >
                            <ShieldAlert size={18} className={auditMode === 'safety-critical' ? 'text-amber-400' : 'text-slate-500'} />
                            <div className="text-left">
                                <div className="font-semibold">Safety-Critical Audit</div>
                                <div className="text-[11px] font-normal opacity-70">Elevated safety weighting & strict thresholds</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* ═══ PIPELINE PROGRESS INDICATOR ═══ */}
                {loading && pipelineStages.length > 0 && (
                    <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-purple-300 uppercase tracking-wider font-semibold">
                                Audit Pipeline Execution
                            </span>
                            <Loader2 size={16} className="text-purple-400 animate-spin" />
                        </div>
                        <div className="space-y-0">
                            {pipelineStages.map((stage, idx) => (
                                <div key={stage.key} className="flex items-stretch">
                                    {/* Connector line + icon */}
                                    <div className="flex flex-col items-center w-8 shrink-0">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stage.status === 'done'
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : stage.status === 'active'
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse'
                                                    : 'bg-slate-900 border-slate-700 text-slate-600'
                                            }`}>
                                            {stage.status === 'done' ? (
                                                <CheckCircle2 size={12} />
                                            ) : stage.status === 'active' ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Circle size={8} />
                                            )}
                                        </div>
                                        {idx < pipelineStages.length - 1 && (
                                            <div className={`w-0.5 flex-1 min-h-[16px] transition-colors duration-300 ${stage.status === 'done' ? 'bg-emerald-500/40' : 'bg-slate-800'
                                                }`} />
                                        )}
                                    </div>
                                    {/* Label */}
                                    <div className={`pb-3 pl-2 pt-0.5 text-xs font-medium transition-colors duration-300 ${stage.status === 'done'
                                            ? 'text-emerald-300'
                                            : stage.status === 'active'
                                                ? 'text-purple-300'
                                                : 'text-slate-500'
                                        }`}>
                                        {stage.label}
                                        {stage.status === 'active' && (
                                            <span className="text-[10px] text-purple-400/70 ml-2 font-mono">Processing…</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-1 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !modelName || !prediction}
                        className="inline-flex items-center gap-2.5 px-7 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/60 disabled:text-purple-400/50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-950/50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Executing Pipeline…</span>
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                <span>Run Trust Audit</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
