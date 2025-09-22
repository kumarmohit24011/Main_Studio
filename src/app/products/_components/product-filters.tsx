
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: { category: string; sortBy: string }) => void;
  initialCategory: string;
  initialSort: string;
}

export function ProductFilters({ categories, onFilterChange, initialCategory, initialSort }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSortBy(initialSort);
  }, [initialCategory, initialSort]);

  useEffect(() => {
    onFilterChange({
        category: selectedCategory,
        sortBy
    });
  }, [selectedCategory, sortBy, onFilterChange]);

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className='flex items-center justify-end'>
         <div className="flex items-center gap-2">
            <Label htmlFor='sort-by' className="text-muted-foreground whitespace-nowrap">Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id='sort-by' className='w-[180px]'>
                  <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {allCategories.map((category) => (
            <CarouselItem key={category.id} className="pl-2 basis-auto">
              <Button
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "rounded-full whitespace-nowrap",
                  selectedCategory === category.name && "font-bold"
                )}
              >
                {category.name}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
