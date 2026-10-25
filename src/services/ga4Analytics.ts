import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getActiveAdAttribution } from './adTracking';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface GoogleAnalyticsSettings {
  measurementId: string; // e.g. G-XXXXXXXXXX
  siteVerification: string; // Google Search Console / Site Verification
  enabled: boolean;
  enhancedEcommerce: boolean;
  debugMode: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_ga4_settings';
const DEFAULT_SETTINGS: GoogleAnalyticsSettings = {
  measurementId: (import.meta.env.VITE_GA4_MEASUREMENT_ID as string) || '',
  siteVerification: '',
  enabled: true,
  enhancedEcommerce: true,
  debugMode: false,
};

let ga4ScriptInjected = false;
let currentActiveMeasurementId = '';

/**
 * Get GA4 settings from local storage or environment default
 */
export const getCachedGA4Settings = (): GoogleAnalyticsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached GA4 settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/ga4_ads
 */
export const fetchGA4SettingsFromFirestore = async (): Promise<GoogleAnalyticsSettings> => {
  try {
    const ref = doc(db, 'settings', 'ga4_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as GoogleAnalyticsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applyGoogleSiteVerification(data.siteVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch GA4 settings from Firestore', e);
  }
  return getCachedGA4Settings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveGA4Settings = async (
  settings: Partial<GoogleAnalyticsSettings>
): Promise<GoogleAnalyticsSettings> => {
  const current = getCachedGA4Settings();
  const updated: GoogleAnalyticsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applyGoogleSiteVerification(updated.siteVerification);

  try {
    const ref = doc(db, 'settings', 'ga4_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving GA4 settings to Firestore (saved locally)', e);
  }

  // Reinitialize GA4 if enabled and measurement ID is provided
  if (updated.enabled && updated.measurementId.trim()) {
    injectAndInitGA4(updated.measurementId.trim(), { debug: updated.debugMode });
  }

  return updated;
};

/**
 * Update the <meta name="google-site-verification"> tag in document.head
 */
export const applyGoogleSiteVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'google-site-verification');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Injects Google tag (gtag.js) and configures the GA4 stream
 */
export const injectAndInitGA4 = (measurementId: string, options?: { debug?: boolean }) => {
  if (typeof window === 'undefined') return;

  const cleanId = measurementId.trim().toUpperCase();
  if (!cleanId) return;

  // Initialize dataLayer and gtag function if not already present
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  // If already loaded with the same measurement ID, just re-config
  if (ga4ScriptInjected && currentActiveMeasurementId === cleanId) {
    try {
      window.gtag('config', cleanId, {
        send_page_view: false,
        debug_mode: !!options?.debug,
      });
    } catch (e) {
      console.warn('GA4 reconfig notice', e);
    }
    return;
  }

  // Inject Google Tag script async
  const scriptId = 'google-tag-manager-gtag';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
    document.head.appendChild(script);
  } else if (currentActiveMeasurementId !== cleanId) {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
  }

  ga4ScriptInjected = true;
  currentActiveMeasurementId = cleanId;

  try {
    window.gtag('js', new Date());
    window.gtag('config', cleanId, {
      send_page_view: false, // We control page_view manually on route transitions with ad UTMs
      debug_mode: !!options?.debug,
      cookie_flags: 'SameSite=None;Secure',
    });
    console.info(`[GA4] Google Analytics 4 initialized with Measurement ID: ${cleanId}`);
  } catch (err) {
    console.warn('Failed to initialize GA4 gtag with ID:', cleanId, err);
  }
};

/**
 * Initialize Google Analytics 4 on app load
 */
export const initGA4 = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedGA4Settings();
  if (cached.siteVerification) {
    applyGoogleSiteVerification(cached.siteVerification);
  }
  if (cached.enabled && cached.measurementId) {
    injectAndInitGA4(cached.measurementId, { debug: cached.debugMode });
  }

  // Fetch latest settings from Firestore in background
  try {
    const remote = await fetchGA4SettingsFromFirestore();
    if (remote.enabled && remote.measurementId) {
      injectAndInitGA4(remote.measurementId, { debug: remote.debugMode });
    }
    if (remote.siteVerification) {
      applyGoogleSiteVerification(remote.siteVerification);
    }
  } catch (e) {
    // Graceful fallback to cached
  }
};

/**
 * Track GA4 PageView on route navigation with full UTM and Ad Attribution
 */
