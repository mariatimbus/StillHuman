import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlight' | 'rose' | 'lavender' | 'blush' | 'plum' | 'cream' | 'peach';
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
        rose: 'bg-gradient-to-br from-[#FF8FB7]/40 to-[#FF8FB7]/20 border-hot-pink/30 shadow-[0_8px_32px_rgba(232,60,145,0.15),0_2px_8px_rgba(232,60,145,0.08)]',
        lavender: 'bg-gradient-to-br from-[#E7DDF5]/80 to-[#F3F0FF]/60 border-[#E7DDF5] shadow-[0_8px_32px_rgba(139,126,200,0.15),0_2px_8px_rgba(139,126,200,0.08)]',
        blush: 'bg-gradient-to-br from-[#FFF7FB] to-[#FFE5F0] border-[#FF8FB7]/30 shadow-[0_8px_32px_rgba(255,143,183,0.15),0_2px_8px_rgba(255,143,183,0.08)]',
        plum: 'bg-gradient-to-br from-[#43334C]/10 to-[#43334C]/5 border-[#43334C]/20 shadow-[0_8px_32px_rgba(67,51,76,0.15),0_2px_8px_rgba(67,51,76,0.08)]',
        cream: 'bg-gradient-to-br from-[#F8F4EC] to-[#FFF9F0] border-[#E7DDF5]/50 shadow-[0_8px_32px_rgba(232,60,145,0.1),0_2px_8px_rgba(232,60,145,0.05)]',
        peach: 'bg-gradient-to-br from-[#FFC857]/20 to-[#FFC857]/10 border-[#FFC857]/30 shadow-[0_8px_32px_rgba(255,200,87,0.15),0_2px_8px_rgba(255,200,87,0.08)]',
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
