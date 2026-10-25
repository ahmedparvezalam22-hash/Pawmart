import React, { useState, useEffect } from 'react';
import { 
  Share, 
  PlusSquare, 
  X, 
  Smartphone, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  ChevronRight, 
  Laptop, 
  Download, 
  ExternalLink,
  Layers,
  Monitor
} from 'lucide-react';

type DeviceTab = 'ios' | 'android' | 'desktop';

export const IOSQuickAccessPrompt: React.FC = () => {
  const [deviceType, setDeviceType] = useState<DeviceTab>('ios');
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppSource, setInAppSource] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [androidInstalled, setAndroidInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const ua = window.navigator.userAgent.toLowerCase();

      // Detect iOS devices
      const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      // Detect Android
      const isAndroid = /android/.test(ua);

      // Detect in-app browsers
      let appName = '';
      if (/fban|fbav/i.test(ua)) appName = 'Facebook';
      else if (/instagram/i.test(ua)) appName = 'Instagram';
      else if (/tiktok|musical_ly|bytedanceweb/i.test(ua)) appName = 'TikTok';
      else if (/snapchat/i.test(ua)) appName = 'Snapchat';
      else if (/threads/i.test(ua)) appName = 'Threads';
      else if (/micromessenger|line/i.test(ua)) appName = 'In-App Browser';

      const inApp = !!appName;

      // Standalone mode detection (PWA / Added to Home Screen)
      const isStandalone = 
        ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) || 
        window.matchMedia('(display-mode: standalone)').matches;

      setIsIOSDevice(isIOS);
      setIsInAppBrowser(inApp);
      setInAppSource(appName);
      setIsStandaloneMode(!!isStandalone);

      // Set active tab based on detected device
      if (isIOS) {
        setDeviceType('ios');
      } else if (isAndroid) {
        setDeviceType('android');
      } else {
        setDeviceType('desktop');
      }

      // Check if user dismissed prompt recently (7 days)
      const dismissedAt = localStorage.getItem('pawmart_device_prompt_dismissed');
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const isDismissed = dismissedAt && (now - parseInt(dismissedAt, 10)) < sevenDays;

      // Show bottom quick-access bar for mobile visitors (iOS or Android) if not already installed & not dismissed
      if ((isIOS || isAndroid) && !isStandalone && !isDismissed) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Device quick access detection error', e);
    }
  }, []);

  // Capture Android PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setAndroidInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen to manual open event (e.g. from footer link or menu)
  useEffect(() => {
    const handleOpenGuide = () => {
      setShowFullGuide(true);
      setIsVisible(true);
    };
    window.addEventListener('open-ios-guide', handleOpenGuide);
    window.addEventListener('open-device-guide', handleOpenGuide);
    return () => {
      window.removeEventListener('open-ios-guide', handleOpenGuide);
      window.removeEventListener('open-device-guide', handleOpenGuide);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowFullGuide(false);
    try {
      localStorage.setItem('pawmart_device_prompt_dismissed', Date.now().toString());
    } catch (e) {
      // Safe fallback for restricted storage environments
    }
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setAndroidInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.warn('Installation prompt dismissed or failed', e);
    }
  };

  // If not visible and modal is closed, don't render anything
  if (!isVisible && !showFullGuide) return null;

  return (
    <>
      {/* Floating Bottom Quick Bar for Mobile Visitors (iPhone & Android) */}
      {!showFullGuide && isVisible && (
        <div 
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-amber-500/30 animate-in slide-in-from-bottom duration-300"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  {isIOSDevice ? 'iPhone Quick Access' : 'Quick Access Setup'}
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-slate-100 mt-1 leading-snug">
                {isIOSDevice ? '1-Tap Easy Access on iPhone' : '1-Tap Easy Access on Your Phone'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Add to your home screen for an instant, full-screen shopping experience.
              </p>

              {/* In-app browser notice */}
              {isInAppBrowser && (
                <div className="mt-2 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 shrink-0" />
                  <span>Visiting from {inAppSource || 'social ads'}? Tap ••• to open in Safari/Chrome.</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowFullGuide(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition active:scale-95"
                >
                  View Steps
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition shrink-0"
              aria-label="Close prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step-by-Step Multi-Device Modal Guide (100% English) */}
      {showFullGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 max-h-[92vh] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 p-4 sm:p-5 relative">
              <button
                type="button"
                onClick={() => setShowFullGuide(false)}
                className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition"
                aria-label="Close guide"
              >
                <X className="w-4 h-4 text-slate-950" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/90 shadow-sm flex items-center justify-center text-amber-600 font-extrabold text-lg">
                  🐾
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight leading-tight">
                    Quick Access & Setup Guide
                  </h3>
                  <p className="text-xs text-amber-950/80 font-medium">
                    Fast access on iPhone, Android, Tablet, or Computer
                  </p>
                </div>
              </div>

              {/* Device Tabs */}
              <div className="flex items-center gap-1.5 mt-3.5 bg-black/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDeviceType('ios')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'ios'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-950/80 hover:text-slate-950 hover:bg-white/40'
                  }`}
                >
                  <span>🍎</span>
                  <span>iPhone / iOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType('android')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'android'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-950/80 hover:text-slate-950 hover:bg-white/40'
                  }`}
                >
                  <span>🤖</span>
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType('desktop')}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'desktop'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-950/80 hover:text-slate-950 hover:bg-white/40'
                  }`}
                >
                  <span>💻</span>
                  <span>PC / Mac</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              {/* In-app browser tips for Meta Ads, Snap Ads & TikTok Ads */}
              {isInAppBrowser && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 flex items-start gap-3">
                  <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-950">
                      Browsing via {inAppSource || 'Social Media Ads'}?
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      For peak performance, instant loading, and seamless external orders, tap the <strong>••• (Options)</strong> button at the top corner and choose <strong>&ldquo;Open in Safari&rdquo;</strong> (iPhone) or <strong>&ldquo;Open in Chrome&rdquo;</strong> (Android).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: IPHONE / IOS GUIDE */}
              {deviceType === 'ios' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      3 Simple Steps for iPhone & iPad:
                    </p>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Safari Recommended
                    </span>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        Tap the Share Button
                        <Share className="w-3.5 h-3.5 text-blue-500 inline" />
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        In Safari, tap the <strong>Share</strong> icon (square with an arrow pointing up) at the bottom or top of your screen.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        Select &ldquo;Add to Home Screen&rdquo;
                        <PlusSquare className="w-3.5 h-3.5 text-amber-600 inline" />
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Scroll down the sharing sheet and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        Tap &ldquo;Add&rdquo;
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner. PawMart will appear on your home screen just like an app icon!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANDROID GUIDE */}
              {deviceType === 'android' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Fast Setup for Android:
                    </p>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Chrome & Samsung Internet
                    </span>
                  </div>

                  {deferredPrompt && !androidInstalled && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Direct 1-Click Install Available</p>
                        <p className="text-[11px] text-slate-600">Install directly to your Android launcher.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleInstallAndroid}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Install App
                      </button>
                    </div>
                  )}

                  {/* Android Step 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900">
                        Open the Browser Menu
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Tap the <strong>three vertical dots (⋮)</strong> at the top right of Google Chrome or Samsung Internet.
                      </p>
                    </div>
                  </div>

                  {/* Android Step 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900">
                        Select &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong> from the dropdown menu.
                      </p>
                    </div>
                  </div>

                  {/* Android Step 3 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900">
                        Confirm Install
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Tap <strong>Install</strong>. You can now launch PawMart directly from your app drawer and home screen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DESKTOP / LAPTOP / COMPUTER */}
              {deviceType === 'desktop' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quick Access on Computer & Laptop:
                    </p>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Mac, Windows & Chromebook
                    </span>
                  </div>

                  {/* Desktop Tip 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        Bookmark with Keyboard Shortcut
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-mono text-[10px]">Ctrl + D</kbd> (Windows) or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-mono text-[10px]">⌘ + D</kbd> (Mac) to bookmark PawMart to your browser toolbar.
                      </p>
                    </div>
                  </div>

                  {/* Desktop Tip 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900">
                        Install as Desktop App (Chrome & Edge)
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Look for the <strong>Install</strong> icon (computer monitor with download arrow 🖥️) on the right side of your browser URL bar and click to install PawMart as a standalone window.
                      </p>
                    </div>
                  </div>

                  {/* Desktop Tip 3 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold text-slate-900">
                        Pin to Taskbar or Dock
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Pin the installed app or browser tab to your Windows Taskbar or macOS Dock for instant 1-click access anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Universal Benefits Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Why use Quick Access?</p>
                <p className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Full-screen, ultra-fast browsing without address bar clutter
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Favorite items and shopping selections stay saved
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Optimized specifically for ad traffic from Meta, TikTok & Snapchat
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition text-center"
              >
                Got It, Thanks!
              </button>
              <button
                type="button"
                onClick={() => setShowFullGuide(false)}
                className="py-2.5 px-3 text-xs text-slate-500 hover:text-slate-700 font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

