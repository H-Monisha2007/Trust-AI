import React from 'react';
import { Shield, LayoutDashboard, PlusCircle, FileText, History, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    apiConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, apiConnected }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'new-audit', label: 'New Audit', icon: PlusCircle },
        { id: 'results', label: 'Audit Results', icon: FileText },
        { id: 'history', label: 'Audit History', icon: History },
        { id: 'reports', label: 'Reports', icon: Activity },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none">
            <div>
                {/* Logo & Header */}
                <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="font-mono text-base font-bold text-slate-100 tracking-wider">TRUST-AI</h1>
                        <p className="text-xs text-slate-400 font-medium">AI Decision Auditor</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 font-semibold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-purple-400' : 'text-slate-400'} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom System Status */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
                    System Status
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                            <Database size={13} className="text-slate-400" />
                            API Status
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium ${apiConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                            {apiConnected ? 'Connected' : 'Offline'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                            <Activity size={13} className="text-slate-400" />
                            Audit Engine
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-purple-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            Active
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
