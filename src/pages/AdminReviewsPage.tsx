import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Product, ProductReview, ProductReviewReply } from '../types';
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
} from 'lucide-react';
import { Link } from '../utils/navigation';
import { addReviewAdminReply, deleteProductReview } from '../firebase/products';

interface AdminReviewsPageProps {
  products: Product[];
}

interface ReviewWithProduct {
  product: Product;
  review: ProductReview;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ products }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unreplied' | 'replied'>('all');
  const [replyingReviewKey, setReplyingReviewKey] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('PawMart Team');
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Customer Reviews — PawMart Admin';
  }, []);

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

  // Filter reviews
  const filtered = allReviewsWithProducts.filter(({ product, review }) => {
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

  const totalReviewsCount = allReviewsWithProducts.length;
  const unrepliedCount = allReviewsWithProducts.filter((i) => !i.review.adminReply).length;
  const repliedCount = allReviewsWithProducts.filter((i) => Boolean(i.review.adminReply)).length;

  const handleAdminReplySubmit = async (productId: string, reviewId: string) => {
    if (!replyComment.trim()) return;

    try {
      setSubmittingReply(true);
      const replyData: ProductReviewReply = {
        author: replyAuthor.trim() || 'PawMart Admin',
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

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteProductReview(productId, reviewId);
      setActionSuccess('Review removed successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Could not delete review: ' + err.message);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout title="Customer Reviews & Replies">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                All Product Reviews & Feedback ({totalReviewsCount})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Read what customers are saying, post official team replies, and manage customer sentiment.
              </p>
            </div>

            {actionSuccess && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
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
                Total Reviews
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
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
              }`}
            >
              <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
                Replied by Store
              </span>
              <span className="text-2xl font-black mt-1 block">{repliedCount}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews, product, or customer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Reviews ({totalReviewsCount})</option>
                <option value="unreplied">Awaiting Reply ({unrepliedCount})</option>
                <option value="replied">Answered ({repliedCount})</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Reviews Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || filterType !== 'all'
                  ? 'No reviews match your current filters. Try changing or clearing search criteria.'
                  : 'Customer reviews will appear here once submitted on product detail pages.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(({ product, review }, idx) => {
                const reviewKey = `${product.id}_${review.id || idx}`;
                const isReplying = replyingReviewKey === reviewKey;

                return (
                  <div
                    key={reviewKey}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-amber-300 transition-all"
                  >
                    {/* Top: Product Snapshot & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                            {product.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <span>View Product</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {review.id && (
                          <button
                            onClick={() => handleDelete(product.id, review.id!)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reviewer Details & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center">
                          {review.author ? review.author.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {review.author || 'Verified Customer'}
                            </span>
                            {review.authorEmail && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{review.authorEmail}</span>
                              </span>
                            )}
                          </div>
                          {review.date && (
                            <span className="text-[10px] text-slate-400">{review.date}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-1">
                      {review.title && (
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                          {review.title}
                        </h5>
                      )}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Existing Admin Reply */}
                    {review.adminReply ? (
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              Official Store Reply
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {review.adminReply.author}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {review.adminReply.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 pl-5 leading-relaxed">
                          {review.adminReply.comment}
                        </p>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                        <AlertCircle className="w-3 h-3 text-slate-400" />
                        <span>No response posted yet</span>
                      </div>
                    )}

                    {/* Reply Form or Trigger */}
                    {review.id && (
                      <div className="pt-2">
                        {isReplying ? (
                          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-300 space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span>Write Official Store Response</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setReplyingReviewKey(null)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>

                            <input
                              type="text"
                              value={replyAuthor}
                              onChange={(e) => setReplyAuthor(e.target.value)}
                              placeholder="Display Author (e.g. PawMart Team / Parvez)"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                            />

                            <textarea
                              rows={3}
                              value={replyComment}
                              onChange={(e) => setReplyComment(e.target.value)}
                              placeholder="Type your authentic response to this customer..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
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
      </AdminLayout>
    </AdminRoute>
  );
};
