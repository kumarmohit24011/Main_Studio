
'use client';

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@/lib/types";
import { Heart } from "lucide-react";

export function AddToWishlistButton({ product }: { product: Product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleToggleWishlist} title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
    </Button>
  );
}
