
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

interface ProductDetailsClientProps {
    product: Product;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ product }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);
    const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean) as string[];
    const [mainImage, setMainImage] = useState(allImages[0]);

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

    if (!product) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:sticky top-24">
            {allImages.length > 1 && (
                 <div className="grid grid-cols-5 gap-2 pb-2 md:flex md:flex-col md:gap-3 md:pb-0">
                    {allImages.map((img, index) => (
                        <button 
                            key={index} 
                            onClick={() => setMainImage(img)} 
                            className={cn(
                                'relative aspect-square rounded-lg overflow-hidden border-2 md:w-24 md:h-24',
                                mainImage === img ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50 transition-colors'
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 20vw, 10vw"
                            />
                        </button>
                    ))}
                </div>
            )}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                <Image
                    src={mainImage}
                    alt={product.name}
                    data-ai-hint="jewelry product"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{product.name}</h1>
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
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="flex items-center gap-4">
                <AddToCartButton product={product} className="flex-grow" />
                <Button variant="outline" size="icon" onClick={handleToggleWishlist}>
                    <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
                </Button>
            </div>
          </div>
        </div>
    );
};

export default ProductDetailsClient;
