import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { WebsiteReview } from '../types';
import {
  Star,
  Globe,
  Plus,
  Send,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  ExternalLink,
  MessageSquareQuote,
  Sparkles
} from 'lucide-react';
import { Link } from '../utils/navigation';
import {
  subscribeToWebsiteReviews,
  createWebsiteReview,
  deleteWebsiteReview
} from '../firebase/websiteReviews';

export const AdminWebsiteReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Verified Buyer • USA');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [verified, setVerified] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Website Reviews Management — PawMartFinder Admin';
    const unsub = subscribeToWebsiteReviews((list) => {
      setReviews(list);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setError('Please provide reviewer name (নাম দিন).');
      return;
    }
    if (!comment.trim()) {
      setError('Please provide review text/feedback (রিভিউ লেখা দিন).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createWebsiteReview({
        author: author.trim(),
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        location: location.trim() || 'Verified Shopper',
        date: date.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isCustomAdmin: true,
        verified,
      });

      setActionSuccess('Website review submitted successfully! It is now live in the homepage slide animation.');
      setAuthor('');
      setTitle('');
      setComment('');
      setRating(5);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error adding website review:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, reviewerName: string) => {
    if (!window.confirm(`Are you sure you want to delete the review by "${reviewerName}"? It will be removed from the homepage.`)) {
      return;
    }

    try {
      await deleteWebsiteReview(id);
      setActionSuccess('Review deleted successfully from website.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review: ' + err.message);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.author.toLowerCase().includes(q) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q))
    );
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  const customCount = reviews.filter((r) => r.isCustomAdmin).length;
  const customerCount = reviews.filter((r) => !r.isCustomAdmin).length;

  return (
    <AdminRoute>
      <AdminLayout title="Website Reviews">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-500" />
                <span>Website Reviews &amp; Testimonials Management</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                এখানে নাম, স্টার রেটিং এবং রিভিউ লিখে সাবমিট করুন—তা সরাসরি হোমপেজের স্লাইড অ্যানিমেশনে প্রদর্শিত হবে। এছাড়াও কাস্টমারদের করা রিভিউ পছন্দ না হলে সহজে ডিলিট করতে পারবেন।
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <span>View on Homepage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {actionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Total Reviews
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {reviews.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Average Rating
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">{avgRating}</span>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Admin Custom Reviews
              </span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {customCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Customer Reviews
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {customerCount}
              </span>
            </div>
          </div>

          {/* Form: Add Custom Website Review */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300/80 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Add Website Review (#নতুন রিভিউ যুক্ত করুন)
                  </h3>
                  <p className="text-xs text-slate-500">
                    নাম, স্টার এবং রিভিউ লিখে সাবমিট করলেই তা ওয়েবসাইটের রিভিউ স্লাইডারে লাইভ শো করবে।
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Submission</span>
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Selection */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  ১. স্টার রেটিং সিলেক্ট করুন (Star Rating 1 - 5) <span className="text-amber-600 font-black">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}

                  <span className="ml-3 px-3 py-1 rounded-xl bg-slate-900 text-amber-400 font-extrabold text-xs shadow-2xs">
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reviewer Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    ২. রিভিউয়ারের নাম (Name) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Jessica Miller বা David Khan"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                {/* Location / Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    লোকেশন / ব্যাজ (Location or Shopper Tag)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Verified Buyer • California, USA"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Headline / Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    রিভিউ হেডলাইন / টাইটেল (Optional Title)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Best curated cat accessories on Amazon!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                {/* Date Display */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                    তারিখ (Date Display)
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Oct 24, 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Review Text / Feedback */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  ৩. রিভিউ বিস্তারিত লেখা (Review Feedback &amp; Comments) <span className="text-amber-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="এখানে আপনার রিভিউ বা কাস্টমার টেস্টমোনিয়াল লিখুন (যেমন: PawMartFinder এর মাধ্যমে সহজেই ভেরিফাইড প্রোডাক্ট পেয়েছি, অ্যামাজন প্রাইম ডেলিভারি দারুণ ছিল)..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Checkbox and Submit button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span>"Verified Review" সবুজ ব্যাজ শো করবে</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {submitting ? (
                    <span>Publishing Review...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit &amp; Show on Website (সাবমিট করুন)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of All Live Reviews & Customer Review Moderation */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-amber-500" />
                  <span>All Live Website Reviews ({filteredReviews.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  যেকোনো রিভিউ পছন্দ না হলে ডানপাশের লাল ডিলিট বাটনে ক্লিক করে ওয়েবসাইট থেকে সাথে সাথে মুছে দিতে পারেন।
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviews by name or text..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                No reviews found. Add your first review above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs space-y-4 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        {/* Stars */}
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
                          <span className="text-xs font-bold text-slate-800 ml-1">
                            {rev.rating}/5
                          </span>
                        </div>

                        {/* Badges + Delete */}
                        <div className="flex items-center gap-1.5">
                          {rev.isCustomAdmin ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Admin Custom
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              Customer
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(rev.id, rev.author)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this review from website"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {rev.title && (
                        <h4 className="text-sm font-extrabold text-slate-900">
                          "{rev.title}"
                        </h4>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-900 font-bold flex items-center justify-center text-[10px] uppercase">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{rev.author}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{rev.location || 'Visitor'}</p>
                        </div>
                      </div>

                      <span className="text-slate-400 text-[10px]">{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
