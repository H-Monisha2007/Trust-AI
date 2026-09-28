import React from 'react';
import { OverviewStats, AuditRecord } from '../types/audit';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { FileCheck, Shield, Download, BarChart2, PieChart as PieIcon } from 'lucide-react';

interface ReportsPageProps {
    stats: OverviewStats | null;
    history: AuditRecord[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ stats, history }) => {
    const pieData = [
        { name: 'Trusted', value: stats?.trusted_decisions ?? 0, color: '#10b981' },
        { name: 'Review Required', value: stats?.review_required ?? 0, color: '#f59e0b' },
        { name: 'Unsafe', value: stats?.unsafe_decisions ?? 0, color: '#ef4444' },
    ];

    const barData = history.slice(0, 7).map((item) => ({
        name: item.id.replace('AUD-2026-', '#'),
        score: Math.round(item.decision_score * 100),
        confidence: Math.round(item.model_confidence * 100),
    }));

    const handleExportCSV = () => {
        const headers = 'ID,Timestamp,Model,UseCase,Prediction,Confidence,TrustDecision,DecisionScore\n';
        const rows = history
            .map(
                (a) =>
                    `"${a.id}","${a.timestamp}","${a.model_name}","${a.use_case}","${a.prediction}",${a.model_confidence},"${a.trust_decision}",${a.decision_score}`
            )
            .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trust-ai-governance-report-${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 tracking-tight">AI Governance & Compliance Reports</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Aggregate trust analytics and audit distributions for compliance verification.
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold font-mono transition-colors shadow-lg shadow-purple-950/40"
                >
                    <Download size={14} />
                    <span>Export Audit Log (CSV)</span>
                </button>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Decision Breakdown Pie Chart */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <PieIcon size={14} className="text-purple-400" />
                            Trust Decision Distribution
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500">All Evaluations</span>
                    </div>

                    <div className="h-56 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc', fontSize: '12px', fontFamily: 'monospace' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 pt-2">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-300 font-mono">
                                    {item.name}: <strong className="text-slate-100">{item.value}</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Model Confidence vs Decision Score Bar Chart */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <BarChart2 size={14} className="text-purple-400" />
                            Recent Audits Score Trends
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500">Score vs Confidence</span>
                    </div>

                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc', fontSize: '12px', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="TRUST Score" />
                                <Bar dataKey="confidence" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Confidence %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            <span className="text-xs text-slate-300 font-mono">TRUST-AI Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-xs text-slate-300 font-mono">Model Confidence</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Summary Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Compliance Matrix & Risk Register
                </h3>
                <p className="text-xs text-slate-400">
                    Evaluated according to EU AI Act Risk Tiering & NIST AI Risk Management Framework standards.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Audit Standard</span>
                        <div className="text-xs font-semibold text-slate-200">ISO/IEC 42001 & NIST AI RMF</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Verification Engine</span>
                        <div className="text-xs font-semibold text-slate-200">TRUST-AI Heuristic V1.0</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Storage Integrity</span>
                        <div className="text-xs font-semibold text-slate-200">SQLite Prototype Database</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
