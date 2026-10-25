import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Product, ProductReview, ProductReviewReply, WebsiteReview } from '../types';
import {
  Star,
  MessageSquareQuote,
  ShieldCheck,
  CornerDownRight,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Mail,
  AlertCircle,
  Globe,
  Plus,
  Send,
  User,
  Package
} from 'lucide-react';
import { Link } from '../utils/navigation';
import { addReviewAdminReply, deleteProductReview } from '../firebase/products';
import {
  subscribeToWebsiteReviews,
  createWebsiteReview,
  deleteWebsiteReview
} from '../firebase/websiteReviews';

interface AdminReviewsPageProps {
  products: Product[];
}

interface ReviewWithProduct {
  product: Product;
  review: ProductReview;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ products }) => {
  // Navigation Tab: website reviews or product reviews
  const [activeTab, setActiveTab] = useState<'website' | 'product'>('website');

  // Website Reviews states
  const [websiteReviews, setWebsiteReviews] = useState<WebsiteReview[]>([]);
  const [webAuthor, setWebAuthor] = useState('');
  const [webLocation, setWebLocation] = useState('Verified Buyer • USA');
  const [webRating, setWebRating] = useState(5);
  const [webTitle, setWebTitle] = useState('');
  const [webComment, setWebComment] = useState('');
  const [webDate, setWebDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [webVerified, setWebVerified] = useState(true);
  const [submittingWebReview, setSubmittingWebReview] = useState(false);
  const [webActionSuccess, setWebActionSuccess] = useState<string | null>(null);
  const [webError, setWebError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState('');

  // Product Reviews states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unreplied' | 'replied'>('all');
  const [replyingReviewKey, setReplyingReviewKey] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('PawMartFinder Team');
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Customer & Website Reviews — PawMartFinder Admin';
    const unsub = subscribeToWebsiteReviews((list) => {
      setWebsiteReviews(list);
    });
    return () => unsub();
  }, []);

  // Submit custom website review
  const handleCustomWebsiteReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAuthor.trim()) {
      setWebError('Please enter reviewer name.');
      return;
    }
    if (!webComment.trim()) {
      setWebError('Please enter review comment/feedback.');
      return;
    }

    try {
      setSubmittingWebReview(true);
      setWebError(null);

      await createWebsiteReview({
        author: webAuthor.trim(),
        location: webLocation.trim() || 'Verified Shopper',
        rating: webRating,
        title: webTitle.trim() || undefined,
        comment: webComment.trim(),
        date: webDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isCustomAdmin: true,
        verified: webVerified,
      });

      setWebActionSuccess('Custom website review submitted & published to landing page!');
      setWebAuthor('');
      setWebTitle('');
      setWebComment('');
      setWebRating(5);
      setTimeout(() => setWebActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Error submitting custom website review:', err);
      setWebError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingWebReview(false);
    }
  };

  const handleDeleteWebsiteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this website review?')) return;
    try {
      await deleteWebsiteReview(id);
      setWebActionSuccess('Website review deleted successfully.');
      setTimeout(() => setWebActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting website review:', err);
      alert('Failed to delete review: ' + err.message);
    }
  };

  // Collect all reviews across all products
  const allReviewsWithProducts: ReviewWithProduct[] = [];
  products.forEach((p) => {
    if (p.reviews && p.reviews.length > 0) {
      p.reviews.forEach((r) => {
        allReviewsWithProducts.push({
          product: p,
          review: r,
        });
      });
    }
  });

  // Filter product reviews
  const filteredProductReviews = allReviewsWithProducts.filter(({ product, review }) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      review.author.toLowerCase().includes(search.toLowerCase()) ||
      (review.authorEmail && review.authorEmail.toLowerCase().includes(search.toLowerCase())) ||
      review.comment.toLowerCase().includes(search.toLowerCase()) ||
      (review.title && review.title.toLowerCase().includes(search.toLowerCase()));

    const isReplied = Boolean(review.adminReply);
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'unreplied'
        ? !isReplied
        : isReplied;

    return matchesSearch && matchesFilter;
  });

  // Filter website reviews
  const filteredWebsiteReviews = websiteReviews.filter((r) => {
    const q = webSearch.toLowerCase();
    return (
      r.author.toLowerCase().includes(q) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q))
    );
  });

  const totalReviewsCount = allReviewsWithProducts.length;
  const unrepliedCount = allReviewsWithProducts.filter((i) => !i.review.adminReply).length;
  const repliedCount = allReviewsWithProducts.filter((i) => Boolean(i.review.adminReply)).length;

  const handleAdminReplySubmit = async (productId: string, reviewId: string) => {
    if (!replyComment.trim()) return;

    try {
      setSubmittingReply(true);
      const replyData: ProductReviewReply = {
        author: replyAuthor.trim() || 'PawMartFinder Admin',
        comment: replyComment.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      await addReviewAdminReply(productId, reviewId, replyData);
      setReplyingReviewKey(null);
      setReplyComment('');
      setActionSuccess('Official reply posted successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving reply:', err);
      alert('Failed to save reply: ' + err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteProductReview = async (productId: string, reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this product review?')) return;

    try {
      await deleteProductReview(productId, reviewId);
      setActionSuccess('Product review removed successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting product review:', err);
      alert('Could not delete review: ' + err.message);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Reviews & Testimonials">
        <div className="space-y-6">
          
          {/* Top Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('website')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'website'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Website Reviews (Landing Page)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white">
                {websiteReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('product')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'product'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-white">
                {totalReviewsCount}
              </span>
            </button>
          </div>

          {/* TAB 1: WEBSITE REVIEWS (LANDING PAGE) */}
          {activeTab === 'website' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-500" />
                    <span>Website Reviews &amp; Testimonials ({websiteReviews.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage testimonials shown right below Subscribe on the Homepage. Submit custom reviews or moderate customer reviews.
                  </p>
                </div>

                {webActionSuccess && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{webActionSuccess}</span>
                  </div>
                )}
              </div>

              {/* Form: Add Customized Website Review */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Submit Custom Website Review (#নতুন কাস্টম রিভিউ যুক্ত করুন)
                    </h3>
                    <p className="text-xs text-slate-500">
                      This review will instantly display on the Homepage right beneath the Subscribe newsletter box.
                    </p>
                  </div>
                </div>

                {webError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{webError}</span>
                  </div>
                )}

                <form onSubmit={handleCustomWebsiteReviewSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Star Rating (1 - 5) <span className="text-amber-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setWebRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= webRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-slate-700">
                          {webRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Reviewer Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Reviewer Name <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={webAuthor}
                        onChange={(e) => setWebAuthor(e.target.value)}
                        placeholder="e.g. Jessica Miller"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Location / Note */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Location / Shopper Tag
                      </label>
                      <input
                        type="text"
                        value={webLocation}
                        onChange={(e) => setWebLocation(e.target.value)}
                        placeholder="e.g. Verified Buyer • California"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Review Headline */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Review Headline / Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={webTitle}
                        onChange={(e) => setWebTitle(e.target.value)}
                        placeholder="e.g. Saved so much time finding authentic Amazon picks"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Date Display
                      </label>
                      <input
                        type="text"
                        value={webDate}
                        onChange={(e) => setWebDate(e.target.value)}
                        placeholder="e.g. Oct 24, 2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Feedback Comment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Review Feedback &amp; Comments <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={webComment}
                      onChange={(e) => setWebComment(e.target.value)}
                      placeholder="Write the custom testimonial here..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Options & Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={webVerified}
                        onChange={(e) => setWebVerified(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <span>Show "Verified Review" green badge</span>
                    </label>

                    <button
                      type="submit"
                      disabled={submittingWebReview}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {submittingWebReview ? (
                        <span>Publishing Review...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish to Website</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* All Website Reviews List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Live Website Reviews on Landing Page ({filteredWebsiteReviews.length})
                  </h3>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={webSearch}
                      onChange={(e) => setWebSearch(e.target.value)}
                      placeholder="Search website reviews..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {filteredWebsiteReviews.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                    No website reviews found. Add your first custom review above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWebsiteReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= (rev.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-slate-700 ml-1">
                                {rev.rating} / 5
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {rev.isCustomAdmin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Admin Custom
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                  Customer Review
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteWebsiteReview(rev.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete this review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {rev.title && (
                            <h4 className="text-sm font-bold text-slate-900">
                              "{rev.title}"
                            </h4>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-slate-800">
                            {rev.author} ({rev.location || 'Visitor'})
                          </span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT REVIEWS */}
          {activeTab === 'product' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    <span>Product Reviews &amp; Feedback ({totalReviewsCount})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Read customer reviews for specific catalog products, write official replies, and manage customer ratings.
                  </p>
                </div>

                {actionSuccess && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{actionSuccess}</span>
                  </div>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setFilterType('all')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                    Total Product Reviews
                  </span>
                  <span className="text-2xl font-black mt-1 block">{totalReviewsCount}</span>
                </div>

                <div
                  onClick={() => setFilterType('unreplied')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    filterType === 'unreplied'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                      Awaiting Reply
                    </span>
                    {unrepliedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                        Action Needed
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-black mt-1 block">{unrepliedCount}</span>
                </div>

                <div
                  onClick={() => setFilterType('replied')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    filterType === 'replied'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                    Replied Reviews
                  </span>
                  <span className="text-2xl font-black mt-1 block">{repliedCount}</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product title, customer name, comments..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <span className="text-xs text-slate-500">
                  Showing {filteredProductReviews.length} reviews
                </span>
              </div>

              {/* Product Reviews List */}
              {filteredProductReviews.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                  No product reviews found matching criteria.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProductReviews.map(({ product, review }, idx) => {
                    const reviewKey = `${product.id}_${review.id || idx}`;
                    const isReplying = replyingReviewKey === reviewKey;

                    return (
                      <div
                        key={reviewKey}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                            />
                            <div>
                              <Link
                                to={`/product/${product.slug || product.id}`}
                                className="text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1 flex items-center gap-1"
                              >
                                <span>{product.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </Link>
                              <span className="text-[11px] text-slate-400">
                                {product.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteProductReview(product.id, review.id!)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Rating & Review */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= (review.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-slate-700 ml-1">
                                {review.rating} / 5
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400">
                              {review.date || 'Recent review'}
                            </span>
                          </div>

                          {review.title && (
                            <h4 className="text-sm font-bold text-slate-900">
                              "{review.title}"
                            </h4>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{review.comment}"
                          </p>
                        </div>

                        {/* Customer signature */}
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Review by {review.author}</span>
                          {review.authorEmail && (
                            <span className="text-slate-400 font-normal">({review.authorEmail})</span>
                          )}
                        </div>

                        {/* Admin Reply Section */}
                        {review.adminReply && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                              <span className="flex items-center gap-1">
                                <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                                <span>Official Reply by {review.adminReply.author}</span>
                              </span>
                              <span className="text-[10px] text-amber-700 font-normal">
                                {review.adminReply.date}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed pl-4">
                              {review.adminReply.comment}
                            </p>
                          </div>
                        )}

                        {/* Reply Action Form or Button */}
                        {review.id && (
                          <div className="pt-2">
                            {isReplying ? (
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <span className="text-xs font-bold text-slate-800 block">
                                  Write Official Admin Reply:
                                </span>
                                <input
                                  type="text"
                                  value={replyAuthor}
                                  onChange={(e) => setReplyAuthor(e.target.value)}
                                  placeholder="Reply Author (e.g. PawMartFinder Support)"
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                                />
                                <textarea
                                  rows={2}
                                  value={replyComment}
                                  onChange={(e) => setReplyComment(e.target.value)}
                                  placeholder="Write response to customer..."
                                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingReviewKey(null)}
                                    className="px-3 py-1.5 text-xs text-slate-500"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={submittingReply || !replyComment.trim()}
                                    onClick={() => handleAdminReplySubmit(product.id, review.id!)}
                                    className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-xs"
                                  >
                                    {submittingReply ? 'Saving...' : 'Post Reply'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewKey(reviewKey);
                                  setReplyComment(review.adminReply?.comment || '');
                                  if (review.adminReply?.author) setReplyAuthor(review.adminReply.author);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                                <span>{review.adminReply ? 'Edit Official Reply' : 'Reply to Customer'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
