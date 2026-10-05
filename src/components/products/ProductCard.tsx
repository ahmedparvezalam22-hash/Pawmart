import React from 'react';
import { Heart, ExternalLink, ShieldCheck, Play, Film, Eye, Star, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useRouter } from '../../utils/navigation';
import { isVideoUrl } from '../../firebase/products';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { navigate } = useRouter();

  const favorited = isFavorite(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product.id);
  };

  const handleAmazonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Opens exact admin Amazon affiliate link in new tab securely
    window.open(product.amazonAffiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer h-full"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
        />

        {/* Category & Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs border border-slate-200/50">
            {product.category}
          </span>
          {product.featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs uppercase tracking-wider">
              Featured Pick
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
            favorited
              ? 'bg-amber-500 text-white shadow-amber-500/30 scale-105'
              : 'bg-white/85 hover:bg-white text-slate-600 hover:text-red-500'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              favorited ? 'fill-current scale-110' : 'group-hover:scale-110'
            }`}
          />
        </button>

        {/* Video / Gallery count indicator */}
        {product.galleryUrls && product.galleryUrls.some(isVideoUrl) && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-amber-400 text-[10px] font-bold shadow-xs">
              <Film className="w-3 h-3 text-amber-400" />
              <span>Video</span>
            </span>
          </div>
        )}

        {/* Custom Views Count Badge for Visitor */}
        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 text-[11px] font-bold shadow-md border border-white/10">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{product.viewsCount || '1.6k'} views</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-5 justify-between">
        <div>
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {(
                  product.reviews.reduce((a, b) => a + (b.rating || 5), 0) /
                  product.reviews.length
                ).toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({product.reviews.length})
              </span>
            </div>
          )}

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
            {product.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Action Bottom */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Verified Amazon Link</span>
            </div>
            {product.viewsCount && (
              <span className="text-[10px] text-slate-400">{product.viewsCount} views</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCardClick}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={handleAmazonClick}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group/btn"
            >
              <span>Amazon</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
