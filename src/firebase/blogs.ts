import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { BlogPost } from '../types';

const BLOGS_COLLECTION = 'blogs';

// Clean URL slug generator
export const generateBlogSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Initial curated blogs if database is clean
export const INITIAL_BLOGS: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'The Ultimate Guide to Calming Anxious Cats: Cozy Essentials & Tips',
    slug: 'guide-to-calming-anxious-cats',
    category: 'Cats',
    excerpt: 'Discover how calming beds, interactive scratching posts, and gentle stimulation can help shy or nervous felines thrive in any home.',
    content: `Cats are creatures of habit and sensitive to shifts in their environment. Whether it's thunder, moving to a new apartment, or unfamiliar guests, anxious behaviors like excessive grooming, hiding, or scratching furniture can quickly emerge.

### 1. Create a Dedicated Safe Haven
Give your feline companion an elevated, enclosed retreat. High-sided plush donut beds and cat trees placed in quiet corners provide a secure vantage point where cats feel protected from floor-level disturbances.

### 2. Routine Daily Play Sessions
Expending excess energy reduces cortisol levels in cats. Ten to fifteen minutes with an interactive laser toy or feather wand before evening mealtime triggers their natural predatory cycle—hunt, catch, eat, and sleep.

### 3. Scent & Pheromone Comfort
Natural calming diffusers and familiar blankets help reduce stress during travel or vet visits. Pair comforting scents with positive reinforcement and gentle verbal reassurance.

### Recommended Item Featured in This Guide
For immediate stress reduction, pair gentle physical play with an automated or interactive toy that rewards their natural curiosity. Check out our verified Amazon recommendation linked below.`,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    viewsCount: '1.5k',
    amazonProductLink: 'https://www.amazon.com/s?k=interactive+cat+toy&tag=pawmart0e-20',
    amazonButtonText: 'Check Recommended Cat Comfort Gear on Amazon',
    author: 'Parvez',
    readTime: '4 min read',
    featured: true,
    published: true,
  },
  {
    title: 'Essential Dog Gear Every Modern Puppy Parent Needs',
    slug: 'essential-dog-gear-puppy-parents',
    category: 'Dogs',
    excerpt: 'From positive reinforcement essentials to no-pull harnesses and indestructible chew toys, here is what actually works for happy, well-mannered pups.',
    content: `Welcoming a new puppy into your family is thrilling, but the avalanche of products on the market can easily overwhelm any pet owner. We tested the most popular puppy accessories to identify the durable staples worth investing in.

### 1. Ergonomic No-Pull Harness
Standard collars can put harmful pressure on a puppy's delicate trachea when they excitedly pull forward. A padded front-clip harness gently redirects their momentum toward you without strain, making leash training significantly smoother.

### 2. Natural Teething & Boredom Busters
Puppies explore the world with their mouths. Providing dense, non-toxic rubber chew toys and puzzle treat dispensers saves your baseboards and shoes while teaching healthy self-soothing habits.

### 3. Portable Hydration on the Go
During park visits and training walks, hydration is paramount. A leak-proof travel bottle with an integrated drinking cup ensures clean water is always on hand.

### Recommended Item Featured in This Guide
Build a solid foundation with trusted training tools that keep your puppy safe and engaged. See the top-rated gear directly on Amazon below.`,
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    viewsCount: '2.1k',
    amazonProductLink: 'https://www.amazon.com/s?k=dog+training+guide+positive+reinforcement&tag=pawmart0e-20',
    amazonButtonText: 'Explore Top Puppy Training Essentials on Amazon',
    author: 'Parvez',
    readTime: '5 min read',
    featured: true,
    published: true,
  },
  {
    title: 'How to Style Graphic Pet T-Shirts for Casual Weekend Fits',
    slug: 'how-to-style-graphic-pet-tshirts',
    category: 'T-Shirts',
    excerpt: 'Elevate your everyday wardrobe with minimalist animal artwork, breathable cotton, and modern layering combinations.',
    content: `Graphic t-shirts have evolved from casual loungewear into expressive statement pieces for modern street style. A thoughtful pet graphic tee lets you celebrate your love for your furry companion while staying effortlessly sharp.

### 1. Minimalist Linework Meets Relaxed Denim
Pair a clean, single-needle graphic tee with washed vintage denim and crisp white sneakers. The subtle graphic keeps the outfit tasteful and versatile for brunch, dog park visits, or weekend getaways.

### 2. Layering Under Open Overshirts
During transitional weather, wear your graphic tee unbuttoned under a heavy flannel or chore jacket. Let the chest graphic peek through for an intentional pop of visual interest.

### 3. Premium Cotton Matters
Always prioritize 100% ring-spun combed cotton. High-grade cotton resists shrinkage, holds rich screen prints through repeated washes, and maintains breathable softness across hot summer days.

### Recommended Item Featured in This Guide
Discover soft, durable everyday tees with custom pet illustrations. Tap the link below to view current sizes and colors on Amazon.`,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    viewsCount: '1.5k',
    amazonProductLink: 'https://www.amazon.com/s?k=minimalist+graphic+t+shirt&tag=pawmart0e-20',
    amazonButtonText: 'View Trending Graphic Tees on Amazon',
    author: 'Parvez',
    readTime: '3 min read',
    featured: false,
    published: true,
  },
  {
    title: 'Top 5 Books Every Animal Lover Should Read This Year',
    slug: 'top-books-for-animal-lovers',
    category: 'Books',
    excerpt: 'From heartwarming canine memoirs to fascinating behavioral science, these must-read titles will deepen your connection with the animal kingdom.',
    content: `Few things are more rewarding than curling up with a book that celebrates the unbreakable bond between humans and their animals. Whether you are seeking practical behavioral wisdom or uplifting true stories, our top picks offer wonderful perspectives.

### 1. Understanding Animal Psychology
Modern canine and feline behaviorists have transformed how we interpret body language, vocal cues, and emotional intelligence. Reading comprehensive guidebooks gives pet parents invaluable empathy into what pets truly feel.

### 2. Inspiring Rescue Tales
Memoirs detailing the resilience of shelter pets and the dedicated families who adopt them remind us of the transformative power of patience and unconditional care.

### 3. Practical At-Home Care Manuals
Having a reliable physical guide covering pet nutrition, first aid essentials, and age-related transitions offers peace of mind when questions arise outside of regular clinic hours.

### Recommended Item Featured in This Guide
Expand your pet library with curated reads and definitive guides available with fast Amazon Prime delivery below.`,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    viewsCount: '1.8k',
    amazonProductLink: 'https://www.amazon.com/s?k=pet+lovers+guide+stories&tag=pawmart0e-20',
    amazonButtonText: 'Browse Top Pet Books on Amazon',
    author: 'Parvez',
    readTime: '4 min read',
    featured: false,
    published: true,
  },
];

