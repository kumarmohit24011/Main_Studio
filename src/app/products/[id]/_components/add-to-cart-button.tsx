'use client';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    product: Product;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToCartButton({ product, className, size = "lg"}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if the button is inside a link
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Button onClick={handleAddToCart} size={size} className={cn("flex items-center justify-center", className)} aria-label="Add to cart">
        <ShoppingCart className={cn("h-4 w-4", size !== 'icon' && "mr-2")} />
        {size !== 'icon' && <span>Add to Cart</span>}
    </Button>
  );
}
