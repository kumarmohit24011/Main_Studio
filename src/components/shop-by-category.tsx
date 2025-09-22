"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "lucide-react";
import type { Category } from "@/lib/types";

interface ShopByCategoryProps {
  categories: Category[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const featuredCategories = categories.filter(category => category.isFeatured);
  
  // If no featured categories, show first 6 categories
  const displayCategories = featuredCategories.length > 0 
    ? featuredCategories.slice(0, 6) 
    : categories.slice(0, 6);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <section id="shop-by-category" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold tracking-tight text-primary mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our diverse collection of jewelry organized by category
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {displayCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group-hover:shadow-xl border-0">
                <div className="relative aspect-square">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={`${category.name} jewelry collection`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16.66vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                      <Tag className="h-12 w-12 text-primary/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base font-headline text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}