'use client';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShoppingCart, XCircle } from "lucide-react";

interface AddToCartButtonProps {
    product: Product;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function AddToCartButton({ product, className, size = "lg", variant = "default"}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if the button is inside a link
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (product.stock === 0) {
    return (
        <Button disabled size={size} variant={'secondary'} className={cn("flex items-center justify-center", className)} aria-label="Sold Out">
            <XCircle className="h-4 w-4 mr-2" />
            <span className="sm:hidden">Sold Out</span>
            <span className="hidden sm:inline">Sold Out</span>
        </Button>
    )
  }

  return (
    <Button onClick={handleAddToCart} size={size} variant={variant} className={cn("flex items-center justify-center", className)} aria-label="Add to cart">
        <ShoppingCart className="h-4 w-4 mr-2" />
        <span className="sm:hidden">Add</span>
        <span className="hidden sm:inline">Add to Cart</span>
    </Button>
  );
}
