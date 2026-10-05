import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  updatePassword as updateAuthPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';
import { seedProductsIfEmpty } from './products';

export const ADMIN_EMAIL = 'ahmedparvezalam22@gmail.com';
export const CONFIGURED_ADMIN_PASSWORD = '123Par&#@';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Session key in localStorage
const ADMIN_SESSION_STORAGE_KEY = 'pawmart_admin_session';
const ADMIN_PASSWORD_STORAGE_KEY = 'pawmart_admin_password';

// Get current active admin password (stored in Firestore or localStorage, fallback to default)
export const getActiveAdminPassword = async (): Promise<string> => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'admin_auth'));
    if (docSnap.exists() && docSnap.data()?.password) {
      return docSnap.data().password as string;
    }
  } catch (err) {
    // Firestore error fallback
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);
    if (local) return local;
  }

  return CONFIGURED_ADMIN_PASSWORD;
};

// Set and persist new active admin password
export const setActiveAdminPassword = async (newPassword: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPassword);
  }

  try {
    await setDoc(
      doc(db, 'settings', 'admin_auth'),
      {
        email: ADMIN_EMAIL,
        password: newPassword,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist admin_auth to Firestore settings:', err);
  }
};

// Retrieve stored admin session if present
export const getStoredAdminSession = (): { user: AuthUser; profile: UserProfile } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && data.role === 'admin') {
      const user: AuthUser = {
        uid: data.uid || 'admin_parvez',
        email: ADMIN_EMAIL,
        displayName: data.name || 'Parvez',
      };
      const profile: UserProfile = {
        uid: user.uid,
        name: data.name || 'Parvez',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: data.createdAt || new Date().toISOString(),
      };
      return { user, profile };
    }
  } catch (e) {
    console.warn('Failed parsing stored admin session:', e);
  }
  return null;
};

export const saveAdminSession = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify({
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        createdAt: profile.createdAt,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Failed saving admin session:', e);
  }
};

export const clearAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
};

// Fetch user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error getting user profile:', err);
    return null;
  }
};

// Create user profile in Firestore
export const createUserProfileDocument = async (
  user: AuthUser | User,
  name: string
): Promise<UserProfile> => {
  const isAutoAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const profile: UserProfile = {
    uid: user.uid,
    name: name || user.displayName || (isAutoAdmin ? 'Parvez' : 'Member'),
    email: user.email || '',
    role: isAutoAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
  } catch (err) {
    console.warn('Error setting user profile document in Firestore:', err);
  }
  return profile;
};

// Register visitor
export const registerUser = async (name: string, email: string, pass: string): Promise<UserProfile> => {
  const cleanEmail = email.trim();
  const isAutoAdmin = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    await updateAuthProfile(cred.user, { displayName: name.trim() });
    const profile = await createUserProfileDocument(cred.user, name.trim());
    return profile;
  } catch (fbErr: any) {
    // Fallback if email/password auth provider disabled in GCP
    const syntheticUid = isAutoAdmin
      ? 'admin_parvez'
      : 'user_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 16);
    
    const profile: UserProfile = {
      uid: syntheticUid,
      name: name.trim() || (isAutoAdmin ? 'Parvez' : 'Member'),
      email: cleanEmail,
      role: isAutoAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    if (isAutoAdmin) {
      await setActiveAdminPassword(pass);
      saveAdminSession(profile);
    }

    try {
      await setDoc(doc(db, 'users', syntheticUid), profile, { merge: true });
    } catch (_) {}

    return profile;
  }
};

