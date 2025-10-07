
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/app/products/_components/product-card";
import type { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const FALLBACK_IMAGE_URL = 'https://picsum.photos/200/200';

export default function GiftFinderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, hasGiftItem } = useCart();
  const router = useRouter();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (hasGiftItem()) {
      setLoading(false);
      return;
    }

    const existingGift = sessionStorage.getItem('wonGift');
    if (existingGift) {
        try {
            const gift: Product = JSON.parse(existingGift);
            setSelectedProduct(gift);
            setLoading(false);
            return; 
        } catch (e) {
            console.error("Failed to parse won gift from session storage", e);
            sessionStorage.removeItem('wonGift');
        }
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/gift-finder");
        if (!response.ok) {
          throw new Error("Failed to fetch products for the spinner.");
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not load products for the gift spinner. Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [hasGiftItem]);

  const handleSpin = () => {
    if (products.length === 0) return;

    setSpinning(true);
    setSelectedProduct(null);

    const spinDuration = 3000;
    const intervalDuration = 150;

    const spinInterval = setInterval(() => {
      setCurrentProductIndex(prevIndex => (prevIndex + 1) % products.length);
    }, intervalDuration);

    setTimeout(() => {
      clearInterval(spinInterval);
      const randomIndex = Math.floor(Math.random() * products.length);
      const winner = products[randomIndex];
      setSelectedProduct(winner);
      setSpinning(false);

      try {
        sessionStorage.setItem('wonGift', JSON.stringify(winner));
      } catch (e) {
          console.error("Failed to save won gift to session storage", e);
      }

       toast({ title: "Congratulations!", description: `You won: ${winner.name}` });
    }, spinDuration);
  };

  const handleClaimGift = () => {
    if (!selectedProduct) return;
    
    addToCart(selectedProduct, 1, true);
    sessionStorage.removeItem('wonGift');

    toast({ 
        title: "Gift Claimed!", 
        description: "The gift has been added to your cart. You must add at least one other item to checkout.",
        action: <Button asChild><Link href="/cart">Go to Cart</Link></Button>
    });
    
    router.push("/cart");
  };
  
  const currentProduct = products[currentProductIndex];

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading your lucky spin...</p>
      </div>
    );
  }

  if (hasGiftItem()) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold tracking-tight">
              You Already Have a Gift!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              You have a gift in your cart. Please complete your order before spinning for a new one.
            </p>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/cart">View Your Cart</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

 if (selectedProduct) {
    return (
      <div className="relative container mx-auto py-12">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} tweenDuration={10000} />
        <Card className="max-w-2xl mx-auto overflow-hidden shadow-2xl animate-fade-in-up">
          <CardHeader className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-8">
            <CardTitle className="text-center text-4xl font-extrabold tracking-tighter text-white drop-shadow-lg">
              You Won a Gift!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 p-8 bg-background">
            <p className="text-lg text-muted-foreground">
              Congratulations! Here is the gift you won. Claim it now by adding it to your cart.
            </p>
            <div className="space-y-4">
              <div className="max-w-xs mx-auto transform hover:scale-105 transition-transform duration-300">
                <ProductCard product={selectedProduct} isGift={true} />
              </div>
              <Button onClick={handleClaimGift} size="lg" className="w-full md:w-auto text-lg py-6 mt-4 animate-pulse">
                Claim Your FREE Gift
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-focus text-primary-foreground rounded-t-lg py-8">
          <CardTitle className="text-center text-4xl font-extrabold tracking-tight">
            Spin to Win a Free Gift!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-8 py-10">
          <p className="text-lg text-muted-foreground">
            Feeling lucky? Spin the wheel to win one of our exclusive products. Add it to your cart with any other purchase to claim!
          </p>
          
          <div className="relative w-64 h-64 mx-auto border-8 border-primary rounded-full flex items-center justify-center overflow-hidden bg-white shadow-inner">
             {spinning && <div className="animate-spin-slow absolute inset-0 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>}
             <div className='transition-opacity duration-150 ease-in-out'>
                {currentProduct && (
                    <Image 
                        src={currentProduct.imageUrl || FALLBACK_IMAGE_URL} 
                        alt={currentProduct.name} 
                        width={200} 
                        height={200} 
                        className='object-contain rounded-full aspect-square p-2' 
                    />
                )}
             </div>
          </div>

          <Button onClick={handleSpin} disabled={spinning || products.length === 0} size="lg" className="w-full md:w-auto transform hover:scale-105 transition-transform duration-200">
            {spinning ? "Spinning..." : (products.length > 0 ? "Spin the Wheel!" : "Spinner Not Available")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
