import React, { useState, useEffect } from 'react';
import { CategoryInfo, Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { SearchBar } from '../components/products/SearchBar';
import { Link } from '../utils/navigation';
import { ChevronRight, ArrowUpDown } from 'lucide-react';

interface CategoryPageProps {
  category: CategoryInfo;
  products: Product[];
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category, products }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'title'>('newest');

  useEffect(() => {
    document.title = `${category.name} — PawMart Product Discovery`;
  }, [category]);

  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === category.name.toLowerCase() && p.published
  );

  const filtered = categoryProducts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-amber-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white mb-10 shadow-lg">
          <div className="absolute inset-0">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
          </div>

          <div className="relative p-8 sm:p-12 md:p-16 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              {category.name} Collection
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {category.heroHeadline}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              {category.shortDescription} {category.heroSubheadline}
            </p>
            <p className="text-xs font-semibold text-amber-400">
              {categoryProducts.length} curated products discovered
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={`Search in ${category.name}...`}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{sorted.length}</strong> of {categoryProducts.length} items
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sorted.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-slate-500 text-sm">
              {search
                ? `No products in ${category.name} matched "${search}". Try another search term.`
                : `No products available in this category yet.`}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
