import React from 'react';
import { Heart, X, LogIn, UserPlus } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useRouter } from '../../utils/navigation';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authModalMessage } = useFavorites();
  const { navigate } = useRouter();

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 ring-8 ring-amber-50/50">
          <Heart className="w-7 h-7 fill-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">Save to Your Favorites</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {authModalMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setShowAuthModal(false);
              navigate('/login');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            LOGIN
          </button>
          
          <button
            onClick={() => {
              setShowAuthModal(false);
              navigate('/signup');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-all shadow-sm shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};
