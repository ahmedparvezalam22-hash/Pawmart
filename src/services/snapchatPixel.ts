import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    snaptr?: any;
    _snaptr?: any;
  }
}

export interface SnapchatAdsSettings {
  pixelId: string;
  domainVerification: string;
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_snapchat_ads_settings';
const DEFAULT_SETTINGS: SnapchatAdsSettings = {
  pixelId: '',
  domainVerification: '',
  enabled: false,
};

let snapScriptInjected = false;

/**
 * Get Snapchat settings from local cache for instant zero-latency loading
 */
export const getCachedSnapchatSettings = (): SnapchatAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Snapchat settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Firestore /settings/snapchat_ads
 */
export const fetchSnapchatSettingsFromFirestore = async (): Promise<SnapchatAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'snapchat_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as SnapchatAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applySnapchatVerification(data.domainVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Snapchat settings from Firestore', e);
  }
  return getCachedSnapchatSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveSnapchatSettings = async (settings: Partial<SnapchatAdsSettings>): Promise<SnapchatAdsSettings> => {
  const current = getCachedSnapchatSettings();
  const updated: SnapchatAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applySnapchatVerification(updated.domainVerification);

  try {
    const ref = doc(db, 'settings', 'snapchat_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Snapchat settings to Firestore (saved locally)', e);
  }

  // Reinitialize or load Snap Pixel
  if (updated.enabled && updated.pixelId.trim()) {
    injectAndInitSnapPixel(updated.pixelId.trim());
  }

  return updated;
};

/**
 * Update the <meta name="snapchat-site-verification"> in document.head
 */
export const applySnapchatVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="snapchat-site-verification"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'snapchat-site-verification');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Official Snap Pixel Base Code Loader
 */
export const injectAndInitSnapPixel = (pixelId: string) => {
  if (typeof window === 'undefined' || !pixelId) return;
  const cleanId = pixelId.trim();
  if (!cleanId) return;

  if (window.snaptr && snapScriptInjected) {
    try {
      window.snaptr('init', cleanId);
      window.snaptr('track', 'PAGE_VIEW');
    } catch (e) {
      console.warn('Snapchat Pixel already loaded, reloaded with ID:', cleanId, e);
    }
    return;
  }

  /* eslint-disable */
  (function (e: any, t: any, n: any) {
    if (e.snaptr) return;
    var a: any = (e.snaptr = function () {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
    });
    a.queue = [];
    var s = 'script';
    var r = t.createElement(s);
    r.async = !0;
    r.src = n;
    var u = t.getElementsByTagName(s)[0];
    if (u && u.parentNode) {
      u.parentNode.insertBefore(r, u);
    } else {
      t.head.appendChild(r);
    }
  })(window, document, 'https://sc-static.net/scevent.min.js');
  /* eslint-enable */

  snapScriptInjected = true;

  try {
    window.snaptr('init', cleanId);
    window.snaptr('track', 'PAGE_VIEW');
  } catch (err) {
    console.warn('Failed to initialize Snapchat Pixel:', cleanId, err);
  }
};

/**
 * Initialize Snap Pixel on startup
 */
export const initSnapPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedSnapchatSettings();
  if (cached.domainVerification) {
    applySnapchatVerification(cached.domainVerification);
  }
  if (cached.enabled && cached.pixelId) {
    injectAndInitSnapPixel(cached.pixelId);
  }

  try {
    const remote = await fetchSnapchatSettingsFromFirestore();
    if (remote.enabled && remote.pixelId) {
      injectAndInitSnapPixel(remote.pixelId);
    }
    if (remote.domainVerification) {
      applySnapchatVerification(remote.domainVerification);
    }
  } catch (e) {
    // Fallback silent
  }
};

/**
 * Track PAGE_VIEW event on Snap Pixel
 */
export const trackSnapPageView = (pathName?: string) => {
  if (typeof window !== 'undefined' && window.snaptr) {
    try {
      window.snaptr('track', 'PAGE_VIEW');
    } catch (e) {
      console.warn('Error sending Snapchat PAGE_VIEW', e);
    }
  }
};

/**
 * Track VIEW_CONTENT event on Snap Pixel
 */
export const trackSnapProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window !== 'undefined' && window.snaptr) {
    try {
      window.snaptr('track', 'VIEW_CONTENT', {
        item_ids: item.id ? [item.id] : [item.title],
        item_category: item.category || 'General',
        price: item.price || 1,
        currency: 'USD',
      });
    } catch (e) {
      console.warn('Error sending Snapchat VIEW_CONTENT', e);
    }
  }
};

/**
 * Track Outbound Affiliate Click on Snap Pixel (START_CHECKOUT & CUSTOM_EVENT_1)
 */
export const trackSnapAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window !== 'undefined' && window.snaptr) {
    try {
      // START_CHECKOUT is high value conversion in Snapchat Ads Manager
      window.snaptr('track', 'START_CHECKOUT', {
        item_ids: item.id ? [item.id] : [item.title],
        item_category: item.category || 'General',
        price: item.price || 1,
        currency: 'USD',
      });

      // Custom event for granular reporting
      window.snaptr('track', 'CUSTOM_EVENT_1', {
        description: 'AmazonOutboundAffiliateClick',
        item_name: item.title,
      });
    } catch (e) {
      console.warn('Error sending Snapchat START_CHECKOUT', e);
    }
  }
};

/**
 * Track SEARCH event on Snap Pixel
 */
export const trackSnapSearch = (query: string) => {
  if (typeof window !== 'undefined' && window.snaptr && query) {
    try {
      window.snaptr('track', 'SEARCH', {
        search_string: query,
      });
    } catch (e) {
      console.warn('Error sending Snapchat SEARCH', e);
    }
  }
};

/**
 * Send test ping event to verify connection in Snapchat Events Manager
 */
export const sendSnapTestEvent = (): boolean => {
  if (typeof window !== 'undefined' && window.snaptr) {
    try {
      window.snaptr('track', 'CUSTOM_EVENT_2', {
        description: 'AdminPixelTestPing',
        source: 'PawMartFinder Web Admin',
      });
      return true;
    } catch (e) {
      console.error('Error firing Snapchat test ping', e);
      return false;
    }
  }
  return false;
};
