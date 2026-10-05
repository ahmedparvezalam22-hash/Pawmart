export interface SupportedCountry {
  code: string;
  name: string;
  flag: string;
  langCode: string;
  langName: string;
  nativeLangName: string;
  region: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// 22 Countries requested by the user
export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  {
    code: 'US',
    name: 'USA',
    flag: '🇺🇸',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English (US)',
    region: 'North America',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English / Français',
    region: 'North America',
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    langCode: 'es',
    langName: 'Spanish',
    nativeLangName: 'Español (México)',
    region: 'North America',
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    langCode: 'pt',
    langName: 'Portuguese',
    nativeLangName: 'Português (Brasil)',
    region: 'South America',
  },
  {
    code: 'GB',
    name: 'UK',
    flag: '🇬🇧',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English (UK)',
    region: 'Europe',
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    langCode: 'de',
    langName: 'German',
    nativeLangName: 'Deutsch',
    region: 'Europe',
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    langCode: 'fr',
    langName: 'French',
    nativeLangName: 'Français',
    region: 'Europe',
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    langCode: 'es',
    langName: 'Spanish',
    nativeLangName: 'Español',
    region: 'Europe',
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    langCode: 'it',
    langName: 'Italian',
    nativeLangName: 'Italiano',
    region: 'Europe',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    langCode: 'nl',
    langName: 'Dutch',
    nativeLangName: 'Nederlands',
    region: 'Europe',
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    langCode: 'sv',
    langName: 'Swedish',
    nativeLangName: 'Svenska',
    region: 'Europe',
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    langCode: 'pl',
    langName: 'Polish',
    nativeLangName: 'Polski',
    region: 'Europe',
  },
  {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    langCode: 'ar',
    langName: 'Arabic',
    nativeLangName: 'العربية (الإمارات)',
    region: 'Middle East',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    langCode: 'ar',
    langName: 'Arabic',
    nativeLangName: 'العربية (السعودية)',
    region: 'Middle East',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    langCode: 'hi',
    langName: 'Hindi',
    nativeLangName: 'हिन्दी / English',
    region: 'Asia',
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    langCode: 'ja',
    langName: 'Japanese',
    nativeLangName: '日本語',
    region: 'Asia',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English / 中文',
    region: 'Asia',
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English (AU)',
    region: 'Oceania',
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    langCode: 'nl',
    langName: 'Dutch / French',
    nativeLangName: 'Nederlands / Français',
    region: 'Europe',
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    langCode: 'ar',
    langName: 'Arabic',
    nativeLangName: 'العربية (مصر)',
    region: 'Middle East',
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    langCode: 'en',
    langName: 'English',
    nativeLangName: 'English (IE)',
    region: 'Europe',
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    langCode: 'tr',
    langName: 'Turkish',
    nativeLangName: 'Türkçe',
    region: 'Europe & Asia',
  },
];

// Distinct languages available
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
];

const STORAGE_LANG_KEY = 'pawmart_selected_language';
const STORAGE_COUNTRY_KEY = 'pawmart_selected_country';

// Cookie helper for Google Translate
const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  const host = window.location.hostname;

  // Set on root path and explicit domain
  document.cookie = `${name}=${value}${expires}; path=/;`;
  if (host && host !== 'localhost') {
    document.cookie = `${name}=${value}${expires}; path=/; domain=.${host};`;
    document.cookie = `${name}=${value}${expires}; path=/; domain=${host};`;
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Retrieve saved language code
export const getSavedLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  try {
    const local = localStorage.getItem(STORAGE_LANG_KEY);
    if (local) return local;

    // Check googtrans cookie: /en/es -> es
    const cookie = getCookie('googtrans');
    if (cookie) {
      const parts = cookie.split('/');
      const code = parts[parts.length - 1];
      if (code && code !== 'en' && code !== 'auto') return code;
    }
  } catch {
    // fallback
  }
  return 'en';
};

// Retrieve saved country
export const getSavedCountry = (): SupportedCountry => {
  if (typeof window === 'undefined') return SUPPORTED_COUNTRIES[0];
  try {
    const code = localStorage.getItem(STORAGE_COUNTRY_KEY);
    if (code) {
      const country = SUPPORTED_COUNTRIES.find((c) => c.code === code);
      if (country) return country;
    }
  } catch {}
  return SUPPORTED_COUNTRIES[0]; // USA fallback
};

// Apply and switch site language
export const changeSiteLanguage = (langCode: string, countryCode?: string) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_LANG_KEY, langCode);

    if (countryCode) {
      localStorage.setItem(STORAGE_COUNTRY_KEY, countryCode);
    } else {
      // Find matching country
      const matched = SUPPORTED_COUNTRIES.find((c) => c.langCode === langCode);
      if (matched) {
        localStorage.setItem(STORAGE_COUNTRY_KEY, matched.code);
      }
    }

    // Set RTL direction if Arabic
    if (langCode === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = langCode;
    }

    // If English, clear translation cookie
    if (langCode === 'en') {
      setCookie('googtrans', '/en/en', 365);
      setCookie('googtrans', '', -1);
    } else {
      setCookie('googtrans', `/en/${langCode}`, 365);
    }

    // Try finding Google Translate combo element
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If combo not in DOM yet or switching from/to English, reload to apply clean neural translation
      window.location.reload();
    }
  } catch (err) {
    console.error('Failed to change language:', err);
  }
};
