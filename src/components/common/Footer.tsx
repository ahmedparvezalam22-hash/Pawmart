import React from 'react';
import { Logo } from './Logo';
import { Link } from '../../utils/navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" variant="light" />
            </Link>
            <p className="text-amber-400/90 font-medium text-sm">
              Discover Products You'll Love
            </p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              PawMart is an independent curated product discovery platform for pet owners, fashion enthusiasts, and readers. We discover, review, and organize trending items available on Amazon.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 font-medium w-fit">
                Official Amazon Verified Partner
              </span>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Email: </span>
                <a
                  href="mailto:supportpawmart@gmail.com?subject=Support%20Inquiry%20from%20PawMart"
                  className="text-amber-400 hover:underline font-mono"
                  title="Click to email supportpawmart@gmail.com"
                >
                  supportpawmart@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cats" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Cats
                </Link>
              </li>
              <li>
                <Link to="/dogs" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Dogs
                </Link>
              </li>
              <li>
                <Link to="/kids-toys" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Kids Toys
                </Link>
              </li>
              <li>
                <Link to="/skin-care" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Skin Care
                </Link>
              </li>
              <li>
                <Link to="/furniture" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/shoes" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/wedding-collection" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Wedding Collection
                </Link>
              </li>
              <li>
                <Link to="/jewelry-collection" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Jewelry Collection
                </Link>
              </li>
              <li>
                <Link to="/electronics" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/other-products" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Other Products
                </Link>
              </li>
              <li>
                <Link to="/t-shirts" className="text-slate-400 hover:text-amber-400 transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/hoodies" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                  <span>Blog & Guides</span>
                  <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300">New</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  aria-label="Portal"
                  className="text-slate-600 hover:text-amber-400 transition-colors inline-flex items-center p-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Information
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/disclosure" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Store Disclosure
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Store Disclosure Box */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="rounded-xl bg-slate-800/40 p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Store Disclosure: </span>
            PawMart participates in partner programs. When you click certain links and make a purchase, we may earn a referral commission at no additional cost to you. Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <p>© 2026 PawMart. All rights reserved.</p>
              <LanguageSelector variant="footer" />
            </div>
            <p className="flex items-center gap-4">
              <span>Fast & Secure External Discovery</span>
              <span>•</span>
              <span>Amazon Verified Partner</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
