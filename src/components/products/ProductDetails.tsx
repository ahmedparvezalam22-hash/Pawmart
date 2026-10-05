import React, { useState, useEffect } from 'react';
import { Heart, ExternalLink, ShieldCheck, ChevronRight, Share2, ArrowLeft, Truck, RefreshCw, Sparkles, CheckCircle2, Play, Film, Image as ImageIcon, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { Link, useRouter } from '../../utils/navigation';
import { ProductCard } from './ProductCard';
import { isVideoUrl } from '../../firebase/products';
import { SocialShareButtons, SocialShareModal } from './SocialShareButtons';
import { ProductReviewsSection } from './ProductReviewsSection';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, relatedProducts }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { navigate } = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(product.imageUrl);
  }, [product.imageUrl, product.id]);

  const favorited = isFavorite(product.id);
  // Ensure Image 1 (main cover) is first, followed by images/videos 2 through 6
  const rawGallery = product.galleryUrls && product.galleryUrls.length > 0
    ? product.galleryUrls
    : [product.imageUrl];
  const gallery = [
    product.imageUrl,
    ...rawGallery.filter((u) => u && u !== product.imageUrl)
  ];

  const handleAmazonClick = () => {
    window.open(product.amazonAffiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-8 md:py-12 bg-slate-50 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-amber-600 transition-colors whitespace-nowrap">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <Link
            to={`/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-amber-600 transition-colors whitespace-nowrap"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        {/* Main Details Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Product Images & Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-inner group flex items-center justify-center">
                {isVideoUrl(selectedImage) ? (
                  selectedImage.includes('youtube.com') || selectedImage.includes('youtu.be') ? (
                    <iframe
                      src={selectedImage.replace('watch?v=', 'embed/')}
                      title={product.title}
                      className="w-full h-full rounded-2xl"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      src={selectedImage}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-contain bg-black rounded-2xl"
                    />
                  )
                ) : (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Category & Badge */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200/60">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-xs">
                      Curator's Choice
                    </span>
                  )}
                </div>

                {/* Views Count Badge on Main Image for Visitor */}
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 text-xs font-bold shadow-md border border-white/10">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>{product.viewsCount || '1.6k'} views</span>
                  </span>
                </div>

                {isVideoUrl(selectedImage) && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Film className="w-3.5 h-3.5" />
                      <span>Product Video</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails (1 to 6 Photos & Videos) - Visitor clicks to enlarge */}
              {gallery.length > 1 && (
                <div className="space-y-2">
                  <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                    {gallery.map((mediaUrl, idx) => {
                      const isVid = isVideoUrl(mediaUrl);
                      const isSelected = selectedImage === mediaUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(mediaUrl)}
                          title={`Click to view media #${idx + 1}`}
                          className={`group/thumb relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 scale-95 shadow-md ring-3 ring-amber-400/40 opacity-100'
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-amber-300'
                          }`}
                        >
                          {/* Number Badge (1 is Main Cover, 2-6 are extra) */}
                          <span
                            className={`absolute top-1 left-1 z-10 px-1.5 py-0.2 rounded text-[9px] font-black leading-tight shadow-xs ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-black/70 text-white'
                            }`}
                          >
                            #{idx + 1}
                          </span>

                          {isVid ? (
                            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative">
                              {mediaUrl.startsWith('data:video/') || mediaUrl.endsWith('.mp4') ? (
                                <video src={mediaUrl} className="w-full h-full object-cover opacity-60" />
                              ) : null}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                                  <Play className="w-3 h-3 fill-slate-950 ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1 text-[9px] font-bold text-amber-300">
                                Video
                              </span>
                            </div>
                          ) : (
                            <img src={mediaUrl} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Click any thumbnail above to view in full size ({gallery.length} media items)</span>
                  </p>
                </div>
              )}

              {/* Trust Points Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
                  <Truck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Amazon Prime Eligible</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
                  <RefreshCw className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Standard Amazon Returns</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Amazon CTA */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
              <div>
                
                {/* Category & Status */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-xs uppercase font-extrabold tracking-wider text-amber-600 hover:text-amber-700"
                    >
                      {product.category} Collection
                    </Link>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold shadow-2xs">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>{product.viewsCount || '1.6k'} views</span>
                    </span>

                    {product.reviews && product.reviews.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>
                          {(
                            product.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) /
                            product.reviews.length
                          ).toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                      title="Share product with friends"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                  {product.title}
                </h1>

                {/* Short Highlights */}
                {product.shortDescription && (
                  <p className="text-base text-slate-600 font-medium leading-relaxed mb-6 pb-6 border-b border-slate-100">
                    {product.shortDescription}
                  </p>
                )}

                {/* Highlights checkmarks */}
                <div className="space-y-2 mb-6 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Tested for durability, real-world utility, and verified positive reviews.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct Amazon product link with real-time stock and seller protection.</span>
                  </div>
                </div>

                {/* Full Description */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
                    Product Description & Overview
                  </h3>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>

              </div>

              {/* Action Area */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  
                  {/* VIEW AMAZON Main Button */}
                  <button
                    onClick={handleAmazonClick}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>VIEW AMAZON</span>
                    <ExternalLink className="w-5 h-5" />
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border transition-all text-sm font-bold ${
                      favorited
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                    <span>{favorited ? 'Saved in Favorites' : 'Add to Favorites'}</span>
                  </button>

                </div>

                {/* 100% Verified Links Guarantee */}
                <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-emerald-900">100% Verified Links: </span>
                    100% verified links, no third party links. Direct, genuine, and safe official Amazon store access.
                  </p>
                </div>

                {/* Social Media Share Buttons */}
                <div className="pt-2">
                  <SocialShareButtons product={product} />
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Customer & Admin Reviews Section */}
        <ProductReviewsSection
          productId={product.id}
          productTitle={product.title}
          initialReviews={product.reviews || []}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Related Discoveries
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                More in {product.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Floating Bottom Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-2xl flex items-center gap-2">
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`p-3 rounded-xl border flex-shrink-0 cursor-pointer ${
            favorited ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title="Save to favorites"
        >
          <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={() => setShareModalOpen(true)}
          className="p-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 flex-shrink-0 cursor-pointer"
          title="Share product with friends"
        >
          <Share2 className="w-5 h-5 text-amber-600" />
        </button>

        <button
          onClick={handleAmazonClick}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span>VIEW AMAZON</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Social Media Share Modal */}
      <SocialShareModal
        product={product}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

    </div>
  );
};
