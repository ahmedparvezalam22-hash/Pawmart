import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Search,
  ShieldCheck,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Tag,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { Link, useRouter } from '../../utils/navigation';
import { Product } from '../../types';
import heroLifestyleImg from '../../assets/images/hero_curated_lifestyle_1790481508227.jpg';

interface SpotlightSlide {
  id: string;
  category: string;
  title: string;
  tagline: string;
  rating: number;
  reviewsCount: string;
  priceNote: string;
  imageUrl: string;
  link: string;
  badge: string;
}

const SPOTLIGHT_SLIDES: SpotlightSlide[] = [
  {
    id: 'slide-1',
    category: 'Furniture & Living',
    title: 'Ergonomic High-Back Executive Mesh Chair',
    tagline: 'Adaptive lumbar support, breathable mesh, and smooth reclining comfort.',
    rating: 4.9,
    reviewsCount: '3,840+',
    priceNote: 'Amazon Best Value',
    imageUrl: heroLifestyleImg,
    link: '/furniture',
    badge: "Editor's Choice",
  },
  {
    id: 'slide-2',
    category: 'Electronics & Audio',
    title: 'Hybrid Active Noise-Cancelling Headphones',
    tagline: 'Hi-Res certified audio, 40-hour battery life & instant ambient transparency.',
    rating: 4.8,
    reviewsCount: '5,210+',
    priceNote: 'Top Rated Tech',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    link: '/electronics',
    badge: 'Trending Now',
  },
  {
    id: 'slide-3',
    category: 'Shoes & Footwear',
    title: 'Ultra-Cushioned Lightweight Running Sneakers',
    tagline: 'High-rebound shock absorbing EVA sole with breathable jacquard knit.',
    rating: 4.9,
    reviewsCount: '2,950+',
    priceNote: 'Customer Favorite',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    link: '/shoes',
    badge: 'Popular Pick',
  },
  {
    id: 'slide-4',
    category: 'Pet Essentials',
    title: 'Smart Interactive Cat & Pet Playground Haven',
    tagline: 'Engaging motion sensors, durable claw-friendly sisal & automated play.',
    rating: 4.9,
    reviewsCount: '4,120+',
    priceNote: 'Verified Safe',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1000&auto=format&fit=crop',
    link: '/cats',
    badge: 'Top Pet Care',
  },
  {
    id: 'slide-5',
    category: 'Wedding Collection',
    title: 'Timeless Crystal Bridal & Celebration Keepsakes',
    tagline: 'Hand-finished hypoallergenic cubic zirconia jewelry and linen guestbooks.',
    rating: 4.9,
    reviewsCount: '1,830+',
    priceNote: 'Special Moment',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
    link: '/wedding-collection',
    badge: 'New Collection',
  },
];

const TRENDING_SEARCHES = [
  { label: '🛋️ Ergonomic Chair', query: 'ergonomic chair', href: '/furniture' },
  { label: '👟 Running Shoes', query: 'running shoes', href: '/shoes' },
  { label: '✨ Gold Bracelet', query: 'bracelet', href: '/jewelry-collection' },
  { label: '🧴 Skin Care', query: 'skin care', href: '/skin-care' },
  { label: '🧸 Kids Toys', query: 'kids toys', href: '/kids-toys' },
  { label: '🎁 Other Products', query: 'other products', href: '/other-products' },
  { label: '🐾 Cat Tree', query: 'cat', href: '/cats' },
];

const HERO_CATEGORIES = [
  { label: 'Cats', href: '/cats', icon: '🐱' },
  { label: 'Dogs', href: '/dogs', icon: '🐶' },
  { label: 'Kids Toys', href: '/kids-toys', icon: '🧸' },
  { label: 'Skin Care', href: '/skin-care', icon: '🧴' },
  { label: 'Furniture', href: '/furniture', icon: '🛋️' },
  { label: 'Shoes', href: '/shoes', icon: '👟' },
  { label: 'Wedding Collection', href: '/wedding-collection', icon: '💍' },
  { label: 'Jewelry Collection', href: '/jewelry-collection', icon: '✨' },
  { label: 'Electronics', href: '/electronics', icon: '⚡' },
  { label: 'Other Products', href: '/other-products', icon: '🎁' },
  { label: 'T-Shirts', href: '/t-shirts', icon: '👕' },
  { label: 'Hoodies', href: '/hoodies', icon: '🧥' },
  { label: 'Books', href: '/books', icon: '📚' },
];

