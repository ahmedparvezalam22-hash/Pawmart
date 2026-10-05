import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { getBlogBySlug, getBlogById, subscribeToPublishedBlogs } from '../firebase/blogs';
import { Link, useRouter } from '../utils/navigation';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Share2,
  BookOpen,
  CheckCircle2,
  Eye,
  Mail,
  Copy,
  Check,
  X as CloseIcon
} from 'lucide-react';

interface BlogDetailPageProps {
  identifier: string; // Slug or ID
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ identifier }) => {
  const { navigate } = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchPost = async () => {
      setLoading(true);
      let found = await getBlogBySlug(identifier);
      if (!found) {
        found = await getBlogById(identifier);
      }

      if (isMounted) {
        setBlog(found);
        setLoading(false);
        if (found) {
          document.title = `${found.title} — PawMart Blog`;
        }
      }
    };

    fetchPost();

    const unsub = subscribeToPublishedBlogs((items) => {
      if (isMounted) {
        setRelatedBlogs(items.filter((b) => b.slug !== identifier && b.id !== identifier).slice(0, 3));
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [identifier]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog ? `${blog.title} — PawMart Guide` : 'PawMart Guide';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedImage = encodeURIComponent(blog?.imageUrl || '');
  const emailBody = encodeURIComponent(
    `Hi,\n\nI thought you might enjoy this guide on PawMart:\n\n${blog?.title || ''}\n\nRead it here:\n${shareUrl}`
  );
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodedTitle}&body=${emailBody}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail.trim())}&su=${encodedTitle}&body=${emailBody}`;

  const openSharePopup = (url: string, label: string) => {
    const width = 620;
    const height = 540;
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
    window.open(
      url,
      `share-blog-${label}`,
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
    );
    setShareSuccessMsg(`Opening ${label}...`);
    setTimeout(() => setShareSuccessMsg(null), 3000);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareSuccessMsg('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShareSuccessMsg(null);
      }, 2500);
    }
  };

  const handleEmailShareClick = () => {
    setShowEmailShare(true);
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
      openSharePopup(gmailUrl, 'Gmail');
    }
  };

  const handleOpenAmazon = () => {
    if (blog?.amazonProductLink) {
      window.open(blog.amazonProductLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-10 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-96 w-full bg-slate-200 rounded-3xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 font-extrabold text-2xl">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Article Not Found
        </h1>
        <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
          The guide you are looking for may have been updated, unpublished, or moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Guides</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 py-8 sm:py-12 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Breadcrumb & Back */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <Link to="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 font-semibold truncate">{blog.category}</span>
          </nav>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Blog</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              {blog.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>{blog.viewsCount || '1.5k'} views</span>
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readTime}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center border border-amber-300 text-sm">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{blog.author || 'Parvez'}</p>
                <p className="text-[11px] text-slate-500">PawMart Editorial Specialist</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-amber-500" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Cover Image with Views Badge */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md mb-8 bg-slate-900">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full max-h-[480px] object-cover"
          />
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 text-xs font-bold shadow-md border border-white/10">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{blog.viewsCount || '1.5k'} views</span>
            </span>
          </div>
        </div>

        {/* Lead Excerpt */}
        {blog.excerpt && (
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 text-sm sm:text-base font-medium leading-relaxed mb-8">
            {blog.excerpt}
          </div>
        )}

        {/* Main Article Content Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          
          {/* Article Body */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
            {blog.content.split('\n\n').map((paragraph, idx) => {
              const cleanPara = paragraph.trim();
              const imgMatch = cleanPara.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
              if (imgMatch) {
                return (
                  <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imgMatch[2]}
                      alt={imgMatch[1] || blog.title}
                      className="w-full max-h-[460px] object-cover"
                    />
                  </div>
                );
              }
              if (cleanPara.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100">
                    {cleanPara.replace('### ', '')}
                  </h3>
                );
              }
              if (cleanPara.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-6 pb-2">
                    {cleanPara.replace('## ', '')}
                  </h2>
                );
              }
              if (cleanPara.startsWith('- ') || cleanPara.startsWith('* ')) {
                const listItems = cleanPara.split('\n').filter(Boolean);
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-slate-700">
                    {listItems.map((li, lIdx) => (
                      <li key={lIdx}>{li.replace(/^[-*]\s+/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {cleanPara}
                </p>
              );
            })}
          </div>

          {/* Prominent Featured Amazon Recommendation Card */}
          {blog.amazonProductLink && (
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                    <Sparkles className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Editor's Pick On Amazon
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                      Featured Recommendation for This Guide
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAmazon}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider hover:from-amber-400 hover:to-amber-300 transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer flex-shrink-0"
                >
                  <span>{blog.amazonButtonText || 'View Recommended Item on Amazon'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Amazon Access</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Zero Price Markup</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 text-[11px]">
                  Opens securely in a new browser tab with Amazon buyer protection.
                </span>
              </div>
            </div>
          )}

          {/* Share This Guide With Friends Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Share2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Share this guide with friends
                </span>
              </div>

              {shareSuccessMsg && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{shareSuccessMsg}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              <button
                type="button"
                onClick={() => openSharePopup(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, 'WhatsApp')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-2xs cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, 'Facebook')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#1877F2] hover:bg-[#166fe5] text-white transition-all shadow-2xs cursor-pointer"
              >
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => openSharePopup(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, 'X')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-2xs cursor-pointer"
              >
                <span>X (Twitter)</span>
              </button>

              <button
                type="button"
                onClick={() => openSharePopup(`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`, 'Pinterest')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#E60023] hover:bg-[#d5001f] text-white transition-all shadow-2xs cursor-pointer"
              >
                <span>Pinterest</span>
              </button>

              <button
                type="button"
                onClick={() => openSharePopup(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, 'Telegram')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-[#229ED9] hover:bg-[#1f8fc4] text-white transition-all shadow-2xs cursor-pointer"
              >
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleEmailShareClick}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-2xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {showEmailShare && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Share Guide via Email</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmailShare(false)}
                    className="text-slate-400 hover:text-slate-600"
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
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={mailtoUrl}
                    target="_top"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Mail App</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Author Box */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              <User className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Written by {blog.author || 'Parvez'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                PawMart lead curator and researcher. Passionate about practical pet wellness, sustainable accessories, and finding reliable products on Amazon.
              </p>
            </div>
          </div>

        </div>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12 sm:mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>More Curated Guides</span>
              </h3>
              <Link to="/blog" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((rel) => (
                <article
                  key={rel.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <div className="h-40 overflow-hidden relative bg-slate-100">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {rel.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/85 text-amber-300 text-[10px] font-bold">
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>{rel.viewsCount || '1.5k'} views</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {rel.readTime}
                      </span>
                      <Link to={`/blog/${rel.slug || rel.id}`}>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                      </Link>
                    </div>

                    <Link
                      to={`/blog/${rel.slug || rel.id}`}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors pt-2 border-t border-slate-100"
                    >
                      Read Guide →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
