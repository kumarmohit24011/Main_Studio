
'use client';

import { useState } from "react";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";
import { AddToWishlistButton } from "./add-to-wishlist-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function ProductDetailsClient({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(
    (url, index, self) => url && self.indexOf(url) === index
  ) as string[];

  const [mainImage, setMainImage] = useState<string>(allImages[0] || "https://picsum.photos/600/600");

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Image Gallery */}
      <div className="flex flex-col-reverse md:flex-row gap-4 sticky top-24">
        {allImages.length > 1 && (
             <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {allImages.map((img, index) => (
                    <button 
                        key={index} 
                        onClick={() => setMainImage(img)} 
                        className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 w-16 h-16 md:w-24 md:h-24 flex-shrink-0",
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

      {/* Product Information */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Link href={`/products?category=${product.category}`}>
              <Badge variant="outline">{product.category}</Badge>
            </Link>
            {product.tags?.map(tag => (
                tag === 'new' ? <Badge key={tag}>New Arrival</Badge> : 
                tag === 'popular' ? <Badge variant="secondary" key={tag}>Trending</Badge> : 
                null
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">{product.name}</h1>
        </div>

        <p className="text-2xl md:text-3xl font-semibold text-primary">₹{product.price.toFixed(2)}</p>
        
        <p className="text-muted-foreground text-base leading-relaxed">{product.description}</p>
        
        <Separator />

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <AddToCartButton product={product} className="w-full sm:w-auto flex-grow"/>
          <AddToWishlistButton product={product} />
        </div>

        <div className="mt-1 text-sm text-muted-foreground">
          <p>
            In Stock: {product.stock > 0 
                ? (product.stock < 10 ? `Only ${product.stock} units left!` : 'Available') 
                : 'Out of Stock'
            }
          </p>
          {product.sku && <p>SKU: {product.sku}</p>}
        </div>
      </div>
    </div>
  );
}
