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
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Product, ProductReview, ProductReviewReply } from '../types';
import { INITIAL_PRODUCTS } from '../services/sampleData';

const PRODUCTS_COLLECTION = 'products';

// Helper to sanitize slug
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Real-time listener for public published products
export const subscribeToPublishedProducts = (callback: (products: Product[]) => void) => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('published', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, gracefully provide the complete curated sample catalog
        callback(INITIAL_PRODUCTS.map(p => ({
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })));
        return;
      }

      const items: Product[] = [];
      snapshot.forEach((d) => {
        const itemData = d.data();
        items.push({
          id: d.id,
          ...itemData,
          viewsCount: itemData.viewsCount || '1.6k',
        } as Product);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Firestore subscription fallback triggered:', err);
      // Fallback: If snapshot error occurs, return curated catalog
      callback(INITIAL_PRODUCTS.map(p => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }
  );
};

// Real-time listener for admin (all products, published & unpublished)
export const subscribeToAllProducts = (callback: (products: Product[]) => void) => {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_PRODUCTS.map(p => ({
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })));
        return;
      }

      const items: Product[] = [];
      snapshot.forEach((d) => {
        const itemData = d.data();
        items.push({
          id: d.id,
          ...itemData,
          viewsCount: itemData.viewsCount || '1.6k',
        } as Product);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Admin products subscription fallback:', err);
      callback(INITIAL_PRODUCTS.map(p => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }
  );
};

// Get single product by id or slug
export const getProductByIdOrSlug = async (identifier: string): Promise<Product | null> => {
  try {
    // Try by document ID first
    const docRef = doc(db, PRODUCTS_COLLECTION, identifier);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const itemData = snap.data();
      return { id: snap.id, ...itemData, viewsCount: itemData.viewsCount || '1.6k' } as Product;
    }

    // Try query by slug
    const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', identifier));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      const itemData = first.data();
      return { id: first.id, ...itemData, viewsCount: itemData.viewsCount || '1.6k' } as Product;
    }

    // Check fallback sample data
    const sample = INITIAL_PRODUCTS.find(p => p.id === identifier || p.slug === identifier);
    if (sample) {
      return {
        ...sample,
        viewsCount: sample.viewsCount || '1.6k',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.error('Error fetching product:', err);
    const sample = INITIAL_PRODUCTS.find(p => p.id === identifier || p.slug === identifier);
    return sample ? { ...sample, viewsCount: sample.viewsCount || '1.6k', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : null;
  }
};

// Create product (Admin)
export const createProduct = async (
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }
): Promise<string> => {
  const now = new Date().toISOString();
  const slug = data.slug || generateSlug(data.title);
  const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
  
  const product: Product = {
    id: newDocRef.id,
    title: data.title.trim(),
    slug,
    category: data.category,
    shortDescription: data.shortDescription.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    galleryUrls: data.galleryUrls || [data.imageUrl.trim()],
    viewsCount: data.viewsCount ? data.viewsCount.trim() : '1.6k',
    reviews: data.reviews && data.reviews.length > 0 ? data.reviews : [],
    amazonAffiliateLink: data.amazonAffiliateLink.trim(),
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, product);
  return newDocRef.id;
};

// Update product (Admin)
export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (data.title && !data.slug) {
    updateData.slug = generateSlug(data.title);
  }
  await updateDoc(docRef, updateData);
};

// Delete product (Admin)
export const deleteProduct = async (id: string): Promise<void> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Toggle published
export const togglePublishStatus = async (id: string, currentStatus: boolean): Promise<void> => {
  await updateProduct(id, { published: !currentStatus });
};

// Toggle featured
export const toggleFeaturedStatus = async (id: string, currentStatus: boolean): Promise<void> => {
  await updateProduct(id, { featured: !currentStatus });
};

