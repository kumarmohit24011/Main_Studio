
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { ProductActions } from "./_components/product-actions";
import type { Product, Category } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function ProductsPageSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="border rounded p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminProductsPage() {
    const { user, userProfile, authLoading } = useAuth();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProductsData() {
            if (!user || !userProfile?.isAdmin || authLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [productsData, categoriesData] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Error fetching products data:', err);
                setError('Failed to load products data. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchProductsData();
    }, [user, userProfile, authLoading]);

    if (authLoading || loading) {
        return <ProductsPageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                            <Button 
                                onClick={() => window.location.reload()} 
                                className="mt-4"
                                variant="outline"
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Products</CardTitle>
                    <CardDescription>
                        Search, filter, and manage all the products in your store.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductActions products={products} categories={categories} />
                </CardContent>
            </Card>
        </div>
    );
}
