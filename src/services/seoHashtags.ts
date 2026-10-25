/**
 * Google SEO Hashtags Generator & Keyword Optimizer
 * Generates tailored Google Search # hashtags and indexing keywords for products and blog posts.
 */

import { Product, BlogPost } from '../types';

export interface SEOHashtagData {
  tags: string[];
  searchTerms: string[];
  rawHashtagsString: string;
}

// Category keyword mappings for Google SEO
const CATEGORY_SEO_KEYWORDS: Record<string, string[]> = {
  Cats: ['CatSupplies', 'CatLovers', 'KittenCare', 'PetWellness', 'IndoorCatCare', 'CatProducts'],
  Dogs: ['DogGear', 'PuppyTraining', 'DogEssentials', 'DogLovers', 'K9Accessories', 'PetCareDeals'],
  'Kids Toys': ['KidsToys', 'STEMToys', 'EducationalToys', 'CreativePlay', 'ToddlerGifts', 'LearningGames'],
  'Skin Care': ['SkinCareRoutine', 'GlowingSkin', 'DermatologistRecommended', 'HydratingSerum', 'BeautyFavorites'],
  'Phone Cases': ['PhoneCases', 'MagSafeAccessories', 'ProtectiveCase', 'ShockproofArmor', 'PhoneAesthetics'],
  'T-Shirts': ['GraphicTees', 'CottonTShirts', 'StreetwearStyle', 'PetLoverShirts', 'CasualFashion'],
  Hoodies: ['CozyHoodies', 'FleecePullover', 'WarmApparel', 'StreetwearHoodie', 'EverydayComfort'],
  Books: ['BookRecommendations', 'MustReadBooks', 'PetCareGuides', 'MindfulLiving', 'BookLovers'],
  Furniture: ['HomeDecor', 'ModernFurniture', 'ErgonomicLiving', 'SpaceSavingStorage', 'InteriorInspo'],
  Shoes: ['Sneakers', 'RunningShoes', 'ComfortFootwear', 'AthleticShoes', 'DailyStyle'],
  'Wedding Collection': ['WeddingInspo', 'BridalJewelry', 'WeddingGifts', 'CelebrationKeepsakes', 'BrideToBe'],
  'Jewelry Collection': ['FineJewelry', 'GoldPlatedJewelry', 'MinimalistJewelry', 'LayeringNecklaces', 'EverydayLuxury'],
  Electronics: ['TechGadgets', 'SmartHome', 'WirelessAudio', 'NoiseCancelling', 'EverydayTech'],
  'Other Products': ['LifestyleFinds', 'TrendingOnAmazon', 'SmartTools', 'EverydayEssentials', 'HomeGifts'],
};

// General brand & Google SEO tags
const CORE_BRAND_TAGS = ['PawMartFinder', 'AmazonVerified', 'CuratedDeals', 'GoogleSEO', 'TrendingNow'];

/**
 * Sanitize a string into a clean PascalCase hashtag
 */
export const toHashtag = (phrase: string): string => {
  return phrase
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Parses user/admin raw tag input string (comma, space, or newline separated)
 * e.g. "#CatToy, #AmazonFinds, PetSupplies" -> ["#CatToy", "#AmazonFinds", "#PetSupplies"]
 */
export const parseTagsInput = (input: string): string[] => {
  if (!input || !input.trim()) return [];
  // Split by commas, semicolons, or multiple spaces/newlines
  const rawParts = input.split(/[,;\n]+/);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    // If user typed space-separated hashtags like "#CatToy #AmazonDeal"
    const subParts = part.trim().split(/\s+/).filter(Boolean);
    for (const sub of subParts) {
      const clean = sub.trim().replace(/^#+/, '');
      if (clean.length > 0) {
        const formatted = `#${clean}`;
        const lower = formatted.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          result.push(formatted);
        }
      }
    }
  }

  return result;
};

/**
 * Generate Google SEO # Hashtags for a Product
 * Prioritizes admin-provided custom #tags from the Admin Add/Edit Product panel
 */
export const getProductSEOHashtags = (product: Product): SEOHashtagData => {
  const tagsSet = new Set<string>();

  // If Admin provided custom SEO #tags, prioritize them first!
  if (product.seoTags && product.seoTags.length > 0) {
    product.seoTags.forEach((tag) => {
      const clean = tag.trim().replace(/^#+/, '');
      if (clean) tagsSet.add(clean);
    });
  }

  // Always ensure Core Brand Tag exists
  tagsSet.add('PawMartFinder');

  // If fewer than 6 tags, complement with smart category and title tags
  if (tagsSet.size < 6) {
    const titleTag = toHashtag(product.title.slice(0, 30));
    if (titleTag && titleTag.length >= 4) {
      tagsSet.add(titleTag);
    }

    const catKeywords = CATEGORY_SEO_KEYWORDS[product.category] || ['CuratedShopping', 'AmazonPicks'];
    catKeywords.slice(0, 3).forEach((kw) => tagsSet.add(kw));
    tagsSet.add('AmazonFinds');
    tagsSet.add('VerifiedProduct');
  }

  if (product.featured) {
    tagsSet.add('TopPick2026');
  }

  const tags = Array.from(tagsSet).slice(0, 10);
  const formattedTags = tags.map((t) => (t.startsWith('#') ? t : `#${t}`));

  return {
    tags: formattedTags,
    searchTerms: tags.map((t) => t.replace(/^#/, '')),
    rawHashtagsString: formattedTags.join(' '),
  };
};

/**
 * Generate Google SEO # Hashtags for a Blog Post
 * Prioritizes admin-provided custom #tags from the Admin Add/Edit Blog panel
 */
export const getBlogSEOHashtags = (blog: BlogPost): SEOHashtagData => {
  const tagsSet = new Set<string>();

  // If Admin provided custom SEO #tags, prioritize them first!
  if (blog.seoTags && blog.seoTags.length > 0) {
    blog.seoTags.forEach((tag) => {
      const clean = tag.trim().replace(/^#+/, '');
      if (clean) tagsSet.add(clean);
    });
  }

  tagsSet.add('PawMartFinder');

  if (tagsSet.size < 6) {
    const titleTag = toHashtag(blog.title.slice(0, 30));
    if (titleTag && titleTag.length >= 4) {
      tagsSet.add(titleTag);
    }

    const catKeywords = CATEGORY_SEO_KEYWORDS[blog.category] || ['PetGuide', 'CareTips'];
    catKeywords.slice(0, 3).forEach((kw) => tagsSet.add(kw));
    tagsSet.add('CuratedGuide');
    tagsSet.add('PetAdvice');
    tagsSet.add('AmazonVerified');
    tagsSet.add('GoogleSEO');
  }

  const tags = Array.from(tagsSet).slice(0, 10);
  const formattedTags = tags.map((t) => (t.startsWith('#') ? t : `#${t}`));

  return {
    tags: formattedTags,
    searchTerms: tags.map((t) => t.replace(/^#/, '')),
    rawHashtagsString: formattedTags.join(' '),
  };
};
