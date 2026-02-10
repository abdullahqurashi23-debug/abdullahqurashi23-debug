import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-semibold rounded-lg transition-all duration-200 
    inline-flex items-center justify-center gap-2
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2
  `;

  const variants = {
    primary: `
      bg-[var(--brand-primary)] text-white 
      hover:bg-[var(--brand-primary-hover)] hover:shadow-[var(--shadow-glow)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    `,
    secondary: `
      bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]
      hover:bg-[var(--surface-elevated)] hover:border-[var(--brand-primary)]
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]
      hover:bg-[var(--brand-primary)] hover:text-white
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--surface)] hover:text-[var(--text-primary)]
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
