'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductActions } from "./product-actions";
import type { Product, Category } from "@/lib/types";
import * as XLSX from 'xlsx';

interface ProductPageClientProps {
    products: Product[];
    categories: Category[];
}

export function ProductPageClient({ products, categories }: ProductPageClientProps) {
    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(products);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, "products.xlsx");
    };

    return (
        <div className="flex flex-col gap-4">
             <div className="flex justify-end">
                <Button onClick={handleExport} disabled={products.length === 0}>
                    Export to Excel
                </Button>
            </div>
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