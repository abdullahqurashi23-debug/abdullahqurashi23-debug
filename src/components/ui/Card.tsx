import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    variant?: 'default' | 'elevated' | 'bordered';
}

export default function Card({
    children,
    className = '',
    hover = true,
    variant = 'default'
}: CardProps) {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';

    const variants = {
        default: 'bg-[var(--surface-elevated)] border border-[var(--border)]',
        elevated: 'bg-[var(--surface-elevated)] shadow-lg border border-[var(--border)]',
        bordered: 'bg-transparent border-2 border-[var(--border)]',
    };

    const hoverStyles = hover
        ? 'hover:border-[var(--brand-primary)] hover:shadow-lg hover:shadow-[var(--brand-glow)]'
        : '';

    return (
        <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
}
