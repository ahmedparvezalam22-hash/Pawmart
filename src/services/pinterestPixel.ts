import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    pintrk?: any;
    _pintrk?: any;
  }
}

export interface PinterestAdsSettings {
  tagId: string; // e.g. 2612345678901
  domainVerification: string; // e.g. meta tag verification code
  enabled: boolean;
  enhancedMatch: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_pinterest_ads_settings';
const DEFAULT_SETTINGS: PinterestAdsSettings = {
  tagId: (import.meta.env.VITE_PINTEREST_TAG_ID as string) || '',
  domainVerification: '',
  enabled: false,
  enhancedMatch: true,
};

let pinterestScriptInjected = false;

/**
 * Get Pinterest Settings from local storage first (instant), then Firestore
 */
export const getCachedPinterestSettings = (): PinterestAdsSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Pinterest settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/pinterest_ads
 */
export const fetchPinterestSettingsFromFirestore = async (): Promise<PinterestAdsSettings> => {
  try {
    const ref = doc(db, 'settings', 'pinterest_ads');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as PinterestAdsSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applyPinterestDomainVerification(data.domainVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Pinterest settings from Firestore', e);
  }
  return getCachedPinterestSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const savePinterestSettings = async (
  settings: Partial<PinterestAdsSettings>
): Promise<PinterestAdsSettings> => {
  const current = getCachedPinterestSettings();
  const updated: PinterestAdsSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applyPinterestDomainVerification(updated.domainVerification);

  try {
    const ref = doc(db, 'settings', 'pinterest_ads');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Pinterest settings to Firestore (saved locally)', e);
  }

  // Reinitialize or update Pinterest Tag
  if (updated.enabled && updated.tagId.trim()) {
    injectAndInitPinterest(updated.tagId.trim());
  }

  return updated;
};

/**
 * Update the <meta name="p:domain_verify"> tag in document.head
 */
export const applyPinterestDomainVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="p:domain_verify"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'p:domain_verify');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Injects Pinterest Tag base code and initializes with tagId
 */
export const injectAndInitPinterest = (tagId: string) => {
  if (typeof window === 'undefined' || !tagId) return;

  const cleanId = tagId.trim();
  if (!cleanId) return;

  // If already initialized
  if (window.pintrk && pinterestScriptInjected) {
    try {
      window.pintrk('load', cleanId);
      window.pintrk('page');
    } catch (e) {
      console.warn('Pinterest Tag already active, reinit called', e);
    }
    return;
  }

  /* eslint-disable */
  (function (e: any) {
    if (!window.pintrk) {
      window.pintrk = function () {
        window.pintrk.queue.push(Array.prototype.slice.call(arguments));
      };
      var n: any = window.pintrk;
      n.queue = [];
      n.version = '3.0';
      var t = document.createElement('script');
      t.async = true;
      t.src = e;
      var r = document.getElementsByTagName('script')[0];
      if (r && r.parentNode) {
        r.parentNode.insertBefore(t, r);
      } else {
        document.head.appendChild(t);
      }
    }
  })('https://s.pinimg.com/ct/core.js');
  /* eslint-enable */

  pinterestScriptInjected = true;

  try {
    window.pintrk('load', cleanId);
    window.pintrk('page');
    console.info(`[Pinterest Tag] Initialized with Tag ID: ${cleanId}`);
  } catch (err) {
    console.warn('Failed to initialize Pinterest Tag with ID:', cleanId, err);
  }
};

/**
 * Initialize Pinterest Tag on app load
 */
export const initPinterestPixel = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedPinterestSettings();
  if (cached.domainVerification) {
    applyPinterestDomainVerification(cached.domainVerification);
  }
  if (cached.enabled && cached.tagId) {
    injectAndInitPinterest(cached.tagId);
  }

  // Fetch latest from Firestore in background
  try {
    const remote = await fetchPinterestSettingsFromFirestore();
    if (remote.enabled && remote.tagId) {
      injectAndInitPinterest(remote.tagId);
    }
    if (remote.domainVerification) {
      applyPinterestDomainVerification(remote.domainVerification);
    }
  } catch (e) {
    // Graceful fallback to cached
  }
};

/**
 * Track Page (called on router transitions)
 */
export const trackPinterestPageView = (pathName?: string) => {
  if (typeof window !== 'undefined' && window.pintrk) {
    try {
      window.pintrk('page', {
        page_name: document.title,
        page_path: pathName || window.location.pathname,
      });
    } catch (e) {
      console.warn('Could not fire Pinterest page event', e);
    }
  }
};

/**
 * Track Product View (PageVisit / ViewContent)
 */
export const trackPinterestProductView = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
}) => {
  if (typeof window !== 'undefined' && window.pintrk) {
    try {
      window.pintrk('track', 'pagevisit', {
        product_name: item.title,
        product_id: item.id,
        product_category: item.category,
        product_price: item.price || 0,
        currency: 'USD',
      });
    } catch (e) {
      console.warn('Could not fire Pinterest pagevisit event', e);
    }
  }
};

/**
 * Track Affiliate Click (Checkout / Outbound Lead)
 */
export const trackPinterestAffiliateClick = (item: {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}) => {
  if (typeof window !== 'undefined' && window.pintrk) {
    try {
      window.pintrk('track', 'checkout', {
        value: item.price || 0,
        order_quantity: 1,
        currency: 'USD',
        line_items: [
          {
            product_name: item.title,
            product_id: item.id,
            product_category: item.category,
            product_price: item.price || 0,
          },
        ],
        property: 'Amazon Associates',
      });

      // Also fire Lead conversion
      window.pintrk('track', 'lead', {
        lead_type: 'affiliate_outbound',
        destination: 'Amazon',
      });
    } catch (e) {
      console.warn('Could not fire Pinterest checkout event', e);
    }
  }
};

/**
 * Track Search Query
 */
export const trackPinterestSearch = (query: string) => {
  if (typeof window !== 'undefined' && window.pintrk && query.trim()) {
    try {
      window.pintrk('track', 'search', {
        search_query: query.trim(),
      });
    } catch (e) {
      console.warn('Could not fire Pinterest search event', e);
    }
  }
};

/**
 * Track Lead / Newsletter
 */
export const trackPinterestLead = (source: string = 'home_newsletter') => {
  if (typeof window !== 'undefined' && window.pintrk) {
    try {
      window.pintrk('track', 'lead', {
        lead_type: source,
      });
    } catch (e) {
      console.warn('Could not fire Pinterest lead event', e);
    }
  }
};

/**
 * Send a verification test event to Pinterest
 */
export const sendPinterestTestEvent = (): boolean => {
  if (typeof window !== 'undefined' && window.pintrk) {
    try {
      window.pintrk('track', 'custom', {
        event_name: 'AdminTestPing',
        source: 'PawMartFinderAdmin',
        timestamp: Date.now(),
      });
      return true;
    } catch (e) {
      console.warn('Could not fire Pinterest test event', e);
    }
  }
  return false;
};
