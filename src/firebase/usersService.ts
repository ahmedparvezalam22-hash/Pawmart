import { collection, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

// Subscribe to all registered users (for admin panel)
export const subscribeToAllUsers = (callback: (users: UserProfile[]) => void) => {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        users.push({
          uid: d.id,
          name: data.name || 'Member',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt || new Date().toISOString(),
        } as UserProfile);
      });
      // Sort newest sign-ups first
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(users);
    },
    (err) => {
      console.warn('Users subscription error:', err);
      callback([]);
    }
  );
};

// Fetch all registered users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      const data = d.data();
      users.push({
        uid: d.id,
        name: data.name || 'Member',
        email: data.email || '',
        role: data.role || 'user',
        createdAt: data.createdAt || new Date().toISOString(),
      } as UserProfile);
    });
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return users;
  } catch (err) {
    console.error('Error fetching registered users:', err);
    return [];
  }
};
