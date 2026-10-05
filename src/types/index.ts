export type ProductCategory =
  | 'Cats'
  | 'Dogs'
  | 'Kids Toys'
  | 'Skin Care'
  | 'T-Shirts'
  | 'Hoodies'
  | 'Books'
  | 'Furniture'
  | 'Shoes'
  | 'Wedding Collection'
  | 'Electronics'
  | 'Jewelry Collection'
  | 'Other Products';

export interface ProductReviewReply {
  author: string;
  comment: string;
  date: string;
}

export interface ProductReview {
  id?: string;
  author: string;
  authorEmail?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  date?: string;
  verifiedPurchase?: boolean;
  isAdminReview?: boolean;
  adminReply?: ProductReviewReply;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  imageUrl: string;
  galleryUrls?: string[];
  viewsCount?: string;
  reviews?: ProductReview[];
  amazonAffiliateLink: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source?: string;
  createdAt: string;
  status?: 'active' | 'unsubscribed';
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  slug: string;
  shortDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  imageUrl: string;
}

export type BlogCategory = 'Cats' | 'Dogs' | 'T-Shirts' | 'Hoodies' | 'Books' | 'Pet Care' | 'Guides' | 'Lifestyle';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory | string;
  excerpt: string;
  content: string;
  imageUrl: string;
  viewsCount?: string;
  amazonProductLink: string;
  amazonButtonText?: string;
  author: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
