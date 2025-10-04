'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
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

  const showDiscount = !!product.salePrice;

  // Filter out special tags that have their own indicators
  const displayTags = product.tags?.filter(tag => tag !== 'popular') || [];

  return (
    <Card className="overflow-hidden group border bg-card hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="relative w-full aspect-square overflow-hidden">
          <Link href={`/products/${product.id}`} className="block">
              <Image
                src={product.imageUrl || "https://picsum.photos/400/400"}
                alt={product.name}
                data-ai-hint="jewelry product"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
          </Link>

          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.tags?.includes('popular') && (
              <Badge className="bg-rose-500 text-rose-50 hover:bg-rose-600 border-none text-xs px-1.5 py-0.5">
                Hot
              </Badge>
            )}
            {product.isNewArrival && (
                <Badge className="bg-blue-500 text-blue-50 hover:bg-blue-600 border-none text-xs px-1.5 py-0.5">
                    New
                </Badge>
            )}
            {displayTags.slice(0, 2).map((tag) => ( // Show first 2 custom tags
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 capitalize">
                    {tag}
                </Badge>
            ))}
          </div>

          <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleToggleWishlist} 
              className="absolute top-2 right-2 rounded-full h-8 w-8 bg-background/60 backdrop-blur-sm hover:bg-background"
              aria-label="Toggle Wishlist"
          >
              <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
          </Button>
        </div>
        <CardContent className="p-2 sm:p-4 pb-2 sm:pb-3">
            <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate min-h-[2.5em] sm:min-h-[2em]">{product.name}</h3>
            </Link>
            <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                <p className="text-primary font-bold text-base sm:text-lg">
                    ₹{showDiscount ? product.salePrice?.toFixed(2) : product.price.toFixed(2)}
                </p>
                {showDiscount && (
                    <p className="text-muted-foreground text-xs sm:text-sm line-through">
                        ₹{product.price.toFixed(2)}
                    </p>
                )}
            </div>
        </CardContent>
      </div>
      <AddToCartButton product={product} size="sm" className="w-full rounded-none" />
    </Card>
  );
}
