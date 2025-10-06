'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateGiftFinderProducts } from '@/services/productService';
import { useRouter } from 'next/navigation';

interface GiftSpinnerFormProps {
    allProducts: Product[];
    giftFinderProductIds: string[];
}

export function GiftSpinnerForm({ allProducts, giftFinderProductIds }: GiftSpinnerFormProps) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>(giftFinderProductIds);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleToggleProduct = (productId: string) => {
        const isSelected = selectedProducts.includes(productId);

        if (!isSelected && selectedProducts.length >= 6) {
            toast({ title: 'Limit Reached', description: 'You can select a maximum of 6 products for the gift spinner.', variant: 'destructive' });
            return;
        }

        setSelectedProducts(prev => 
            isSelected ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateGiftFinderProducts(selectedProducts);
            toast({ title: 'Success', description: 'Gift spinner products have been updated!' });
            router.refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save your changes.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gift Spinner Products</CardTitle>
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
    );
}
