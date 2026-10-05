import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { addFavorite, removeFavorite, subscribeToFavorites } from '../firebase/favoritesService';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMessage: string;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>('Please log in to save products to your favorites.');

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const unsubscribe = subscribeToFavorites(user.uid, (ids) => {
      setFavoriteIds(ids);
    });

    return () => unsubscribe();
  }, [user]);

  const isFavorite = (productId: string) => {
    return favoriteIds.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      setAuthModalMessage('Please log in to save products to your favorites.');
      setShowAuthModal(true);
      return;
    }

    try {
      if (favoriteIds.includes(productId)) {
        await removeFavorite(user.uid, productId);
      } else {
        await addFavorite(user.uid, productId);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
        showAuthModal,
        setShowAuthModal,
        authModalMessage,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
