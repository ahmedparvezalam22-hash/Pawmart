import React, { useState } from 'react';
import { Save, Eye, X, AlertCircle, Star, Plus, Trash2, MessageSquareQuote } from 'lucide-react';
import { Product, ProductCategory, ProductReview } from '../../types';
import { MediaGalleryUploader } from './MediaGalleryUploader';
import { useRouter } from '../../utils/navigation';

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => Promise<void>;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  loading = false,
}) => {
  const { navigate } = useRouter();

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'Cats');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialProduct?.galleryUrls && initialProduct.galleryUrls.length > 0
      ? initialProduct.galleryUrls
      : initialProduct?.imageUrl
      ? [initialProduct.imageUrl]
      : []
  );
  const [amazonAffiliateLink, setAmazonAffiliateLink] = useState(initialProduct?.amazonAffiliateLink || '');
  const [featured, setFeatured] = useState<boolean>(initialProduct ? initialProduct.featured : false);
  const [published, setPublished] = useState<boolean>(initialProduct ? initialProduct.published : true);
  const [viewsCount, setViewsCount] = useState<string>(initialProduct?.viewsCount || '1.6k');
  const [reviews, setReviews] = useState<ProductReview[]>(
    initialProduct?.reviews && initialProduct.reviews.length > 0
      ? initialProduct.reviews
      : []
  );
  const [error, setError] = useState<string | null>(null);

  const categories: ProductCategory[] = [
    'Cats',
    'Dogs',
    'Kids Toys',
    'Skin Care',
    'Furniture',
    'Shoes',
    'Wedding Collection',
    'Jewelry Collection',
    'Electronics',
    'Other Products',
    'T-Shirts',
    'Hoodies',
    'Books',
  ];

  const handleMediaChange = (newMediaUrls: string[], newPrimaryUrl: string) => {
    setGalleryUrls(newMediaUrls);
    setImageUrl(newPrimaryUrl || (newMediaUrls[0] || ''));
  };

  const handleAddReview = () => {
    setReviews([
      ...reviews,
      {
        id: `rev-${Date.now()}`,
        author: '',
        rating: 5,
        title: '',
        comment: '',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        verifiedPurchase: true,
      },
    ]);
  };

  const handleUpdateReview = (index: number, field: keyof ProductReview, value: any) => {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    setReviews(updated);
  };

  const handleRemoveReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
  };

  const validate = () => {
    const effectiveImageUrl = imageUrl || galleryUrls[0] || '';
    if (!effectiveImageUrl.trim() && galleryUrls.length === 0) {
      setError('Please upload or provide at least 1 product photo or video.');
      return false;
    }
    if (!title.trim()) {
      setError('Please enter a product title.');
      return false;
    }
    if (!shortDescription.trim()) {
      setError('Please enter a short description.');
      return false;
    }
    if (!description.trim()) {
      setError('Please enter a full description.');
      return false;
    }
    if (!amazonAffiliateLink.trim()) {
      setError('Please enter the Amazon product URL.');
      return false;
    }
    try {
      const parsed = new URL(amazonAffiliateLink.trim());
      if (!parsed.protocol.startsWith('http')) {
        setError('Product link must be a valid HTTP or HTTPS URL.');
        return false;
      }
    } catch {
      setError('Please enter a valid Amazon product URL.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSave = async (publishImmediate?: boolean) => {
    if (!validate()) return;

    const effectiveImageUrl = imageUrl || galleryUrls[0] || '';
    const finalGallery = galleryUrls.length > 0 ? galleryUrls : [effectiveImageUrl];

    // Filter out empty reviews so it's purely optional
    const validReviews = reviews
      .map((r) => ({
        ...r,
        author: r.author.trim() || 'Verified Customer',
        title: r.title?.trim() || undefined,
        comment: r.comment.trim(),
        date: r.date?.trim() || undefined,
        verifiedPurchase: r.verifiedPurchase ?? true,
      }))
      .filter((r) => r.comment.length > 0);

    await onSubmit({
      title: title.trim(),
      category,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      imageUrl: effectiveImageUrl.trim(),
      galleryUrls: finalGallery,
      viewsCount: viewsCount.trim() || undefined,
      reviews: validReviews.length > 0 ? validReviews : [],
      amazonAffiliateLink: amazonAffiliateLink.trim(),
      featured,
      published: publishImmediate !== undefined ? publishImmediate : published,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Product Photos & Videos Gallery (Up to 5-6 Items) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          1. Product Photos & Videos (Up to 6 Media Items) <span className="text-red-500">*</span>
        </label>
        <MediaGalleryUploader
          mediaUrls={galleryUrls}
          primaryUrl={imageUrl}
          onChange={handleMediaChange}
          maxItems={6}
        />
      </div>

      {/* 2. Product Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          2. Product Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ergonomic Self-Cleaning Cat Grooming Brush"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
      </div>

      {/* 3. Category & Views Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            3. Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Product Views Display (e.g. 1.6k)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">optional</span>
          </label>
          <input
            type="text"
            value={viewsCount}
            onChange={(e) => setViewsCount(e.target.value)}
            placeholder="e.g. 1.6k, 2.4k, 850"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Enter the view count (e.g. 1.6k) to display alongside this product with the Eye icon for visitors.
          </p>
        </div>
      </div>

      {/* 4. Short Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          4. Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Concise 1-2 sentence teaser shown on product discovery cards..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
      </div>

      {/* 5. Full Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          5. Full Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed product features, materials, sizing, and key highlights..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
      </div>

      {/* 6. Amazon Product Link */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          6. Amazon Product Link <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          required
          value={amazonAffiliateLink}
          onChange={(e) => setAmazonAffiliateLink(e.target.value)}
          placeholder="https://www.amazon.com/dp/.../ref=..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Paste the complete Amazon product or store URL. Visitors will be directed here when clicking VIEW AMAZON.
        </p>
      </div>

      {/* 7. Customer Reviews & Ratings (Optional) */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-amber-500" />
              <span>7. Customer Reviews & Ratings</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              If you write reviews here, they will automatically appear below the product on the visitor details page. If left blank, no review section will be displayed.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddReview}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No customer reviews added. This product will be displayed cleanly without a reviews section.
            </p>
            <button
              type="button"
              onClick={handleAddReview}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
            >
              + Click here to add an optional review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-4 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Customer Review #{idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveReview(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Rating */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleUpdateReview(idx, 'rating', star)}
                          className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-slate-700">
                        {rev.rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Reviewer Name */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Reviewer Name
                    </label>
                    <input
                      type="text"
                      value={rev.author}
                      onChange={(e) => handleUpdateReview(idx, 'author', e.target.value)}
                      placeholder="e.g. Jessica M. or Verified Buyer"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Date / Purchase note */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Date / Purchase Note
                    </label>
                    <input
                      type="text"
                      value={rev.date || ''}
                      onChange={(e) => handleUpdateReview(idx, 'date', e.target.value)}
                      placeholder="e.g. Verified Amazon Purchase • US"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Review Title */}
                  <div className="sm:col-span-12">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Review Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={rev.title || ''}
                      onChange={(e) => handleUpdateReview(idx, 'title', e.target.value)}
                      placeholder="e.g. Highly recommend! Exceeded all my expectations"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="sm:col-span-12">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Review Feedback & Experience <span className="text-amber-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rev.comment}
                      onChange={(e) => handleUpdateReview(idx, 'comment', e.target.value)}
                      placeholder="Write customer feedback or review quote here (leave blank to omit)..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8: Toggles (Featured & Published) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        
        {/* Featured Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Featured Product</p>
            <p className="text-xs text-slate-500">Display in top horizontal carousel</p>
          </div>
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              featured ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                featured ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Published Status</p>
            <p className="text-xs text-slate-500">Make visible to public website visitors</p>
          </div>
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              published ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                published ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>CANCEL</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSave()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'SAVING...' : 'SAVE PRODUCT'}</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSave(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
        >
          <Eye className="w-4 h-4" />
          <span>{loading ? 'PUBLISHING...' : 'PUBLISH PRODUCT'}</span>
        </button>
      </div>

    </div>
  );
};
