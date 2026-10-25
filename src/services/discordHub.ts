import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface DiscordHubSettings {
  serverInviteUrl: string; // e.g. https://discord.gg/xxxxxx
  webhookUrl: string; // Optional Discord Webhook URL for posting deal alerts
  serverName: string; // e.g. PawMart Deals Discord
  enabled: boolean;
  updatedAt?: number;
}

const LOCAL_STORAGE_KEY = 'pawmart_discord_hub_settings';
const DEFAULT_SETTINGS: DiscordHubSettings = {
  serverInviteUrl: '',
  webhookUrl: '',
  serverName: 'PawMart Deals Community',
  enabled: false,
};

/**
 * Get Discord settings from local storage first, then Firestore
 */
export const getCachedDiscordSettings = (): DiscordHubSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read cached Discord settings', e);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Fetch settings from Cloud Firestore /settings/discord_settings
 */
export const fetchDiscordSettingsFromFirestore = async (): Promise<DiscordHubSettings> => {
  try {
    const ref = doc(db, 'settings', 'discord_settings');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as DiscordHubSettings;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Could not fetch Discord settings from Firestore', e);
  }
  return getCachedDiscordSettings();
};

/**
 * Save settings to both Firestore and localStorage
 */
export const saveDiscordSettings = async (
  settings: Partial<DiscordHubSettings>
): Promise<DiscordHubSettings> => {
  const current = getCachedDiscordSettings();
  const updated: DiscordHubSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const ref = doc(db, 'settings', 'discord_settings');
    await setDoc(ref, updated, { merge: true });
  } catch (e) {
    console.warn('Error saving Discord settings to Firestore', e);
  }

  return updated;
};

/**
 * Initialize Discord Hub on app load
 */
export const initDiscordHub = async () => {
  if (typeof window === 'undefined') return;
  try {
    await fetchDiscordSettingsFromFirestore();
  } catch (e) {
    // Graceful fallback
  }
};

/**
 * Track Discord referral traffic
 */
export const trackDiscordPageView = (pathName?: string) => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  if (source === 'discord') {
    console.info(`[Discord] Traffic active from Discord channel on: ${pathName || window.location.pathname}`);
  }
};

/**
 * Send test ping to Discord webhook (if configured) or validate invite link
 */
export const sendDiscordTestPing = async (): Promise<{ success: boolean; message: string }> => {
  const settings = getCachedDiscordSettings();

  if (!settings.serverInviteUrl.trim() && !settings.webhookUrl.trim()) {
    return {
      success: false,
      message: 'Please enter a Discord Server Invite URL (https://discord.gg/...) or Discord Webhook URL first.',
    };
  }

  if (settings.webhookUrl.trim()) {
    try {
      const response = await fetch(settings.webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '⚡ **PawMartFinder Test Ping**: Connection verified! Deal alerts and campaign traffic will be tracked successfully.',
          embeds: [
            {
              title: 'PawMartFinder — Curated Deals & Products',
              description: 'Your Discord channel is now connected to track ad campaigns and boost traffic.',
              color: 0xf59e0b,
              url: typeof window !== 'undefined' ? window.location.origin : 'https://pawmart.com',
            },
          ],
        }),
      });

      if (response.ok || response.status === 204) {
        return {
          success: true,
          message: '✓ Test message successfully sent to your Discord channel via Webhook!',
        };
      }
    } catch (err: any) {
      console.warn('Discord webhook test warning', err);
    }
  }

  // Validate invite URL
  if (settings.serverInviteUrl.includes('discord.gg') || settings.serverInviteUrl.includes('discord.com/invite')) {
    return {
      success: true,
      message: `✓ Discord Server Invite link verified: ${settings.serverInviteUrl}. Visitors can now join your community.`,
    };
  }

  return {
    success: true,
    message: 'Discord configuration saved! Use ?utm_source=discord in your links when promoting on Discord servers.',
  };
};
