

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { updateUserProfile } from '@/services/userService';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_LOCALSTORAGE_KEY = 'redbow_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, authLoading } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocalWishlist = useCallback((): string[] => {
    if (!isClient) return [];
    try {
      const localWishlist = localStorage.getItem(WISHLIST_LOCALSTORAGE_KEY);
      return localWishlist ? JSON.parse(localWishlist) : [];
    } catch (error) {
      console.error("Failed to parse wishlist from localStorage", error);
      return [];
    }
  }, [isClient]);

  useEffect(() => {
    if (authLoading || !isClient) {
      setWishlistLoading(true);
      return;
    }
    
    if (user && userProfile) {
      // User is logged in, use Firestore wishlist
      const firestoreWishlist = userProfile.wishlist || [];
      const localWishlist = getLocalWishlist();

      if (localWishlist.length > 0) {
        // Merge local and firestore wishlists, avoiding duplicates
        const merged = Array.from(new Set([...firestoreWishlist, ...localWishlist]));
        setWishlist(merged);
        updateUserProfile(user.uid, { wishlist: merged });
        localStorage.removeItem(WISHLIST_LOCALSTORAGE_KEY);
      } else {
        setWishlist(firestoreWishlist);
      }
    } else {
      // User is logged out, use local storage
      setWishlist(getLocalWishlist());
    }
    setWishlistLoading(false);
  }, [user, userProfile, authLoading, getLocalWishlist, isClient]);

  const updateWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    if (!isClient) return;

    if (user) {
      updateUserProfile(user.uid, { wishlist: newWishlist });
    } else {
      localStorage.setItem(WISHLIST_LOCALSTORAGE_KEY, JSON.stringify(newWishlist));
    }
  };

  const addToWishlist = (product: Product) => {
    if (wishlist.includes(product.id)) return;
    const newWishlist = [...wishlist, product.id];
    updateWishlist(newWishlist);
    toast({ title: "Added to Wishlist", description: `${product.name} has been added to your wishlist.` });
  };

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter(id => id !== productId);
    updateWishlist(newWishlist);
    toast({ title: "Removed from Wishlist", description: `Item has been removed from your wishlist.` });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistLoading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
