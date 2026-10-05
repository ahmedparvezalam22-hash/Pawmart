import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  ExternalLink,
  Search,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { useRouter } from '../../utils/navigation';
import {
  deleteProduct,
  togglePublishStatus,
  toggleFeaturedStatus,
} from '../../firebase/products';

interface ProductTableProps {
  products: Product[];
}

export const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const categories: string[] = [
    'All',
    'Cats',
    'Dogs',
    'Kids Toys',
    'Skin Care',
    'Furniture',
    'Shoes',
    'Wedding Collection',
    'Jewelry Collection',
    'Electronics',
    'Other Products',
    'T-Shirts',
    'Hoodies',
    'Books',
  ];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTogglePublish = async (p: Product) => {
    try {
      setActionLoadingId(p.id);
      await togglePublishStatus(p.id, p.published);
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (p: Product) => {
    try {
      setActionLoadingId(p.id);
      await toggleFeaturedStatus(p.id, p.featured);
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setActionLoadingId(deletingProduct.id);
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-center">Published</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-4">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : '—';

                  const isLoading = actionLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-6">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3 px-6 max-w-xs">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-1">{p.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.shortDescription}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <a
                            href={p.amazonAffiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
                          >
                            <span>Test Amazon Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {p.viewsCount && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              <Eye className="w-3 h-3 text-amber-500" />
                              <span>{p.viewsCount} views</span>
                            </span>
                          )}
                          {p.reviews && p.reviews.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{p.reviews.length} {p.reviews.length === 1 ? 'review' : 'reviews'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {p.category}
                        </span>
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            p.published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          {p.published ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleToggleFeatured(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            p.featured
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                          <span>{p.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No products matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{deletingProduct.title}"</strong>? This action cannot be undone and will immediately remove it from public discovery.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
