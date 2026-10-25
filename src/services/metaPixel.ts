import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export interface MetaAdsSettings {
  pixelId: string;
  domainVerification: string;
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_meta_ads_settings';
const DEFAULT_SETTINGS: MetaAdsSettings = {
  pixelId: '',
  domainVerification: '',
  enabled: false,
};

let pixelScriptInjected = false;

/**
 * Get Meta Settings from local storage first (instant), then Firestore
 */
export const getCachedMetaSettings = (): MetaAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Meta settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/meta_ads
 */
export const fetchMetaSettingsFromFirestore = async (): Promise<MetaAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'meta_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as MetaAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applyDomainVerification(data.domainVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Meta settings from Firestore', e);
  }
  return getCachedMetaSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveMetaSettings = async (settings: Partial<MetaAdsSettings>): Promise<MetaAdsSettings> => {
  const current = getCachedMetaSettings();
  const updated: MetaAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applyDomainVerification(updated.domainVerification);

  try {
    const ref = doc(db, 'settings', 'meta_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Meta settings to Firestore (saved locally)', e);
  }

  // Reinitialize or update Pixel
  if (updated.enabled && updated.pixelId.trim()) {
    injectAndInitPixel(updated.pixelId.trim());
  }

  return updated;
};

/**
 * Update the <meta name="facebook-domain-verification"> tag in document.head
 */
export const applyDomainVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="facebook-domain-verification"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'facebook-domain-verification');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Injects Meta Pixel base code and initializes with pixelId
 */
export const injectAndInitPixel = (pixelId: string) => {
  if (typeof window === 'undefined' || !pixelId) return;

  const cleanId = pixelId.trim();
  if (!cleanId) return;

  // If already initialized
  if (window.fbq && pixelScriptInjected) {
    try {
      window.fbq('init', cleanId);
      window.fbq('track', 'PageView');
    } catch (e) {
      console.warn('Meta Pixel already active, reinit called', e);
    }
    return;
  }

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      document.head.appendChild(t);
    }
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  pixelScriptInjected = true;

  try {
    window.fbq('init', cleanId);
    window.fbq('track', 'PageView');
  } catch (err) {
    console.warn('Failed to initialize Meta Pixel with ID:', cleanId, err);
  }
};

/**
 * Initialize Meta Pixel on app load
 */
export const initMetaPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedMetaSettings();
  if (cached.domainVerification) {
    applyDomainVerification(cached.domainVerification);
  }
  if (cached.enabled && cached.pixelId) {
    injectAndInitPixel(cached.pixelId);
  }

  // Fetch latest from Firestore in background
  try {
    const remote = await fetchMetaSettingsFromFirestore();
    if (remote.enabled && remote.pixelId) {
      injectAndInitPixel(remote.pixelId);
    }
    if (remote.domainVerification) {
      applyDomainVerification(remote.domainVerification);
    }
  } catch (e) {
    // Graceful fallback to cached
  }
};

/**
 * Track PageView event (called on router transitions)
 */
export const trackMetaPageView = (pathName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'PageView');
      if (pathName) {
        window.fbq('trackCustom', 'AppRouteChanged', { path: pathName });
      }
    } catch (e) {
      console.warn('Error sending PageView to Meta Pixel', e);
    }
  }
};

/**
 * Track Product ViewContent event
 */
export const trackMetaProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: item.title,
        content_category: item.category || 'General',
        content_ids: item.id ? [item.id] : undefined,
        content_type: 'product',
        currency: 'USD',
        value: item.price || 1,
      });
    } catch (e) {
      console.warn('Error sending ViewContent to Meta Pixel', e);
    }
  }
};

/**
 * Track Outbound Affiliate click (Lead / InitiateCheckout)
 * When boosted through Meta Ads, this measures the exact conversion to Amazon!
 */
export const trackMetaAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      // Standard Lead Event
      window.fbq('track', 'Lead', {
        content_name: item.title,
        content_category: item.category || 'General',
        content_ids: item.id ? [item.id] : undefined,
        currency: 'USD',
        value: item.price || 1,
      });

      // Custom Amazon Outbound Click Event
      window.fbq('trackCustom', 'AmazonOutboundClick', {
        product_title: item.title,
        category: item.category,
        destination: 'Amazon',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Error sending Lead / OutboundClick to Meta Pixel', e);
    }
  }
};

/**
 * Send test event to verify Pixel connection in Meta Events Manager
 */
export const sendMetaTestEvent = (): boolean => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('trackCustom', 'AdminPixelTestPing', {
        message: 'PawMartFinder Meta Ads Test Event',
        platform: 'Web',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      console.error('Error firing test ping', e);
      return false;
    }
  }
  return false;
};
