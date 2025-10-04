
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { updateUserProfile } from '@/services/userService';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from './use-toast';
import { getProductById } from '@/services/productService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartLoading: boolean;
  isAddingToCart: boolean;
  getItem: (productId: string) => CartItem | undefined;
  validateCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_LOCALSTORAGE_KEY = 'redbow_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
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
  
  const updateCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (!isClient) return;

    if (user) {
      await updateUserProfile(user.uid, { cart: newCart });
    } else {
      localStorage.setItem(CART_LOCALSTORAGE_KEY, JSON.stringify(newCart));
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (cartLoading || isAddingToCart) {
      toast({ title: "Please wait", description: "Syncing your data, please try again shortly.", variant: "destructive" });
      return;
    }

    setIsAddingToCart(true);
    try {
        const newCart = [...cart];
        const existingItemIndex = newCart.findIndex(item => item.productId === product.id);

        if (existingItemIndex > -1) {
            newCart[existingItemIndex].quantity += quantity;
        } else {
          newCart.push({ 
              productId: product.id, 
              quantity,
              name: product.name,
              price: product.salePrice || product.price,
              imageUrl: product.imageUrl,
              stock: product.stock, // Stock will be validated at checkout
              sku: product.sku
          });
        }
        await updateCart(newCart);
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`
        });
    } finally {
        setIsAddingToCart(false);
    }
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
  
  const validateCart = async (): Promise<boolean> => {
    if (cart.length === 0) return true;

    let cartHasIssues = false;
    let cartNeedsDbUpdate = false;
    let newCart = [...cart];

    const validationPromises = newCart.map(async (item, index) => {
      try {
        const product = await getProductById(item.productId);
        const stock = product?.stock ?? 0;

        if (!product || stock <= 0) {
          toast({
            variant: "destructive",
            title: "Item Removed From Cart",
            description: `${item.name} is out of stock.`,
          });
          newCart[index].quantity = 0; 
          cartHasIssues = true;
          cartNeedsDbUpdate = true;
        } else if (stock < item.quantity) {
          toast({
            variant: "default",
            title: "Cart Quantity Adjusted",
            description: `Only ${stock} of ${item.name} are available.`,
          });
          newCart[index].quantity = stock;
          newCart[index].stock = stock;
          cartHasIssues = true;
          cartNeedsDbUpdate = true;
        } else if (item.stock !== stock) {
          newCart[index].stock = stock;
          cartNeedsDbUpdate = true;
        }
      } catch (error) {
        console.error(`Failed to validate product ${item.productId}:`, error);
        toast({
            variant: "destructive",
            title: "Item Removed From Cart",
            description: `We couldn\'t verify ${item.name}, so it has been removed.`,
        });
        newCart[index].quantity = 0;
        cartHasIssues = true;
        cartNeedsDbUpdate = true;
      }
    });

    await Promise.all(validationPromises);
    
    if (cartNeedsDbUpdate) {
      const finalCart = newCart.filter(item => item.quantity > 0);
      await updateCart(finalCart);
    }
    
    return !cartHasIssues;
  };

  const clearCart = () => {
    if (cartLoading) return;
    updateCart([]);
  };

  const getItem = (productId: string): CartItem | undefined => {
    return cart.find(item => item.productId === productId);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartLoading,
    isAddingToCart,
    getItem,
    validateCart,
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
