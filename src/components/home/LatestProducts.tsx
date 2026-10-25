import React, { useState } from 'react';
import { Sparkles, ArrowRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';
import { CategoryProductSlider } from '../products/CategoryProductSlider';
import { CATEGORIES } from '../../services/categories';
import { Link } from '../../utils/navigation';
import { trackCategoryNavigation } from '../../services/adTracking';

interface LatestProductsProps {
  products: Product[];
}

export const LatestProducts: React.FC<LatestProductsProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');

  // Filter products for the selected category or all
  const filteredProducts = selectedCategory === 'All'
    ? products.filter((p) => p.published)
    : products.filter((p) => {
        if (!p.published) return false;
        const catLower = p.category.toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        if (catLower === selLower) return true;
        if (selectedCategory === 'Phone Cases' && (catLower === 'phone cases' || catLower === 'phone case')) return true;
        if (selectedCategory === 'Kids Toys' && (catLower === 'kids toys' || catLower === 'kids toy' || catLower === 'toys')) return true;
        if (selectedCategory === 'Skin Care' && (catLower === 'skin care' || catLower === 'skincare')) return true;
        if (selectedCategory === 'Other Products' && (catLower === 'other products' || catLower === 'other' || catLower === 'others')) return true;
        return false;
      });

  // Categories that have published products
  const activeCategories = CATEGORIES.filter((cat) => {
    return products.some((p) => {
      if (!p.published) return false;
      const catLower = p.category.toLowerCase();
      const nameLower = cat.name.toLowerCase();
      if (catLower === nameLower) return true;
      if (cat.slug === 'phone-cases' && (catLower === 'phone cases' || catLower === 'phone case')) return true;
      if (cat.slug === 'kids-toys' && (catLower === 'kids toys' || catLower === 'kids toy' || catLower === 'toys')) return true;
      if (cat.slug === 'skin-care' && (catLower === 'skin care' || catLower === 'skincare')) return true;
      if (cat.slug === 'other-products' && (catLower === 'other products' || catLower === 'other' || catLower === 'others')) return true;
      return false;
    });
  });

  return (
    <section className="py-16 md:py-24 bg-slate-50/80 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Category Tabs & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Category Collections & Discoveries
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Shop by Category Slide Showcases
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Each category features individual smooth slide animations, handpicked selections, and direct Amazon links.
            </p>
          </div>

          {/* View Mode Switcher (Slide Animation vs Grid) */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 self-start md:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Slide Animation</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories ({activeCategories.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                trackCategoryNavigation(cat.name);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 1. SLIDE ANIMATION VIEW (Default) */}
        {viewMode === 'slider' && (
          <div className="space-y-4">
            {selectedCategory === 'All' ? (
              // Every category gets its own separate slide animation carousel!
              activeCategories.map((cat, idx) => (
                <CategoryProductSlider
                  key={cat.id}
                  category={cat}
                  products={products}
                  categoryIndex={idx}
                />
              ))
            ) : (
              // Single selected category slide animation carousel
              (() => {
                const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
                if (!catObj) return null;
                return (
                  <CategoryProductSlider
                    category={catObj}
                    products={products}
                    categoryIndex={0}
                  />
                );
              })()
            )}
          </div>
        )}

        {/* 2. GRID VIEW (Optional toggle) */}
        {viewMode === 'grid' && (
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.slice(0, 16).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                <p className="text-slate-500 text-sm">No products found in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA to view all in selected category */}
        {selectedCategory !== 'All' && (
          <div className="mt-8 text-center">
            <Link
              to={`/${CATEGORIES.find((c) => c.id === selectedCategory)?.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>Explore All {selectedCategory} Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
