import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_LANGUAGES,
  SupportedCountry,
  SupportedLanguage,
  getSavedLanguage,
  getSavedCountry,
  changeSiteLanguage,
} from '../services/languageService';

interface LanguageContextType {
  currentLanguage: string;
  currentCountry: SupportedCountry;
  supportedCountries: SupportedCountry[];
  supportedLanguages: SupportedLanguage[];
  switchLanguage: (langCode: string, countryCode?: string) => void;
  isModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [currentCountry, setCurrentCountryState] = useState<SupportedCountry>(SUPPORTED_COUNTRIES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const lang = getSavedLanguage();
    const country = getSavedCountry();
    setCurrentLanguageState(lang);
    setCurrentCountryState(country);

    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = lang;
    }
  }, []);

  const switchLanguage = (langCode: string, countryCode?: string) => {
    setCurrentLanguageState(langCode);
    if (countryCode) {
      const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
      if (country) setCurrentCountryState(country);
    } else {
      const country = SUPPORTED_COUNTRIES.find((c) => c.langCode === langCode);
      if (country) setCurrentCountryState(country);
    }
    setIsModalOpen(false);
    changeSiteLanguage(langCode, countryCode);
  };

  const openLanguageModal = () => setIsModalOpen(true);
  const closeLanguageModal = () => setIsModalOpen(false);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentCountry,
        supportedCountries: SUPPORTED_COUNTRIES,
        supportedLanguages: SUPPORTED_LANGUAGES,
        switchLanguage,
        isModalOpen,
        openLanguageModal,
        closeLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
