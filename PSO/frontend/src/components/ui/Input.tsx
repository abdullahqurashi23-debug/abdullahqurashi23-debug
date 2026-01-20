import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, fullWidth = true, ...props }, ref) => {
        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full h-11 bg-[var(--background)] border border-[var(--border)] rounded-lg
                            text-[var(--text-primary)] placeholder-[var(--text-muted)]
                            focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10
                            disabled:bg-[var(--surface)] disabled:cursor-not-allowed
                            transition-all duration-200
                            ${icon ? 'pl-10' : 'px-4'}
                            ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-red-500/10' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-[var(--color-danger)] animate-fade-up">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
