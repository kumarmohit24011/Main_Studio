

'use client';

import { useState, useMemo } from 'react';
import type { Product, Category } from '@/lib/types';
import { ProductTable } from './product-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Search, Trash2, ShieldX } from 'lucide-react';
import { deleteMultipleProducts } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface ProductActionsProps {
    products: Product[];
    categories: Category[];
}

type StockStatus = 'all' | 'in-stock' | 'out-of-stock' | 'low-stock';
const LOW_STOCK_THRESHOLD = 5;

export function ProductActions({ products, categories }: ProductActionsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState<StockStatus>('all');
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const { toast } = useToast();
    const router = useRouter();


    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = 
                categoryFilter === 'all' || product.category === categoryFilter;
            
            const matchesStock = () => {
                switch(stockFilter) {
                    case 'in-stock':
                        return product.stock > LOW_STOCK_THRESHOLD;
                    case 'out-of-stock':
                        return product.stock === 0;
                    case 'low-stock':
                        return product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
                    case 'all':
                    default:
                        return true;
                }
            }

            return matchesSearch && matchesCategory && matchesStock();
        });
    }, [products, searchQuery, categoryFilter, stockFilter]);

     const handleBulkDelete = async () => {
        try {
            await deleteMultipleProducts(selectedProducts);
            toast({ title: "Success", description: `${selectedProducts.length} products deleted.` });
            setSelectedProducts([]);
            // Wait a bit for cache revalidation to complete, then refresh
            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to delete products." });
        }
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="relative w-full md:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat: Category) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as StockStatus)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock Statuses</SelectItem>
                            <SelectItem value="in-stock">In Stock</SelectItem>
                            <SelectItem value="low-stock">Low Stock</SelectItem>
                             <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="w-full md:w-auto flex items-center gap-2">
                    {selectedProducts.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-10">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedProducts.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete {selectedProducts.length} product(s).
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button size="sm" className="h-10 gap-1 w-full" asChild>
                        <Link href="/admin/products/new">
                            <PlusCircle className="h-4 w-4" />
                            <span className="whitespace-nowrap">
                                Add Product
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <ProductTable 
                products={filteredProducts} 
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
            />
        </div>
    );
}
