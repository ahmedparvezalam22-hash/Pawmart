import { CategoryInfo, ProductCategory } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Cats',
    name: 'Cats',
    slug: 'cats',
    shortDescription: 'Explore useful and fun products for cats.',
    heroHeadline: 'Curated Finds for Happy Felines',
    heroSubheadline: 'From ergonomic scratching trees to stimulating toys and grooming essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Dogs',
    name: 'Dogs',
    slug: 'dogs',
    shortDescription: 'Discover practical products for your furry friends.',
    heroHeadline: 'Quality Essentials for Your Best Friend',
    heroSubheadline: 'Durable play toys, leak-proof hydration gear, and cozy walking accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Kids Toys',
    name: 'Kids Toys',
    slug: 'kids-toys',
    shortDescription: 'Educational, creative, and fun playsets & toys for kids of all ages.',
    heroHeadline: 'Fun, Safe & Educational Kids Toys',
    heroSubheadline: 'Discover STEM building sets, interactive plushies, outdoor games, and creative toys on Amazon.',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Skin Care',
    name: 'Skin Care',
    slug: 'skin-care',
    shortDescription: 'Hydrating serums, gentle cleansers, daily sunscreens, and glowing beauty essentials.',
    heroHeadline: 'Radiant & Dermatologist-Tested Skin Care',
    heroSubheadline: 'Explore nourishing moisturizers, vitamin C serums, gentle cleansers, and daily skin care routines on Amazon.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'T-Shirts',
    name: 'T-Shirts',
    slug: 't-shirts',
    shortDescription: 'Find casual and stylish T-shirts.',
    heroHeadline: 'Minimalist & Graphic Pet Lover Tees',
    heroSubheadline: '100% premium cotton everyday tees with tasteful artwork and timeless cuts.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Hoodies',
    name: 'Hoodies',
    slug: 'hoodies',
    shortDescription: 'Explore comfortable everyday hoodies.',
    heroHeadline: 'Cozy, Everyday Heavyweight Hoodies',
    heroSubheadline: 'Ultra-soft fleece pullovers and zip-ups crafted for all-day comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Books',
    name: 'Books',
    slug: 'books',
    shortDescription: 'Discover interesting books and reading picks.',
    heroHeadline: 'Enriching Reads & Pet Guides',
    heroSubheadline: 'Comprehensive training manuals, canine psychology, and heartfelt pet memoirs.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Furniture',
    name: 'Furniture',
    slug: 'furniture',
    shortDescription: 'Modern furniture, ergonomic seating, and stylish home decor.',
    heroHeadline: 'Contemporary Living & Modern Furniture',
    heroSubheadline: 'Ergonomic office chairs, coffee tables, comfortable sofas, and space-saving storage.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Shoes',
    name: 'Shoes',
    slug: 'shoes',
    shortDescription: 'Trendy sneakers, running shoes, and comfortable footwear.',
    heroHeadline: 'Premium Comfort & Trendsetting Footwear',
    heroSubheadline: 'High-traction running shoes, cushioned walking sneakers, and stylish daily footwear.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Wedding Collection',
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    shortDescription: 'Bridal accessories, celebration gifts, and timeless decor.',
    heroHeadline: 'Timeless Wedding Collection & Celebrations',
    heroSubheadline: 'Handcrafted keepsakes, bridal party gifts, festive accents, and memorable favors.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Electronics',
    name: 'Electronics',
    slug: 'electronics',
    shortDescription: 'Smart devices, wireless audio gear, and home gadgets.',
    heroHeadline: 'Smart Tech, Audio & Modern Electronics',
    heroSubheadline: 'Noise-cancelling headphones, wireless chargers, automated feeders, and everyday tech essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Jewelry Collection',
    name: 'Jewelry Collection',
    slug: 'jewelry-collection',
    shortDescription: 'Fine gold, silver, rings, necklaces, and delicate accessories.',
    heroHeadline: 'Exquisite & Timeless Jewelry Collection',
    heroSubheadline: 'Handpicked sterling silver, 14K gold plated bracelets, sparkling pendants, and everyday luxury.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'Other Products',
    name: 'Other Products',
    slug: 'other-products',
    shortDescription: 'Everyday discoveries, trending accessories, and unique lifestyle goods.',
    heroHeadline: 'Curated Essentials & Other Products',
    heroSubheadline: 'Explore unique trending finds, novel lifestyle tools, and everyday accessories on Amazon.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop'
  }
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<ProductCategory, CategoryInfo>);

export const getCategoryBySlug = (slug: string): CategoryInfo | undefined => {
  const decoded = decodeURIComponent(slug).toLowerCase().replace(/^\/+|\/+$/g, '').replace(/\s+/g, '-');
  if (
    decoded === 'other' ||
    decoded === 'others' ||
    decoded === 'other-product' ||
    decoded === 'others-products' ||
    decoded === 'others-product'
  ) {
    return CATEGORIES.find(c => c.slug === 'other-products');
  }
  if (decoded === 'skincare') {
    return CATEGORIES.find(c => c.slug === 'skin-care');
  }
  if (decoded === 'toys' || decoded === 'kid-toys') {
    return CATEGORIES.find(c => c.slug === 'kids-toys');
  }
  return CATEGORIES.find(c => c.slug === decoded || c.name.toLowerCase().replace(/\s+/g, '-') === decoded);
};
