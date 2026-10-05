import React, { useEffect, useState } from 'react';
import { BlogPost } from '../../types';
import { subscribeToPublishedBlogs } from '../../firebase/blogs';
import { Link } from '../../utils/navigation';
import { BookOpen, Clock, ArrowRight, Sparkles, Eye } from 'lucide-react';

export const HomeBlogSection: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const unsub = subscribeToPublishedBlogs((items) => {
      setBlogs(items.slice(0, 3));
    });
    return () => unsub();
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Guides & Tips</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From Our Pet & Lifestyle Blog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Expert care insights, sizing guides, and honest recommendations with direct access to Amazon.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition-all shadow-xs self-start sm:self-auto"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Blog Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {blogs.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-300 transition-all duration-300 flex flex-col group"
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
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
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
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
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
