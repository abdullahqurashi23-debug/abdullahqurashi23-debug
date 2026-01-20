'use client';

import { useLanguageStore } from '@/lib/store/languageStore';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguageStore();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="
                px-3 py-1.5 
                rounded-md 
                text-sm font-medium 
                bg-[var(--surface-hover)] 
                text-[var(--text-secondary)] 
                hover:text-[var(--text-primary)] 
                transition-colors
                border border-[var(--border)]
                flex items-center gap-2
            "
        >
            <span>{language === 'en' ? '🇺🇸' : '🇵🇰'}</span>
            <span className="hidden md:inline">{language === 'en' ? 'English' : 'اردو'}</span>
        </button>
    );
};
