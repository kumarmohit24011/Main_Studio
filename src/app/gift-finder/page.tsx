
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

export default function GiftFinderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  const handleSpin = () => {
    if (products.length === 0) return;

    setSpinning(true);
    setSelectedProduct(null);

    const spinDuration = 3000;
    const intervalDuration = 100;
    let activeIndex = 0;

    const spinInterval = setInterval(() => {
      activeIndex = (activeIndex + 1) % products.length;
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
    
    router.push("/products");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading your lucky spin...</p>
      </div>
    );
  }

  if (selectedProduct) {
     return (
        <div className="container mx-auto py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold tracking-tight">
                        You Already Won a Gift!
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground">
                        Congratulations! Here is the gift you won. Claim it now by adding it to your cart.
                    </p>
                    <div className="space-y-4">
                        <p className="text-lg font-semibold">Your Gift: {selectedProduct.name}</p>
                        <div className="max-w-xs mx-auto">
                            <ProductCard product={selectedProduct} />
                        </div>
                        <Button onClick={handleClaimGift} size="lg" className="w-full md:w-auto">
                            Claim Your Gift
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Spin to Win a Free Gift!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Feeling lucky? Spin the wheel to win one of our exclusive products. Add it to your cart with any other purchase to claim!
          </p>
          
          <div className="relative w-64 h-64 mx-auto border-4 border-primary rounded-full flex items-center justify-center overflow-hidden bg-muted">
             {spinning && <div className="animate-spin-slow absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>}
             <span className="text-xl font-semibold">?</span>
          </div>

          <Button onClick={handleSpin} disabled={spinning || products.length === 0} size="lg" className="w-full md:w-auto">
            {spinning ? "Spinning..." : (products.length > 0 ? "Spin the Wheel!" : "Spinner Not Available")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
