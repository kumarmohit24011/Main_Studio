
import { getProductById, getProductsByCategory } from "@/services/productService";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductDetailsClient } from "./_components/product-details-client";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "../_components/product-card";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const product = await getProductById(id);

  if (!product || !product.isPublished) {
    notFound();
  }

  // Fetch related products (from the same category, excluding the current one, limit 5)
  const relatedProductsData = await getProductsByCategory(product.category);
  const relatedProducts = relatedProductsData
    .filter(p => p.id !== product.id && p.isPublished)
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
        
        {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-24">
                <Separator />
                <div className="py-12">
                    <h2 className="text-3xl font-headline text-center mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
