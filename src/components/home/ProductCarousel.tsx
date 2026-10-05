import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../products/ProductCard';

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const featured = React.useMemo(() => {
    const published = products.filter((p) => p.published);
    const feat = published.filter((p) => p.featured);
    const nonFeat = published.filter((p) => !p.featured);
    return feat.length >= 6 ? feat : [...feat, ...nonFeat].slice(0, 12);
  }, [products]);

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
    setActiveIndex(Math.min(approxIdx, Math.max(0, featured.length - 1)));
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [featured]);

  // Auto-slide every 4 seconds (4000ms) if not hovered
  useEffect(() => {
    if (isHovered || featured.length <= 1) return;
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 20) {
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        containerRef.current.scrollBy({ left: 304, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, featured.length]);

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

  if (featured.length === 0) return null;

  return (
    <section
      className="py-16 bg-white border-y border-slate-200/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Curator's Choice
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Products
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-tested and highly recommended customer favorites on Amazon.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className={`p-2.5 rounded-full border border-slate-200 transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white text-slate-800 hover:bg-slate-100 shadow-xs hover:border-slate-300'
                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              aria-label="Next products"
              className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Horizontal Scroll Container */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {featured.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[290px] md:w-[280px] lg:w-[280px] transition-transform duration-500"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Slide Progress Indicators */}
        {featured.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {featured.slice(0, Math.min(featured.length, 8)).map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Slide to product ${idx + 1}`}
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
    </section>
  );
};
