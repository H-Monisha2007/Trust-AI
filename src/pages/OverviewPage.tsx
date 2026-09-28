import React from 'react';
import { AuditRecord, OverviewStats } from '../types/audit';
import { TrustBadge } from '../components/TrustBadge';
import { AuditPipeline } from '../components/AuditPipeline';
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight, ShieldAlert, FileText, Database } from 'lucide-react';

interface OverviewPageProps {
    stats: OverviewStats | null;
    latestAudit: AuditRecord | null;
    onViewDetails: (audit: AuditRecord) => void;
    onNavigateNewAudit: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
    stats,
    latestAudit,
    onViewDetails,
    onNavigateNewAudit,
}) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                        Trustworthy AI Decision Auditor
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Evaluate whether an AI prediction is reliable enough to trust.
                    </p>
                </div>
                <button
                    onClick={onNavigateNewAudit}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-950/40"
                >
                    <span>Run New Audit</span>
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Audits Today */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Audits Today</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-slate-100">{stats?.audits_today ?? 0}</span>
                        <span className="text-xs font-mono text-blue-400">Total Evaluations</span>
                    </div>
                </div>

                {/* Trusted Decisions */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Trusted Decisions</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-emerald-400">{stats?.trusted_decisions ?? 0}</span>
                        <span className="text-xs font-mono text-emerald-500/90">{stats?.trust_rate ?? 0}% Rate</span>
                    </div>
                </div>

                {/* Review Required */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Review Required</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-amber-400">{stats?.review_required ?? 0}</span>
                        <span className="text-xs font-mono text-slate-400">Human Intervention</span>
                    </div>
                </div>

                {/* Unsafe Decisions */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Unsafe Decisions</span>
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertOctagon size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-rose-400">{stats?.unsafe_decisions ?? 0}</span>
                        <span className="text-xs font-mono text-rose-500/90">Blocked / Rejected</span>
                    </div>
                </div>
            </div>

            {/* Audit Pipeline Component */}
            <AuditPipeline
                breakdown={latestAudit?.pipeline_breakdown}
                trustDecision={latestAudit?.trust_decision ?? 'TRUST'}
            />

            {/* Main Section: Latest Audit */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-purple-400 border border-slate-700">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                                Latest Audit Case
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                                    {latestAudit?.id ?? 'AUD-2026-9042'}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                {latestAudit?.model_name} • {latestAudit?.use_case}
                            </p>
                        </div>
                    </div>
                    {latestAudit && (
                        <button
                            onClick={() => onViewDetails(latestAudit)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <span>View Detailed Audit Report</span>
                            <ArrowRight size={14} />
                        </button>
                    )}
                </div>

                {latestAudit ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Prediction Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Prediction Target
                            </span>
                            <div className="text-sm font-semibold text-slate-100">
                                {latestAudit.prediction}
                            </div>
                        </div>

                        {/* Model Confidence Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                    Model Confidence
                                </span>
                                <span className="text-xs font-mono font-semibold text-blue-400">
                                    {Math.round(latestAudit.model_confidence * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                                <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{ width: `${latestAudit.model_confidence * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Trust Decision Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Trust Decision
                            </span>
                            <div className="pt-0.5">
                                <TrustBadge decision={latestAudit.trust_decision} size="md" />
                            </div>
                        </div>

                        {/* Data Quality Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                    Data Quality
                                </span>
                                <span className="text-xs font-mono font-semibold text-emerald-400">
                                    {Math.round(latestAudit.data_quality_score * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                                <div
                                    className="bg-emerald-500 h-full rounded-full"
                                    style={{ width: `${latestAudit.data_quality_score * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* OOD Status Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                OOD Status
                            </span>
                            <div className="text-xs font-mono font-semibold mt-1">
                                <span
                                    className={
                                        latestAudit.ood_status === 'IN_DISTRIBUTION'
                                            ? 'text-emerald-400'
                                            : latestAudit.ood_status === 'MODERATE_SHIFT'
                                                ? 'text-amber-400'
                                                : 'text-rose-400'
                                    }
                                >
                                    {latestAudit.ood_status}
                                </span>
                                <span className="text-slate-400 font-normal ml-2">
                                    (Score: {latestAudit.ood_score})
                                </span>
                            </div>
                        </div>

                        {/* Safety Risk Card */}
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                Safety Risk
                            </span>
                            <div className="text-xs font-mono font-semibold mt-1">
                                <span
                                    className={
                                        latestAudit.safety_risk_level === 'LOW'
                                            ? 'text-emerald-400'
                                            : latestAudit.safety_risk_level === 'MEDIUM'
                                                ? 'text-amber-400'
                                                : 'text-rose-400'
                                    }
                                >
                                    {latestAudit.safety_risk_level} RISK
                                </span>
                                <span className="text-slate-400 font-normal ml-2">
                                    ({Math.round(latestAudit.safety_score * 100)}% Index)
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400">Loading latest audit details...</div>
                )}
            </div>
        </div>
    );
};
