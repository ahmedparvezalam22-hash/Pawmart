import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    qp?: any;
    _qp?: any;
  }
}

export interface QuoraAdsSettings {
  pixelId: string; // e.g. 1a2b3c4d5e6f7g8h9i0j
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_quora_ads_settings';
const DEFAULT_SETTINGS: QuoraAdsSettings = {
  pixelId: (import.meta.env.VITE_QUORA_PIXEL_ID as string) || '',
  enabled: false,
};

let quoraScriptInjected = false;

/**
 * Get Quora Settings from local storage first (instant), then Firestore
 */
export const getCachedQuoraSettings = (): QuoraAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Quora settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/quora_ads
 */
export const fetchQuoraSettingsFromFirestore = async (): Promise<QuoraAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'quora_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as QuoraAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Quora settings from Firestore', e);
  }
  return getCachedQuoraSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveQuoraSettings = async (
  settings: Partial<QuoraAdsSettings>
): Promise<QuoraAdsSettings> => {
  const current = getCachedQuoraSettings();
  const updated: QuoraAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const ref = doc(db, 'settings', 'quora_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Quora settings to Firestore (saved locally)', e);
  }

  // Reinitialize or update Quora Pixel
  if (updated.enabled && updated.pixelId.trim()) {
    injectAndInitQuora(updated.pixelId.trim());
  }

  return updated;
};

/**
 * Injects Quora Pixel base code and initializes with pixelId
 */
export const injectAndInitQuora = (pixelId: string) => {
  if (typeof window === 'undefined' || !pixelId) return;

  const cleanId = pixelId.trim();
  if (!cleanId) return;

  // If already initialized
  if (window.qp && quoraScriptInjected) {
    try {
      window.qp('init', cleanId);
      window.qp('track', 'Generic');
    } catch (e) {
      console.warn('Quora Pixel already active, reinit called', e);
    }
    return;
  }

  /* eslint-disable */
  (function (q: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (q.qp) return;
    n = q.qp = function () {
      n.qp ? n.qp.apply(n, arguments) : n.queue.push(arguments);
    };
    n.queue = [];
    t = document.createElement(e);
    t.async = true;
    t.src = v;
    s = document.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      document.head.appendChild(t);
    }
  })(window, 'script', 'https://a.quora.com/qevents.js');
  /* eslint-enable */

  quoraScriptInjected = true;

  try {
    window.qp('init', cleanId);
    window.qp('track', 'Generic');
    console.info(`[Quora Pixel] Initialized with Pixel ID: ${cleanId}`);
  } catch (err) {
    console.warn('Failed to initialize Quora Pixel with ID:', cleanId, err);
  }
};

/**
 * Initialize Quora Pixel on app load
 */
export const initQuoraPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedQuoraSettings();
  if (cached.enabled && cached.pixelId) {
    injectAndInitQuora(cached.pixelId);
  }

  // Fetch latest from Firestore in background
  try {
    const remote = await fetchQuoraSettingsFromFirestore();
    if (remote.enabled && remote.pixelId) {
      injectAndInitQuora(remote.pixelId);
    }
  } catch (e) {
    // Graceful fallback to cached
  }
};

/**
 * Track PageView (Generic event on Quora)
 */
export const trackQuoraPageView = (pathName?: string) => {
  if (typeof window !== 'undefined' && window.qp) {
    try {
      window.qp('track', 'Generic');
    } catch (e) {
      console.warn('Could not fire Quora Generic event', e);
    }
  }
};

/**
 * Track Product ViewContent
 */
export const trackQuoraProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window !== 'undefined' && window.qp) {
    try {
      window.qp('track', 'ViewContent');
    } catch (e) {
      console.warn('Could not fire Quora ViewContent event', e);
    }
  }
};

/**
 * Track Outbound Affiliate Click (InitiateCheckout)
 */
export const trackQuoraAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window !== 'undefined' && window.qp) {
    try {
      window.qp('track', 'InitiateCheckout');
      window.qp('track', 'Purchase'); // High-intent conversion signal for Quora campaign optimization
    } catch (e) {
      console.warn('Could not fire Quora InitiateCheckout event', e);
    }
  }
};

/**
 * Track Search
 */
export const trackQuoraSearch = (query: string) => {
  if (typeof window !== 'undefined' && window.qp && query.trim()) {
    try {
      window.qp('track', 'Search');
    } catch (e) {
      console.warn('Could not fire Quora Search event', e);
    }
  }
};

/**
 * Track Lead / Notification Sign Up
 */
export const trackQuoraLead = (source: string = 'home_newsletter') => {
  if (typeof window !== 'undefined' && window.qp) {
    try {
      window.qp('track', 'GenerateLead');
    } catch (e) {
      console.warn('Could not fire Quora GenerateLead event', e);
    }
  }
};

/**
 * Send test ping to Quora
 */
export const sendQuoraTestEvent = (): boolean => {
  if (typeof window !== 'undefined' && window.qp) {
    try {
      window.qp('track', 'Generic');
      return true;
    } catch (e) {
      console.warn('Could not fire Quora test event', e);
    }
  }
  return false;
};