// Fallback seed function if collection is empty
export const seedInitialBlogsIfEmpty = async (): Promise<boolean> => {
  try {
    const snap = await getDocs(collection(db, BLOGS_COLLECTION));
    if (!snap.empty) {
      return false; // Already populated
    }

    const now = new Date().toISOString();
    for (let i = 0; i < INITIAL_BLOGS.length; i++) {
      const blog = INITIAL_BLOGS[i];
      const blogId = `blog_${i + 1}`;
      await setDoc(doc(db, BLOGS_COLLECTION, blogId), {
        ...blog,
        createdAt: now,
        updatedAt: now,
      });
    }
    return true;
  } catch (err) {
    console.warn('Could not seed initial blogs:', err);
    return false;
  }
};

// Real-time listener for published blogs (Visitor website)
export const subscribeToPublishedBlogs = (callback: (blogs: BlogPost[]) => void) => {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where('published', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If query returned no published blogs, fallback to initial blogs if not yet seeded
        callback(
          INITIAL_BLOGS.filter(b => b.published).map((b, idx) => ({
            id: `blog_${idx + 1}`,
            ...b,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
        return;
      }

      const items: BlogPost[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as BlogPost);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Blogs subscription fallback triggered:', err);
      callback(
        INITIAL_BLOGS.map((b, idx) => ({
          id: `blog_${idx + 1}`,
          ...b,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );
    }
  );
};

// Real-time listener for ALL blogs (Admin panel)
export const subscribeToAllBlogs = (callback: (blogs: BlogPost[]) => void) => {
  return onSnapshot(
    collection(db, BLOGS_COLLECTION),
    (snapshot) => {
      const items: BlogPost[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as BlogPost);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Admin blogs subscription error:', err);
    }
  );
};

// Get single blog by ID
export const getBlogById = async (id: string): Promise<BlogPost | null> => {
  try {
    const snap = await getDoc(doc(db, BLOGS_COLLECTION, id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as BlogPost;
    }
  } catch (err) {
    console.error('Error fetching blog by ID:', err);
  }

  // Fallback to sample data
  const sample = INITIAL_BLOGS.find((b, idx) => `blog_${idx + 1}` === id);
  if (sample) {
    return {
      id,
      ...sample,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return null;
};

// Get single blog by Slug
export const getBlogBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const q = query(collection(db, BLOGS_COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docItem = snap.docs[0];
      return { id: docItem.id, ...docItem.data() } as BlogPost;
    }
  } catch (err) {
    console.error('Error fetching blog by slug:', err);
  }

  const sample = INITIAL_BLOGS.find((b) => b.slug === slug);
  if (sample) {
    const idx = INITIAL_BLOGS.indexOf(sample);
    return {
      id: `blog_${idx + 1}`,
      ...sample,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return null;
};

// Create a new blog post in Firestore
export const createBlogPost = async (
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const newId = `blog_${Date.now()}`;
  const now = new Date().toISOString();
  const slug = data.slug?.trim() ? generateBlogSlug(data.slug) : generateBlogSlug(data.title);

  const newPost: BlogPost = {
    ...data,
    id: newId,
    slug,
    title: data.title.trim(),
    viewsCount: data.viewsCount ? data.viewsCount.trim() : '1.5k',
    amazonProductLink: data.amazonProductLink.trim(),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, BLOGS_COLLECTION, newId), newPost);
  return newId;
};

// Update an existing blog post
export const updateBlogPost = async (
  id: string,
  data: Partial<BlogPost>
): Promise<void> => {
  const updatePayload: any = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (data.title && !data.slug) {
    updatePayload.slug = generateBlogSlug(data.title);
  }

  await updateDoc(doc(db, BLOGS_COLLECTION, id), updatePayload);
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, BLOGS_COLLECTION, id));
};
