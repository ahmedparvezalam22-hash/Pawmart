/**
 * YouTube Ads & Google Video Campaigns Integration Engine for PawMartFinder
 * Supports YouTube Video Ads (In-stream, YouTube Shorts ads, bumper ads),
 * Google Ads conversion tag (AW-XXXXXXXXX), mobile app modeled click IDs (wbraid, gbraid, gclid),
 * and Amazon outbound affiliate conversion tracking.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActiveAdAttribution } from './adTracking';

export interface YouTubeAdsSettings {
  conversionId: string; // e.g. AW-XXXXXXXXX
  conversionLabel: string; // e.g. AbCdEfGhIjK or AW-XXXXXXXXX/AbCdEfGhIjK
  channelUrl: string; // Optional YouTube channel URL
  enabled: boolean;
  remarketing: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_youtube_ads_settings';
const DEFAULT_SETTINGS: YouTubeAdsSettings = {
  conversionId: (import.meta.env.VITE_YOUTUBE_CONVERSION_ID as string) || '',
  conversionLabel: '',
  channelUrl: '',
  enabled: true,
  remarketing: true,
};

let scriptInjected = false;
let currentActiveConversionId = '';

/**
 * Get cached YouTube Ads settings
 */
export const getCachedYouTubeSettings = (): YouTubeAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Could not read cached YouTube Ads settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/youtube_ads
 */
export const fetchYouTubeSettingsFromFirestore = async (): Promise<YouTubeAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'youtube_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as YouTubeAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch YouTube Ads settings from Firestore', e);
  }
  return getCachedYouTubeSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveYouTubeSettings = async (
  settings: Partial<YouTubeAdsSettings>
): Promise<YouTubeAdsSettings> => {
  const current = getCachedYouTubeSettings();
  const updated: YouTubeAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const ref = doc(db, 'settings', 'youtube_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving YouTube Ads settings to Firestore', e);
  }

  if (updated.enabled && updated.conversionId.trim()) {
    injectAndInitYouTubeAds(updated.conversionId.trim(), { remarketing: updated.remarketing });
  }

  return updated;
};

/**
 * Injects Google Ads / YouTube tag
 */
export const injectAndInitYouTubeAds = (
  conversionId: string,
  options?: { remarketing?: boolean }
) => {
  if (typeof window === 'undefined') return;

  const cleanId = conversionId.trim().toUpperCase();
  if (!cleanId) return;

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  if (scriptInjected && currentActiveConversionId === cleanId) {
    return;
  }

  const scriptId = 'google-ads-youtube-gtag';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
    document.head.appendChild(script);
  }

  scriptInjected = true;
  currentActiveConversionId = cleanId;

  try {
    window.gtag('config', cleanId, {
      send_page_view: false,
      allow_enhanced_conversions: true,
      restricted_data_processing: false,
    });
    console.info(`[YouTube Ads] Tag initialized with Conversion ID: ${cleanId}`);
  } catch (err) {
    console.warn('Failed to configure YouTube Ads gtag:', cleanId, err);
  }
};

/**
 * Initialize on app mount
 */
export const initYouTubeAds = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedYouTubeSettings();
  if (cached.enabled && cached.conversionId) {
    injectAndInitYouTubeAds(cached.conversionId, { remarketing: cached.remarketing });
  }

  try {
    const remote = await fetchYouTubeSettingsFromFirestore();
    if (remote.enabled && remote.conversionId) {
      injectAndInitYouTubeAds(remote.conversionId, { remarketing: remote.remarketing });
    }
  } catch (e) {
    // Graceful fallback
  }
};

/**
 * Track route / PageView for YouTube Ads audiences
 */
export const trackYouTubePageView = (pathName?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const settings = getCachedYouTubeSettings();
    if (!settings.enabled || !settings.conversionId) return;

    const adAttribution = getActiveAdAttribution();
    window.gtag('event', 'page_view', {
      send_to: settings.conversionId,
      page_path: pathName || window.location.pathname,
      gclid: adAttribution?.gclid,
      wbraid: adAttribution?.wbraid,
      gbraid: adAttribution?.gbraid,
      traffic_source: 'youtube_ads',
    });
  } catch (err) {
    console.warn('Failed to track YouTube Ads page_view', err);
  }
};

/**
 * Track Product View for YouTube Remarketing
 */
export const trackYouTubeProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const settings = getCachedYouTubeSettings();
    if (!settings.enabled || !settings.conversionId) return;

    window.gtag('event', 'view_item', {
      send_to: settings.conversionId,
      currency: 'USD',
      value: item.price || 0,
      items: [
        {
          id: item.id || item.title,
          name: item.title,
          category: item.category || 'General',
          price: item.price || 0,
        },
      ],
    });
  } catch (err) {
    console.warn('Failed to track YouTube view_item', err);
  }
};

/**
 * Track Amazon Affiliate Outbound Click as YouTube Ad Conversion
 */
export const trackYouTubeAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const settings = getCachedYouTubeSettings();
    if (!settings.enabled || !settings.conversionId) return;

    // Send conversion to specific label if configured or conversionId
    const target = settings.conversionLabel.trim()
      ? settings.conversionLabel.includes('/')
        ? settings.conversionLabel.trim()
        : `${settings.conversionId}/${settings.conversionLabel.trim()}`
      : settings.conversionId;

    window.gtag('event', 'conversion', {
      send_to: target,
      value: item.price || 1.0,
      currency: 'USD',
      transaction_id: `yt_${Date.now()}`,
    });
  } catch (err) {
    console.warn('Failed to track YouTube Ads conversion', err);
  }
};

/**
 * Send Test Ping to YouTube / Google Ads
 */
export const sendYouTubeTestEvent = (): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Window is not defined' };
  }

  const settings = getCachedYouTubeSettings();
  if (!settings.conversionId.trim()) {
    return {
      success: false,
      message: 'YouTube Conversion ID is missing. Enter a valid ID (e.g. AW-XXXXXXXXX) first.',
    };
  }

  try {
    injectAndInitYouTubeAds(settings.conversionId);

    if (window.gtag) {
      window.gtag('event', 'test_event', {
        send_to: settings.conversionId,
        test_type: 'admin_youtube_verification',
        platform: 'PawMartFinder',
        timestamp: new Date().toISOString(),
      });
      return {
        success: true,
        message: `YouTube Ads test event sent for Conversion ID ${settings.conversionId}! Check Google Ads > Goals > Conversions summary.`,
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error sending YouTube test event: ${err.message}` };
  }

  return { success: false, message: 'YouTube Ads tag initializing. Please retry in a few seconds.' };
};
