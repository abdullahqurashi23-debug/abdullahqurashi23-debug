// Accessibility utilities and helpers

// Focus trap for modals and dialogs
export function createFocusTrap(containerRef: React.RefObject<HTMLElement>) {
    const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return {
        activate: () => {
            const container = containerRef.current;
            if (!container) return;

            const focusableElements = container.querySelectorAll(focusableSelectors);
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            };

            container.addEventListener('keydown', handleKeyDown);
            firstElement?.focus();

            return () => container.removeEventListener('keydown', handleKeyDown);
        },
    };
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Check for reduced motion preference
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get appropriate animation duration
export function getAnimationDuration(normalDuration: number): number {
    return prefersReducedMotion() ? 0 : normalDuration;
}

// Keyboard navigation helpers
export const KeyboardKeys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
} as const;

// Handle click or keyboard activation
export function handleActivation(
    e: React.MouseEvent | React.KeyboardEvent,
    callback: () => void
) {
    if ('key' in e) {
        if (e.key === KeyboardKeys.ENTER || e.key === KeyboardKeys.SPACE) {
            e.preventDefault();
            callback();
        }
    } else {
        callback();
    }
}

// Generate unique IDs for aria-labelledby
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
    return `${prefix}-${++idCounter}`;
}

// Skip link component styles (add to globals.css)
export const skipLinkStyles = `
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 8px 16px;
    z-index: 100;
    text-decoration: none;
    font-weight: 600;
    transition: top 0.2s;
}

.skip-link:focus {
    top: 0;
}
`;

// Color contrast checker (WCAG AA requires 4.5:1 for normal text, 3:1 for large)
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;

        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrastRequirement(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
): boolean {
    const ratio = getContrastRatio(foreground, background);
    const threshold = level === 'AAA'
        ? (isLargeText ? 4.5 : 7)
        : (isLargeText ? 3 : 4.5);
    return ratio >= threshold;
}

// Accessible loading state text
export function getLoadingText(isLoading: boolean, loadingText: string = 'Loading...', readyText: string = 'Ready'): string {
    return isLoading ? loadingText : readyText;
}
