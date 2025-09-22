
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../../_components/product-form";
import { getProductById } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { notFound } from "next/navigation";
import type { Product, Category } from "@/lib/types";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const product: Product | null = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  // The services now return serializable data directly
  const categories: Category[] = await getAllCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Edit Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the form below to edit the product details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
