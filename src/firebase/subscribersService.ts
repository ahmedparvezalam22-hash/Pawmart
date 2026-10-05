import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { Subscriber } from '../types';

const SUBSCRIBERS_COLLECTION = 'subscribers';

// Helper to create safe doc ID from email
export const generateSubscriberId = (email: string): string => {
  return 'sub_' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
};

// Add or update a subscriber
export const addSubscriber = async (
  email: string,
  source: string = 'home_newsletter'
): Promise<{ success: boolean; subscriber: Subscriber }> => {
  const cleanEmail = email.trim().toLowerCase();
  const id = generateSubscriberId(cleanEmail);
  const now = new Date().toISOString();

  const subscriberData: Subscriber = {
    id,
    email: cleanEmail,
    source,
    createdAt: now,
    status: 'active',
  };

  // 1. Save in dedicated 'subscribers' collection
  const subDocRef = doc(db, SUBSCRIBERS_COLLECTION, id);
  await setDoc(subDocRef, subscriberData, { merge: true });

  // 2. Also ensure visible in users collection with role: 'user'
  try {
    const userDocRef = doc(db, 'users', id);
    await setDoc(
      userDocRef,
      {
        uid: id,
        email: cleanEmail,
        name: 'Newsletter Subscriber',
        role: 'user',
        createdAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not mirror subscriber to users:', err);
  }

  return { success: true, subscriber: subscriberData };
};

// Real-time listener for admin panel
export const subscribeToAllSubscribers = (callback: (subscribers: Subscriber[]) => void) => {
  const colRef = collection(db, SUBSCRIBERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Subscriber[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          email: data.email || '',
          source: data.source || 'newsletter',
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'active',
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Subscribers subscription fallback:', err);
      callback([]);
    }
  );
};

// Fetch all subscribers
export const getAllSubscribers = async (): Promise<Subscriber[]> => {
  try {
    const snap = await getDocs(collection(db, SUBSCRIBERS_COLLECTION));
    const items: Subscriber[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        email: data.email || '',
        source: data.source || 'newsletter',
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'active',
      });
    });
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    return [];
  }
};

// Delete subscriber
export const deleteSubscriber = async (id: string): Promise<void> => {
  const docRef = doc(db, SUBSCRIBERS_COLLECTION, id);
  await deleteDoc(docRef);
};
