import React, { useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { CATEGORIES } from '../services/categories';
import { Product } from '../types';
import { ExternalLink, Layers } from 'lucide-react';
import { Link } from '../utils/navigation';

interface AdminCategoriesPageProps {
  products: Product[];
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ products }) => {
  useEffect(() => {
    document.title = 'Categories — PawMart Admin';
  }, []);

  return (
    <AdminRoute>
      <AdminLayout title="Product Categories">
        <div className="space-y-6">
          <div className="max-w-4xl">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Configured Categories ({CATEGORIES.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active taxonomy for grouping and discovering products across PawMart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              const publishedCount = products.filter((p) => p.category === cat.id && p.published).length;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-slate-100">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {cat.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{cat.shortDescription}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span>Total: {count}</span>
                        <span className="text-emerald-600">Published: {publishedCount}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/${cat.slug}`}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <span>View Public Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
