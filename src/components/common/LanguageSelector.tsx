import React, { useState, useMemo } from 'react';
import { Globe, Check, Search, X, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedCountry, SupportedLanguage } from '../../services/languageService';

interface LanguageSelectorProps {
  variant?: 'header' | 'mobile' | 'footer' | 'pill';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const {
    currentLanguage,
    currentCountry,
    supportedCountries,
    supportedLanguages,
    switchLanguage,
    isModalOpen,
    openLanguageModal,
    closeLanguageModal,
  } = useLanguage();

  const [activeTab, setActiveTab] = useState<'countries' | 'languages'>('countries');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries by search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return supportedCountries;
    const q = searchQuery.toLowerCase().trim();
    return supportedCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.langName.toLowerCase().includes(q) ||
        c.nativeLangName.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [supportedCountries, searchQuery]);

  // Filter languages by search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return supportedLanguages;
    const q = searchQuery.toLowerCase().trim();
    return supportedLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [supportedLanguages, searchQuery]);

  // Trigger button based on variant
  const renderTrigger = () => {
    if (variant === 'mobile') {
      return (
        <button
          type="button"
          onClick={openLanguageModal}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentCountry.flag}</span>
            <div className="text-left">
              <p className="leading-tight text-slate-900 font-bold">
                {currentCountry.name} ({currentCountry.nativeLangName})
              </p>
              <p className="text-[10px] text-slate-500 font-normal">
                Click to switch language / country
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      );
    }

    if (variant === 'footer') {
      return (
        <button
          type="button"
          onClick={openLanguageModal}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer ${className}`}
        >
          <span className="text-base">{currentCountry.flag}</span>
          <span>{currentCountry.name} • {currentLanguage.toUpperCase()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      );
    }

    // Default 'header' & 'pill'
    return (
      <button
        type="button"
        onClick={openLanguageModal}
        title="Change Country & Language"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-xs font-bold ${className}`}
      >
        <span className="text-sm leading-none">{currentCountry.flag}</span>
        <span className="font-extrabold tracking-wide uppercase">
          {currentLanguage}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Language & Country Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    Select Your Country & Language
                  </h3>
                  <p className="text-xs text-slate-400">
                    Translate PawMart immediately into your native language
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeLanguageModal}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Selection Bar */}
            <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Currently active:</span>
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="text-base">{currentCountry.flag}</span>
                <span>{currentCountry.name}</span>
                <span className="text-slate-400">•</span>
                <span>{currentCountry.nativeLangName} ({currentLanguage.toUpperCase()})</span>
              </span>
            </div>

            {/* Search & Tabs */}
            <div className="p-4 sm:p-6 pb-2 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries (USA, Canada, Germany, Japan...) or languages..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('countries')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'countries'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  22 Supported Countries & Regions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('languages')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'languages'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Direct Languages (14)
                </button>
              </div>
            </div>

            {/* Items Grid (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              {activeTab === 'countries' ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {filteredCountries.map((c) => {
                      const isSelected =
                        currentCountry.code === c.code && currentLanguage === c.langCode;

                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => switchLanguage(c.langCode, c.code)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl flex-shrink-0">{c.flag}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {c.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {c.nativeLangName}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredLanguages.map((l) => {
                    const isSelected = currentLanguage === l.code;

                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => switchLanguage(l.code)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl flex-shrink-0">{l.flag}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {l.nativeName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {l.name} ({l.code.toUpperCase()})
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-time neural page translation into your chosen language.</span>
              </div>
              <button
                type="button"
                onClick={closeLanguageModal}
                className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
