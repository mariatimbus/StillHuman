import React from 'react';

interface GlassButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    ...props
}: GlassButtonProps) {
    const baseStyles =
        'relative inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group active:scale-95';

    const variants = {
        primary:
            'bg-white/20 backdrop-blur-md border border-white/30 text-black hover:bg-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105',
        secondary:
            'bg-black/10 backdrop-blur-sm border border-black/10 text-black hover:bg-black/20 hover:scale-105',
        ghost: 'bg-transparent hover:bg-white/10 text-black hover:text-black hover:scale-105',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>

            {/* Shimmer effect on hover */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            )}
        </button>
    );
}
