"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProducts } from "@/services/productService";
import { searchCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";

interface SearchDialogProps {
  children?: React.ReactNode;
}

export function SearchDialog({ children }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setProducts([]);
      setCategories([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const [productResults, categoryResults] = await Promise.all([
        searchProducts(term),
        searchCategories(term),
      ]);
      
      setProducts(productResults);
      setCategories(categoryResults);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchTerm("");
    setProducts([]);
    setCategories([]);
    setHasSearched(false);
  };

  const totalResults = products.length + categories.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" aria-describedby="search-description">
        <DialogHeader>
          <DialogTitle>Search Products & Categories</DialogTitle>
        </DialogHeader>
        <div id="search-description" className="sr-only">
          Search through our product catalog and categories to find what you're looking for
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for products, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          )}

          {!isLoading && hasSearched && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {totalResults === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{searchTerm}"</p>
                    <p className="text-sm">Try different keywords or check the spelling</p>
                  </div>
                ) : (
                  <>
                    {categories.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Tag className="h-4 w-4" />
                          Categories ({categories.length})
                        </div>
                        <div className="space-y-1">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/products?category=${encodeURIComponent(category.name)}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Tag className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{category.name}</p>
                                {category.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="shrink-0">Category</Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {products.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Package className="h-4 w-4" />
                          Products ({products.length})
                        </div>
                        <div className="space-y-1">
                          {products.slice(0, 8).map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted">
                                {product.imageUrl ? (
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-primary">
                                    ₹{product.price.toLocaleString()}
                                  </p>
                                  {product.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {product.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {product.tags?.includes('new') && (
                                <Badge className="shrink-0">New</Badge>
                              )}
                            </Link>
                          ))}
                          {products.length > 8 && (
                            <Link
                              href={`/products?search=${encodeURIComponent(searchTerm)}`}
                              onClick={handleResultClick}
                              className="block p-3 text-center text-sm text-primary hover:bg-muted rounded-lg transition-colors"
                            >
                              View all {products.length} products →
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {!hasSearched && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search for products and categories</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}