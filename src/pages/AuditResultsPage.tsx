import React from 'react';
import { AuditRecord } from '../types/audit';
import { TrustBadge } from '../components/TrustBadge';
import { AuditPipeline } from '../components/AuditPipeline';
import { Shield, CheckCircle2, AlertTriangle, FileCode, Check, Crosshair, HelpCircle, Activity, ArrowLeft } from 'lucide-react';

interface AuditResultsPageProps {
    audit: AuditRecord | null;
    onBackToHistory?: () => void;
}

export const AuditResultsPage: React.FC<AuditResultsPageProps> = ({ audit, onBackToHistory }) => {
    if (!audit) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3 max-w-xl mx-auto my-12">
                <Shield size={40} className="mx-auto text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-200">No Audit Selected</h3>
                <p className="text-sm text-slate-400">
                    Run a new audit from the New Audit page or select a historic evaluation record from Audit History.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                    {onBackToHistory && (
                        <button
                            onClick={onBackToHistory}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight">{audit.id}</h2>
                            <span className="text-xs text-slate-400">({new Date(audit.timestamp).toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Model: <span className="text-slate-200 font-mono">{audit.model_name}</span> | Domain:{' '}
                            <span className="text-slate-200">{audit.use_case}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TrustBadge decision={audit.trust_decision} size="lg" />
                </div>
            </div>

            {/* Audit Pipeline Diagram */}
            <AuditPipeline breakdown={audit.pipeline_breakdown} trustDecision={audit.trust_decision} />

            {/* Top 3 Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Composite Decision Score */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Composite Decision Score
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-mono font-bold text-purple-400">
                            {Math.round(audit.decision_score * 100)}/100
                        </span>
                        <span className="text-xs font-mono text-slate-500">Weighted Matrix</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${audit.decision_score * 100}%` }}
                        />
                    </div>
                </div>

                {/* Prediction Confidence */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Model Confidence
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-mono font-bold text-blue-400">
                            {Math.round(audit.model_confidence * 100)}%
                        </span>
                        <span className="text-xs font-mono text-slate-500">Self-Reported</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${audit.model_confidence * 100}%` }}
                        />
                    </div>
                </div>

                {/* Explainability Index */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Explainability Index
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-mono font-bold text-cyan-400">
                            {Math.round(audit.explainability_score * 100)}%
                        </span>
                        <span className="text-xs font-mono text-slate-500">Attribution Match</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${audit.explainability_score * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Breakdown: Evidence & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Evidence Analysis (Strengths & Concerns) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                        Evidence Analysis
                    </h3>

                    {/* Strengths */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            Validated Trust Indicators ({audit.evidence_summary.strengths.length})
                        </span>
                        <ul className="space-y-1.5">
                            {audit.evidence_summary.strengths.map((str, i) => (
                                <li key={i} className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-500/20 rounded p-2 flex items-start gap-2">
                                    <span className="text-emerald-400 font-mono mt-0.5">•</span>
                                    <span>{str}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Concerns */}
                    <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle size={14} />
                            Identified Risk Factors ({audit.evidence_summary.concerns.length})
                        </span>
                        <ul className="space-y-1.5">
                            {audit.evidence_summary.concerns.map((con, i) => (
                                <li key={i} className="text-xs text-slate-300 bg-amber-950/20 border border-amber-500/20 rounded p-2 flex items-start gap-2">
                                    <span className="text-amber-400 font-mono mt-0.5">•</span>
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Input Payload & Detailed Parameters */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                        <span>Input Features Payload</span>
                        <FileCode size={14} className="text-slate-500" />
                    </h3>
                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-purple-300/90 overflow-x-auto max-h-64">
                        {JSON.stringify(audit.input_features, null, 2)}
                    </pre>

                    {/* Core Metrics Table */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Data Quality Score</span>
                            <span className="font-mono font-semibold text-slate-200">
                                {Math.round(audit.data_quality_score * 100)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">OOD Mahalanobis Status</span>
                            <span className="font-mono font-semibold text-slate-200">
                                {audit.ood_status} ({audit.ood_score})
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Safety Risk Level</span>
                            <span className="font-mono font-semibold text-slate-200">
                                {audit.safety_risk_level} ({Math.round(audit.safety_score * 100)}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
