
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, TrendingUp, Sparkles, Eye, EyeOff } from 'lucide-react';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteProduct, updateProductStatus } from '@/services/productService';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProductTableProps {
    products: Product[];
    selectedProducts: Product[];
    setSelectedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function ProductTable({ products, selectedProducts, setSelectedProducts }: ProductTableProps) {
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (product: Product) => {
        try {
            await deleteProduct(product.id, product.imageUrls);
            toast({ title: "Success", description: "Product deleted successfully." });
            // Wait a bit for cache revalidation to complete, then refresh
            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
        }
    }

    const handleToggleStatus = async (productId: string, statusType: 'isPublished' | 'isNewArrival' | 'isTrending', value: boolean) => {
        try {
            await updateProductStatus(productId, { [statusType]: value });
            toast({ title: "Status Updated", description: "Product status changed successfully." });
            // Wait a bit for cache revalidation to complete, then refresh
            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (error) {
            console.error("Error updating product status:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update product status." });
        }
    }

    const handleSelectProduct = (product: Product, isSelected: boolean) => {
        if (isSelected) {
            setSelectedProducts(prev => [...prev, product]);
        } else {
            setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
        }
    }

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedProducts(products);
        } else {
            setSelectedProducts([]);
        }
    }

  return (
    <div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]">
                        <Checkbox 
                            checked={selectedProducts.length === products.length && products.length > 0}
                            onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => (
                <TableRow key={product.id} data-state={selectedProducts.some(p => p.id === product.id) && "selected"}>
                    <TableCell>
                         <Checkbox 
                            checked={selectedProducts.some(p => p.id === product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product, Boolean(checked))}
                            aria-label={`Select ${product.name}`}
                        />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                            alt="Product image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.imageUrl || '/placeholder.svg'}
                            width="64"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-2 items-start">
                           <div className="flex items-center space-x-2">
                                <Switch 
                                    id={`published-${product.id}`} 
                                    checked={product.isPublished} 
                                    onCheckedChange={(val) => {
                                        try {
                                            handleToggleStatus(product.id, 'isPublished', val);
                                        } catch (error) {
                                            console.error("Toggle error:", error);
                                        }
                                    }} 
                                />
                                <Label htmlFor={`published-${product.id}`} className="text-xs flex items-center gap-1">{product.isPublished ? <Eye className="h-3 w-3"/> : <EyeOff className="h-3 w-3"/>} Published</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id={`new-${product.id}`} 
                                    checked={product.isNewArrival || false} 
                                    onCheckedChange={(val) => {
                                        try {
                                            handleToggleStatus(product.id, 'isNewArrival', val);
                                        } catch (error) {
                                            console.error("Toggle error:", error);
                                        }
                                    }}
                                />
                                <Label htmlFor={`new-${product.id}`} className="text-xs flex items-center gap-1"><Sparkles className="h-3 w-3"/> New</Label>
                            </div>
                           <div className="flex items-center space-x-2">
                                <Switch 
                                    id={`trending-${product.id}`} 
                                    checked={product.tags?.includes('popular') || false} 
                                    onCheckedChange={(val) => {
                                        try {
                                            handleToggleStatus(product.id, 'isTrending', val);
                                        } catch (error) {
                                            console.error("Toggle error:", error);
                                        }
                                    }}
                                />
                                <Label htmlFor={`trending-${product.id}`} className="text-xs flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Trending</Label>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/products/${product.id}/edit`}>
                             <Pencil className="mr-2 h-4 w-4"/>Edit
                           </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4 text-red-500"/>
                                    <span className="text-red-500">Delete</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product and all its images from the server.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
        {products.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <p>No products found. Get started by adding a new one.</p>
            </div>
        )}
    </div>
  );
}
