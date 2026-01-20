'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}: ModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (overlayRef.current === e.target) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full m-4'
    };

    return createPortal(
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div
                className={`
                    bg-[var(--background)] 
                    w-full 
                    ${sizeClasses[size]} 
                    rounded-2xl 
                    shadow-2xl 
                    border border-[var(--border)]
                    flex flex-col
                    max-h-[90vh]
                    relative
                    animate-in zoom-in-95 duration-200
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    {title && (
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
