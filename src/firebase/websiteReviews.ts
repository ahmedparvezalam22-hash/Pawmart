import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { WebsiteReview } from '../types';

export const WEBSITE_REVIEWS_COLLECTION = 'website_reviews';

export const INITIAL_WEBSITE_REVIEWS: WebsiteReview[] = [
  {
    id: 'web-rev-1',
    author: 'Emily Richardson',
    authorEmail: 'emily.r@gmail.com',
    rating: 5,
    title: 'Found the best pet products in minutes!',
    comment: 'PawMartFinder made shopping on Amazon so much easier! The handpicked items are top-tier quality and the direct Amazon links with Prime delivery were super convenient.',
    location: 'Verified Buyer • New York',
    date: 'Oct 18, 2026',
    isCustomAdmin: true,
    verified: true,
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'web-rev-2',
    author: 'Marcus Vance',
    authorEmail: 'marcus.v@outlook.com',
    rating: 5,
    title: 'Zero clutter and 100% verified links',
    comment: 'I love that there is zero price markup and everything leads directly to the official Amazon listing. The design of this website is clean, modern, and very trustworthy.',
    location: 'Verified Shopper • Austin, TX',
    date: 'Oct 20, 2026',
    isCustomAdmin: true,
    verified: true,
    createdAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'web-rev-3',
    author: 'Sophia Chen',
    authorEmail: 'sophia.c@yahoo.com',
    rating: 5,
    title: 'Love the curated collections & guides',
    comment: 'The blog guides and category suggestions helped me pick the right orthopedic bed for my senior dog. Fantastic curated platform!',
    location: 'Verified Buyer • Seattle, WA',
    date: 'Oct 22, 2026',
    isCustomAdmin: true,
    verified: true,
    createdAt: '2026-10-22T09:15:00Z',
  },
];

/**
 * Real-time subscription to website reviews
 */
export const subscribeToWebsiteReviews = (
  callback: (reviews: WebsiteReview[]) => void
): (() => void) => {
  try {
    const q = query(collection(db, WEBSITE_REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: WebsiteReview[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as WebsiteReview);
          });
          callback(list);
        } else {
          // Fallback to initial reviews if collection has not been populated yet
          callback(INITIAL_WEBSITE_REVIEWS);
        }
      },
      (error) => {
        console.warn('Falling back to default website reviews due to Firestore read error:', error);
        callback(INITIAL_WEBSITE_REVIEWS);
      }
    );
  } catch (err) {
    console.error('Error attaching website reviews listener:', err);
    callback(INITIAL_WEBSITE_REVIEWS);
    return () => {};
  }
};

/**
 * One-off fetch of website reviews
 */
export const getWebsiteReviews = async (): Promise<WebsiteReview[]> => {
  try {
    const q = query(collection(db, WEBSITE_REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: WebsiteReview[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WebsiteReview);
      });
      return list;
    }
    return INITIAL_WEBSITE_REVIEWS;
  } catch (err) {
    console.error('Error fetching website reviews:', err);
    return INITIAL_WEBSITE_REVIEWS;
  }
};

/**
 * Add a new website review (either from public customer or admin custom)
 */
export const createWebsiteReview = async (
  reviewData: Omit<WebsiteReview, 'id' | 'createdAt'>
): Promise<string> => {
  const newId = `rev_${Date.now()}`;
  const now = new Date().toISOString();

  const fullReview: WebsiteReview = {
    ...reviewData,
    id: newId,
    date: reviewData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    verified: reviewData.verified !== undefined ? reviewData.verified : true,
    createdAt: now,
  };

  await setDoc(doc(db, WEBSITE_REVIEWS_COLLECTION, newId), fullReview);
  return newId;
};

/**
 * Delete a website review (Admin)
 */
export const deleteWebsiteReview = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, WEBSITE_REVIEWS_COLLECTION, id));
};
