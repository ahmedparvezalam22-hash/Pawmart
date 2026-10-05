import React, { useState, useEffect } from 'react';
import { BlogPost, BlogCategory } from '../types';
import { subscribeToPublishedBlogs } from '../firebase/blogs';
import { Link, useRouter } from '../utils/navigation';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Tag,
  Eye
} from 'lucide-react';

interface BlogListPageProps {
  blogs?: BlogPost[];
}

export const BlogListPage: React.FC<BlogListPageProps> = ({ blogs: propBlogs }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(propBlogs || []);
  const [loading, setLoading] = useState(!propBlogs || propBlogs.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    document.title = 'Blog & Curated Guides — PawMart';
    window.scrollTo(0, 0);

    const unsub = subscribeToPublishedBlogs((items) => {
      setBlogs(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const categories = ['All', 'Cats', 'Dogs', 'Kids Toys', 'Skin Care', 'T-Shirts', 'Books', 'Guides'];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = filteredBlogs.find((b) => b.featured) || filteredBlogs[0];
  const regularBlogs = featuredBlog
    ? filteredBlogs.filter((b) => b.id !== featuredBlog.id)
    : filteredBlogs;

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Blog & Buying Guides</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>PawMart Editorial</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Curated Guides, Tips & Pet Stories
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Practical advice for pet parents, apparel styling insights, and hand-selected recommendations available directly on Amazon.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, tips, or topics..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-80 bg-white rounded-3xl animate-pulse border border-slate-200" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-200" />
              ))}
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No blog posts found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any articles matching your search or category filter. Try clearing the filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Hero Card */}
            {featuredBlog && selectedCategory === 'All' && searchQuery === '' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto overflow-hidden relative">
                  <img
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Featured Guide</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 text-xs font-bold shadow-md border border-white/10">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{featuredBlog.viewsCount || '1.5k'} views</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {featuredBlog.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>{featuredBlog.viewsCount || '1.5k'} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredBlog.readTime}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(featuredBlog.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <Link to={`/blog/${featuredBlog.slug || featuredBlog.id}`}>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                        {featuredBlog.title}
                      </h2>
                    </Link>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {featuredBlog.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      By <strong className="text-slate-800">{featuredBlog.author || 'Parvez'}</strong>
                    </div>

                    <Link
                      to={`/blog/${featuredBlog.slug || featuredBlog.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Regular Blog Posts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>
                    {selectedCategory === 'All' && searchQuery === ''
                      ? 'Latest Articles & Guides'
                      : `Results in ${selectedCategory} (${filteredBlogs.length})`}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {(selectedCategory === 'All' && searchQuery === '' ? regularBlogs : filteredBlogs).map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300/80 transition-all duration-300 flex flex-col group"
                  >
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 text-[11px] font-bold shadow-md border border-white/10">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.viewsCount || '1.5k'} views</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <Eye className="w-3 h-3 text-amber-500" />
                            <span>{item.viewsCount || '1.5k'} views</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.readTime}</span>
                          </span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>

                        <Link to={`/blog/${item.slug || item.id}`}>
                          <h4 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          By <strong className="text-slate-700">{item.author || 'Parvez'}</strong>
                        </span>

                        <Link
                          to={`/blog/${item.slug || item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <span>Read Guide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
