
import { NextResponse } from "next/server";
import { getProductsByIds, getGiftFinderProducts } from "@/services/productService";
import { Product } from "@/lib/types";

export async function GET() {
  try {
    const productIds = await getGiftFinderProducts();
    
    if (productIds.length === 0) {
        // You can return a default set of products or an empty array
        return NextResponse.json([]);
    }

    const products: Product[] = await getProductsByIds(productIds);

    // Add placeholder for products without images
    const productsWithPlaceholders = products.map(p => {
        if (!p.imageUrls || p.imageUrls.length === 0) {
            return {
                ...p,
                imageUrls: ["https://placehold.co/600x400/EEE/31343C?text=No+Image"]
            };
        }
        return p;
    });

    return NextResponse.json(productsWithPlaceholders);

  } catch (error) {
    console.error("Error fetching gift-finder products:", error);
    return NextResponse.json({ message: "Error fetching products. Please try again later." }, { status: 500 });
  }
}