interface HeroProps {
  products?: Product[];
}

export const Hero: React.FC<HeroProps> = ({ products = [] }) => {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides: SpotlightSlide[] = React.useMemo(() => {
    const uploaded = products.filter((p) => p.published && p.imageUrl);
    if (uploaded.length === 0) return SPOTLIGHT_SLIDES;

    const mappedUploaded: SpotlightSlide[] = uploaded.slice(0, 6).map((p) => ({
      id: p.id,
      category: p.category,
      title: p.title,
      tagline: p.shortDescription || p.description,
      rating:
        p.reviews && p.reviews.length > 0
          ? Number(
              (
                p.reviews.reduce((a, b) => a + (b.rating || 5), 0) /
                p.reviews.length
              ).toFixed(1)
            )
          : 4.9,
      reviewsCount: p.viewsCount || '2.4k+',
      priceNote: p.featured ? 'Featured Pick' : 'Verified Amazon',
      imageUrl: p.imageUrl,
      link: `/product/${p.slug || p.id}`,
      badge: p.featured ? "Editor's Choice" : 'Curated Pick',
    }));

    return mappedUploaded.length >= 4
      ? mappedUploaded
      : [...mappedUploaded, ...SPOTLIGHT_SLIDES.slice(0, 5 - mappedUploaded.length)];
  }, [products]);

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [slides.length, activeSlide]);

  // Auto-slide every 4 seconds (4000ms)
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickTagClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-800/80">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Value, Search & Quick Navigation */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-amber-400 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>CURATED AMAZON PRODUCT DISCOVERY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.1] text-white">
              Discover Products{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                You'll Love
              </span>{' '}
              Every Single Day.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
              We hand-select and review top-rated products across Pet Care, Modern Furniture, Footwear, Electronics, Apparel, Books, and Wedding Collections—linking you directly to verified listings on Amazon.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl pt-1">
              <div className="relative flex items-center bg-slate-900/95 border-2 border-slate-700/80 focus-within:border-amber-400 rounded-2xl p-1.5 shadow-xl transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pet gear, chairs, running shoes, headphones, books..."
                  className="w-full px-3.5 py-2.5 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Trending Searches */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Trending:</span>
              </span>
              {TRENDING_SEARCHES.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-xs font-medium transition-all cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Explore Catalog: All Product Categories */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Explore Catalog Categories:</span>
                </span>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-400 font-bold text-xs transition-colors"
                >
                  <span>Buying Guides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {HERO_CATEGORIES.map((cat, idx) => (
                  <Link
                    key={cat.href}
                    to={cat.href}
                    className={
                      idx === 0
                        ? 'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/15 transition-all hover:-translate-y-0.5'
                        : 'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-300 border border-slate-700/90 hover:border-amber-500/50 font-bold text-xs transition-all hover:-translate-y-0.5'
                    }
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">
                  Verified Amazon Links
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">
                  Handpicked Quality
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">
                  4.9/5 Reader Rated
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Spotlight Product Showcase Card */}
          <div
            className="lg:col-span-5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-2xl overflow-hidden group">
              {/* Sliding Track for Images */}
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-800">
                <div
                  className="flex w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
                    </div>
                  ))}
                </div>

                {/* Top Badges on Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                    <Tag className="w-3 h-3" />
                    <span>{currentSlide.badge}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentSlide.rating}</span>
                    <span className="text-slate-400 text-[10px]">({currentSlide.reviewsCount})</span>
                  </span>
                </div>

                {/* Prev / Next Controls on Image */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous spotlight"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next spotlight"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Category & Price Note inside Image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {currentSlide.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                    {currentSlide.priceNote}
                  </span>
                </div>
              </div>

              {/* Slide Content Details */}
              <div className="mt-4 space-y-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug line-clamp-1 transition-all duration-300">
                  {currentSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed transition-all duration-300">
                  {currentSlide.tagline}
                </p>

                <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800/80">
                  {/* Slide Dots */}
                  <div className="flex items-center gap-1.5">
                    {slides.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeSlide
                            ? 'w-6 bg-amber-400'
                            : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>

                  <Link
                    to={currentSlide.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
