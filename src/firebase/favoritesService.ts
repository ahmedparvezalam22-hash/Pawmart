import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

export interface FavoriteRecord {
  productId: string;
  savedAt: string;
}

export const addFavorite = async (userId: string, productId: string): Promise<void> => {
  const favDoc = doc(db, 'users', userId, 'favorites', productId);
  await setDoc(favDoc, {
    productId,
    savedAt: new Date().toISOString()
  });
};

export const removeFavorite = async (userId: string, productId: string): Promise<void> => {
  const favDoc = doc(db, 'users', userId, 'favorites', productId);
  await deleteDoc(favDoc);
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  try {
    const colRef = collection(db, 'users', userId, 'favorites');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.id);
  } catch (err) {
    console.warn('Error fetching favorites:', err);
    return [];
  }
};

export const subscribeToFavorites = (userId: string, callback: (productIds: string[]) => void) => {
  const colRef = collection(db, 'users', userId, 'favorites');
  return onSnapshot(
    colRef,
    (snap) => {
      const ids = snap.docs.map(d => d.id);
      callback(ids);
    },
    (err) => {
      console.warn('Favorites listener error:', err);
      callback([]);
    }
  );
};
