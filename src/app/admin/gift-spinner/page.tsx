
'use client';

import { useState, useEffect } from 'react';
import { getAllProducts, getGiftFinderProducts, updateGiftFinderProducts } from '@/services/productService';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GiftFinderSettingsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const [products, giftFinderIds] = await Promise.all([
                    getAllProducts(),
                    getGiftFinderProducts(),
                ]);
                
                const productsWithPlaceholders = products.map(p => {
                    if (!p.imageUrls || p.imageUrls.length === 0) {
                        return {
                            ...p,
                            imageUrls: ["https://placehold.co/600x400/EEE/31343C?text=No+Image"]
                        };
                    }
                    return p;
                });

                setAllProducts(productsWithPlaceholders);
                setSelectedProducts(giftFinderIds);

            } catch (error) {
                toast({ title: 'Error', description: 'Failed to load products.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleToggleProduct = (productId: string) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            if (prev.length >= 6) {
                toast({ title: 'Limit Reached', description: 'You can select a maximum of 6 products for the gift spinner.', variant: 'destructive' });
                return prev;
            }
            return [...prev, productId];
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateGiftFinderProducts(selectedProducts);
            toast({ title: 'Success', description: 'Gift spinner products have been updated!' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save your changes.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div>Loading product settings...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Gift Spinner Settings</CardTitle>
                    <CardDescription>Select up to 6 products to feature in the gift spinner.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        {allProducts.map(product => (
                            <div key={product.id} 
                                 className={`border rounded-lg p-2 cursor-pointer ${selectedProducts.includes(product.id) ? 'border-primary ring-2 ring-primary' : ''}`}
                                 onClick={() => handleToggleProduct(product.id)}>
                                <img src={product.imageUrls ? product.imageUrls[0] : ''} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2" />
                                <p className="text-sm font-medium text-center">{product.name}</p>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleSave} disabled={isSaving || selectedProducts.length === 0}>
                        {isSaving ? 'Saving...' : `Save ${selectedProducts.length} Products`}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
