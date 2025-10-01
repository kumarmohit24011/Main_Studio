
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { ProductPageClient } from "./_components/product-page-client";
import type { Product, Category } from "@/lib/types";

// This forces the page to be dynamically rendered, ensuring fresh data on every load.
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    // Fetch data directly on the server.
    // Using Promise.all to fetch in parallel for better performance.
    const [products, categories]: [Product[], Category[]] = await Promise.all([
        getAllProducts(),
        getAllCategories()
    ]);

    // Pass the fetched data as props to the client component.
    return <ProductPageClient products={products} categories={categories} />;
}
