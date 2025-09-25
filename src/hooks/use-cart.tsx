
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
      const firestoreCart = userProfile.cart || [];
      const localCart = getLocalCart();

      if (localCart.length > 0) {
        const mergedCart = [...firestoreCart];
        localCart.forEach((localItem: CartItem) => {
          const existingItemIndex = mergedCart.findIndex(item => item.productId === localItem.productId);
          if (existingItemIndex > -1) {
             mergedCart[existingItemIndex].quantity = localItem.quantity;
          } else {
            mergedCart.push(localItem);
          }
        });
        setCart(mergedCart);
        updateUserProfile(user.uid, { cart: mergedCart });
        localStorage.removeItem(CART_LOCALSTORAGE_KEY); 
      } else {
        setCart(firestoreCart);
      }
    } else {
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
    if (cartLoading) {
      toast({ title: "Please wait", description: "Syncing your data, please try again shortly.", variant: "destructive" });
      return;
    }

    if (product.stock < 1) {
        toast({ title: "Out of Stock", description: `Sorry, ${product.name} is currently out of stock.`, variant: "destructive" });
        return;
    }

    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
        const newQuantity = newCart[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
            toast({ title: "Stock Limit Exceeded", description: `You can only add up to ${product.stock} units of ${product.name}.`, variant: "destructive" });
            return;
        }
        newCart[existingItemIndex].quantity = newQuantity;
    } else {
        if (quantity > product.stock) {
            toast({ title: "Stock Limit Exceeded", description: `You can only add up to ${product.stock} units of ${product.name}.`, variant: "destructive" });
            return;
        }
      newCart.push({ 
          productId: product.id, 
          quantity,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          sku: product.sku
      });
    }
    updateCart(newCart);
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
    });
  };

  const removeFromCart = (productId: string) => {
    if (cartLoading) return;
    const newCart = cart.filter(item => item.productId !== productId);
    updateCart(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (cartLoading) return;

    const itemToUpdate = cart.find(item => item.productId === productId);
    if (!itemToUpdate) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (itemToUpdate.stock && quantity > itemToUpdate.stock) {
        toast({ title: "Stock Limit Exceeded", description: `You can only have up to ${itemToUpdate.stock} units.`, variant: "destructive" });
        return;
    }

    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    updateCart(newCart);
  };

  const clearCart = () => {
    if (cartLoading) return;
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
