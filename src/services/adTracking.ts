/**
 * Unified Omnichannel Ad & Analytics Engine for PawMartFinder
 * Supports Google Analytics 4 (GA4), Meta (FB/IG/Threads), TikTok, Snapchat,
 * Pinterest Ads, Quora Ads, Tumblr Blaze, and Discord Traffic Hub.
 */

import {
  initMetaPixel,
  trackMetaPageView,
  trackMetaProductView,
  trackMetaAffiliateClick,
} from './metaPixel';

import {
  initTikTokPixel,
  trackTikTokPageView,
  trackTikTokProductView,
  trackTikTokAffiliateClick,
  trackTikTokSearch,
} from './tiktokPixel';

import {
  initSnapPixel,
  trackSnapPageView,
  trackSnapProductView,
  trackSnapAffiliateClick,
  trackSnapSearch,
} from './snapchatPixel';

import {
  initGA4,
  trackGA4PageView,
  trackGA4ProductView,
  trackGA4AffiliateClick,
  trackGA4Search,
  trackGA4CategorySelect,
  trackGA4Lead,
} from './ga4Analytics';

import {
  initPinterestPixel,
  trackPinterestPageView,
  trackPinterestProductView,
  trackPinterestAffiliateClick,
  trackPinterestSearch,
  trackPinterestLead,
} from './pinterestPixel';

import {
  initQuoraPixel,
  trackQuoraPageView,
  trackQuoraProductView,
  trackQuoraAffiliateClick,
  trackQuoraSearch,
  trackQuoraLead,
} from './quoraPixel';

import {
  initTumblrBlaze,
  trackTumblrPageView,
} from './tumblrBlaze';

import {
  initDiscordHub,
  trackDiscordPageView,
} from './discordHub';

import {
  initXPixel,
  trackXPageView,
  trackXProductView,
  trackXAffiliateClick,
  trackXSearch,
  trackXLead,
} from './xAdsPixel';

import {
  initYouTubeAds,
  trackYouTubePageView,
  trackYouTubeProductView,
  trackYouTubeAffiliateClick,
} from './youtubeAds';

export interface TrackingProductPayload {
  id?: string;
  title: string;
  category?: string;
  price?: number;
  url?: string;
}

export interface AdAttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  ttclid?: string;
  ScCid?: string;
  gclid?: string;
  wbraid?: string; // YouTube mobile modeled conversion ID
  gbraid?: string; // YouTube app modeled conversion ID
  twclid?: string; // X (Twitter) Ads click ID
  epik?: string; // Pinterest click ID
  qclid?: string; // Quora click ID
  landingPath?: string;
  capturedAt?: number;
}

const ATTRIBUTION_STORAGE_KEY = 'pawmart_ad_attribution';

/**
 * Capture and safely persist Ad Click IDs and UTM campaign parameters across all channels
 * Meta Ads (fbclid), TikTok (ttclid), Snap (ScCid), Google (gclid), Pinterest (epik), Quora (qclid), Tumblr, Discord
 */
export const captureAndPreserveAdTraffic = (): AdAttributionData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid') || undefined;
    const ttclid = params.get('ttclid') || undefined;
    const ScCid = params.get('ScCid') || params.get('sccid') || undefined;
    const gclid = params.get('gclid') || undefined;
    const wbraid = params.get('wbraid') || undefined;
    const gbraid = params.get('gbraid') || undefined;
    const twclid = params.get('twclid') || undefined;
    const epik = params.get('epik') || undefined;
    const qclid = params.get('qclid') || undefined;
    const utm_source = params.get('utm_source') || undefined;
    const utm_medium = params.get('utm_medium') || undefined;
    const utm_campaign = params.get('utm_campaign') || undefined;
    const utm_content = params.get('utm_content') || undefined;
    const utm_term = params.get('utm_term') || undefined;

    // Check if any ad tracking or campaign params exist in current URL
    if (fbclid || ttclid || ScCid || gclid || wbraid || gbraid || twclid || epik || qclid || utm_source || utm_campaign) {
      const attribution: AdAttributionData = {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        fbclid,
        ttclid,
        ScCid,
        gclid,
        wbraid,
        gbraid,
        twclid,
        epik,
        qclid,
        landingPath: window.location.pathname,
        capturedAt: Date.now(),
      };

      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
      return attribution;
    }

    // Otherwise return existing session attribution if present
    const existing = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
  } catch (e) {
    // Graceful fallback for restricted WebViews / incognito mode
  }
  return null;
};

/**
 * Retrieve current session ad attribution data
 */
export const getActiveAdAttribution = (): AdAttributionData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore error
  }
  return null;
};

/**
 * Initialize all marketing & analytics pixels on app mount
 * (GA4, Meta, TikTok, Snapchat, Pinterest, Quora, Tumblr Blaze, Discord, X Ads, YouTube Ads)
 */
export const initAllMarketingPixels = async () => {
  try {
    // Capture any incoming ad traffic parameters first
    captureAndPreserveAdTraffic();

    await Promise.allSettled([
      initGA4(),
      initMetaPixel(),
      initTikTokPixel(),
      initSnapPixel(),
      initPinterestPixel(),
      initQuoraPixel(),
      initTumblrBlaze(),
      initDiscordHub(),
      initXPixel(),
      initYouTubeAds(),
    ]);
  } catch (e) {
    console.warn('Ad & analytics pixels initialization warning', e);
  }
};

/**
 * Track route / PageView across all channels
 */
export const trackAllPageView = (pathName?: string) => {
  trackGA4PageView(pathName);
  trackMetaPageView(pathName);
  trackTikTokPageView(pathName);
  trackSnapPageView(pathName);
  trackPinterestPageView(pathName);
  trackQuoraPageView(pathName);
  trackTumblrPageView(pathName);
  trackDiscordPageView(pathName);
  trackXPageView(pathName);
  trackYouTubePageView(pathName);
};

/**
 * Track Product ViewContent across all active ad networks
 */
export const trackAllProductView = (item: TrackingProductPayload) => {
  trackGA4ProductView(item);
  trackMetaProductView(item);
  trackTikTokProductView(item);
  trackSnapProductView(item);
  trackPinterestProductView(item);
  trackQuoraProductView(item);
  trackXProductView(item);
  trackYouTubeProductView(item);
};

/**
 * Track Outbound Affiliate Click (Amazon) across all active ad networks
 */
export const trackAllAffiliateClick = (item: TrackingProductPayload) => {
  trackGA4AffiliateClick(item);
  trackMetaAffiliateClick(item);
  trackTikTokAffiliateClick(item);
  trackSnapAffiliateClick(item);
  trackPinterestAffiliateClick(item);
  trackQuoraAffiliateClick(item);
  trackXAffiliateClick(item);
  trackYouTubeAffiliateClick(item);
};

/**
 * Track search queries across all active ad networks
 */
export const trackAllSearch = (query: string) => {
  trackGA4Search(query);
  trackTikTokSearch(query);
  trackSnapSearch(query);
  trackPinterestSearch(query);
  trackQuoraSearch(query);
  trackXSearch(query);
};

/**
 * Track category select on GA4
 */
export const trackCategoryNavigation = (category: string) => {
  trackGA4CategorySelect(category);
};

/**
 * Track newsletter or user lead signup across networks
 */
export const trackLeadConversion = (source: string) => {
  trackGA4Lead(source);
  trackPinterestLead(source);
  trackQuoraLead(source);
  trackXLead(source);
};
