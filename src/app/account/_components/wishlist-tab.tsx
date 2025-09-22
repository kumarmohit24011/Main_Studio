
'use client';

import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { getProductsByIds } from "@/services/productService";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/app/products/_components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function WishlistTab() {
  const { wishlist: wishlistIds, wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length > 0) {
        setLoading(true);
        const fetchedProducts = await getProductsByIds(wishlistIds);
        setProducts(fetchedProducts);
        setLoading(false);
      } else {
        setProducts([]);
        setLoading(false);
      }
    };

    if (!wishlistLoading) {
        fetchWishlistProducts();
    }
  }, [wishlistIds, wishlistLoading]);

  const isLoading = loading || wishlistLoading;

  if (isLoading) {
    return (
       <Card>
            <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
                <CardDescription>The products you love, all in one place.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
                <CardDescription>The products you love, all in one place.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                    <Heart className="mx-auto h-16 w-16 mb-4" />
                    <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
                    <p className="mt-2">You haven't added any products to your wishlist yet.</p>
                    <Button asChild className="mt-6">
                        <Link href="/products">Explore Products</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Your Wishlist</CardTitle>
            <CardDescription>The products you love, all in one place. ({products.length} items)</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
