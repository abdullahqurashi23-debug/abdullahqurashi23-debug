'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { language, direction } = useLanguageStore();

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;

        // Add specific font class for Urdu if needed
        if (language === 'ur') {
            document.body.classList.add('font-urdu');
        } else {
            document.body.classList.remove('font-urdu');
        }
    }, [language, direction]);

    return <>{children}</>;
}
