'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
