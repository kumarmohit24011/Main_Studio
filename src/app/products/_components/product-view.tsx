
'use client';

import { useEffect, useState, useCallback } from "react";
import type { Product, Category } from "@/lib/types";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { useRouter, usePathname } from "next/navigation";

interface ProductViewProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategory: string;
  initialSort: string;
}

export function ProductView({ initialProducts, categories, initialCategory, initialSort }: ProductViewProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const router = useRouter();
  const pathname = usePathname();

  const applyFilters = useCallback((filters: { category: string; sortBy: string; }) => {
    let tempProducts = [...initialProducts];

    // Category filter
    if (filters.category && filters.category.toLowerCase() !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === filters.category);
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        tempProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        break;
    }
    
    setFilteredProducts(tempProducts);
    
    // Update URL
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category);
    }
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

  }, [initialProducts, router, pathname]);
  
  // Apply initial filters on mount
  useEffect(() => {
    applyFilters({ category: initialCategory, sortBy: initialSort });
  }, [initialCategory, initialSort, applyFilters]);

  // Apply filters when initialProducts change
  useEffect(() => {
    applyFilters({ category: initialCategory, sortBy: initialSort });
  }, [initialProducts, applyFilters, initialCategory, initialSort]);


  return (
    <div>
      <ProductFilters 
        categories={categories} 
        onFilterChange={applyFilters} 
        initialCategory={initialCategory}
        initialSort={initialSort}
      />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
