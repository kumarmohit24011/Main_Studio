'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="overflow-hidden group border bg-card hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={`/products/${product.id}`} className="block flex flex-col h-full">
        <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={product.imageUrl || "https://picsum.photos/400/400"}
              alt={product.name}
              data-ai-hint="jewelry product"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={handleToggleWishlist} 
                    className="rounded-full h-9 w-9 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
                    aria-label="Toggle Wishlist"
                >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                </Button>
            </div>
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <AddToCartButton product={product} size="sm" variant="secondary" className="w-full" />
            </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-semibold text-base text-foreground truncate flex-grow">{product.name}</h3>
            <p className="text-primary font-bold text-lg mt-2">₹{product.price.toFixed(2)}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
