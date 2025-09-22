
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../_components/product-form";
import { getAllCategories } from "@/services/categoryService";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const categories: Category[] = await getAllCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Add New Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill out the form below to add a new product to your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
