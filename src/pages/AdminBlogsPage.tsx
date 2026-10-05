import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogPost } from '../types';
import {
  subscribeToAllBlogs,
  updateBlogPost,
  deleteBlogPost,
  seedInitialBlogsIfEmpty
} from '../firebase/blogs';
import { Link, useRouter } from '../utils/navigation';
import {
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Manage Blogs — PawMart Admin';

    const unsub = subscribeToAllBlogs((items) => {
      setBlogs(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleTogglePublish = async (blog: BlogPost) => {
    try {
      await updateBlogPost(blog.id, { published: !blog.published });
      setActionMsg(`Blog "${blog.title.slice(0, 20)}..." status updated.`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleToggleFeatured = async (blog: BlogPost) => {
    try {
      await updateBlogPost(blog.id, { featured: !blog.featured });
      setActionMsg(`Featured status updated.`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert('Error updating featured: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogPost(id);
      setDeleteConfirmId(null);
      setActionMsg('Blog post deleted successfully.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert('Error deleting post: ' + err.message);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedInitialBlogsIfEmpty();
      setActionMsg('Sample guides loaded.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert('Error seeding: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Cats', 'Dogs', 'T-Shirts', 'Hoodies', 'Books', 'Guides'];

  const filtered = blogs.filter((b) => {
    const matchCat =
      selectedCat === 'All' || b.category.toLowerCase() === selectedCat.toLowerCase();
    const matchSearch =
      search === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AdminRoute>
      <AdminLayout title="Blog Management">
        <div className="space-y-6">
          
          {/* Top Actions & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>All Blog Posts ({blogs.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish articles, add Amazon product recommendations, and manage visitor guides.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/admin/blogs/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-xs shadow-amber-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Post</span>
              </Link>
            </div>
          </div>

          {actionMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blog posts..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCat === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading blog posts...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No blog posts found</p>
                <p className="text-xs text-slate-400">Create your first blog post with an Amazon link!</p>
                <div className="pt-2">
                  <Link
                    to="/admin/blogs/add"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Post Now</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amazon Link</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                            />
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-bold text-slate-900 truncate">{item.title}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{item.readTime}</span>
                                <span>•</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.amazonProductLink ? (
                            <a
                              href={item.amazonProductLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
                            >
                              <span>Configured</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No link</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePublish(item)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                                item.published
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{item.published ? 'Published' : 'Draft'}</span>
                            </button>

                            {item.featured && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/blog/${item.slug || item.id}`}
                              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="View on public website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/admin/blogs/edit/${item.id}`}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                              title="Edit post"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete this blog post?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This action permanently removes the article and its recommendations from the visitor website.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 cursor-pointer shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </AdminLayout>
    </AdminRoute>
  );
};
