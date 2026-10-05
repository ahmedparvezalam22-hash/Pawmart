import React, { useState, useEffect } from 'react';
import {
  Package,
  Eye,
  EyeOff,
  Star,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  PenTool,
  Users,
  Mail,
  Copy,
  Check,
  MessageSquareQuote,
  CornerDownRight,
  Search,
  Bell,
  LogOut,
} from 'lucide-react';
import { Product, UserProfile, Subscriber } from '../../types';
import { CATEGORIES } from '../../services/categories';
import { Link, useRouter } from '../../utils/navigation';
import { seedProductsIfEmpty } from '../../firebase/products';
import { subscribeToAllUsers } from '../../firebase/usersService';
import { subscribeToAllSubscribers } from '../../firebase/subscribersService';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  products: Product[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products }) => {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedSingleEmail, setCopiedSingleEmail] = useState<string | null>(null);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.published).length;
  const unpublishedProducts = products.filter((p) => !p.published).length;
  const featuredProducts = products.filter((p) => p.featured).length;

  // Real-time listener for registered customers / users
  useEffect(() => {
    const unsub = subscribeToAllUsers((users) => {
      setRegisteredUsers(users);
    });
    return () => unsub();
  }, []);

  // Real-time listener for email subscribers
  useEffect(() => {
    const unsub = subscribeToAllSubscribers((data) => {
      setSubscribers(data);
    });
    return () => unsub();
  }, []);

  // Compute all reviews across products
  const allReviews: { product: Product; review: any }[] = [];
  products.forEach((p) => {
    if (p.reviews && p.reviews.length > 0) {
      p.reviews.forEach((r) => {
        allReviews.push({ product: p, review: r });
      });
    }
  });

  const unrepliedReviews = allReviews.filter((i) => !i.review.adminReply);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.category === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    // If no products exist in Firestore, attempt automatic seed
    if (totalProducts === 0) {
      seedProductsIfEmpty();
    }
  }, [totalProducts]);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const seeded = await seedProductsIfEmpty();
      if (seeded) {
        setSeedMessage('Successfully loaded sample catalog into Firestore!');
      } else {
        setSeedMessage('Catalog already populated with products.');
      }
      setTimeout(() => setSeedMessage(null), 4000);
    } catch (err: any) {
      setSeedMessage('Error seeding: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleCopyAllEmails = () => {
    const validEmails = registeredUsers
      .map((u) => u.email.trim())
      .filter((e) => Boolean(e) && e.includes('@'));
    
    if (validEmails.length === 0) return;

    const emailList = Array.from(new Set(validEmails)).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  const handleCopySingleEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedSingleEmail(email);
    setTimeout(() => setCopiedSingleEmail(null), 2500);
  };

  const filteredUsers = registeredUsers.filter((u) => {
    const q = usersSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discovery Management Dashboard
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Welcome back, Parvez. Manage your curated catalog, respond to customer reviews, review customer email sign-ups, and monitor category statistics in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            to="/admin/reviews"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 transition-all cursor-pointer"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Reviews ({allReviews.length})</span>
          </Link>

          <Link
            to="/admin/subscribers"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Subscribers ({subscribers.length})</span>
          </Link>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>Seed Catalog</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
          {seedMessage}
        </div>
      )}

      {/* Main Status Statistics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Platform Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Products</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalProducts}</p>
            <p className="text-[10px] text-slate-400 mt-1">In catalog</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Published</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{publishedProducts}</p>
            <p className="text-[10px] text-emerald-600 mt-1">Live to visitors</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Unpublished</span>
              <EyeOff className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{unpublishedProducts}</p>
            <p className="text-[10px] text-slate-400 mt-1">Drafts</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Featured</span>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{featuredProducts}</p>
            <p className="text-[10px] text-amber-600 mt-1">In carousel</p>
          </div>

          {/* Registered Customers / Sign-up Users */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Users</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{registeredUsers.length}</p>
            <p className="text-[10px] text-blue-600 mt-1">Accounts</p>
          </div>

          {/* Email Subscribers */}
          <Link
            to="/admin/subscribers"
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer block"
          >
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Subscribers</span>
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{subscribers.length}</p>
            <p className="text-[10px] text-amber-600 mt-1">Email alerts</p>
          </Link>

          {/* Customer Reviews & Replies */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Reviews</span>
              <MessageSquareQuote className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{allReviews.length}</p>
            <p className="text-[10px] text-purple-600 mt-1">
              {unrepliedReviews.length > 0 ? `${unrepliedReviews.length} need reply` : 'All answered'}
            </p>
          </div>
        </div>
      </div>

      {/* REGISTERED CUSTOMERS & SIGN-UP EMAIL IDs TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Registered Customer Sign-ups & Email IDs ({registeredUsers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All visitors who registered on PawMart. You can view their email IDs, copy emails, or export for notifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAllEmails}
              disabled={registeredUsers.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copiedEmails
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {copiedEmails ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Emails Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Email IDs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar for users */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              placeholder="Search by customer name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            Showing {filteredUsers.length} of {registeredUsers.length} users
          </span>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="py-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
            <Mail className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Customers Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When customers sign up on the website or register with email, their accounts will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Email ID</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3">Role / Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const isCopied = copiedSingleEmail === u.email;
                  const isOwner = u.role === 'admin';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isOwner
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-bold text-slate-900">{u.name || 'Member'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-mono text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isOwner
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isOwner ? 'Store Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingleEmail(u.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Copy email ID"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-700 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`mailto:${u.email}?subject=Welcome to PawMart`}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded-md"
                            title="Send email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Category Breakdown
          </h3>
          <Link to="/admin/categories" className="text-xs font-bold text-amber-600 hover:text-amber-700">
            Manage Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate">{cat.name}</p>
                  <p className="text-2xl font-black text-slate-900 mt-2">{count}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {count === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px]">
                  <Link
                    to={`/${cat.slug}`}
                    className="text-amber-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Public</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews, Email Subscribers & Recent Products Snapshot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Customer Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest reviews and feedback from shoppers</p>
              </div>
              <Link
                to="/admin/reviews"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <span>View All ({allReviews.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {allReviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reviews submitted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {allReviews.slice(0, 4).map(({ product, review }, idx) => (
                  <div key={review.id || idx} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{review.author}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-slate-700 font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      on <span className="text-slate-800 font-bold">{product.title}</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1">"{review.comment}"</p>
                    {review.adminReply ? (
                      <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-bold pt-0.5">
                        <Check className="w-3 h-3" />
                        <span>Answered</span>
                      </div>
                    ) : (
                      <Link
                        to="/admin/reviews"
                        className="text-[10px] text-amber-600 hover:underline flex items-center gap-1 font-bold pt-0.5"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Reply</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/admin/reviews"
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Email Subscribers Snapshot */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Email Subscribers</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visitors subscribed for product alerts</p>
              </div>
              <Link
                to="/admin/subscribers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <span>View All ({subscribers.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {subscribers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No email subscribers yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {subscribers.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-slate-900 truncate">
                        {sub.email}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(sub.createdAt).toLocaleDateString()} • {sub.source || 'newsletter'}
                      </p>
                    </div>

                    <a
                      href={`mailto:${sub.email}?subject=New Product Alerts from PawMart`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors flex-shrink-0"
                      title="Send email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/admin/subscribers"
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Subscribers ({subscribers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Products Snapshot */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Products</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick look at the latest items added to PawMart</p>
              </div>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <span>View All ({totalProducts})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.category} • {p.published ? 'Published' : 'Draft'} • {p.featured ? 'Featured' : 'Standard'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/admin/products"
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