export const trackGA4PageView = (pathName?: string, pageTitle?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const location = window.location.href;
    const pagePath = pathName || window.location.pathname;
    const title = pageTitle || document.title;
    const adAttribution = getActiveAdAttribution();

    window.gtag('event', 'page_view', {
      page_location: location,
      page_path: pagePath,
      page_title: title,
      traffic_source: adAttribution?.utm_source || 'direct',
      traffic_medium: adAttribution?.utm_medium || 'organic',
      campaign_name: adAttribution?.utm_campaign,
      campaign_content: adAttribution?.utm_content,
      campaign_term: adAttribution?.utm_term,
      meta_fbclid: adAttribution?.fbclid,
      tiktok_ttclid: adAttribution?.ttclid,
      snapchat_sccid: adAttribution?.ScCid,
      google_gclid: adAttribution?.gclid,
    });
  } catch (err) {
    console.warn('Failed to track GA4 page_view', err);
  }
};

/**
 * Track GA4 view_item event (standard e-commerce)
 */
export const trackGA4ProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const numericPrice = typeof item.price === 'number' ? item.price : 0;
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: numericPrice,
      items: [
        {
          item_id: item.id || item.title.toLowerCase().replace(/\s+/g, '-'),
          item_name: item.title,
          item_category: item.category || 'General',
          price: numericPrice,
          quantity: 1,
        },
      ],
    });
  } catch (err) {
    console.warn('Failed to track GA4 view_item', err);
  }
};

/**
 * Track GA4 affiliate outbound click (triggers 'click_affiliate' and e-commerce 'begin_checkout')
 */
export const trackGA4AffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    const numericPrice = typeof item.price === 'number' ? item.price : 0;
    const itemId = item.id || item.title.toLowerCase().replace(/\s+/g, '-');

    // 1. Standard Begin Checkout (High-intent conversion)
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: numericPrice,
      coupon: 'AMAZON_PRIME',
      items: [
        {
          item_id: itemId,
          item_name: item.title,
          item_category: item.category || 'General',
          price: numericPrice,
          quantity: 1,
        },
      ],
    });

    // 2. Custom Affiliate Outbound Conversion Event
    window.gtag('event', 'click_affiliate_link', {
      affiliate_network: 'Amazon Associates',
      item_id: itemId,
      item_name: item.title,
      item_category: item.category || 'General',
      item_price: numericPrice,
      destination_url: item.url || '',
    });
  } catch (err) {
    console.warn('Failed to track GA4 affiliate click', err);
  }
};

/**
 * Track GA4 search query
 */
export const trackGA4Search = (query: string) => {
  if (typeof window === 'undefined' || !window.gtag || !query.trim()) return;

  try {
    window.gtag('event', 'search', {
      search_term: query.trim(),
    });
  } catch (err) {
    console.warn('Failed to track GA4 search', err);
  }
};

/**
 * Track GA4 Category Select
 */
export const trackGA4CategorySelect = (categoryName: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'select_content', {
      content_type: 'category',
      item_id: categoryName,
    });
  } catch (err) {
    console.warn('Failed to track GA4 category select', err);
  }
};

/**
 * Track GA4 Newsletter / Lead Generation
 */
export const trackGA4Lead = (leadSource: string = 'home_newsletter') => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'generate_lead', {
      lead_source: leadSource,
      value: 1,
      currency: 'USD',
    });
  } catch (err) {
    console.warn('Failed to track GA4 generate_lead', err);
  }
};

/**
 * Send a verification test event to GA4
 */
export const sendGA4TestEvent = (): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Window is not defined' };
  }

  const settings = getCachedGA4Settings();
  if (!settings.measurementId.trim()) {
    return {
      success: false,
      message: 'GA4 Measurement ID is missing. Please enter a valid ID (e.g. G-XXXXXXXXXX) first.',
    };
  }

  try {
    // Ensure gtag is initialized
    injectAndInitGA4(settings.measurementId, { debug: true });

    if (window.gtag) {
      window.gtag('event', 'test_event', {
        test_type: 'admin_dashboard_verification',
        platform: 'PawMartFinder',
        timestamp: new Date().toISOString(),
        ad_networks: ['Meta', 'TikTok', 'Snapchat', 'Google'],
      });
      return {
        success: true,
        message: `GA4 test event sent successfully for Stream ${settings.measurementId}! Check your GA4 'Realtime' report in analytics.google.com.`,
      };
    }
  } catch (err: any) {
    return { success: false, message: `Error firing GA4 test event: ${err.message}` };
  }

  return { success: false, message: 'GA4 gtag.js script is initializing. Please retry in a few seconds.' };
};
