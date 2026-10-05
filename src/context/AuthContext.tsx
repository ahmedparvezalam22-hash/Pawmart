import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  getUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  resetUserPassword,
  updateUserDisplayName,
  updateUserPassword,
  onAuthStateChanged,
  ADMIN_EMAIL,
  createUserProfileDocument,
  setupOrRegisterAdmin,
  directAdminSignIn,
  getStoredAdminSession,
  AuthUser,
} from '../firebase/authService';
import { UserProfile } from '../types';

export type ContextUser = AuthUser | User;

interface AuthContextType {
  user: ContextUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  setupAdmin: (password: string, email?: string) => Promise<void>;
  directAdminLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ContextUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      // Check if stored admin session is present before resetting
      const stored = getStoredAdminSession();
      if (stored) {
        setUser(stored.user);
        setProfile(stored.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    try {
      let prof = await getUserProfile(firebaseUser.uid);
      if (!prof) {
        prof = await createUserProfileDocument(firebaseUser, firebaseUser.displayName || 'Member');
      }
      setUser(firebaseUser);
      setProfile(prof);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instantly check for saved local admin session to avoid loading flash
    const stored = getStoredAdminSession();
    if (stored) {
      setUser(stored.user);
      setProfile(stored.profile);
      setLoading(false);
    }

    // 2. Also listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        // If no firebase auth user, but local admin session exists, keep local admin
        const currentStored = getStoredAdminSession();
        if (currentStored) {
          setUser(currentStored.user);
          setProfile(currentStored.profile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    setUser(res.user);
    setProfile(res.profile);
  };

  const signup = async (name: string, email: string, pass: string) => {
    const prof = await registerUser(name, email, pass);
    setProfile(prof);
    setUser(auth.currentUser || {
      uid: prof.uid,
      email: prof.email,
      displayName: prof.name
    });
  };

  const setupAdmin = async (password: string, email: string = ADMIN_EMAIL) => {
    const res = await setupOrRegisterAdmin(password, email);
    setUser(res.user);
    setProfile(res.profile);
  };

  const directAdminLogin = async () => {
    const res = await directAdminSignIn();
    setUser(res.user);
    setProfile(res.profile);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await resetUserPassword(email);
  };

  const updateName = async (newName: string) => {
    if (!user) throw new Error('No authenticated user');
    await updateUserDisplayName(user, newName);
    if (profile) {
      setProfile({ ...profile, name: newName });
    }
  };

  const changePassword = async (newPass: string) => {
    if (!user) throw new Error('No authenticated user');
    await updateUserPassword(user, newPass);
  };

  const refreshProfile = async () => {
    if (user) {
      if ('getIdToken' in user) {
        await fetchProfile(user as User);
      } else {
        const prof = await getUserProfile(user.uid);
        if (prof) setProfile(prof);
      }
    }
  };

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    (user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        signup,
        setupAdmin,
        directAdminLogin,
        logout,
        resetPassword,
        updateName,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