// Login visitor or admin
export const loginUser = async (
  email: string,
  pass: string
): Promise<{ user: AuthUser; profile: UserProfile }> => {
  const cleanEmail = email.trim();
  const isAdminTarget = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (isAdminTarget) {
    // 1. First check if password matches configured admin password or saved password
    const currentActivePassword = await getActiveAdminPassword();
    const isPasswordMatch =
      pass === currentActivePassword ||
      pass === CONFIGURED_ADMIN_PASSWORD ||
      pass.trim() === CONFIGURED_ADMIN_PASSWORD;

    // 2. Try Firebase Auth (if enabled on GCP)
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        profile = await createUserProfileDocument(cred.user, 'Parvez');
      }
      if (profile.role !== 'admin') {
        profile.role = 'admin';
        try {
          await updateDoc(doc(db, 'users', cred.user.uid), { role: 'admin' });
        } catch (_) {}
      }
      saveAdminSession(profile);
      return { user: cred.user, profile };
    } catch (fbErr: any) {
      console.log('Firebase auth attempt code:', fbErr.code || fbErr.message);

      // If password matches the Administrator password (123Par&#@), log in instantly!
      if (isPasswordMatch) {
        const profile: UserProfile = {
          uid: 'admin_parvez',
          name: 'Parvez',
          email: ADMIN_EMAIL,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', 'admin_parvez'), profile, { merge: true });
        } catch (e) {
          console.warn('Could not write admin doc to Firestore:', e);
        }

        saveAdminSession(profile);
        return {
          user: {
            uid: 'admin_parvez',
            email: ADMIN_EMAIL,
            displayName: 'Parvez',
          },
          profile,
        };
      }

      // If password does not match
      throw new Error(
        'Incorrect administrator credentials. Please check your email and password.'
      );
    }
  }

  // Regular user login
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    let profile = await getUserProfile(cred.user.uid);
    if (!profile) {
      profile = await createUserProfileDocument(cred.user, cred.user.displayName || 'Member');
    }
    return { user: cred.user, profile };
  } catch (fbErr: any) {
    if (
      fbErr.code === 'auth/operation-not-allowed' ||
      fbErr.code === 'auth/admin-restricted-operation'
    ) {
      // Graceful fallback for demo visitors
      const syntheticUid =
        'user_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 16);
      const user: AuthUser = {
        uid: syntheticUid,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
      };
      const profile: UserProfile = {
        uid: syntheticUid,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', syntheticUid), profile, { merge: true });
      } catch (_) {}
      return { user, profile };
    }
    throw fbErr;
  }
};

// Direct 1-Click Administrator Sign-In with configured credentials
export const directAdminSignIn = async (): Promise<{ user: AuthUser; profile: UserProfile }> => {
  const profile: UserProfile = {
    uid: 'admin_parvez',
    name: 'Parvez',
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', 'admin_parvez'), profile, { merge: true });
  } catch (e) {
    console.warn('Could not save admin document in Firestore:', e);
  }

  // Ensure active password document exists in settings
  await setActiveAdminPassword(CONFIGURED_ADMIN_PASSWORD);
  saveAdminSession(profile);

  // Seed initial products if empty
  await seedProductsIfEmpty();

  // Also attempt Firebase Auth in background, but never throw
  try {
    await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, CONFIGURED_ADMIN_PASSWORD);
  } catch (_) {
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, CONFIGURED_ADMIN_PASSWORD);
    } catch (_) {}
  }

  return {
    user: {
      uid: 'admin_parvez',
      email: ADMIN_EMAIL,
      displayName: 'Parvez',
    },
    profile,
  };
};

// Setup or Register Administrator Account
export const setupOrRegisterAdmin = async (
  password: string,
  email: string = ADMIN_EMAIL,
  name: string = 'Parvez'
): Promise<{ user: AuthUser; profile: UserProfile }> => {
  const cleanEmail = email.trim().toLowerCase();

  // Save the new password
  await setActiveAdminPassword(password);

  const profile: UserProfile = {
    uid: 'admin_parvez',
    name,
    email: cleanEmail,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', 'admin_parvez'), profile, { merge: true });
  } catch (e) {
    console.warn('Could not save admin document in Firestore:', e);
  }

  saveAdminSession(profile);
  await seedProductsIfEmpty();

  // Try Firebase Auth in background
  try {
    await createUserWithEmailAndPassword(auth, cleanEmail, password);
  } catch (_) {
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (_) {}
  }

  return {
    user: {
      uid: 'admin_parvez',
      email: cleanEmail,
      displayName: name,
    },
    profile,
  };
};

// Logout
export const logoutUser = async (): Promise<void> => {
  clearAdminSession();
  try {
    await firebaseSignOut(auth);
  } catch (_) {}
};

// Forgot Password
export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    if (
      err.code === 'auth/operation-not-allowed' ||
      err.code === 'auth/admin-restricted-operation'
    ) {
      console.log('Password reset requested for:', email);
      return;
    }
    throw err;
  }
};

// Update Profile Name
export const updateUserDisplayName = async (
  user: AuthUser | User,
  newName: string
): Promise<void> => {
  try {
    if ('updateProfile' in user) {
      await updateAuthProfile(user as User, { displayName: newName });
    }
  } catch (_) {}

  try {
    await updateDoc(doc(db, 'users', user.uid), { name: newName });
  } catch (_) {}
};

// Change Password
export const updateUserPassword = async (
  user: AuthUser | User,
  newPassword: string
): Promise<void> => {
  if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    await setActiveAdminPassword(newPassword);
  }

  try {
    if ('updatePassword' in user) {
      await updateAuthPassword(user as User, newPassword);
    }
  } catch (_) {}
};

export const onAuthStateChanged = firebaseOnAuthStateChanged;
