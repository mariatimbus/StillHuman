import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlight' | 'rose' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'teal' | 'cyan';
    hoverEffect?: boolean;
}

export function GlassCard({
    children,
    className = '',
    variant = 'default',
    hoverEffect = false,
    ...props
}: GlassCardProps) {
    const baseStyles =
        'relative overflow-hidden rounded-2xl border transition-all duration-500';

    const variants = {
        default:
            'bg-[#F8F4EC] border-hot-pink/50 shadow-[0_8px_32px_rgba(232,60,145,0.15),0_2px_8px_rgba(232,60,145,0.08)]',
        highlight:
            'bg-gradient-to-br from-[#FF8FB7]/70 to-[#FF8FB7]/50 border-hot-pink/60 shadow-[0_8px_32px_rgba(232,60,145,0.2),0_2px_8px_rgba(232,60,145,0.1)]',
        rose: 'bg-gradient-to-br from-rose-200/80 to-rose-100/50 border-rose-300/50 shadow-[0_8px_32px_rgba(244,63,94,0.15),0_2px_8px_rgba(244,63,94,0.08)]',
        blue: 'bg-gradient-to-br from-sky-200/80 to-sky-100/50 border-sky-300/50 shadow-[0_8px_32px_rgba(14,165,233,0.15),0_2px_8px_rgba(14,165,233,0.08)]',
        green: 'bg-gradient-to-br from-emerald-200/80 to-emerald-100/50 border-emerald-300/50 shadow-[0_8px_32px_rgba(16,185,129,0.15),0_2px_8px_rgba(16,185,129,0.08)]',
        yellow: 'bg-gradient-to-br from-amber-200/80 to-amber-100/50 border-amber-300/50 shadow-[0_8px_32px_rgba(245,158,11,0.15),0_2px_8px_rgba(245,158,11,0.08)]',
        purple: 'bg-gradient-to-br from-violet-200/80 to-violet-100/50 border-violet-300/50 shadow-[0_8px_32px_rgba(139,92,246,0.15),0_2px_8px_rgba(139,92,246,0.08)]',
        orange: 'bg-gradient-to-br from-orange-200/80 to-orange-100/50 border-orange-300/50 shadow-[0_8px_32px_rgba(249,115,22,0.15),0_2px_8px_rgba(249,115,22,0.08)]',
        teal: 'bg-gradient-to-br from-teal-200/80 to-teal-100/50 border-teal-300/50 shadow-[0_8px_32px_rgba(20,184,166,0.15),0_2px_8px_rgba(20,184,166,0.08)]',
        cyan: 'bg-gradient-to-br from-cyan-200/80 to-cyan-100/50 border-cyan-300/50 shadow-[0_8px_32px_rgba(6,182,212,0.15),0_2px_8px_rgba(6,182,212,0.08)]',
    };

    const hoverStyles = hoverEffect
        ? 'hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] hover:scale-[1.02]'
        : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {/* Decorative corner accent - top left */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />

            {/* Decorative corner accent - bottom right */}
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />

            {/* Inner glow border */}
            <div className="absolute inset-[1px] rounded-2xl border border-white/10 pointer-events-none" />

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-2xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
