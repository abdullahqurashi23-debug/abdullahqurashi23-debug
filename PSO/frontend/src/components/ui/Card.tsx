import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
    hoverEffect?: boolean;
}

export const Card = ({ children, className = '', title, action, hoverEffect = false }: CardProps) => {
    return (
        <div className={`
            bg-[var(--background)] rounded-2xl border border-[var(--border)] p-6 shadow-sm
            ${hoverEffect ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-md' : ''}
            ${className}
        `}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    {title && <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
