import React, { useState, useEffect } from 'react';
import { AuditRecord } from '../types/audit';
import { fetchAuditHistory } from '../services/api';
import { TrustBadge } from '../components/TrustBadge';
import { Filter, ArrowRight, RefreshCw, Search } from 'lucide-react';

interface AuditHistoryPageProps {
    onSelectAudit: (audit: AuditRecord) => void;
}

export const AuditHistoryPage: React.FC<AuditHistoryPageProps> = ({ onSelectAudit }) => {
    const [audits, setAudits] = useState<AuditRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDecision, setFilterDecision] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const loadHistory = async () => {
        setLoading(true);
        try {
            const filter = filterDecision === 'ALL' ? undefined : filterDecision;
            const data = await fetchAuditHistory(filter);
            setAudits(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [filterDecision]);

    const filteredAudits = audits.filter(
        (item) =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.use_case.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.prediction.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 tracking-tight">Audit Log History</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Historical registry of all model prediction evaluations stored in SQLite database.
                    </p>
                </div>
                <button
                    onClick={loadHistory}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Database</span>
                </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                {/* Decision Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {['ALL', 'TRUST', 'REVIEW REQUIRED', 'UNSAFE'].map((decision) => (
                        <button
                            key={decision}
                            onClick={() => setFilterDecision(decision)}
                            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${filterDecision === decision
                                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {decision}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by ID, model, prediction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                    />
                </div>
            </div>

            {/* Audit History Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 font-mono text-xs">
                        Querying audit history from database...
                    </div>
                ) : filteredAudits.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No audit records matching criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Audit ID</th>
                                    <th className="py-3 px-4">Timestamp</th>
                                    <th className="py-3 px-4">Model & Use Case</th>
                                    <th className="py-3 px-4">Prediction</th>
                                    <th className="py-3 px-4">Confidence</th>
                                    <th className="py-3 px-4">Trust Decision</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                                {filteredAudits.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onSelectAudit(item)}
                                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                                    >
                                        <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                                            {item.id}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-200">{item.model_name}</div>
                                            <div className="text-[11px] text-slate-400">{item.use_case}</div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-200">{item.prediction}</td>
                                        <td className="py-3 px-4 font-mono text-blue-400 font-medium">
                                            {Math.round(item.model_confidence * 100)}%
                                        </td>
                                        <td className="py-3 px-4">
                                            <TrustBadge decision={item.trust_decision} size="sm" />
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="inline-flex items-center text-purple-400 hover:text-purple-300 font-mono text-[11px]">
                                                Inspect <ArrowRight size={12} className="ml-1" />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
