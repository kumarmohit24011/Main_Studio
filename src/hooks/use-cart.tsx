
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { updateUserProfile } from '@/services/userService';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_LOCALSTORAGE_KEY = 'redbow_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocalCart = useCallback((): CartItem[] => {
    if (!isClient) return [];
    try {
      const localCart = localStorage.getItem(CART_LOCALSTORAGE_KEY);
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  }, [isClient]);

  useEffect(() => {
    if (authLoading || !isClient) {
      setCartLoading(true);
      return;
    }

    if (user && userProfile) {
      // User is logged in, use Firestore cart from userProfile
      const firestoreCart = userProfile.cart || [];
      const localCart = getLocalCart();

      if (localCart.length > 0) {
        // Merge local cart with Firestore cart
        const mergedCart = [...firestoreCart];
        localCart.forEach((localItem: CartItem) => {
          const existingItemIndex = mergedCart.findIndex(item => item.productId === localItem.productId);
          if (existingItemIndex > -1) {
            // If item exists, update its quantity (or you can choose other logic, like summing)
             mergedCart[existingItemIndex].quantity = localItem.quantity;
          } else {
            mergedCart.push(localItem);
          }
        });
        setCart(mergedCart);
        updateUserProfile(user.uid, { cart: mergedCart });
        localStorage.removeItem(CART_LOCALSTORAGE_KEY); // Clear local cart after merging
      } else {
        setCart(firestoreCart);
      }
    } else {
      // User is logged out, use local storage
      setCart(getLocalCart());
    }
    setCartLoading(false);
  }, [user, userProfile, authLoading, getLocalCart, isClient]);
  
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (!isClient) return;

    if (user) {
      updateUserProfile(user.uid, { cart: newCart });
    } else {
      localStorage.setItem(CART_LOCALSTORAGE_KEY, JSON.stringify(newCart));
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart.push({ 
          productId: product.id, 
          quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
      });
    }
    updateCart(newCart);
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
    });
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.productId !== productId);
    updateCart(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    updateCart(newCart);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
