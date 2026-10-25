import React, { useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  Truck,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  Search,
  ExternalLink,
  MessageCircleQuestion
} from 'lucide-react';
import { Link } from '../../utils/navigation';

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: 'pet-products' | 'shipping' | 'orders' | 'general';
}

export const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'shipping',
    question: 'How fast is shipping, and are items Amazon Prime eligible?',
    answer: 'Because all products are purchased directly through our Amazon partner listings, items fulfilled by Amazon are eligible for Free 1-Day or 2-Day Prime Shipping based on your location and Amazon Prime membership status. You enjoy standard Amazon logistics and real-time tracking.',
  },
  {
    id: 'faq-2',
    category: 'pet-products',
    question: 'Are the pet toys, feeders, and accessories safe for my animals?',
    answer: 'Yes! We only curate products with verified positive track records, non-toxic materials, BPA-free food-grade plastics, and pet-safe construction. We continuously monitor buyer sentiment and eliminate any product if safety or quality issues arise.',
  },
  {
    id: 'faq-3',
    category: 'orders',
    question: 'How do I purchase items featured on PawMartFinder?',
    answer: 'When you click "VIEW AMAZON" on any product discovery card, you are seamlessly directed to the official Amazon listing. You complete checkout safely on Amazon using your existing Amazon payment methods, addresses, and Prime benefits.',
  },
  {
    id: 'faq-4',
    category: 'orders',
    question: 'Is there any additional markup or hidden fee when buying here?',
    answer: 'Zero markup! You pay the exact official Amazon price, including any lightning deals, coupons, or Prime member discounts. We never charge extra fees or middleman markups.',
  },
  {
    id: 'faq-5',
    category: 'shipping',
    question: 'What is the return policy if a pet bed, brush, or toy does not fit?',
    answer: 'Every purchase is 100% protected by Amazon’s official 30-Day Return Policy and A-to-z Buyer Guarantee. If an item does not suit your cat or dog, you can initiate a prepaid return or replacement directly through your Amazon account.',
  },
  {
    id: 'faq-6',
    category: 'pet-products',
    question: 'How do I pick the right size for collars, harnesses, and beds?',
    answer: 'Check our product descriptions and the detailed sizing guide on the Amazon listing. We recommend measuring your pet’s chest girth, neck circumference, and weight before ordering to ensure the most comfortable, ergonomic fit.',
  },
  {
    id: 'faq-7',
    category: 'shipping',
    question: 'How do I track my delivery after placing an order?',
    answer: 'Immediately after placing your order on Amazon, tracking updates are automatically accessible in your Amazon app and order history, with SMS and email notifications at every milestone until package delivery.',
  },
  {
    id: 'faq-8',
    category: 'general',
    question: 'How does PawMartFinder curate and verify products?',
    answer: 'Our editorial team researches thousands of online listings, filtering for items with at least a 4.2+ star rating, thousands of verified buyer reviews, reliable manufacturer warranties, and exceptional value.',
  },
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  items?: FAQItem[];
  enableFilter?: boolean;
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Find quick answers to common questions about our curated pet products, Amazon Prime shipping, return policies, and order guarantees.',
  badge = 'Help & Answers',
  items = DEFAULT_FAQ_ITEMS,
  enableFilter = true,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'pet-products', label: 'Pet Products & Safety' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'orders', label: 'Orders & Guarantee' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className={`py-16 md:py-24 bg-slate-50 border-t border-slate-200/80 relative ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{badge}</span>
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {subtitle}
          </p>

          {/* Quick Search */}
          <div className="pt-3 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. shipping, returns, safety)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {enableFilter && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Accordion List */}
        {filteredItems.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <MessageCircleQuestion className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-500">
              Try searching with another keyword or select "All Questions".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs font-bold text-amber-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredItems.map((item, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div
                  key={item.id || idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                          isOpen
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-800'
                        }`}
                      >
                        Q
                      </div>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {item.question}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? 'rotate-180 bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Collapsible Answer */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                      <p className="pl-10">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Support Callout */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 border border-amber-300/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Have more questions about a specific product?
              </h4>
              <p className="text-xs text-slate-600">
                Contact our customer support team or check official product listings on Amazon.
              </p>
            </div>
          </div>

          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </section>
  );
};
