import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export const Badge = ({ children, variant = 'info', className = '' }: BadgeProps) => {
    const variants = {
        success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
        warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
        danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
        info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
    };

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};
