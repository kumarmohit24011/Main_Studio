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

  const showDiscount = product.salePrice && product.salePrice < product.price;

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
          
          {product.tags?.includes('popular') && (
            <Badge className="absolute top-3 left-3 bg-rose-500 text-rose-50 hover:bg-rose-600 border-none">
              Hot Selling
            </Badge>
          )}

          <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleToggleWishlist} 
              className="absolute top-3 right-3 rounded-full h-9 w-9 bg-background/60 backdrop-blur-sm hover:bg-background"
              aria-label="Toggle Wishlist"
          >
              <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
          </Button>
        </div>
        <CardContent className="p-4">
            <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-base text-foreground truncate min-h-[2em]">{product.name}</h3>
            </Link>
            <div className="flex items-baseline gap-2 mt-2">
                <p className="text-primary font-bold text-lg">
                    ₹{showDiscount ? product.salePrice?.toFixed(2) : product.price.toFixed(2)}
                </p>
                {showDiscount && (
                    <p className="text-muted-foreground text-sm line-through">
                        ₹{product.price.toFixed(2)}
                    </p>
                )}
            </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0">
        <AddToCartButton product={product} variant="default" className="w-full" />
      </div>
    </Card>
  );
}
