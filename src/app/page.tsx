
import { Button } from "@/components/ui/button";
import { getNewArrivals, getTrendingProducts } from "@/services/server/productQueries";
import { getSiteContent } from "@/services/siteContentService";
import { getAllCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./products/_components/product-card";
import { ShopByCategory } from "@/components/shop-by-category";

// Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const newArrivals = await getNewArrivals(5);
  const trendingProducts = await getTrendingProducts(5);
  const siteContent = await getSiteContent();
  const categories = await getAllCategories();
  const { heroSection, promoBanner1, promoBanner2 } = siteContent;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[75vh] flex items-center justify-start text-white bg-black">
        {heroSection.imageUrl && (
          <Image
            src={heroSection.imageUrl}
            alt="Elegant jewelry on a dark background"
            data-ai-hint="jewelry dark"
            fill
            className="object-cover opacity-50"
            priority
          />
        )}
        <div className="container relative z-10 p-4 md:p-8">
          <div className="max-w-xl">
             <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">{heroSection.headline}</h1>
             <p className="mt-6 text-lg md:text-xl text-foreground/80">{heroSection.subtitle}</p>
             <Button asChild className="mt-8" size="lg">
                <Link href={heroSection.buttonLink}>{heroSection.buttonText}</Link>
            </Button>
          </div>
        </div>
      </section>

      <ShopByCategory categories={categories} />

      <section id="new-arrivals" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-headline text-center mb-12">New Arrivals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">Explore All</Link>
            </Button>
          </div>
        </div>
      </section>

      {trendingProducts.length > 0 && (
        <section id="trending-products" className="py-16 lg:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-headline text-center mb-12">Trending Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section id="sale-banners" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative rounded-lg overflow-hidden h-80 flex items-center justify-center text-white text-center p-6">
              {promoBanner1.imageUrl && (
                <Image
                  src={promoBanner1.imageUrl}
                  alt={promoBanner1.headline}
                  data-ai-hint="jewelry sale"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-3xl font-headline font-bold">{promoBanner1.headline}</h3>
                <p className="mt-2 text-lg">{promoBanner1.subtitle}</p>
                <Button asChild className="mt-6" variant="secondary">
                  <Link href={promoBanner1.buttonLink}>{promoBanner1.buttonText}</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden h-80 flex items-center justify-center text-white text-center p-6">
              {promoBanner2.imageUrl && (
                <Image
                  src={promoBanner2.imageUrl}
                  alt={promoBanner2.headline}
                  data-ai-hint="ring promotion"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-3xl font-headline font-bold">{promoBanner2.headline}</h3>
                <p className="mt-2 text-lg">{promoBanner2.subtitle}</p>
                <Button asChild className="mt-6" variant="secondary">
                  <Link href={promoBanner2.buttonLink}>{promoBanner2.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
