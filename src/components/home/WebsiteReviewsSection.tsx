import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  Send,
  Plus,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Heart
} from 'lucide-react';
import { WebsiteReview } from '../../types';
import {
  subscribeToWebsiteReviews,
  createWebsiteReview
} from '../../firebase/websiteReviews';

export const WebsiteReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToWebsiteReviews((list) => {
      setReviews(list);
    });
    return () => unsubscribe();
  }, []);

  // Update items per page on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlide = Math.max(0, reviews.length - itemsPerPage);

  // Auto-slide animation every 4 seconds
  useEffect(() => {
    if (reviews.length <= itemsPerPage || isPaused || showForm) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 4200);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [reviews.length, itemsPerPage, maxSlide, isPaused, showForm]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write your feedback/review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await createWebsiteReview({
        author: author.trim(),
        authorEmail: authorEmail.trim() || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        location: 'Verified Visitor',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isCustomAdmin: false,
        verified: true,
      });

      setSuccessMsg(true);
      setAuthor('');
      setAuthorEmail('');
      setTitle('');
      setComment('');
      setRating(5);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowForm(false);
      }, 3500);
    } catch (err: any) {
      console.error('Error submitting website review:', err);
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="py-16 md:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Community Ratings &amp; Experiences</span>
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Website Reviews &amp; Experiences
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Read authentic reviews from shoppers discovering verified Amazon deals on PawMartFinder, or share your own review below!
            </p>
          </div>

          {/* Average Rating + Write Review Button + Slider Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-left border-l border-slate-200 pl-3">
                <p className="text-xs font-extrabold text-slate-900">
                  <span className="text-base text-amber-600 font-black">{avgRating}</span> / 5.0
                </p>
                <p className="text-[11px] text-slate-500">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Verified Reviews'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
            </button>

            {/* Slider Navigation Buttons */}
            {reviews.length > itemsPerPage && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Previous Reviews"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Next Reviews"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Write Review Form */}
        {showForm && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl max-w-3xl mx-auto transition-all animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <MessageSquareQuote className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Share Your Website Experience
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your feedback helps us curate the best deals for the community
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Thank You for Your Review!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your review has been successfully posted and is now live in the slide animation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-6 space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Rating Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    1. Star Rating <span className="text-amber-400">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      2. Your Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Jessica Miller"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address <span className="text-[10px] text-slate-400 font-normal lowercase">(optional, kept private)</span>
                    </label>
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="e.g. jessica@example.com"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Review Headline / Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    3. Review Headline / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Outstanding curated shopping experience!"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Review Feedback / Comment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    4. Your Feedback / Review <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked about PawMartFinder (e.g. product quality, verified Amazon links, easy navigation)..."
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* SLIDE ANIMATION CAROUSEL */}
        <div
          className="relative overflow-hidden pt-2 pb-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {reviews.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm">
              Loading verified reviews...
            </div>
          ) : (
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / itemsPerPage)}%)`,
              }}
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="flex-shrink-0 px-3"
                  style={{
                    width: `${100 / itemsPerPage}%`,
                  }}
                >
                  <div className="h-full p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group">
                    <div className="space-y-3">
                      {/* Stars + Verified Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= (rev.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Review</span>
                          </span>
                        )}
                      </div>

                      {/* Review Title */}
                      {rev.title && (
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                          "{rev.title}"
                        </h4>
                      )}

                      {/* Review Comment */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic line-clamp-4">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Reviewer Details */}
                    <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-300/80 uppercase">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {rev.author}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {rev.location || 'Verified Shopper'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {rev.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slide Indicator Dots */}
        {maxSlide > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: maxSlide + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 h-2.5 bg-amber-500 shadow-xs'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
