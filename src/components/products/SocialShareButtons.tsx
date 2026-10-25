import React, { useState } from 'react';
import { Product } from '../../types';
import { Check, Copy, Share2, Mail, ExternalLink, Sparkles, X as CloseIcon } from 'lucide-react';

interface SocialShareButtonsProps {
  product: Product;
  variant?: 'inline' | 'compact' | 'full';
  className?: string;
  onShareClick?: () => void;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  product,
  variant = 'full',
  className = '',
  onShareClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://pawmart.com/product/${product.slug || product.id}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = `Check out ${product.title} on PawMartFinder!`;
  const shareSummary = product.shortDescription || `Discover ${product.title} with verified 100% direct official store links on PawMartFinder.`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedSummary = encodeURIComponent(shareSummary);
  const encodedImage = encodeURIComponent(product.imageUrl);
  const emailBody = encodeURIComponent(
    `Hi,\n\nI thought you might be interested in this product on PawMartFinder:\n\n${product.title}\n\nCheck it out here:\n${shareUrl}\n\nHappy browsing!`
  );
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodedTitle}&body=${emailBody}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail.trim())}&su=${encodedTitle}&body=${emailBody}`;

  const openShareWindow = (url: string, platformName: string) => {
    onShareClick?.();
    const width = 600;
    const height = 540;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

    window.open(
      url,
      `share-${platformName}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
    );

    setShareSuccessMessage(`Opening ${platformName}...`);
    setTimeout(() => setShareSuccessMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setShareSuccessMessage('Link copied to clipboard!');
        setTimeout(() => {
          setCopied(false);
          setShareSuccessMessage(null);
        }, 3000);
      }
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: shareUrl,
        });
        setShareSuccessMessage('Shared successfully!');
        setTimeout(() => setShareSuccessMessage(null), 3000);
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      handleCopyLink();
    }
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      badgeColor: 'text-[#25D366] bg-[#25D366]/10 border-[#25D366]/30',
      action: () =>
        openShareWindow(
          `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
          'WhatsApp'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      badgeColor: 'text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/30',
      action: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          'Facebook'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
      badgeColor: 'text-slate-900 bg-slate-900/10 border-slate-900/20',
      action: () =>
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
          'X'
        ),
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      color: 'bg-[#E60023] hover:bg-[#d5001f] text-white',
      badgeColor: 'text-[#E60023] bg-[#E60023]/10 border-[#E60023]/30',
      action: () =>
        openShareWindow(
          `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
          'Pinterest'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.5.03-3.58l1.07-4.52s-.27-.55-.27-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.98-.77 3.08-.22.92.46 1.67 1.37 1.67 1.64 0 2.9-1.73 2.9-4.22 0-2.2-1.58-3.75-3.84-3.75-2.62 0-4.15 1.96-4.15 3.99 0 .79.3 1.64.68 2.1a.34.34 0 0 1 .08.33l-.26 1.05c-.04.16-.14.2-.32.12-1.19-.55-1.93-2.29-1.93-3.69 0-3 2.18-5.76 6.29-5.76 3.3 0 5.87 2.35 5.87 5.5 0 3.28-2.07 5.92-4.94 5.92-.96 0-1.87-.5-2.18-1.1l-.59 2.27c-.22.83-.8 1.88-1.2 2.51A12 12 0 1 0 12 0z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] hover:bg-[#1f8fc4] text-white',
      badgeColor: 'text-[#229ED9] bg-[#229ED9]/10 border-[#229ED9]/30',
      action: () =>
        openShareWindow(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
          'Telegram'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.536-.196 1.006.128.832.939z" />
        </svg>
      ),
    },
    {
      name: 'Tumblr',
      color: 'bg-[#36465D] hover:bg-[#2c394c] text-white',
      badgeColor: 'text-[#36465D] bg-[#36465D]/10 border-[#36465D]/30',
      action: () =>
        openShareWindow(
          `https://www.tumblr.com/widgets/share/tool?posttype=link&title=${encodedTitle}&canonicalUrl=${encodedUrl}&caption=${encodedSummary}`,
          'Tumblr'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M14.563 24c-5.093 0-7.031-2.756-7.031-6.415V10.63H4.786V7.054c3.321-.823 4.298-3.702 4.526-6.415h3.693v5.823h4.632v4.168h-4.632v6.299c0 1.933.952 2.766 2.684 2.766h2.043V24h-3.169z" />
        </svg>
      ),
    },
    {
      name: 'Discord',
      color: 'bg-[#5865F2] hover:bg-[#4752C4] text-white',
      badgeColor: 'text-[#5865F2] bg-[#5865F2]/10 border-[#5865F2]/30',
      action: async () => {
        onShareClick?.();
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
            setShareSuccessMessage('Discord embed link copied!');
            setTimeout(() => setShareSuccessMessage(null), 3500);
          }
        } catch {
          handleCopyLink();
        }
      },
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      name: 'Quora',
      color: 'bg-[#b92b27] hover:bg-[#a32420] text-white',
      badgeColor: 'text-[#b92b27] bg-[#b92b27]/10 border-[#b92b27]/30',
      action: () =>
        openShareWindow(
          `https://www.quora.com/share?url=${encodedUrl}&title=${encodedTitle}`,
          'Quora'
        ),
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.72 20.47a7.7 7.7 0 0 1-3.6-.9 6.8 6.8 0 0 1-2.6-2.5 7.4 7.4 0 0 1-.9-3.7 7.4 7.4 0 0 1 .9-3.7 6.8 6.8 0 0 1 2.6-2.5 7.8 7.8 0 0 1 7.2 0 6.8 6.8 0 0 1 2.6 2.5 7.4 7.4 0 0 1 .9 3.7c0 1.3-.3 2.6-.9 3.7a6.8 6.8 0 0 1-2.6 2.5 7.7 7.7 0 0 1-3.6.9zm.1-2.5c1.4 0 2.6-.5 3.5-1.5.9-1 1.4-2.2 1.4-3.7 0-1.5-.5-2.8-1.4-3.7-.9-1-2.1-1.5-3.5-1.5s-2.6.5-3.5 1.5c-.9 1-1.4 2.2-1.4 3.7 0 1.5.5 2.8 1.4 3.7.9 1 2.1 1.5 3.5 1.5zm6.8 5.7c-.5 0-1-.2-1.4-.5l-3-2.6c-.6.2-1.2.3-1.8.3a9.7 9.7 0 0 1-4.7-1.2 9.2 9.2 0 0 1-3.4-3.3 9.4 9.4 0 0 1-1.2-4.8c0-1.7.4-3.3 1.2-4.8a9.2 9.2 0 0 1 3.4-3.3 9.7 9.7 0 0 1 4.7-1.2c1.7 0 3.3.4 4.7 1.2a9.2 9.2 0 0 1 3.4 3.3 9.4 9.4 0 0 1 1.2 4.8c0 1.4-.3 2.7-.9 3.9a9.6 9.6 0 0 1-2.4 3.2l2.3 2c.2.2.3.4.3.7 0 .3-.1.6-.3.8-.2.3-.5.4-.8.4z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      color: 'bg-slate-700 hover:bg-slate-600 text-white',
      badgeColor: 'text-slate-700 bg-slate-100 border-slate-300',
      action: () => {
        setShowEmailOptions(true);
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        if (isMobile) {
          const a = document.createElement('a');
          a.href = mailtoUrl;
          a.target = '_top';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          const width = 650;
          const height = 560;
          const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
          const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
          window.open(
            gmailUrl,
            'share-gmail',
            `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
          );
        }
        setShareSuccessMessage('Email share ready!');
        setTimeout(() => setShareSuccessMessage(null), 3000);
      },
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {socialPlatforms.slice(0, 4).map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={p.action}
            title={`Share on ${p.name}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs cursor-pointer ${p.color}`}
          >
            {p.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy product link"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
            <Share2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Share this product with friends
          </span>
        </div>

        {shareSuccessMessage && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-fade-in flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>{shareSuccessMessage}</span>
          </span>
        )}
      </div>

      {/* Social Button Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            type="button"
            onClick={platform.action}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${platform.color}`}
          >
            {platform.icon}
            <span>{platform.name}</span>
          </button>
        ))}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Native Web Share Button (if supported or mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-2xs hover:shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>More Options</span>
          </button>
        )}
      </div>

      {/* Expandable Direct Email Share Panel */}
      {showEmailOptions && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Share via Email</span>
            </span>
            <button
              type="button"
              onClick={() => setShowEmailOptions(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Friend's email address (optional)..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onShareClick?.()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send via Gmail</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={mailtoUrl}
              target="_top"
              rel="noopener noreferrer"
              onClick={() => onShareClick?.()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Open Mail App</span>
            </a>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 leading-normal">
        Friends can explore this product directly with verified genuine Amazon links.
      </p>
    </div>
  );
};

interface SocialShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Share With Friends
              </h3>
              <p className="text-xs text-slate-500">
                Send this verified product to friends or social feeds
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Card */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {product.category}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
              {product.title}
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              100% verified links • Official Amazon partner
            </p>
          </div>
        </div>

        {/* Share Buttons */}
        <SocialShareButtons product={product} variant="full" onShareClick={onClose} />
      </div>
    </div>
  );
};