// Add a review to a product (Customer or Admin)
export const addProductReview = async (
  productId: string,
  review: ProductReview
): Promise<ProductReview[]> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(docRef);

  let existingProduct: Product | null = null;
  if (snap.exists()) {
    existingProduct = { id: snap.id, ...snap.data() } as Product;
  } else {
    // If not in Firestore yet, get from initial sample data
    const sample = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (sample) {
      existingProduct = {
        ...sample,
        id: productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, existingProduct);
    }
  }

  const newReview: ProductReview = {
    id: review.id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: review.author.trim() || 'Verified Customer',
    authorEmail: review.authorEmail?.trim() || '',
    rating: review.rating || 5,
    title: review.title?.trim() || '',
    comment: review.comment.trim(),
    date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    verifiedPurchase: review.verifiedPurchase !== undefined ? review.verifiedPurchase : true,
    isAdminReview: Boolean(review.isAdminReview),
    adminReply: review.adminReply,
  };

  const updatedReviews: ProductReview[] = [
    newReview,
    ...(existingProduct?.reviews || []),
  ];

  await setDoc(
    docRef,
    {
      reviews: updatedReviews,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return updatedReviews;
};

// Add or update admin reply to a review
export const addReviewAdminReply = async (
  productId: string,
  reviewId: string,
  reply: ProductReviewReply
): Promise<ProductReview[]> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(docRef);

  let existingProduct: Product | null = null;
  if (snap.exists()) {
    existingProduct = { id: snap.id, ...snap.data() } as Product;
  } else {
    const sample = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (sample) {
      existingProduct = {
        ...sample,
        id: productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, existingProduct);
    }
  }

  const reviews = existingProduct?.reviews || [];
  const updatedReviews = reviews.map((r) => {
    if (r.id === reviewId) {
      return {
        ...r,
        adminReply: {
          author: reply.author || 'PawMart Admin',
          comment: reply.comment.trim(),
          date: reply.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      };
    }
    return r;
  });

  await setDoc(
    docRef,
    {
      reviews: updatedReviews,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return updatedReviews;
};

// Delete a review (Admin)
export const deleteProductReview = async (
  productId: string,
  reviewId: string
): Promise<ProductReview[]> => {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return [];

  const product = snap.data() as Product;
  const updatedReviews = (product.reviews || []).filter((r) => r.id !== reviewId);

  await setDoc(
    docRef,
    {
      reviews: updatedReviews,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return updatedReviews;
};

// Helper to determine if a media URL is a video
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mkv') ||
    url.startsWith('data:video/') ||
    url.includes('youtube.com/watch') ||
    url.includes('youtu.be/') ||
    url.includes('youtube.com/embed')
  );
};

// Helper to compress and resize an image File into a compact Data URL for Firestore
const compressImageFile = (file: File, maxDimension = 850, initialQuality = 0.78): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device gallery.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width || 800;
          let height = img.height || 800;

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Fill white background for transparent images before JPEG export
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let quality = initialQuality;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Ensure each image stays compact (~95KB max) so up to 6 gallery photos fit easily in Firestore (< 1MB doc limit)
          while (compressedDataUrl.length > 130000 && quality > 0.4) {
            quality -= 0.12;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(compressedDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => {
        // Fallback if browser cannot decode into canvas (e.g., certain SVG/HEIC)
        resolve(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};

// Upload photo or video from device gallery with instant client-side image compression
export const uploadProductMedia = async (file: File): Promise<string> => {
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|heic|heif|avif|bmp|svg)$/i.test(file.name);

  if (isImage) {
    return compressImageFile(file);
  }

  // For video files, try Firebase Storage with a short 4-second timeout, then fall back to Data URL
  try {
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `videos/${timestamp}_${safeFileName}`);
    const uploadPromise = uploadBytes(storageRef, file).then((snap) =>
      getDownloadURL(snap.ref)
    );
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), 4000)
    );
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
};

// Backwards-compatible alias for existing callers
export const uploadProductImage = uploadProductMedia;

// Seed initial products if collection is empty
export const seedProductsIfEmpty = async (): Promise<boolean> => {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial PawMart products into Firestore...');
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      INITIAL_PRODUCTS.forEach((prod) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(docRef, {
          ...prod,
          createdAt: now,
          updatedAt: now,
        });
      });

      await batch.commit();
      console.log('PawMart products successfully seeded!');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to seed products automatically:', err);
    return false;
  }
};

// Force-seed or update all 20 curated sample products in Firestore
export const forceSeedProducts = async (): Promise<boolean> => {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    INITIAL_PRODUCTS.forEach((prod) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      batch.set(docRef, {
        ...prod,
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to force seed products:', err);
    throw err;
  }
};

