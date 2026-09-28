import React from 'react';
import { PipelineBreakdown, TrustBadge as BadgeType } from '../types/audit';
import { ArrowRight, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface AuditPipelineProps {
    breakdown?: PipelineBreakdown;
    trustDecision: 'TRUST' | 'REVIEW REQUIRED' | 'UNSAFE';
}

export const AuditPipeline: React.FC<AuditPipelineProps> = ({ breakdown, trustDecision }) => {
    const steps = [
        { key: 'pred', name: 'AI Prediction', score: null, icon: 'bot' },
        { key: 'conf', name: 'Confidence', check: breakdown?.confidence_check },
        { key: 'dq', name: 'Data Quality', check: breakdown?.data_quality_check },
        { key: 'ood', name: 'OOD Check', check: breakdown?.ood_check },
        { key: 'exp', name: 'Explainability', check: breakdown?.explainability_check },
        { key: 'safe', name: 'Safety Audit', check: breakdown?.safety_check },
        { key: 'decision', name: 'Trust Decision', isFinal: true },
    ];

    const getStatusIcon = (passed?: boolean) => {
        if (passed === undefined) return null;
        return passed ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
            <AlertCircle size={14} className="text-amber-400" />
        );
    };

    return (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Audit Decision Pipeline Flow
                </h4>
                <span className="text-[11px] font-mono text-slate-500">5-Stage Evaluation Matrix</span>
            </div>

            {/* Horizontal Pipeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;

                    if (step.key === 'pred') {
                        return (
                            <React.Fragment key={step.key}>
                                <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 flex flex-col justify-center items-center text-center">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase">Input Node</span>
                                    <span className="text-xs font-medium text-slate-200 mt-1">AI Prediction</span>
                                </div>
                                <div className="hidden md:flex justify-center text-slate-600">
                                    <ArrowRight size={14} />
                                </div>
                            </React.Fragment>
                        );
                    }

                    if (step.isFinal) {
                        return (
                            <div key={step.key} className="bg-slate-850 border border-purple-500/20 rounded-lg p-2.5 flex flex-col justify-center items-center text-center">
                                <span className="text-[10px] font-mono text-purple-400 uppercase">Final Output</span>
                                <span className="text-xs font-semibold text-slate-100 mt-1">{trustDecision}</span>
                            </div>
                        );
                    }

                    return (
                        <React.Fragment key={step.key}>
                            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                                    <span>{step.name}</span>
                                    {getStatusIcon(step.check?.passed)}
                                </div>
                                <div className="mt-1.5 flex items-baseline justify-between">
                                    <span className="text-xs font-mono font-bold text-slate-100">
                                        {step.check ? `${Math.round(step.check.score * 100)}%` : '--'}
                                    </span>
                                    <span className={`text-[10px] font-mono ${step.check?.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {step.check?.passed ? 'PASS' : 'FLAG'}
                                    </span>
                                </div>
                            </div>
                            {!isLast && (
                                <div className="hidden md:flex justify-center text-slate-600">
                                    <ArrowRight size={14} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
