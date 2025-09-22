
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { getFeaturedCategories } from "@/services/categoryService";
import type { Category } from "@/lib/types";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
});


export const metadata: Metadata = {
  title: "Redbow - Exquisite Jewelry",
  description: "Discover timeless elegance with Redbow's curated collection of fine jewelry. High-quality pieces for every occasion.",
};

// Revalidate layout every 60 seconds to update header categories
export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const featuredCategoriesData = await getFeaturedCategories();
  const categories: Category[] = featuredCategoriesData.map(cat => ({
    ...cat,
    createdAt: cat.createdAt?.seconds ? new Date(cat.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
  }));

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header categories={categories} />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
