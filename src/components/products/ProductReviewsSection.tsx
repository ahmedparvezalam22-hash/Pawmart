import React, { useState } from 'react';
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  CornerDownRight,
  Send,
  PlusCircle,
  X,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Edit3,
  User,
  Mail,
  Sparkles,
} from 'lucide-react';
import { ProductReview, ProductReviewReply } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { addProductReview, addReviewAdminReply, deleteProductReview } from '../../firebase/products';

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
  initialReviews?: ProductReview[];
  onReviewsUpdated?: (reviews: ProductReview[]) => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productTitle,
  initialReviews = [],
  onReviewsUpdated,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(profile?.name || '');
  const [authorEmail, setAuthorEmail] = useState(profile?.email || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isOfficialReview, setIsOfficialReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('PawMart Team');
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!comment.trim()) {
      setFormError('Please enter your review feedback.');
      return;
    }

    try {
      setSubmittingReview(true);
      const newReview: ProductReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author: authorName.trim() || (isOfficialReview ? 'PawMart Team' : 'Verified Customer'),
        authorEmail: authorEmail.trim(),
        rating,
        title: reviewTitle.trim() || undefined,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        verifiedPurchase: true,
        isAdminReview: isOfficialReview,
      };

      const updated = await addProductReview(productId, newReview);
      setReviews(updated);
      onReviewsUpdated?.(updated);

      setFormSuccessMessage('Thank you! Your review has been posted successfully.');
      setReviewTitle('');
      setComment('');
      setTimeout(() => {
        setFormSuccessMessage(null);
        setIsFormOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error adding review:', err);
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Admin Reply Submission
  const handleAdminReplySubmit = async (reviewId: string) => {
    if (!replyComment.trim()) return;

    try {
      setSubmittingReply(true);
      const replyData: ProductReviewReply = {
        author: replyAuthor.trim() || 'PawMart Admin',
        comment: replyComment.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      const updated = await addReviewAdminReply(productId, reviewId, replyData);
      setReviews(updated);
      onReviewsUpdated?.(updated);
      setReplyingReviewId(null);
      setReplyComment('');
    } catch (err: any) {
      console.error('Error submitting reply:', err);
      alert('Failed to save reply: ' + err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Review Deletion (Admin only)
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const updated = await deleteProductReview(productId, reviewId);
      setReviews(updated);
      onReviewsUpdated?.(updated);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Could not delete review: ' + err.message);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 mb-16 space-y-8">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-600">
              <MessageSquareQuote className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Customer Feedback
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified customer reviews, ratings, and official store responses.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {totalReviews > 0 && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {averageRating}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">out of 5</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-bold text-slate-600">
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              if (!authorName && profile?.name) setAuthorName(profile.name);
              if (!authorEmail && profile?.email) setAuthorEmail(profile.email);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isFormOpen ? 'Cancel Review' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 sm:p-8 rounded-3xl bg-amber-50/40 border border-amber-200/80 space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/50">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Write a Review for {productTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your authentic opinion with other shoppers and our team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {/* Star Rating Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Your Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-200 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-600">
                {rating === 5 && '5 Stars — Excellent!'}
                {rating === 4 && '4 Stars — Very Good'}
                {rating === 3 && '3 Stars — Average'}
                {rating === 2 && '2 Stars — Below Expectations'}
                {rating === 1 && '1 Star — Poor'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Name / Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Michael R."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Author Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Email Address (Confidential)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Exceptional build quality and super fast delivery!"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Your Review / Experience *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved about this product, quality, size, and real-world usage..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Admin badge toggle if logged in as admin */}
          {isAdmin && (
            <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300/80 flex items-center gap-3">
              <input
                type="checkbox"
                id="officialReviewToggle"
                checked={isOfficialReview}
                onChange={(e) => setIsOfficialReview(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="officialReviewToggle" className="text-xs font-bold text-amber-900 cursor-pointer">
                Post as Official PawMart Editorial Review / Verified Staff Pick
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List / Grid */}
      {totalReviews === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Reviews Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Be the first customer to share your thoughts, rating, and feedback on this product!
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Write First Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev, idx) => {
            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id || idx}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors shadow-2xs relative"
              >
                <div className="space-y-3">
                  {/* Header: Author + Verified / Admin Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center shadow-xs ${
                          rev.isAdminReview
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-amber-400'
                        }`}
                      >
                        {rev.isAdminReview ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : rev.author ? (
                          rev.author.charAt(0).toUpperCase()
                        ) : (
                          'C'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {rev.author || 'Verified Customer'}
                          </p>
                          {rev.isAdminReview && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-900">
                              Staff Pick
                            </span>
                          )}
                        </div>
                        {rev.date && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{rev.date}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rev.verifiedPurchase !== false && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Purchase</span>
                        </span>
                      )}

                      {/* Admin Actions */}
                      {isAdmin && rev.id && (
                        <button
                          onClick={() => handleDeleteReview(rev.id!)}
                          title="Delete Review (Admin)"
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  {rev.title && (
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {rev.title}
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    "{rev.comment}"
                  </p>

                  {/* Existing Admin Reply */}
                  {rev.adminReply && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                            Official Store Reply
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {rev.adminReply.author || 'PawMart Team'}
                          </span>
                        </div>
                        {rev.adminReply.date && (
                          <span className="text-[10px] text-slate-400">{rev.adminReply.date}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-5">
                        {rev.adminReply.comment}
                      </p>
                    </div>
                  )}

                  {/* Inline Admin Reply Box */}
                  {isAdmin && rev.id && (
                    <div className="pt-2 border-t border-slate-200/60">
                      {isReplying ? (
                        <div className="mt-2 p-3.5 rounded-xl bg-white border border-amber-300 shadow-sm space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Reply to Customer as Store Owner</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setReplyingReviewId(null)}
                              className="text-slate-400 hover:text-slate-600 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                          <input
                            type="text"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            placeholder="Sign-off (e.g. PawMart Team / Parvez)"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                          />
                          <textarea
                            rows={2}
                            value={replyComment}
                            onChange={(e) => setReplyComment(e.target.value)}
                            placeholder="Type your official reply to this customer..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingReviewId(null)}
                              className="px-3 py-1 text-xs text-slate-500"
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              disabled={submittingReply || !replyComment.trim()}
                              onClick={() => handleAdminReplySubmit(rev.id!)}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {submittingReply ? 'Posting...' : 'Post Reply'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev.id!);
                            setReplyComment(rev.adminReply?.comment || '');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>{rev.adminReply ? 'Edit Store Reply' : 'Reply as Store Owner'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
