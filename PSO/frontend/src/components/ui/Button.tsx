import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', icon, isLoading, fullWidth, children, disabled, ...props }, ref) => {

        const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:scale-[1.02] shadow-sm',
            secondary: 'bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-blue-50',
            danger: 'bg-[var(--color-danger)] text-white hover:brightness-110 shadow-sm',
            ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
            xl: 'h-16 px-10 text-lg rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={`
                    ${baseStyles}
                    ${variants[variant]}
                    ${sizes[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
