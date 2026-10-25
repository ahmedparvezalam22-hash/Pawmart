/**
 * X Ads (Twitter Ads Pixel / 'twq') Integration Engine for PawMartFinder
 * Supports official Twitter/X Universal Website Tag (uwt.js),
 * conversion tracking, 'twclid' click ID attribution, and test events.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActiveAdAttribution } from './adTracking';

declare global {
  interface Window {
    twq?: (...args: any[]) => void;
  }
}

export interface XAdsSettings {
  pixelId: string; // e.g. tw-xxxx-xxxx or alphanumeric
  handle: string; // @PawMartFinder
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_x_ads_settings';
const DEFAULT_SETTINGS: XAdsSettings = {
  pixelId: (import.meta.env.VITE_X_ADS_PIXEL_ID as string) || '',
  handle: '@PawMartFinder',
  enabled: true,
};

let scriptInjected = false;
let currentActivePixelId = '';

/**
 * Retrieve cached settings
 */
export const getCachedXSettings = (): XAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Could not read cached X Ads settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/x_ads
 */
export const fetchXSettingsFromFirestore = async (): Promise<XAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'x_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as XAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch X Ads settings from Firestore', e);
  }
  return getCachedXSettings();
};

/**
 * Save settings to Firestore and localStorage
 */
export const saveXSettings = async (
  settings: Partial<XAdsSettings>
): Promise<XAdsSettings> => {
  const current = getCachedXSettings();
  const updated: XAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const ref = doc(db, 'settings', 'x_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving X Ads settings to Firestore', e);
  }

  if (updated.enabled && updated.pixelId.trim()) {
    injectAndInitXPixel(updated.pixelId.trim());
  }

  return updated;
};

/**
 * Injects official Twitter/X Ads script snippet
 */
export const injectAndInitXPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  const cleanId = pixelId.trim();
  if (!cleanId) return;

  if (window.twq && currentActivePixelId === cleanId) {
    return;
  }

  // Official Twitter Website Tag (twq) snippet
  /* eslint-disable */
  (function (e: any, t: any, n: any) {
    if (!e.twq) {
      const s: any = (e.twq = function () {
        s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
      });
      s.version = '1.1';
      s.queue = [];
      const u = t.createElement(n);
      u.async = true;
      u.src = 'https://static.ads-twitter.com/uwt.js';
      const a = t.getElementsByTagName(n)[0];
      a?.parentNode?.insertBefore(u, a);
    }
  })(window, document, 'script');
  /* eslint-enable */

  try {
    window.twq?.('config', cleanId);
    scriptInjected = true;
    currentActivePixelId = cleanId;
    console.info(`[X Ads] Twitter Pixel initialized with ID: ${cleanId}`);
  } catch (err) {
    console.warn('Failed to configure X Ads twq:', cleanId, err);
  }
};

/**
 * Initialize on app mount
 */
export const initXPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedXSettings();
  if (cached.enabled && cached.pixelId) {
    injectAndInitXPixel(cached.pixelId);
  }

  try {
    const remote = await fetchXSettingsFromFirestore();
    if (remote.enabled && remote.pixelId) {
      injectAndInitXPixel(remote.pixelId);
    }
  } catch (e) {
    // Ignore fallback
  }
};

/**
 * Track route / PageView on X Ads
 */
export const trackXPageView = (pathName?: string) => {
  if (typeof window === 'undefined' || !window.twq) return;

  try {
    const adAttribution = getActiveAdAttribution();
    window.twq('event', 'page_view', {
      page_path: pathName || window.location.pathname,
      twclid: adAttribution?.twclid,
      utm_source: adAttribution?.utm_source,
      utm_campaign: adAttribution?.utm_campaign,
    });
  } catch (err) {
    console.warn('Failed to track X Ads page_view', err);
  }
};

/**
 * Track ViewContent on X Ads
 */
export const trackXProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window === 'undefined' || !window.twq) return;

  try {
    window.twq('event', 'view_content', {
      content_type: 'product',
      content_id: item.id || item.title,
      content_name: item.title,
      content_category: item.category || 'General',
      value: item.price || 0,
      currency: 'USD',
    });
  } catch (err) {
    console.warn('Failed to track X Ads view_content', err);
  }
};

/**
 * Track Affiliate Click / Outbound Conversion on X Ads
 */
export const trackXAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window === 'undefined' || !window.twq) return;

  try {
    window.twq('event', 'initiate_checkout', {
      content_type: 'product',
      content_id: item.id || item.title,
      content_name: item.title,
      content_category: item.category || 'General',
      value: item.price || 0,
      currency: 'USD',
      num_items: 1,
    });
  } catch (err) {
    console.warn('Failed to track X Ads initiate_checkout', err);
  }
};

/**
 * Track Search on X Ads
 */
export const trackXSearch = (query: string) => {
  if (typeof window === 'undefined' || !window.twq || !query.trim()) return;

  try {
    window.twq('event', 'search', {
      search_string: query.trim(),
    });
  } catch (err) {
    console.warn('Failed to track X Ads search', err);
  }
};

/**
 * Track Lead on X Ads
 */
export const trackXLead = (source: string) => {
  if (typeof window === 'undefined' || !window.twq) return;

  try {
    window.twq('event', 'generate_lead', {
      content_name: source,
    });
  } catch (err) {
    console.warn('Failed to track X Ads generate_lead', err);
  }
};

/**
 * Send Test Event to X Ads
 */
export const sendXTestEvent = (): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Window is not defined' };
  }

  const settings = getCachedXSettings();
  if (!settings.pixelId.trim()) {
    return {
      success: false,
      message: 'X Ads Pixel ID is missing. Please enter your Twitter/X Pixel ID first.',
    };
  }

  try {
    injectAndInitXPixel(settings.pixelId);

    if (window.twq) {
      window.twq('event', 'test_event', {
        test_type: 'admin_dashboard_verification',
        platform: 'PawMartFinder',
        timestamp: new Date().toISOString(),
      });
      return {
        success: true,
        message: `X (Twitter) Ads test event sent for Pixel ${settings.pixelId}! Check your Events Manager at ads.x.com.`,
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error sending X Ads test event: ${err.message}` };
  }

  return { success: false, message: 'X Ads script is loading. Please retry in 3 seconds.' };
};
