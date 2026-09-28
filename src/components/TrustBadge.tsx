import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface TrustBadgeProps {
    decision: 'TRUST' | 'REVIEW REQUIRED' | 'UNSAFE';
    size?: 'sm' | 'md' | 'lg';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ decision, size = 'md' }) => {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs font-mono tracking-wide',
        md: 'px-3 py-1 text-xs font-mono font-semibold tracking-wider',
        lg: 'px-4 py-1.5 text-sm font-mono font-bold tracking-wider',
    };

    const iconSizes = {
        sm: 13,
        md: 15,
        lg: 18,
    };

    if (decision === 'TRUST') {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 shadow-sm shadow-emerald-950/50 ${sizeClasses[size]}`}>
                <ShieldCheck size={iconSizes[size]} className="text-emerald-400" />
                <span>TRUST</span>
            </span>
        );
    }

    if (decision === 'REVIEW REQUIRED') {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-950/60 text-amber-400 shadow-sm shadow-amber-950/50 ${sizeClasses[size]}`}>
                <AlertTriangle size={iconSizes[size]} className="text-amber-400" />
                <span>REVIEW REQUIRED</span>
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-950/60 text-rose-400 shadow-sm shadow-rose-950/50 ${sizeClasses[size]}`}>
            <AlertOctagon size={iconSizes[size]} className="text-rose-400" />
            <span>UNSAFE</span>
        </span>
    );
};
