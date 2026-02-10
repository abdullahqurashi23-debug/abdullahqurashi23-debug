'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage and system preference
    useEffect(() => {
        setMounted(true);

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }

        // Get system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!savedTheme || savedTheme === 'system') {
            setResolvedTheme(prefersDark ? 'dark' : 'light');
        } else {
            setResolvedTheme(savedTheme as 'light' | 'dark');
        }
    }, []);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                setResolvedTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply theme to document when theme changes
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark');

        let newResolvedTheme: 'light' | 'dark';

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            newResolvedTheme = prefersDark ? 'dark' : 'light';
        } else {
            newResolvedTheme = theme;
            root.classList.add(theme);
        }

        setResolvedTheme(newResolvedTheme);
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        theme,
        resolvedTheme,
        setTheme,
    }), [theme, resolvedTheme]);

    // Always render children within context - just hide visually before mounted
    return (
        <ThemeContext.Provider value={contextValue}>
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}
