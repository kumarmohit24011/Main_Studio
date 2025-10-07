
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { AddToCartButton } from '@/components/shared/add-to-cart-button';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useIsMobile } from '@/hooks/use-mobile'; 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDetailsClientProps {
    product: Product;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ product }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);
    const allImages = [...(product.imageUrls || [])].filter(Boolean) as string[];
    const isMobile = useIsMobile();

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

    if (!product) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image Gallery */}
          <div className="md:sticky top-24">
            <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {allImages.map((img, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                                <Image
                                    src={img}
                                    alt={`${product.name} image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {allImages.length > 1 && !isMobile && (
                    <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                    </>
                )}
            </Carousel>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-black">{product.name}</h1>
                <div className="flex items-baseline gap-2 mt-4">
                    <p className="text-3xl text-primary font-bold">
                        ₹{showDiscount ? product.salePrice?.toFixed(2) : product.price.toFixed(2)}
                    </p>
                    {showDiscount && (
                        <p className="text-xl text-muted-foreground line-through">
                            ₹{product.price.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <AddToCartButton product={product} className="flex-grow" />
                <Button variant="outline" size="icon" onClick={handleToggleWishlist}>
                    <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
                </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        </div>
    );
};

export default ProductDetailsClient;
