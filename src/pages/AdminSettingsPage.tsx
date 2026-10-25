import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Database,
  RefreshCw,
  CheckCircle2,
  Share2,
  Activity,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Zap,
  Video,
  Flame,
  Radio,
  Layers,
  ArrowUpRight,
  Globe,
  FileText,
  Search,
  Copy,
} from 'lucide-react';
import { seedProductsIfEmpty, forceSeedProducts } from '../firebase/products';

// Meta Pixel
import {
  getCachedMetaSettings,
  fetchMetaSettingsFromFirestore,
  saveMetaSettings,
  sendMetaTestEvent,
  MetaAdsSettings,
} from '../services/metaPixel';

// TikTok Pixel
import {
  getCachedTikTokSettings,
  fetchTikTokSettingsFromFirestore,
  saveTikTokSettings,
  sendTikTokTestEvent,
  TikTokAdsSettings,
} from '../services/tiktokPixel';

// Snapchat Pixel
import {
  getCachedSnapchatSettings,
  fetchSnapchatSettingsFromFirestore,
  saveSnapchatSettings,
  sendSnapTestEvent,
  SnapchatAdsSettings,
} from '../services/snapchatPixel';

// Google Analytics 4 (GA4)
import {
  getCachedGA4Settings,
  fetchGA4SettingsFromFirestore,
  saveGA4Settings,
  sendGA4TestEvent,
  GoogleAnalyticsSettings,
} from '../services/ga4Analytics';

// Pinterest Ads
import {
  getCachedPinterestSettings,
  fetchPinterestSettingsFromFirestore,
  savePinterestSettings,
  sendPinterestTestEvent,
  PinterestAdsSettings,
} from '../services/pinterestPixel';

// Quora Ads
import {
  getCachedQuoraSettings,
  fetchQuoraSettingsFromFirestore,
  saveQuoraSettings,
  sendQuoraTestEvent,
  QuoraAdsSettings,
} from '../services/quoraPixel';

// Tumblr Blaze
import {
  getCachedTumblrSettings,
  fetchTumblrSettingsFromFirestore,
  saveTumblrSettings,
  sendTumblrTestPing,
  TumblrBlazeSettings,
} from '../services/tumblrBlaze';

// Discord Hub & Ads
import {
  getCachedDiscordSettings,
  fetchDiscordSettingsFromFirestore,
  saveDiscordSettings,
  sendDiscordTestPing,
  DiscordHubSettings,
} from '../services/discordHub';

// X (Twitter) Ads Pixel
import {
  getCachedXSettings,
  fetchXSettingsFromFirestore,
  saveXSettings,
  sendXTestEvent,
  XAdsSettings,
} from '../services/xAdsPixel';

// YouTube Ads & Video Campaigns
import {
  getCachedYouTubeSettings,
  fetchYouTubeSettingsFromFirestore,
  saveYouTubeSettings,
  sendYouTubeTestEvent,
  YouTubeAdsSettings,
} from '../services/youtubeAds';

