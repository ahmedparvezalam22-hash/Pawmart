import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { CATEGORIES } from '../../services/categories';
import { Link } from '../../utils/navigation';

interface LatestProductsProps {
  products: Product[];
}

export const LatestProducts: React.FC<LatestProductsProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const displayList = filteredProducts.slice(0, 12);

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Fresh Arrivals
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Latest Products
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Browse our newest product discoveries with direct Amazon links and detailed breakdowns.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Columns Desktop, 2 Tablet, 1 Mobile */}
        {displayList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm">No products found in this category.</p>
          </div>
        )}

        {/* Bottom CTA to view all in category */}
        {selectedCategory !== 'All' && (
          <div className="mt-12 text-center">
            <Link
              to={`/${CATEGORIES.find(c => c.id === selectedCategory)?.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>Explore All {selectedCategory}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
