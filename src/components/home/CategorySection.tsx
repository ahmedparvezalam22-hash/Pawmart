import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../services/categories';
import { Product } from '../../types';
import { Link } from '../../utils/navigation';

interface CategorySectionProps {
  products: Product[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ products }) => {
  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <section id="categories" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Browse Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Curated everyday goods across home furniture, footwear, smart electronics, wedding essentials, and pet favorites.
            </p>
          </div>
        </div>

        {/* 9 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const count = getProductCount(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/${cat.slug}`}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Category Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Badge Count */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900/80 backdrop-blur-xs text-white border border-white/20">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {cat.shortDescription}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600 group-hover:text-amber-700">
                    <span>View Category</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
