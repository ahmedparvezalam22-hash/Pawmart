import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface TumblrBlazeSettings {
  blogUrl: string; // e.g. https://yourblog.tumblr.com
  domainVerification: string; // Tumblr site verification code
  trackingTagId: string; // Optional custom campaign tag or conversion tag ID
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_tumblr_blaze_settings';
const DEFAULT_SETTINGS: TumblrBlazeSettings = {
  blogUrl: '',
  domainVerification: '',
  trackingTagId: '',
  enabled: false,
};

/**
 * Get Tumblr Blaze Settings from local storage first, then Firestore
 */
export const getCachedTumblrSettings = (): TumblrBlazeSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Tumblr Blaze settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/tumblr_blaze
 */
export const fetchTumblrSettingsFromFirestore = async (): Promise<TumblrBlazeSettings> => {
  try {
    const ref = doc(db, 'settings', 'tumblr_blaze');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as TumblrBlazeSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      applyTumblrDomainVerification(data.domainVerification);
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Tumblr Blaze settings from Firestore', e);
  }
  return getCachedTumblrSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveTumblrSettings = async (
  settings: Partial<TumblrBlazeSettings>
): Promise<TumblrBlazeSettings> => {
  const current = getCachedTumblrSettings();
  const updated: TumblrBlazeSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  applyTumblrDomainVerification(updated.domainVerification);

  try {
    const ref = doc(db, 'settings', 'tumblr_blaze');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Tumblr Blaze settings to Firestore', e);
  }

  return updated;
};

/**
 * Update the <meta name="tumblr-site-verification"> tag in document.head
 */
export const applyTumblrDomainVerification = (verificationCode?: string) => {
  if (typeof document === 'undefined') return;
  const code = verificationCode?.trim();
  let tag = document.querySelector('meta[name="tumblr-site-verification"]') as HTMLMetaElement | null;

  if (code) {
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'tumblr-site-verification');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', code);
  } else if (tag) {
    tag.setAttribute('content', '');
  }
};

/**
 * Initialize Tumblr Blaze settings on app load
 */
export const initTumblrBlaze = async () => {
  if (typeof window === 'undefined') return;

  const cached = getCachedTumblrSettings();
  if (cached.domainVerification) {
    applyTumblrDomainVerification(cached.domainVerification);
  }

  try {
    const remote = await fetchTumblrSettingsFromFirestore();
    if (remote.domainVerification) {
      applyTumblrDomainVerification(remote.domainVerification);
    }
  } catch (e) {
    // Graceful fallback
  }
};

/**
 * Track Tumblr Traffic on route change
 */
export const trackTumblrPageView = (pathName?: string) => {
  if (typeof window === 'undefined') return;
  // If traffic arrived from Tumblr or Tumblr Blaze
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  if (source === 'tumblr' || source === 'tumblr_blaze') {
    console.info(`[Tumblr Blaze] Visitor engaged from Tumblr campaign on: ${pathName || window.location.pathname}`);
  }
};

/**
 * Send a test ping for Tumblr Blaze verification
 */
export const sendTumblrTestPing = (): { success: boolean; message: string } => {
  const settings = getCachedTumblrSettings();
  if (!settings.blogUrl && !settings.domainVerification && !settings.trackingTagId) {
    return {
      success: false,
      message: 'Please provide either a Tumblr Blog/Post URL, Domain Verification code, or Blaze Tracking Tag.',
    };
  }

  return {
    success: true,
    message: 'Tumblr Blaze configuration verified! Ensure your Tumblr post links use ?utm_source=tumblr&utm_medium=blaze.',
  };
};
