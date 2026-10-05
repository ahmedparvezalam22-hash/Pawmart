import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { CATEGORIES } from '../services/categories';
import { useRouter } from '../utils/navigation';

interface SearchPageProps {
  products: Product[];
}

export const SearchPage: React.FC<SearchPageProps> = ({ products }) => {
  const { searchParams } = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    document.title = query ? `Search: "${query}" — PawMart` : 'Search Products — PawMart';
  }, [query]);

  const published = products.filter((p) => p.published);

  const filtered = published.filter((p) => {
    const q = query.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    if (!q) return matchesCategory;

    const inTitle = p.title.toLowerCase().includes(q);
    const inCategory = p.category.toLowerCase().includes(q);
    const inShortDesc = p.shortDescription?.toLowerCase().includes(q);
    const inDesc = p.description?.toLowerCase().includes(q);

    return matchesCategory && (inTitle || inCategory || inShortDesc || inDesc);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Search Discoveries
          </h1>
          
          {/* Main Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title, category, keywords..."
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar mt-4 pt-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count Message */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold border-b border-slate-200/80 pb-4">
          <span>
            {query.trim()
              ? `${filtered.length} products found for "${query}"`
              : `${filtered.length} products available`}
          </span>
          {selectedCategory !== 'All' && (
            <span className="text-amber-600 font-bold">Category: {selectedCategory}</span>
          )}
        </div>

        {/* Results Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SearchIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              We couldn't find any products matching your search. Try another search or select a different category.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
