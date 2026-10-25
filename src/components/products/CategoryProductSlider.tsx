import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import { CategoryInfo, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Link } from '../../utils/navigation';

interface CategoryProductSliderProps {
  category: CategoryInfo;
  products: Product[];
  categoryIndex?: number;
}

export const CategoryProductSlider: React.FC<CategoryProductSliderProps> = ({
  category,
  products,
  categoryIndex = 0,
}) => {
  // Filter products for this specific category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.published) return false;
      const catLower = p.category.toLowerCase();
      const nameLower = category.name.toLowerCase();

      if (catLower === nameLower) return true;

      if (
        category.slug === 'phone-cases' &&
        (catLower === 'phone cases' || catLower === 'phone case')
      ) {
        return true;
      }
      if (
        category.slug === 'kids-toys' &&
        (catLower === 'kids toys' || catLower === 'kids toy' || catLower === 'toys')
      ) {
        return true;
      }
      if (
        category.slug === 'skin-care' &&
        (catLower === 'skin care' || catLower === 'skincare')
      ) {
        return true;
      }
      if (
        category.slug === 'other-products' &&
        (catLower === 'other products' || catLower === 'other' || catLower === 'others')
      ) {
        return true;
      }

      return false;
    });
  }, [products, category]);

  // For seamless scrolling even with fewer items, expand list if needed
  const displayItems = useMemo(() => {
    if (categoryProducts.length === 0) return [];
    if (categoryProducts.length <= 3) {
      // Duplicate to ensure at least 6 items for smooth horizontal slide animation
      return [
        ...categoryProducts.map((p) => ({ ...p, _displayKey: `${p.id}-d1` })),
        ...categoryProducts.map((p) => ({ ...p, _displayKey: `${p.id}-d2` })),
        ...categoryProducts.map((p) => ({ ...p, _displayKey: `${p.id}-d3` })),
      ];
    }
    return categoryProducts.map((p) => ({ ...p, _displayKey: p.id }));
  }, [categoryProducts]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    const approxIdx = Math.round(scrollLeft / 304);
    setActiveIndex(Math.min(approxIdx, Math.max(0, displayItems.length - 1)));
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayItems]);

  // Auto-slide animation matching Featured Products (every 4000ms with slight stagger)
  useEffect(() => {
    if (isHovered || displayItems.length <= 1) return;
    const delay = 4000 + (categoryIndex % 3) * 350;
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 20) {
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        containerRef.current.scrollBy({ left: 304, behavior: 'smooth' });
      }
    }, delay);

    return () => clearInterval(interval);
  }, [isHovered, displayItems.length, categoryIndex]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const cardWidth = 304;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    if (direction === 'right' && scrollLeft >= scrollWidth - clientWidth - 20) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      containerRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const scrollToIndex = (idx: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: idx * 304,
      behavior: 'smooth',
    });
    setActiveIndex(idx);
  };

  if (categoryProducts.length === 0) return null;

  return (
    <div
      className="py-8 bg-white/70 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:border-amber-400/40 transition-colors mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Slider Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-600">
              <Tag className="w-4 h-4 fill-amber-500/20 text-amber-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              {category.name} Collection
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600 border border-slate-200">
              {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
            <span>{category.name}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {category.shortDescription}
          </p>
        </div>

        {/* Action Controls: Link + Prev/Next buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={`/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors mr-1 group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label={`Previous ${category.name} products`}
              className={`p-2 rounded-full border border-slate-200 transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white text-slate-800 hover:bg-slate-100 shadow-xs hover:border-slate-300'
                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scroll('right')}
              aria-label={`Next ${category.name} products`}
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Animation Carousel Horizontal Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-2 px-2 sm:mx-0 sm:px-0"
      >
        {displayItems.map((product) => (
          <div
            key={product._displayKey}
            className="flex-shrink-0 w-[280px] sm:w-[290px] md:w-[280px] lg:w-[280px] transition-transform duration-500"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Slide Progress Dot Indicators */}
      {displayItems.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {displayItems.slice(0, Math.min(displayItems.length, 8)).map((p, idx) => (
            <button
              key={`dot-${category.id}-${idx}`}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Slide ${category.name} to product ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-amber-500'
                  : 'w-1.5 bg-slate-200 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
