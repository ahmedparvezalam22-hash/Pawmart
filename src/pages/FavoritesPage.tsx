import React, { useEffect } from 'react';
import { Heart, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Link, useRouter } from '../utils/navigation';

interface FavoritesPageProps {
  products: Product[];
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ products }) => {
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const { navigate } = useRouter();

  useEffect(() => {
    document.title = 'My Favorites — PawMart';
  }, []);

  const savedProducts = products.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <Heart className="w-6 h-6 fill-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Favorites
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Your personal wishlist of curated discoveries ready to explore on Amazon.
          </p>
        </div>

        {/* Not Logged In State */}
        {!user ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sign In to View Favorites</h3>
            <p className="text-slate-500 text-sm mb-6">
              Create an account or sign in to save products across devices and organize your wishlists.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Link>
              <Link
                to="/signup"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        ) : savedProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
              <span>{savedProducts.length} saved {savedProducts.length === 1 ? 'item' : 'items'}</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty Saved Products State */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">You haven't saved any products yet.</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tap the heart icon on any product card while browsing to save it to your personal discovery wishlist.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