export const AdminSettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'all' | 'ga4' | 'meta' | 'tiktok' | 'snapchat' | 'pinterest' | 'quora' | 'tumblr' | 'discord' | 'xads' | 'youtube' | 'database'
  >('all');

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Google Analytics 4 (GA4) Settings state
  const [ga4Settings, setGa4Settings] = useState<GoogleAnalyticsSettings>(getCachedGA4Settings());
  const [ga4MeasurementIdInput, setGa4MeasurementIdInput] = useState(ga4Settings.measurementId || '');
  const [ga4SiteVerificationInput, setGa4SiteVerificationInput] = useState(ga4Settings.siteVerification || '');
  const [ga4Enabled, setGa4Enabled] = useState(ga4Settings.enabled);
  const [savingGA4, setSavingGA4] = useState(false);
  const [ga4SavedMessage, setGa4SavedMessage] = useState<string | null>(null);
  const [ga4TestStatus, setGa4TestStatus] = useState<string | null>(null);
  const [sitemapCopied, setSitemapCopied] = useState(false);
  const [robotsCopied, setRobotsCopied] = useState(false);

  // Meta Pixel & Ads Settings state
  const [metaSettings, setMetaSettings] = useState<MetaAdsSettings>(getCachedMetaSettings());
  const [pixelIdInput, setPixelIdInput] = useState(metaSettings.pixelId || '');
  const [domainVerificationInput, setDomainVerificationInput] = useState(metaSettings.domainVerification || '');
  const [metaEnabled, setMetaEnabled] = useState(metaSettings.enabled);
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSavedMessage, setMetaSavedMessage] = useState<string | null>(null);
  const [metaTestStatus, setMetaTestStatus] = useState<string | null>(null);

  // TikTok Pixel & Ads Settings state
  const [tiktokSettings, setTiktokSettings] = useState<TikTokAdsSettings>(getCachedTikTokSettings());
  const [tiktokPixelIdInput, setTiktokPixelIdInput] = useState(tiktokSettings.pixelId || '');
  const [tiktokVerifyInput, setTiktokVerifyInput] = useState(tiktokSettings.domainVerification || '');
  const [tiktokEnabled, setTiktokEnabled] = useState(tiktokSettings.enabled);
  const [savingTikTok, setSavingTikTok] = useState(false);
  const [tiktokSavedMessage, setTiktokSavedMessage] = useState<string | null>(null);
  const [tiktokTestStatus, setTiktokTestStatus] = useState<string | null>(null);

  // Snapchat Pixel & Ads Settings state
  const [snapSettings, setSnapSettings] = useState<SnapchatAdsSettings>(getCachedSnapchatSettings());
  const [snapPixelIdInput, setSnapPixelIdInput] = useState(snapSettings.pixelId || '');
  const [snapVerifyInput, setSnapVerifyInput] = useState(snapSettings.domainVerification || '');
  const [snapEnabled, setSnapEnabled] = useState(snapSettings.enabled);
  const [savingSnap, setSavingSnap] = useState(false);
  const [snapSavedMessage, setSnapSavedMessage] = useState<string | null>(null);
  const [snapTestStatus, setSnapTestStatus] = useState<string | null>(null);

  // Pinterest Ads Settings state
  const [pinterestSettings, setPinterestSettings] = useState<PinterestAdsSettings>(getCachedPinterestSettings());
  const [pinterestTagIdInput, setPinterestTagIdInput] = useState(pinterestSettings.tagId || '');
  const [pinterestVerifyInput, setPinterestVerifyInput] = useState(pinterestSettings.domainVerification || '');
  const [pinterestEnabled, setPinterestEnabled] = useState(pinterestSettings.enabled);
  const [savingPinterest, setSavingPinterest] = useState(false);
  const [pinterestSavedMessage, setPinterestSavedMessage] = useState<string | null>(null);
  const [pinterestTestStatus, setPinterestTestStatus] = useState<string | null>(null);

  // Quora Ads Settings state
  const [quoraSettings, setQuoraSettings] = useState<QuoraAdsSettings>(getCachedQuoraSettings());
  const [quoraPixelIdInput, setQuoraPixelIdInput] = useState(quoraSettings.pixelId || '');
  const [quoraEnabled, setQuoraEnabled] = useState(quoraSettings.enabled);
  const [savingQuora, setSavingQuora] = useState(false);
  const [quoraSavedMessage, setQuoraSavedMessage] = useState<string | null>(null);
  const [quoraTestStatus, setQuoraTestStatus] = useState<string | null>(null);

  // Tumblr Blaze Settings state
  const [tumblrSettings, setTumblrSettings] = useState<TumblrBlazeSettings>(getCachedTumblrSettings());
  const [tumblrBlogUrlInput, setTumblrBlogUrlInput] = useState(tumblrSettings.blogUrl || '');
  const [tumblrVerifyInput, setTumblrVerifyInput] = useState(tumblrSettings.domainVerification || '');
  const [tumblrTagIdInput, setTumblrTagIdInput] = useState(tumblrSettings.trackingTagId || '');
  const [tumblrEnabled, setTumblrEnabled] = useState(tumblrSettings.enabled);
  const [savingTumblr, setSavingTumblr] = useState(false);
  const [tumblrSavedMessage, setTumblrSavedMessage] = useState<string | null>(null);
  const [tumblrTestStatus, setTumblrTestStatus] = useState<string | null>(null);

  // Discord Hub Settings state
  const [discordSettings, setDiscordSettings] = useState<DiscordHubSettings>(getCachedDiscordSettings());
  const [discordInviteInput, setDiscordInviteInput] = useState(discordSettings.serverInviteUrl || '');
  const [discordWebhookInput, setDiscordWebhookInput] = useState(discordSettings.webhookUrl || '');
  const [discordServerNameInput, setDiscordServerNameInput] = useState(discordSettings.serverName || 'PawMart Community');
  const [discordEnabled, setDiscordEnabled] = useState(discordSettings.enabled);
  const [savingDiscord, setSavingDiscord] = useState(false);
  const [discordSavedMessage, setDiscordSavedMessage] = useState<string | null>(null);
  const [discordTestStatus, setDiscordTestStatus] = useState<string | null>(null);

  // X (Twitter) Ads Settings state
  const [xSettings, setXSettings] = useState<XAdsSettings>(getCachedXSettings());
  const [xPixelIdInput, setXPixelIdInput] = useState(xSettings.pixelId || '');
  const [xHandleInput, setXHandleInput] = useState(xSettings.handle || '@PawMartFinder');
  const [xEnabled, setXEnabled] = useState(xSettings.enabled);
  const [savingX, setSavingX] = useState(false);
  const [xSavedMessage, setXSavedMessage] = useState<string | null>(null);
  const [xTestStatus, setXTestStatus] = useState<string | null>(null);

  // YouTube Ads & Video Campaigns state
  const [youtubeSettings, setYouTubeSettings] = useState<YouTubeAdsSettings>(getCachedYouTubeSettings());
  const [youtubeConversionIdInput, setYouTubeConversionIdInput] = useState(youtubeSettings.conversionId || '');
  const [youtubeConversionLabelInput, setYouTubeConversionLabelInput] = useState(youtubeSettings.conversionLabel || '');
  const [youtubeChannelUrlInput, setYouTubeChannelUrlInput] = useState(youtubeSettings.channelUrl || '');
  const [youtubeEnabled, setYouTubeEnabled] = useState(youtubeSettings.enabled);
  const [youtubeRemarketing, setYouTubeRemarketing] = useState(youtubeSettings.remarketing);
  const [savingYouTube, setSavingYouTube] = useState(false);
  const [youtubeSavedMessage, setYouTubeSavedMessage] = useState<string | null>(null);
  const [youtubeTestStatus, setYouTubeTestStatus] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Settings & Growth Ad Networks — PawMartFinder Admin';

    fetchGA4SettingsFromFirestore().then((data) => {
      setGa4Settings(data);
      setGa4MeasurementIdInput(data.measurementId || '');
      setGa4SiteVerificationInput(data.siteVerification || '');
      setGa4Enabled(data.enabled);
    });

    fetchMetaSettingsFromFirestore().then((data) => {
      setMetaSettings(data);
      setPixelIdInput(data.pixelId || '');
      setDomainVerificationInput(data.domainVerification || '');
      setMetaEnabled(data.enabled);
    });

    fetchTikTokSettingsFromFirestore().then((data) => {
      setTiktokSettings(data);
      setTiktokPixelIdInput(data.pixelId || '');
      setTiktokVerifyInput(data.domainVerification || '');
      setTiktokEnabled(data.enabled);
    });

    fetchSnapchatSettingsFromFirestore().then((data) => {
      setSnapSettings(data);
      setSnapPixelIdInput(data.pixelId || '');
      setSnapVerifyInput(data.domainVerification || '');
      setSnapEnabled(data.enabled);
    });

    fetchPinterestSettingsFromFirestore().then((data) => {
      setPinterestSettings(data);
      setPinterestTagIdInput(data.tagId || '');
      setPinterestVerifyInput(data.domainVerification || '');
      setPinterestEnabled(data.enabled);
    });

    fetchQuoraSettingsFromFirestore().then((data) => {
      setQuoraSettings(data);
      setQuoraPixelIdInput(data.pixelId || '');
      setQuoraEnabled(data.enabled);
    });

    fetchTumblrSettingsFromFirestore().then((data) => {
      setTumblrSettings(data);
      setTumblrBlogUrlInput(data.blogUrl || '');
      setTumblrVerifyInput(data.domainVerification || '');
      setTumblrTagIdInput(data.trackingTagId || '');
      setTumblrEnabled(data.enabled);
    });

    fetchDiscordSettingsFromFirestore().then((data) => {
      setDiscordSettings(data);
      setDiscordInviteInput(data.serverInviteUrl || '');
      setDiscordWebhookInput(data.webhookUrl || '');
      setDiscordServerNameInput(data.serverName || 'PawMart Community');
      setDiscordEnabled(data.enabled);
    });

    fetchXSettingsFromFirestore().then((data) => {
      setXSettings(data);
      setXPixelIdInput(data.pixelId || '');
      setXHandleInput(data.handle || '@PawMartFinder');
      setXEnabled(data.enabled);
    });

    fetchYouTubeSettingsFromFirestore().then((data) => {
      setYouTubeSettings(data);
      setYouTubeConversionIdInput(data.conversionId || '');
      setYouTubeConversionLabelInput(data.conversionLabel || '');
      setYouTubeChannelUrlInput(data.channelUrl || '');
      setYouTubeEnabled(data.enabled);
      setYouTubeRemarketing(data.remarketing);
    });
  }, []);

  const handleSeed = async (force: boolean = false) => {
    try {
      setSeeding(true);
      setSeedMessage(null);
      if (force) {
        await forceSeedProducts();
        setSeedMessage('Complete 20-product curated catalog re-seeded successfully!');
      } else {
        const res = await seedProductsIfEmpty();
        if (res) {
          setSeedMessage('Sample catalog loaded successfully!');
        } else {
          setSeedMessage('Catalog already has products. Use "Force Re-Seed" if you want to overwrite/refresh.');
        }
      }
    } catch (err: any) {
      setSeedMessage('Error: ' + (err.message || 'Operation failed'));
    } finally {
      setSeeding(false);
    }
  };

  // --- Meta Save & Ping ---
  const handleSaveMetaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeta(true);
    setMetaSavedMessage(null);

    try {
      const updated = await saveMetaSettings({
        pixelId: pixelIdInput.trim(),
        domainVerification: domainVerificationInput.trim(),
        enabled: metaEnabled,
      });
      setMetaSettings(updated);
      setMetaSavedMessage('Meta Ads & Pixel settings successfully saved to Cloud Firestore!');
      setTimeout(() => setMetaSavedMessage(null), 4000);
    } catch (err: any) {
      setMetaSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleSendMetaTestPing = () => {
    if (!metaEnabled || !pixelIdInput.trim()) {
      setMetaTestStatus('Please enter a valid Meta Pixel ID and ensure Tracking is toggled ON first.');
      return;
    }
    const success = sendMetaTestEvent();
    if (success) {
      setMetaTestStatus('✓ Test event dispatched! Check Meta Events Manager (Test Events tab) to verify live receipt.');
    } else {
      setMetaTestStatus('Pixel is initializing. Save settings first, then click Test Event.');
    }
    setTimeout(() => setMetaTestStatus(null), 5000);
  };

  // --- TikTok Save & Ping ---
  const handleSaveTikTokSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTikTok(true);
    setTiktokSavedMessage(null);

    try {
      const updated = await saveTikTokSettings({
        pixelId: tiktokPixelIdInput.trim(),
        domainVerification: tiktokVerifyInput.trim(),
        enabled: tiktokEnabled,
      });
      setTiktokSettings(updated);
      setTiktokSavedMessage('TikTok Ads & Pixel settings successfully saved to Cloud Firestore!');
      setTimeout(() => setTiktokSavedMessage(null), 4000);
    } catch (err: any) {
      setTiktokSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingTikTok(false);
    }
  };

  const handleSendTikTokTestPing = () => {
    if (!tiktokEnabled || !tiktokPixelIdInput.trim()) {
      setTiktokTestStatus('Please enter a valid TikTok Pixel ID and ensure Tracking is toggled ON first.');
      return;
    }
    const success = sendTikTokTestEvent();
    if (success) {
      setTiktokTestStatus('✓ Test event dispatched! Check TikTok Events Manager (Test Events tab) to verify live receipt.');
    } else {
      setTiktokTestStatus('TikTok Pixel is initializing. Save settings first, then click Test Ping.');
    }
    setTimeout(() => setTiktokTestStatus(null), 5000);
  };

  // --- Snapchat Save & Ping ---
  const handleSaveSnapchatSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSnap(true);
    setSnapSavedMessage(null);

    try {
      const updated = await saveSnapchatSettings({
        pixelId: snapPixelIdInput.trim(),
        domainVerification: snapVerifyInput.trim(),
        enabled: snapEnabled,
      });
      setSnapSettings(updated);
      setSnapSavedMessage('Snapchat Ads & Snap Pixel settings successfully saved to Cloud Firestore!');
      setTimeout(() => setSnapSavedMessage(null), 4000);
    } catch (err: any) {
      setSnapSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingSnap(false);
    }
  };

  const handleSendSnapTestPing = () => {
    if (!snapEnabled || !snapPixelIdInput.trim()) {
      setSnapTestStatus('Please enter a valid Snap Pixel ID and ensure Tracking is toggled ON first.');
      return;
    }
    const success = sendSnapTestEvent();
    if (success) {
      setSnapTestStatus('✓ Test event dispatched! Check Snapchat Ads Manager (Event Diagnostics) to verify live receipt.');
    } else {
      setSnapTestStatus('Snapchat Pixel is initializing. Save settings first, then click Test Ping.');
    }
    setTimeout(() => setSnapTestStatus(null), 5000);
  };

  // --- GA4 Save & Ping ---
  const handleSaveGA4Settings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGA4(true);
    setGa4SavedMessage(null);

    try {
      const updated = await saveGA4Settings({
        measurementId: ga4MeasurementIdInput.trim().toUpperCase(),
        siteVerification: ga4SiteVerificationInput.trim(),
        enabled: ga4Enabled,
      });
      setGa4Settings(updated);
      setGa4SavedMessage('Google Analytics 4 (GA4) settings successfully saved to Cloud Firestore!');
      setTimeout(() => setGa4SavedMessage(null), 4000);
    } catch (err: any) {
      setGa4SavedMessage('Failed to save GA4 settings: ' + err.message);
    } finally {
      setSavingGA4(false);
    }
  };

  const handleSendGA4TestPing = () => {
    if (!ga4Enabled || !ga4MeasurementIdInput.trim()) {
      setGa4TestStatus('Please enter a valid GA4 Measurement ID (e.g. G-XXXXXXXXXX) and ensure Tracking is toggled ON first.');
      return;
    }
    const res = sendGA4TestEvent();
    setGa4TestStatus(res.message);
    setTimeout(() => setGa4TestStatus(null), 6000);
  };

  // --- Pinterest Save & Ping ---
  const handleSavePinterestSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPinterest(true);
    setPinterestSavedMessage(null);

    try {
      const updated = await savePinterestSettings({
        tagId: pinterestTagIdInput.trim(),
        domainVerification: pinterestVerifyInput.trim(),
        enabled: pinterestEnabled,
      });
      setPinterestSettings(updated);
      setPinterestSavedMessage('Pinterest Ads Tag settings successfully saved to Cloud Firestore!');
      setTimeout(() => setPinterestSavedMessage(null), 4000);
    } catch (err: any) {
      setPinterestSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingPinterest(false);
    }
  };

  const handleSendPinterestTestPing = () => {
    if (!pinterestEnabled || !pinterestTagIdInput.trim()) {
      setPinterestTestStatus('Please enter a valid Pinterest Tag ID and ensure Tracking is toggled ON first.');
      return;
    }
    const success = sendPinterestTestEvent();
    if (success) {
      setPinterestTestStatus('✓ Test event dispatched! Check Pinterest Ads Manager (Events History) to verify live receipt.');
    } else {
      setPinterestTestStatus('Pinterest Tag is initializing. Save settings first, then click Test Ping.');
    }
    setTimeout(() => setPinterestTestStatus(null), 5000);
  };

  // --- Quora Save & Ping ---
  const handleSaveQuoraSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQuora(true);
    setQuoraSavedMessage(null);

    try {
      const updated = await saveQuoraSettings({
        pixelId: quoraPixelIdInput.trim(),
        enabled: quoraEnabled,
      });
      setQuoraSettings(updated);
      setQuoraSavedMessage('Quora Pixel settings successfully saved to Cloud Firestore!');
      setTimeout(() => setQuoraSavedMessage(null), 4000);
    } catch (err: any) {
      setQuoraSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingQuora(false);
    }
  };

  const handleSendQuoraTestPing = () => {
    if (!quoraEnabled || !quoraPixelIdInput.trim()) {
      setQuoraTestStatus('Please enter a valid Quora Pixel ID and ensure Tracking is toggled ON first.');
      return;
    }
    const success = sendQuoraTestEvent();
    if (success) {
      setQuoraTestStatus('✓ Test event dispatched! Check Quora Ads Manager (Pixel & Events) to verify live receipt.');
    } else {
      setQuoraTestStatus('Quora Pixel is initializing. Save settings first, then click Test Ping.');
    }
    setTimeout(() => setQuoraTestStatus(null), 5000);
  };

  // --- Tumblr Blaze Save & Ping ---
  const handleSaveTumblrSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTumblr(true);
    setTumblrSavedMessage(null);

    try {
      const updated = await saveTumblrSettings({
        blogUrl: tumblrBlogUrlInput.trim(),
        domainVerification: tumblrVerifyInput.trim(),
        trackingTagId: tumblrTagIdInput.trim(),
        enabled: tumblrEnabled,
      });
      setTumblrSettings(updated);
      setTumblrSavedMessage('Tumblr Blaze settings successfully saved to Cloud Firestore!');
      setTimeout(() => setTumblrSavedMessage(null), 4000);
    } catch (err: any) {
      setTumblrSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingTumblr(false);
    }
  };

  const handleSendTumblrTestPing = () => {
    const res = sendTumblrTestPing();
    setTumblrTestStatus(res.message);
    setTimeout(() => setTumblrTestStatus(null), 5000);
  };

  // --- Discord Hub Save & Ping ---
  const handleSaveDiscordSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDiscord(true);
    setDiscordSavedMessage(null);

    try {
      const updated = await saveDiscordSettings({
        serverInviteUrl: discordInviteInput.trim(),
        webhookUrl: discordWebhookInput.trim(),
        serverName: discordServerNameInput.trim(),
        enabled: discordEnabled,
      });
      setDiscordSettings(updated);
      setDiscordSavedMessage('Discord Community & Hub settings successfully saved to Cloud Firestore!');
      setTimeout(() => setDiscordSavedMessage(null), 4000);
    } catch (err: any) {
      setDiscordSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingDiscord(false);
    }
  };

  const handleSendDiscordTestPing = async () => {
    setDiscordTestStatus('Testing Discord connection...');
    const res = await sendDiscordTestPing();
    setDiscordTestStatus(res.message);
    setTimeout(() => setDiscordTestStatus(null), 6000);
  };

  // --- X (Twitter) Ads Save & Ping ---
  const handleSaveXSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingX(true);
    setXSavedMessage(null);

    try {
      const updated = await saveXSettings({
        pixelId: xPixelIdInput.trim(),
        handle: xHandleInput.trim(),
        enabled: xEnabled,
      });
      setXSettings(updated);
      setXSavedMessage('X (Twitter) Ads settings successfully saved to Cloud Firestore!');
      setTimeout(() => setXSavedMessage(null), 4000);
    } catch (err: any) {
      setXSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingX(false);
    }
  };

  const handleSendXTestEvent = () => {
    const res = sendXTestEvent();
    setXTestStatus(res.message);
    setTimeout(() => setXTestStatus(null), 5000);
  };

  // --- YouTube Ads Save & Ping ---
  const handleSaveYouTubeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingYouTube(true);
    setYouTubeSavedMessage(null);

    try {
      const updated = await saveYouTubeSettings({
        conversionId: youtubeConversionIdInput.trim().toUpperCase(),
        conversionLabel: youtubeConversionLabelInput.trim(),
        channelUrl: youtubeChannelUrlInput.trim(),
        enabled: youtubeEnabled,
        remarketing: youtubeRemarketing,
      });
      setYouTubeSettings(updated);
      setYouTubeSavedMessage('YouTube Video Ads settings successfully saved to Cloud Firestore!');
      setTimeout(() => setYouTubeSavedMessage(null), 4000);
    } catch (err: any) {
      setYouTubeSavedMessage('Failed to save settings: ' + err.message);
    } finally {
      setSavingYouTube(false);
    }
  };

  const handleSendYouTubeTestEvent = () => {
    const res = sendYouTubeTestEvent();
    setYouTubeTestStatus(res.message);
    setTimeout(() => setYouTubeTestStatus(null), 5000);
  };

  const isGA4Active = Boolean(ga4Settings.enabled && ga4Settings.measurementId.trim());
  const isMetaActive = Boolean(metaSettings.enabled && metaSettings.pixelId.trim());
  const isTikTokActive = Boolean(tiktokSettings.enabled && tiktokSettings.pixelId.trim());
  const isSnapActive = Boolean(snapSettings.enabled && snapSettings.pixelId.trim());
  const isPinterestActive = Boolean(pinterestSettings.enabled && pinterestSettings.tagId.trim());
  const isQuoraActive = Boolean(quoraSettings.enabled && quoraSettings.pixelId.trim());
  const isTumblrActive = Boolean(tumblrSettings.enabled && (tumblrSettings.blogUrl.trim() || tumblrSettings.domainVerification.trim()));
  const isDiscordActive = Boolean(discordSettings.enabled && (discordSettings.serverInviteUrl.trim() || discordSettings.webhookUrl.trim()));
  const isXActive = Boolean(xSettings.enabled && xSettings.pixelId.trim());
  const isYouTubeActive = Boolean(youtubeSettings.enabled && youtubeSettings.conversionId.trim());

  return (
    <AdminRoute>
      <AdminLayout title="Omnichannel Ad Networks & Growth Settings">
        <div className="max-w-5xl space-y-8">
          
          {/* Header Intro */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Omnichannel Traffic & Ads Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Omnichannel Ad Networks & Conversion Boost Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Boost your store across <strong>Google Analytics 4</strong>, <strong>Meta (FB/IG/Threads)</strong>, <strong>TikTok</strong>, <strong>Snapchat</strong>, <strong>Pinterest Ads</strong>, <strong>Quora Ads</strong>, <strong>Tumblr Blaze</strong>, and <strong>Discord</strong>. Track every visitor, product view, and outbound Amazon affiliate click automatically to maximize your ad ROI.
            </p>
          </div>

          {/* Quick Platform Status Strip (8 Omnichannel Growth Networks) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. GA4 card status */}
            <div
              onClick={() => setActiveTab('ga4')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'ga4'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                  GA4
                </div>
                <div>
                  <h4 className="text-xs font-bold">Google Analytics</h4>
                  <p className={`text-[10px] ${activeTab === 'ga4' ? 'text-slate-900/80 font-medium' : 'text-slate-500'}`}>
                    Web Stream
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isGA4Active
                    ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isGA4Active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isGA4Active ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 2. Meta card status */}
            <div
              onClick={() => setActiveTab('meta')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'meta'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs border border-blue-400/40">
                  Meta
                </div>
                <div>
                  <h4 className="text-xs font-bold">Meta Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'meta' ? 'text-blue-100' : 'text-slate-500'}`}>
                    FB, IG, Threads
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isMetaActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isMetaActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isMetaActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 3. TikTok card status */}
            <div
              onClick={() => setActiveTab('tiktok')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'tiktok'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-cyan-400 border border-pink-500/40 flex items-center justify-center font-black text-xs shadow-xs">
                  TT
                </div>
                <div>
                  <h4 className="text-xs font-bold">TikTok Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'tiktok' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Spark Ads
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isTikTokActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isTikTokActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isTikTokActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 4. Snapchat card status */}
            <div
              onClick={() => setActiveTab('snapchat')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'snapchat'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs border border-amber-500">
                  👻
                </div>
                <div>
                  <h4 className="text-xs font-bold">Snapchat Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'snapchat' ? 'text-amber-950/70' : 'text-slate-500'}`}>
                    Snap Pixel
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSnapActive
                    ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSnapActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isSnapActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 5. Pinterest card status */}
            <div
              onClick={() => setActiveTab('pinterest')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'pinterest'
                  ? 'bg-[#E60023] text-white border-[#E60023] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E60023] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-bold">Pinterest Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'pinterest' ? 'text-red-100' : 'text-slate-500'}`}>
                    Pinterest Tag
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isPinterestActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isPinterestActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isPinterestActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 6. Quora card status */}
            <div
              onClick={() => setActiveTab('quora')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'quora'
                  ? 'bg-[#b92b27] text-white border-[#b92b27] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#b92b27] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  Q
                </div>
                <div>
                  <h4 className="text-xs font-bold">Quora Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'quora' ? 'text-red-100' : 'text-slate-500'}`}>
                    Quora Pixel
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isQuoraActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isQuoraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isQuoraActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 7. Tumblr Blaze card status */}
            <div
              onClick={() => setActiveTab('tumblr')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'tumblr'
                  ? 'bg-[#36465D] text-white border-[#36465D] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#36465D] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  t
                </div>
                <div>
                  <h4 className="text-xs font-bold">Tumblr Blaze</h4>
                  <p className={`text-[10px] ${activeTab === 'tumblr' ? 'text-slate-200' : 'text-slate-500'}`}>
                    Post Boost
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isTumblrActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isTumblrActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isTumblrActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 8. Discord Hub status */}
            <div
              onClick={() => setActiveTab('discord')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'discord'
                  ? 'bg-[#5865F2] text-white border-[#5865F2] shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5865F2] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  DC
                </div>
                <div>
                  <h4 className="text-xs font-bold">Discord Hub</h4>
                  <p className={`text-[10px] ${activeTab === 'discord' ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Community & Webhook
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isDiscordActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDiscordActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isDiscordActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 9. X (Twitter) Ads status */}
            <div
              onClick={() => setActiveTab('xads')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'xads'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-xs border border-slate-700">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold">X (Twitter) Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'xads' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Twitter Pixel
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isXActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isXActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isXActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>

            {/* 10. YouTube Ads status */}
            <div
              onClick={() => setActiveTab('youtube')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold">YouTube Ads</h4>
                  <p className={`text-[10px] ${activeTab === 'youtube' ? 'text-red-100' : 'text-slate-500'}`}>
                    Video Campaigns
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isYouTubeActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-200/50 text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isYouTubeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isYouTubeActive ? 'Live' : 'Setup'}</span>
              </span>
            </div>
          </div>

          {/* Navigation Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              View All Channels
            </button>
            <button
              onClick={() => setActiveTab('ga4')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'ga4'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Google Analytics 4 & SEO
            </button>
            <button
              onClick={() => setActiveTab('pinterest')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'pinterest'
                  ? 'bg-[#E60023] text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pinterest Ads
            </button>
            <button
              onClick={() => setActiveTab('quora')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'quora'
                  ? 'bg-[#b92b27] text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Quora Ads
            </button>
            <button
              onClick={() => setActiveTab('tumblr')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'tumblr'
                  ? 'bg-[#36465D] text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tumblr Blaze
            </button>
            <button
              onClick={() => setActiveTab('discord')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'discord'
                  ? 'bg-[#5865F2] text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Discord Hub
            </button>
            <button
              onClick={() => setActiveTab('tiktok')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'tiktok'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              TikTok Ads
            </button>
            <button
              onClick={() => setActiveTab('snapchat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'snapchat'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Snapchat Ads
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'meta'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Meta Ads
            </button>
            <button
              onClick={() => setActiveTab('xads')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'xads'
                  ? 'bg-black text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              X (Twitter) Ads
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              YouTube Ads
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Catalog & Database
            </button>
          </div>

          {/* ======================================================== */}
          {/* 0. GOOGLE ANALYTICS 4 (GA4) INTEGRATION CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'ga4') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-300/40 shadow-xs">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Google Analytics 4 (GA4) & Tag Measurement
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isGA4Active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isGA4Active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isGA4Active ? 'Live & Tracking' : 'Not Connected'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stream ID measurement, automated multi-device campaign attribution (Google Ads, Meta, TikTok, Snap), and Amazon outbound affiliate click conversion tracking.
                    </p>
                  </div>
                </div>

                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <span>Open Google Analytics</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Status Message */}
              {ga4SavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{ga4SavedMessage}</span>
                </div>
              )}

              {ga4TestStatus && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    ga4TestStatus.includes('✓') || ga4TestStatus.includes('success')
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  <Activity className="w-4 h-4 flex-shrink-0" />
                  <span>{ga4TestStatus}</span>
                </div>
              )}

              {/* Form Controls */}
              <form onSubmit={handleSaveGA4Settings} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* GA4 Measurement ID */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                      GA4 Measurement ID (Stream ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ga4MeasurementIdInput}
                      onChange={(e) => setGa4MeasurementIdInput(e.target.value.toUpperCase())}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Found in Google Analytics 4: <strong>Admin &gt; Data collection &gt; Data Streams &gt; Web &gt; Measurement ID</strong>.
                    </p>
                  </div>

                  {/* Google Site Verification */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                      Google Search Console / Site Verification
                    </label>
                    <input
                      type="text"
                      value={ga4SiteVerificationInput}
                      onChange={(e) => setGa4SiteVerificationInput(e.target.value)}
                      placeholder="e.g. google-site-verification code"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Automatically injects <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&lt;meta name="google-site-verification"&gt;</code> into document head.
                    </p>
                  </div>
                </div>

                {/* Enable / Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Enable Google Analytics 4 Tracking
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      When enabled, page views, search queries, categories, and Amazon outbound affiliate clicks are sent to your GA4 property in real-time.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ga4Enabled}
                      onChange={(e) => setGa4Enabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingGA4}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingGA4 ? 'Saving...' : 'Save GA4 Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendGA4TestPing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Send Test Event to GA4</span>
                  </button>
                </div>
              </form>

              {/* GA4 Setup & Realtime Verification Guide */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-slate-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Google Analytics 4 (GA4) সেটআপ এবং রিয়েল-টাইম ট্র্যাকিং গাইড</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. Measurement ID সংগ্রহ করুন</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong>analytics.google.com</strong>-এ গিয়ে Admin (গিয়ার আইকন) &gt; Data collection &gt; <strong>Data Streams &gt; Web</strong>-এ ক্লিক করে আপনার <strong>Measurement ID (G-XXXXXXXXXX)</strong> কপি করে উপরের বক্সে বসান।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. Realtime Report যাচাই করুন</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      সেটিংস সেভ করে <strong>"Send Test Event to GA4"</strong> বাটনে ক্লিক করুন। এরপর গুগল অ্যানালিটিক্সের <strong>Reports &gt; Realtime</strong> পেজে ৩-৫ সেকেন্ডের মধ্যে আপনার লাইভ ভিজিট ও ইভেন্ট দেখতে পাবেন।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. ই-কমার্স ও অ্যাড ট্রাফিক ট্র্যাকিং</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Meta, TikTok, Snapchat ও Google Ads-এর সব ক্যাম্পেইন প্যারামিটার (<code>utm_source</code>, <code>fbclid</code>, <code>ttclid</code>, <code>gclid</code>) স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে। ভিজিটর <strong>Amazon</strong> বাটনে ক্লিক করলেই <code>click_affiliate_link</code> এবং <code>begin_checkout</code> ইভেন্ট রেকর্ড হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* GOOGLE SEARCH CONSOLE & SEO SUITE */}
              {/* ======================================================== */}
              <div className="pt-6 border-t border-slate-100 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        Google Search Console & Organic SEO Engine
                      </h4>
                      <p className="text-xs text-slate-500">
                        Sitemap.xml, Robots.txt, Schema.org Rich Snippets, and Canonical indexing status.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
                    >
                      <span>Google Search Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Sitemap & Robots Card Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sitemap.xml card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>XML Sitemap (Canonical Index)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        Active & Generated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Contains all 14 product categories, 20 curated products, blog guides, and policy pages with daily update frequencies.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>View /sitemap.xml</span>
                      </a>

                      <button
                        type="button"
                        onClick={async () => {
                          const url = `${window.location.origin}/sitemap.xml`;
                          try {
                            await navigator.clipboard.writeText(url);
                            setSitemapCopied(true);
                            setTimeout(() => setSitemapCopied(false), 3000);
                          } catch {
                            // Fallback
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        {sitemapCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Sitemap URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Robots.txt card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Robots.txt (Crawler Directives)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        Googlebot Allowed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Allows all Googlebot index crawlers across all public content while safeguarding private admin routes (<code className="bg-white px-1 py-0.2 rounded border">/admin/*</code>).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>View /robots.txt</span>
                      </a>

                      <button
                        type="button"
                        onClick={async () => {
                          const url = `${window.location.origin}/robots.txt`;
                          try {
                            await navigator.clipboard.writeText(url);
                            setRobotsCopied(true);
                            setTimeout(() => setRobotsCopied(false), 3000);
                          } catch {
                            // Fallback
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        {robotsCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Robots URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Google SEO Health Checklist */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Google Search Engine Optimization (SEO) Health Checklist</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      100% SEO Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Canonical URLs</span>
                        <span className="text-[11px] text-slate-400">&lt;link rel="canonical"&gt; on all pages</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Schema.org JSON-LD</span>
                        <span className="text-[11px] text-slate-400">Product, Breadcrumbs &amp; Blog Rich Snippets</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Googlebot Directives</span>
                        <span className="text-[11px] text-slate-400">max-image-preview:large &amp; snippet</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">OpenGraph &amp; Twitter</span>
                        <span className="text-[11px] text-slate-400">High-res 1200x630 share cards</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Mobile-First Viewport</span>
                        <span className="text-[11px] text-slate-400">Responsive, fast &amp; iOS PWA ready</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Search Console Tag</span>
                        <span className="text-[11px] text-slate-400">
                          {ga4SiteVerificationInput ? 'Code Connected' : 'Ready to verify'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* External SEO audit links */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Google SEO টেস্টিং টুলস:</span>
                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Rich Results Test</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span>•</span>
                    <a
                      href="https://pagespeed.web.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>PageSpeed Insights</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. TIKTOK ADS INTEGRATION CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'tiktok') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-black text-cyan-400 border border-pink-500/40 shadow-md">
                    <Video className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        TikTok Ads Integration (TikTok Pixel & Spark Ads)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isTikTokActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isTikTokActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isTikTokActive ? 'TikTok Pixel Active' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Boost high-energy viral TikTok short videos and Spark Ads directly to PawMartFinder. Every visitor, view, and Amazon outbound click is measured in TikTok Ads Manager.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendTikTokTestPing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    title="Send test event to TikTok Events Manager"
                  >
                    <Zap className="w-3.5 h-3.5 text-pink-500" />
                    <span>Send TikTok Test Ping</span>
                  </button>
                </div>
              </div>

              {tiktokTestStatus && (
                <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <span>{tiktokTestStatus}</span>
                </div>
              )}

              {tiktokSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{tiktokSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveTikTokSettings} className="space-y-5">
                {/* Toggle switch for enabled */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="tiktokEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable TikTok Pixel Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Tracks TikTok Ad traffic, page visits, product views (ViewContent), search queries, and Amazon affiliate button clicks (InitiateCheckout).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="tiktokEnabledToggle"
                      type="checkbox"
                      checked={tiktokEnabled}
                      onChange={(e) => setTiktokEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                {/* TikTok Pixel ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>TikTok Pixel ID (SDK ID)</span>
                    <a
                      href="https://ads.tiktok.com/i18n/events_manager/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px] normal-case"
                    >
                      <span>Find in TikTok Ads Manager → Tools → Events</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="text"
                    value={tiktokPixelIdInput}
                    onChange={(e) => setTiktokPixelIdInput(e.target.value)}
                    placeholder="e.g. C5A9O4BC77U87XXXXXXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste your TikTok Pixel ID (typically starts with letters like C...). Automatic standard event listeners for <code>Page</code>, <code>ViewContent</code>, and <code>InitiateCheckout</code> are attached automatically.
                  </p>
                </div>

                {/* TikTok Site Verification Meta Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>TikTok Developers Site Verification Code (Optional)</span>
                    <span className="text-slate-400 font-normal text-[11px] normal-case">
                      TikTok Business Center / Developer Portal
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tiktokVerifyInput}
                    onChange={(e) => setTiktokVerifyInput(e.target.value)}
                    placeholder="e.g. tiktok-developers-site-verification=xyz123"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    If TikTok requests HTML meta-tag domain verification, paste the code here. It is automatically injected into the site header.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingTikTok}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-pink-400" />
                    <span>{savingTikTok ? 'Saving...' : 'Save TikTok Configuration'}</span>
                  </button>
                </div>
              </form>

              {/* TikTok Step-by-Step Boost Strategy Guide */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span>TikTok Ads & Spark Ads Boost Guide (বাংলা ও English)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[10px] font-black">1</span>
                      <span>Campaign Objective</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      TikTok Ads Manager-এ <strong>Traffic</strong> অথবা <strong>Website Conversions</strong> নির্বাচন করুন। অপটিমাইজেশন গোল দিন <strong>Click / Landing Page View</strong> অথবা <strong>Initiate Checkout</strong>।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[10px] font-black">2</span>
                      <span>TikTok Spark Ads (সেরা ফলাফল)</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      আপনার TikTok একাউন্টে Cat/Dog রিলস, Aesthetic Phone Case বা Fashion হুডির ৩-৭ সেকেন্ডের হুক ভিডিও পোস্ট করে <strong>Spark Ads Code</strong> নিন। বিজ্ঞাপনটিতে ল্যান্ডিং পেজ হিসেবে PawMartFinder প্রোডাক্ট লিংক দিন।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[10px] font-black">3</span>
                      <span>Conversion Optimization</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ভিজিটররা যখনই <strong>Buy on Amazon</strong> বাটনে ক্লিক করবে, TikTok Pixel-এ <strong>InitiateCheckout</strong> এবং <strong>ClickButton</strong> ইভেন্ট ফায়ার হবে, যার ফলে TikTok অ্যালগরিদম আসল ক্রেতাদের কাছে অ্যাড পৌঁছে দেবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SNAPCHAT ADS INTEGRATION CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'snapchat') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 border border-amber-500 shadow-md">
                    <span className="text-2xl leading-none">👻</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Snapchat Ads Integration (Snap Pixel & Spotlight Boost)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isSnapActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSnapActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isSnapActive ? 'Snap Pixel Active' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Target Gen-Z and millennial pet owners, phone case lovers, and apparel buyers through Snapchat Story Ads and Spotlight promotions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendSnapTestPing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    title="Send test event to Snapchat Ads Manager"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Send Snap Test Ping</span>
                  </button>
                </div>
              </div>

              {snapTestStatus && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{snapTestStatus}</span>
                </div>
              )}

              {snapSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{snapSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveSnapchatSettings} className="space-y-5">
                {/* Toggle switch for enabled */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="snapEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Snap Pixel Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Tracks swipe-ups from Snapchat Stories, Spotlights, and Discovery ads, plus Amazon conversions (START_CHECKOUT).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="snapEnabledToggle"
                      type="checkbox"
                      checked={snapEnabled}
                      onChange={(e) => setSnapEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>

                {/* Snap Pixel ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Snap Pixel ID</span>
                    <a
                      href="https://ads.snapchat.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px] normal-case"
                    >
                      <span>Find in Snapchat Ads Manager → Assets → Pixels</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="text"
                    value={snapPixelIdInput}
                    onChange={(e) => setSnapPixelIdInput(e.target.value)}
                    placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste your UUID Snap Pixel ID from Snapchat Ads Manager. It automatically registers <code>PAGE_VIEW</code>, <code>VIEW_CONTENT</code>, and <code>START_CHECKOUT</code>.
                  </p>
                </div>

                {/* Snapchat Site Verification Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Snapchat Site Verification Code (Optional)</span>
                    <span className="text-slate-400 font-normal text-[11px] normal-case">
                      Snapchat Business Manager → Business Details
                    </span>
                  </label>
                  <input
                    type="text"
                    value={snapVerifyInput}
                    onChange={(e) => setSnapVerifyInput(e.target.value)}
                    placeholder="e.g. snapchat-site-verification=abcdef123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    If Snapchat Business Manager asks for meta-tag domain verification, paste the code here.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingSnap}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>{savingSnap ? 'Saving...' : 'Save Snapchat Configuration'}</span>
                  </button>
                </div>
              </form>

              {/* Snapchat Step-by-Step Boost Strategy Guide */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Snapchat Ads Boost Strategy (বাংলা ও English)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">1</span>
                      <span>Story & Spotlight Ads</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Snapchat Ads Manager-এ <strong>Drive Traffic to Website</strong> লক্ষ্য নির্বাচন করুন। ফরম্যাট হিসেবে <strong>Single Image or Video</strong> অথবা <strong>Collection Ads</strong> বেছে নিন।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">2</span>
                      <span>Targeting & Swipe-Up</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      টার্গেটিং-এ <strong>Pet Lovers, Fashionistas, Mobile Gamers & Gadget Enthusiasts</strong> যুক্ত করুন। কল টু অ্যাকশনে দিন <strong>Shop Now</strong> বা <strong>View More</strong>।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">3</span>
                      <span>Affiliate Conversion Track</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      স্ন্যাপচ্যাট থেকে আসা ভিজিটররা যখনই Amazon বাটনে ক্লিক করবেন, তখন Snap Pixel-এ স্বয়ংক্রিয়ভাবে <strong>START_CHECKOUT</strong> ইভেন্ট ফায়ার হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. META ADS (FACEBOOK, INSTAGRAM, THREADS) CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'meta') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Meta Ads Integration (Facebook, Instagram & Threads)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isMetaActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isMetaActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isMetaActive ? 'Meta Pixel Active' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Connect your Facebook / Instagram Pixel ID. Every visitor and Amazon affiliate button click will be tracked automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendMetaTestPing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    title="Fire a test event to verify in Meta Events Manager"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span>Send Meta Test Ping</span>
                  </button>
                </div>
              </div>

              {metaTestStatus && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{metaTestStatus}</span>
                </div>
              )}

              {metaSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{metaSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveMetaSettings} className="space-y-5">
                {/* Toggle switch for enabled */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="metaEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Meta Pixel Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Tracks PageViews on Facebook, Instagram & Threads ads, plus Amazon button clicks as Lead conversions.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="metaEnabledToggle"
                      type="checkbox"
                      checked={metaEnabled}
                      onChange={(e) => setMetaEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Meta Pixel ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Meta Pixel (Dataset) ID</span>
                    <a
                      href="https://business.facebook.com/events_manager2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px] normal-case"
                    >
                      <span>Get Pixel ID in Events Manager</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="text"
                    value={pixelIdInput}
                    onChange={(e) => setPixelIdInput(e.target.value)}
                    placeholder="e.g. 182746192837465"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    Enter your 15-16 digit Meta Pixel / Dataset ID. No coding needed — script and event listeners are automatically activated.
                  </p>
                </div>

                {/* Facebook Domain Verification Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Facebook Domain Verification Code (Optional)</span>
                    <span className="text-slate-400 font-normal text-[11px] normal-case">
                      Meta Business Settings → Brand Safety → Domains
                    </span>
                  </label>
                  <input
                    type="text"
                    value={domainVerificationInput}
                    onChange={(e) => setDomainVerificationInput(e.target.value)}
                    placeholder="e.g. abcdef0123456789xyz"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    If Meta Business Manager asks for HTML meta-tag domain verification, paste the code here. It is dynamically added to the site header.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingMeta}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-blue-400" />
                    <span>{savingMeta ? 'Saving...' : 'Save Meta Ads Configuration'}</span>
                  </button>
                </div>
              </form>

              {/* Step-by-Step Meta Ads Guide */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Meta Ads (Facebook, Instagram & Threads) Boost Strategy</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">1. Campaign Objective</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Meta Ads Manager-এ গিয়ে <strong>Traffic</strong> অথবা <strong>Leads</strong> ক্যাম্পেইন তৈরি করুন। ট্র্যাফিক ক্যাম্পেইনে লক্ষ্য দিন <strong>Website Link Clicks</strong> বা <strong>Landing Page Views</strong>।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">2. Placements (FB, IG, Threads)</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong>Advantage+ Placements</strong> নির্বাচন করুন। এতে আপনার বিজ্ঞাপন এক ক্লিকে <strong>Facebook Feed, Instagram Reels, Stories, Explore এবং Threads Feed</strong>-এ স্বয়ংক্রিয়ভাবে বুস্ট হবে।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">3. Outbound Affiliate Conversion</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ওয়েবসাইটে ভিজিটর যখনই কোনো প্রোডাক্টের <strong>Amazon</strong> বাটনে ক্লিক করবে, তখনই Meta Pixel-এ একটি <strong>Lead / AmazonOutboundClick</strong> ইভেন্ট ফায়ার হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.1. PINTEREST ADS (PINTEREST TAG & SHOPPING) CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'pinterest') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#E60023] text-white shadow-md shadow-red-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Pinterest Ads Integration (Pinterest Tag & Rich Pins)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isPinterestActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPinterestActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isPinterestActive ? 'Tag Active' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Connect your Pinterest Tag ID for Pinterest Ads, Idea Pin conversion tracking, and Rich Pin verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://ads.pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#E60023] hover:underline"
                  >
                    <span>Pinterest Ads Manager</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {pinterestTestStatus && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{pinterestTestStatus}</span>
                </div>
              )}

              {pinterestSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{pinterestSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSavePinterestSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="pinterestEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Pinterest Tag Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Tracks page visits, category browsing, and sends Checkout/Lead conversion signals on Amazon link clicks.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="pinterestEnabledToggle"
                      type="checkbox"
                      checked={pinterestEnabled}
                      onChange={(e) => setPinterestEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E60023]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Pinterest Tag ID (e.g., 2612345678901)
                    </label>
                    <input
                      type="text"
                      value={pinterestTagIdInput}
                      onChange={(e) => setPinterestTagIdInput(e.target.value)}
                      placeholder="e.g. 2612345678901"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Find in Pinterest Ads Manager &gt; Conversions &gt; Tag Manager.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Pinterest Domain Verification Meta Tag
                    </label>
                    <input
                      type="text"
                      value={pinterestVerifyInput}
                      onChange={(e) => setPinterestVerifyInput(e.target.value)}
                      placeholder="e.g. a1b2c3d4e5f6g7h8..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Auto-injects <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&lt;meta name="p:domain_verify"&gt;</code> into header.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPinterest}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingPinterest ? 'Saving...' : 'Save Pinterest Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendPinterestTestPing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E60023] hover:bg-[#d5001f] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Send Pinterest Test Ping</span>
                  </button>
                </div>
              </form>

              {/* Step-by-Step Pinterest Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-red-500/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E60023]" />
                  <span>Pinterest Ads & Shopping Boost Strategy</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. পিন ও শপিং ক্যাম্পেইন</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Pinterest Ads Manager-এ <strong>Consideration</strong> বা <strong>Conversions</strong> গোল সিলেক্ট করে হাই-কোয়ালিটি প্রোডাক্ট ইমেজ দিয়ে পিন অ্যাড চালান।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. কি-ওয়ার্ড ও ইন্টারেস্ট টার্গেটিং</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      "home decor", "pet essentials", "cute phone cases", "aesthetic outfits" ইত্যাদি হাই-সার্চ ভলিউম কি-ওয়ার্ড পিন ডেসক্রিপশনে ব্যবহার করুন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. অ্যামাজন আউটবাউন্ড কনভার্শন</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ভিজিটর পিন থেকে সাইটে এসে অ্যামাজন বাটনে ক্লিক করলেই Pinterest Tag-এ <code>checkout</code> এবং <code>lead</code> ইভেন্ট স্বয়ংক্রিয়ভাবে রেকর্ড হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.2. QUORA ADS (QUORA PIXEL) CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'quora') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#b92b27] text-white shadow-md shadow-red-500/20">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Quora Ads Integration (Quora Pixel)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isQuoraActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isQuoraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isQuoraActive ? 'Pixel Active' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Target high-intent shoppers searching questions on Quora (e.g. "What is the best cat tree?" or "Top office chairs").
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://www.quora.com/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#b92b27] hover:underline"
                  >
                    <span>Quora Ads Manager</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {quoraTestStatus && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{quoraTestStatus}</span>
                </div>
              )}

              {quoraSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{quoraSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveQuoraSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="quoraEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Quora Pixel Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Fires Generic page views, ViewContent, and InitiateCheckout conversions for Quora Ads campaigns.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="quoraEnabledToggle"
                      type="checkbox"
                      checked={quoraEnabled}
                      onChange={(e) => setQuoraEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b92b27]"></div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Quora Pixel ID
                  </label>
                  <input
                    type="text"
                    value={quoraPixelIdInput}
                    onChange={(e) => setQuoraPixelIdInput(e.target.value)}
                    placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Find in Quora Ads Manager &gt; Pixels & Conversions.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingQuora}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingQuora ? 'Saving...' : 'Save Quora Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendQuoraTestPing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#b92b27] hover:bg-[#a32420] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Send Quora Test Ping</span>
                  </button>
                </div>
              </form>

              {/* Step-by-Step Quora Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-red-900/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#b92b27]" />
                  <span>Quora Ads Boost & Intent Strategy</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. কোয়েশ্চেন টার্গেটিং (Question Targeting)</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      কোরাতে যেসব মানুষ নির্দিষ্ট প্রোডাক্টের রিভিউ বা রেকমেন্ডেশন খুঁজছে তাদের প্রশ্নের নিচে আপনার অ্যাড দেখান (যেমন: "Which dog food is best?").
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. টপিক ও কি-ওয়ার্ড</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Pets, Consumer Electronics, Home Office, Men's Fashion ইত্যাদি ক্যাটাগরি টপিক নির্বাচন করে হাই-কনভার্টিং ট্র্যাফিক আনুন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. চেকআউট ট্র্যাক</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      কোরা ভিজিটররা Amazon বাটনে ক্লিক করলে কোরা পিক্সেলে <code>InitiateCheckout</code> ইভেন্ট ট্র্যাক হবে, যা অ্যালগরিদমকে বেস্ট বায়ার খুঁজতে সাহায্য করে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.3. TUMBLR BLAZE PROMOTION & TRACKING CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'tumblr') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#36465D] text-white shadow-md shadow-slate-700/20">
                    <Flame className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Tumblr Blaze Promotion & Domain Verification
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isTumblrActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTumblrActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isTumblrActive ? 'Blaze Connected' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Boost your posts with Tumblr Blaze across Tumblr Dashboards worldwide and track incoming traffic automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://www.tumblr.com/blaze"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#36465D] hover:underline"
                  >
                    <span>About Tumblr Blaze</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {tumblrTestStatus && (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>{tumblrTestStatus}</span>
                </div>
              )}

              {tumblrSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{tumblrSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveTumblrSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="tumblrEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Tumblr Blaze Integration
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Enables domain verification and auto-captures Tumblr campaign attribution (?utm_source=tumblr).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="tumblrEnabledToggle"
                      type="checkbox"
                      checked={tumblrEnabled}
                      onChange={(e) => setTumblrEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#36465D]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Tumblr Blog or Post URL
                    </label>
                    <input
                      type="url"
                      value={tumblrBlogUrlInput}
                      onChange={(e) => setTumblrBlogUrlInput(e.target.value)}
                      placeholder="https://yourbrand.tumblr.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Your Tumblr blog link where you post and Blaze products.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Tumblr Site Verification Code
                    </label>
                    <input
                      type="text"
                      value={tumblrVerifyInput}
                      onChange={(e) => setTumblrVerifyInput(e.target.value)}
                      placeholder="e.g. tumblr-site-verification token"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Auto-injects <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">&lt;meta name="tumblr-site-verification"&gt;</code> into header.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingTumblr}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingTumblr ? 'Saving...' : 'Save Tumblr Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTumblrTestPing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#36465D] hover:bg-[#2c394c] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verify Blaze Config</span>
                  </button>
                </div>
              </form>

              {/* Tumblr Blaze Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Tumblr Blaze Promotion Strategy</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. নান্দনিক প্রোডাক্ট পোস্ট তৈরি</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Tumblr-এ আকর্ষণীয় ছবি ও অ্যানিমেশন সহ পোস্ট তৈরি করুন। পোস্টে আপনার ওয়েবসাইটের প্রোডাক্ট লিংক দিন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. Blaze বাটন চেপে বুস্ট</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      পোস্টের নিচের <strong>Blaze</strong> ফ্লেম আইকনে ক্লিক করে বাজেট নির্ধারণ করুন (যেমন $১০ থেকে $৫০)। এটি মুহূর্তে লাখ লাখ টাম্বলার ড্যাশবোর্ডে ছড়িয়ে পড়বে।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. স্বয়ংক্রিয় ট্র্যাকিং</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      পোস্ট লিংকে <code>?utm_source=tumblr&utm_medium=blaze</code> যোগ করুন। সাইট ভিজিটরদের কার্যকলাপ GA4 ও অন্যান্য ট্র্যাকিং মডিউলে সংরক্ষিত হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3.4. DISCORD COMMUNITY & AD TRAFFIC HUB CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'discord') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#5865F2] text-white shadow-md shadow-indigo-500/20">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Discord Community & Ad Traffic Hub
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isDiscordActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isDiscordActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isDiscordActive ? 'Hub Connected' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Promote trending deals across Discord servers, communities, and send instant deal drops via Discord Webhook.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5865F2] hover:underline"
                  >
                    <span>Discord Platform</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {discordTestStatus && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>{discordTestStatus}</span>
                </div>
              )}

              {discordSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{discordSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveDiscordSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="discordEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable Discord Hub & Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Enables Discord community invite link and captures Discord campaign traffic (?utm_source=discord).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="discordEnabledToggle"
                      type="checkbox"
                      checked={discordEnabled}
                      onChange={(e) => setDiscordEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Discord Server Invite URL
                    </label>
                    <input
                      type="url"
                      value={discordInviteInput}
                      onChange={(e) => setDiscordInviteInput(e.target.value)}
                      placeholder="https://discord.gg/yourserver"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Share link for visitors and shoppers to join your Discord server.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Discord Channel Webhook URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={discordWebhookInput}
                      onChange={(e) => setDiscordWebhookInput(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Channel Settings &gt; Integrations &gt; Webhooks &gt; New Webhook.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingDiscord}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingDiscord ? 'Saving...' : 'Save Discord Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendDiscordTestPing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Send Discord Test Ping</span>
                  </button>
                </div>
              </form>

              {/* Discord Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-indigo-50/60 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#5865F2]" />
                  <span>Discord Traffic & Community Strategy</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. ডিসকর্ড সার্ভারে ডিল শেয়ার</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      গেমিং, ফ্যাশন, পেট লাভার্স সার্ভারে ডিসকর্ড রিচ প্রিভিউ কার্ড সহ লিংক পেস্ট করুন। ছবি ও বিবরণ প্রিভিউ আকারে সুন্দর দেখাবে।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. নিজস্ব কমিউনিটি ড্রাইভ</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ভিজিটরদের আপনার নিজস্ব ডিসকর্ড সার্ভারে আমন্ত্রণ জানান এবং নতুন অ্যামাজন ডিল এলে সরাসরি নোটিফাই করুন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. ওয়েবহুক অ্যালার্টস</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ডিসকর্ড ওয়েবহুক ইন্টিগ্রেট করে নতুন প্রোডাক্ট বা হট অফার সরাসরি আপনার ডিসকর্ড চ্যানেলে অটো-পোস্ট করতে পারেন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* X (TWITTER) ADS INTEGRATION CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'xads') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-black text-white border border-slate-800 shadow-md">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        X (Twitter) Ads Integration (Twitter Pixel &amp; Universal Tag)
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isXActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isXActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isXActive ? 'Live & Tracking' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Run Promoted Posts &amp; Conversion Campaigns on X (Twitter). Tracks page views, twclid attribution, and Amazon outbound affiliate clicks.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://ads.x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
                  >
                    <span>X Ads Manager</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {xTestStatus && (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <span>{xTestStatus}</span>
                </div>
              )}

              {xSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{xSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveXSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="xEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable X (Twitter) Pixel Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      When enabled, loads Twitter uwt.js and tracks conversions for X Ad campaigns.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="xEnabledToggle"
                      type="checkbox"
                      checked={xEnabled}
                      onChange={(e) => setXEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      X Pixel ID (Twitter Website Tag) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={xPixelIdInput}
                      onChange={(e) => setXPixelIdInput(e.target.value.trim())}
                      placeholder="e.g. tw-xxxxx-xxxxx or alphanumeric"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Found in <strong>ads.x.com &gt; Tools &gt; Events manager</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Brand X Handle
                    </label>
                    <input
                      type="text"
                      value={xHandleInput}
                      onChange={(e) => setXHandleInput(e.target.value)}
                      placeholder="@PawMartFinder"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Associated with Twitter Card attribution and promoted campaign tweets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingX}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingX ? 'Saving...' : 'Save X Ads Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendXTestEvent}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Send X Ads Test Event</span>
                  </button>
                </div>
              </form>

              {/* X Ads Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>X (Twitter) Ads সেটআপ ও ক্যাম্পেইন গাইড</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. Twitter Pixel ID সংগ্রহ</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong>ads.x.com</strong>-এ গিয়ে Tools &gt; <strong>Events manager</strong> থেকে আপনার পিক্সেল আইডি সংগ্রহ করে উপরের বক্সে পেস্ট করুন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. twclid ক্লিক ট্র্যাকিং</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      X Ads থেকে আসা প্রতিটি ক্লিকে <code>twclid</code> প্যারামিটার ক্যাপচার হয় এবং ব্যবহারকারীর সেশন জুড়ে সংরক্ষিত থাকে।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. ই-কমার্স কনভার্সন ট্র্যাকিং</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ভিজিটর যখনই Amazon বাটনে ক্লিক করবে, তখনই <code>initiate_checkout</code> এবং ভ্যালু ইভেন্ট হিসেবে রেকর্ড হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* YOUTUBE ADS INTEGRATION CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'youtube') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-red-600 text-white border border-red-500 shadow-md">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        YouTube Ads &amp; Google Video Campaigns
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isYouTubeActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isYouTubeActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isYouTubeActive ? 'Live & Tracking' : 'Setup Required'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Run YouTube In-stream, Shorts, and Bumper Video Ads. Captures mobile app modeled click IDs (wbraid, gbraid, gclid) and records conversion goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://ads.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                  >
                    <span>Google Ads Manager</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {youtubeTestStatus && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{youtubeTestStatus}</span>
                </div>
              )}

              {youtubeSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{youtubeSavedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveYouTubeSettings} className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <label htmlFor="ytEnabledToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Enable YouTube Video Ads Tracking
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Enables Google Ads video conversion measurement and remarketing audiences.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="ytEnabledToggle"
                      type="checkbox"
                      checked={youtubeEnabled}
                      onChange={(e) => setYouTubeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Google Ads Conversion ID (for YouTube) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={youtubeConversionIdInput}
                      onChange={(e) => setYouTubeConversionIdInput(e.target.value.toUpperCase())}
                      placeholder="AW-XXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono uppercase"
                    />
                    <p className="text-[11px] text-slate-400">
                      Found in <strong>Google Ads &gt; Goals &gt; Conversions &gt; Summary &gt; Tag setup</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      YouTube Conversion Action Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={youtubeConversionLabelInput}
                      onChange={(e) => setYouTubeConversionLabelInput(e.target.value.trim())}
                      placeholder="e.g. AbC_123XyZ or AW-XXXX/Label"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-400">
                      Conversion action label created for YouTube video click attribution.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    YouTube Channel / Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={youtubeChannelUrlInput}
                    onChange={(e) => setYouTubeChannelUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/@YourChannel"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingYouTube}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingYouTube ? 'Saving...' : 'Save YouTube Ads Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendYouTubeTestEvent}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Send YouTube Test Event</span>
                  </button>
                </div>
              </form>

              {/* YouTube Ads Strategy */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-red-50/60 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>YouTube Ads ও ভিডিও ক্যাম্পেইন ট্র্যাকিং গাইড</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">১. Google Ads (AW-XXXXXXXXX)</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ইউটিউব বিজ্ঞাপন সরাসরি গুগল অ্যাডস নেটওয়ার্কে চলে। আপনার Google Ads Conversion ID (AW-XXXXXXXXX) ও লেবেল এখানে সংযুক্ত করুন।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">২. YouTube Shorts ও In-stream ক্লিক</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ইউটিউব মোবাইল অ্যাপ ও ওয়েবসাইট থেকে আসা ক্লিকের <code>gclid</code>, <code>wbraid</code> এবং <code>gbraid</code> স্বয়ংক্রিয়ভাবে ট্র্যাক হয়।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                    <p className="font-bold text-slate-900">৩. অ্যামাজন অ্যাফিলিয়েট কনভার্সন</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ভিজিটর ইউটিউব অ্যাড দেখে এসে অ্যামাজনে ক্লিক করলেই গুগল অ্যাডস ভিডিও ক্যাম্পেইনে সফল কনভার্সন হিসেবে গণনা হবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. DATABASE UTILITIES & SAMPLE RESTORE CARD */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'database') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Catalog & Database Utilities</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                If your database needs replenishing or you want to restore curated sample products across all categories (Cats, Dogs, Phone Cases, T-Shirts, Hoodies, Books, etc.), use the options below.
              </p>

              {seedMessage && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>{seedMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSeed(false)}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Seeding...' : 'Seed Catalog If Empty'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSeed(true)}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Updating...' : '⚡ Force Restore Sample Catalog'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. ADMIN PROFILE BOX */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Administrator Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Admin Name</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{profile?.name || 'Parvez'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Admin Email</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user?.email || 'admin@pawmart.com'}</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. AMAZON PARTNER INTEGRITY */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Partner Policy & Outbound Links
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PawMartFinder preserves every administrator product link exactly as input in Firestore. All outbound links open in secure tabs with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">rel="noopener noreferrer"</code> and automatically trigger <strong>TikTok</strong> (<code>InitiateCheckout</code> / <code>ClickButton</code>), <strong>Snapchat</strong> (<code>START_CHECKOUT</code>), and <strong>Meta</strong> (<code>Lead</code> / <code>AmazonOutboundClick</code>) Conversion events.
            </p>
          </div>

        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
