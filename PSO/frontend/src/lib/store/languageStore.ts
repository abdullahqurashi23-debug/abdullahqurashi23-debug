import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ur';
type Direction = 'ltr' | 'rtl';

interface LanguageState {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',
            direction: 'ltr',
            setLanguage: (lang) => set({
                language: lang,
                direction: lang === 'ur' ? 'rtl' : 'ltr'
            }),
        }),
        {
            name: 'language-storage',
        }
    )
);
