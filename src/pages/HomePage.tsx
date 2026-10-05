import React, { useEffect, useState } from 'react';
import { Hero } from '../components/home/Hero';
import { CategorySection } from '../components/home/CategorySection';
import { ProductCarousel } from '../components/home/ProductCarousel';
import { LatestProducts } from '../components/home/LatestProducts';
import { HomeBlogSection } from '../components/home/HomeBlogSection';
import { Product } from '../types';
import { ShieldCheck, Truck, Sparkles, ExternalLink, ArrowRight, HeartHandshake, CheckCircle2, Search, Send, Bell } from 'lucide-react';
import { Link } from '../utils/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addSubscriber } from '../firebase/subscribersService';

interface HomePageProps {
  products: Product[];
  loading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ products, loading }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    document.title = "PawMart — Discover Products You'll Love";
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (cleanEmail) {
      setNewsletterSubscribed(true);
      try {
        await addSubscriber(cleanEmail, 'home_newsletter');
      } catch (err) {
        console.warn('Could not store subscriber email:', err);
      }
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Section */}
      <Hero products={products} />

      {/* 1.5. New Product Notification & Signup Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-3.5 px-4 shadow-sm border-y border-amber-600/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-slate-950 text-amber-400 font-extrabold text-xs flex-shrink-0">
              <Bell className="w-4 h-4" />
            </span>
            <p className="text-xs sm:text-sm font-extrabold tracking-tight">
              Sign up today! When you sign up, you will automatically receive instant notifications whenever new products and trending deals are added.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            Sign Up for Notifications
          </Link>
        </div>
      </div>

      {/* 2. 5 Category Cards */}
      <CategorySection products={products} />

      {/* 3. Featured Horizontal Carousel */}
      <ProductCarousel products={products} />

      {/* 4. Latest Products Grid */}
      <LatestProducts products={products} />

      {/* 5. Professional Why Discover on PawMart Trust Section */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Curated Selection Standard</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Why Discover Products on PawMart?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              We cut through the noise of millions of online listings to curate only the most durable, stylish, and high-value pet products, fashion apparel, and books on Amazon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Curated Quality Picks</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Every item is evaluated for authentic customer satisfaction, verified build quality, and reputable Amazon merchant reliability.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Amazon Protection</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Zero third-party checkout risks. You complete orders safely on Amazon with full A-to-z buyer protection, customer service, and returns.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Prime & Fast Shipping</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Take full advantage of your Amazon Prime membership with free 1-day or 2-day shipping on eligible curated items.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Price Markup</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                You never pay a penny extra. All items reflect official Amazon pricing at absolutely zero additional cost or hidden charges to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5. Curated Blog & Guides Section */}
      <HomeBlogSection />

      {/* 6. Newsletter / Trending Curated Alerts Box */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 -z-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider border border-slate-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Curations</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get Instant Notifications for New Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Sign up today! When you register or subscribe with your email, you will automatically receive instant notifications whenever new products, trending collections, and verified Amazon deals arrive.
            </p>

            {newsletterSubscribed ? (
              <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>Thank you! You are subscribed. You will receive instant notifications whenever new products are posted.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] text-slate-500 pt-1">
              Zero spam. Unsubscribe anytime. View our <Link to="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
