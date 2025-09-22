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
  // Show up to 12 most popular categories
  const displayCategories = categories
    .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
    .slice(0, 12);

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
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {displayCategories.map((category) => (
            <div key={category.id} className="w-40 flex-shrink-0">
              <Link 
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
                        sizes="160px"
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
            </div>
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
