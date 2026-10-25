import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

export interface TikTokAdsSettings {
  pixelId: string;
  domainVerification: string;
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_tiktok_ads_settings';
const DEFAULT_SETTINGS: TikTokAdsSettings = {
  pixelId: '',
  domainVerification: '',
  enabled: false,
};

let tiktokScriptInjected = false;

/**
 * Get TikTok settings from local cache for instant zero-latency loading
 */
export const getCachedTikTokSettings = (): TikTokAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached TikTok settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Firestore /settings/tiktok_ads
 */
export const fetchTikTokSettingsFromFirestore = async (): Promise<TikTokAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'tiktok_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as TikTokAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applyTikTokVerification(data.domainVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch TikTok settings from Firestore', e);
  }
  return getCachedTikTokSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveTikTokSettings = async (settings: Partial<TikTokAdsSettings>): Promise<TikTokAdsSettings> => {
  const current = getCachedTikTokSettings();
  const updated: TikTokAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applyTikTokVerification(updated.domainVerification);

  try {
    const ref = doc(db, 'settings', 'tiktok_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving TikTok settings to Firestore (saved locally)', e);
  }

  // Reinitialize or load TikTok Pixel
  if (updated.enabled && updated.pixelId.trim()) {
    injectAndInitTikTokPixel(updated.pixelId.trim());
  }

  return updated;
};

/**
 * Update the <meta name="tiktok-developers-site-verification"> in document.head
 */
export const applyTikTokVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="tiktok-developers-site-verification"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'tiktok-developers-site-verification');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Official TikTok Pixel Base Code Loader
 */
export const injectAndInitTikTokPixel = (pixelId: string) => {
  if (typeof window === 'undefined' || !pixelId) return;
  const cleanId = pixelId.trim();
  if (!cleanId) return;

  if (window.ttq && tiktokScriptInjected) {
    try {
      window.ttq.load(cleanId);
      window.ttq.page();
    } catch (e) {
      console.warn('TikTok Pixel already loaded, reloaded with ID:', cleanId, e);
    }
    return;
  }

  /* eslint-disable */
  (function (w: any, d: any, t: string) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
    ];
    ttq.setAndDefer = function (t: any, e: any) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function (t: any) {
      var e = ttq._i[t] || [];
      for (var n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(e, ttq.methods[n]);
      }
      return e;
    };
    ttq.load = function (e: any, n: any) {
      var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var a = d.createElement('script');
      a.type = 'text/javascript';
      a.async = !0;
      a.src = i + '?sdkid=' + e + '&lib=' + t;
      var c = d.getElementsByTagName('script')[0];
      if (c && c.parentNode) {
        c.parentNode.insertBefore(a, c);
      } else {
        d.head.appendChild(a);
      }
    };
  })(window, document, 'ttq');
  /* eslint-enable */

  tiktokScriptInjected = true;

  try {
    window.ttq.load(cleanId);
    window.ttq.page();
  } catch (err) {
    console.warn('Failed to initialize TikTok Pixel:', cleanId, err);
  }
};

/**
 * Initialize TikTok Pixel on startup
 */
export const initTikTokPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedTikTokSettings();
  if (cached.domainVerification) {
    applyTikTokVerification(cached.domainVerification);
  }
  if (cached.enabled && cached.pixelId) {
    injectAndInitTikTokPixel(cached.pixelId);
  }

  try {
    const remote = await fetchTikTokSettingsFromFirestore();
    if (remote.enabled && remote.pixelId) {
      injectAndInitTikTokPixel(remote.pixelId);
    }
    if (remote.domainVerification) {
      applyTikTokVerification(remote.domainVerification);
    }
  } catch (e) {
    // Fallback silent
  }
};

/**
 * Track PageView event on TikTok Pixel
 */
export const trackTikTokPageView = (pathName?: string) => {
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      window.ttq.page();
    } catch (e) {
      console.warn('Error sending TikTok PageView', e);
    }
  }
};

/**
 * Track ViewContent event on TikTok Pixel
 */
export const trackTikTokProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      window.ttq.track('ViewContent', {
        content_id: item.id || item.title,
        content_name: item.title,
        content_type: 'product',
        content_category: item.category || 'General',
        value: item.price || 1,
        currency: 'USD',
      });
    } catch (e) {
      console.warn('Error sending TikTok ViewContent', e);
    }
  }
};

/**
 * Track Outbound Affiliate Click on TikTok Pixel (InitiateCheckout & ClickButton)
 */
export const trackTikTokAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      // InitiateCheckout is standard TikTok high-intent conversion event
      window.ttq.track('InitiateCheckout', {
        content_id: item.id || item.title,
        content_name: item.title,
        content_type: 'product',
        content_category: item.category || 'General',
        value: item.price || 1,
        currency: 'USD',
      });

      // ClickButton event for affiliate link clicks
      window.ttq.track('ClickButton', {
        content_name: item.title,
        button_name: 'Buy on Amazon',
        destination: 'Amazon Affiliate',
      });
    } catch (e) {
      console.warn('Error sending TikTok conversion event', e);
    }
  }
};

/**
 * Track Search event on TikTok Pixel
 */
export const trackTikTokSearch = (query: string) => {
  if (typeof window !== 'undefined' && window.ttq && query) {
    try {
      window.ttq.track('Search', {
        query: query,
      });
    } catch (e) {
      console.warn('Error sending TikTok Search event', e);
    }
  }
};

/**
 * Send test ping event to verify connection in TikTok Events Manager
 */
export const sendTikTokTestEvent = (): boolean => {
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      window.ttq.track('CustomEvent', {
        test_event: true,
        event_name: 'AdminPixelTestPing',
        source: 'PawMartFinder Web Admin',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      console.error('Error firing TikTok test ping', e);
      return false;
    }
  }
  return false;
};
