
'use client';

import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Frown } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

const ITEMS_PER_PAGE = 15;

export function ProductGrid({ products }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="flex-1">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {products.length > 0 ? visibleProducts.length : 0} of {products.length} products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 text-muted-foreground border-2 border-dashed rounded-lg">
          <Frown className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">No Products Found</h3>
          <p className="mt-2 max-w-xs">Your search or filter combination didn't return any results. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {visibleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {visibleCount < products.length && (
        <div className="text-center mt-12">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
