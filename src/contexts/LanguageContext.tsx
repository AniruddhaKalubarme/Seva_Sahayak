import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, TranslationKey, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

// Context allows every component to read or change the selected language
// without passing language props through all intermediate components.
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is the initial language shown to a new visitor.
  const [language, setLanguage] = useState<Language>('en');

  // Recreate the translator only when the selected language changes.
  const t = useCallback(
    (key: TranslationKey) => getTranslation(language, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Failing here gives a clear setup error instead of a later null-reference error.
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
