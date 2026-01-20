import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({
    className = '',
    width,
    height,
    variant = 'rectangular'
}: SkeletonProps) => {

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    const variantClasses = {
        text: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`
                bg-gray-200 dark:bg-gray-700 
                animate-pulse 
                ${variantClasses[variant]} 
                ${className}
            `}
            style={style}
        />
    );
};
