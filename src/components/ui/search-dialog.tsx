"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { searchProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

interface SearchDialogProps {
  children?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  onResultClick?: () => void;
}

export function SearchDialog({ children, onOpenChange, onResultClick }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const productResults = await searchProducts(term);
      setProducts(productResults);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const handleResultClick = () => {
    handleOpenChange(false);
    setSearchTerm("");
    setProducts([]);
    setHasSearched(false);
    if (onResultClick) {
      onResultClick();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-2xl h-screen sm:h-auto flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Search Products</DialogTitle>
            <DialogClose className="sm:hidden">
              <X className="h-5 w-5"/>
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <DialogDescription className="hidden sm:block">
            Find the perfect piece of jewelry from our collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && hasSearched && (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No products found for "{searchTerm}"</p>
                      <p className="text-sm">Try different keywords or check the spelling</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Package className="h-4 w-4" />
                        Products ({products.length})
                      </div>
                      <div className="space-y-1">
                        {products.slice(0, 20).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                              <p className="font-medium text-sm">{product.name}</p>
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
                              <Badge className="shrink-0 ml-auto">New</Badge>
                            )}
                          </Link>
                        ))}
                        {products.length > 20 && (
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
                </div>
              </ScrollArea>
            )}

            {!hasSearched && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start typing to search for products</p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
