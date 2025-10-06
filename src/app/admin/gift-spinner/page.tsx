
import { getAllProducts, getGiftFinderProducts } from '@/services/productService';
import { getSiteContent } from "@/services/siteContentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GiftFinderSettingsForm } from "./_components/gift-finder-settings-form";
import { GiftSpinnerForm } from './_components/gift-spinner-form';

export default async function GiftFinderSettingsPage() {
  const [products, giftFinderProductIds, siteContent] = await Promise.all([
    getAllProducts(),
    getGiftFinderProducts(),
    getSiteContent()
  ]);

  const productsWithPlaceholders = products.map(p => {
    if (!p.imageUrls || p.imageUrls.length === 0) {
        return {
            ...p,
            imageUrls: ["https://placehold.co/600x400/EEE/31343C?text=No+Image"]
        };
    }
    return p;
  });

  return (
    <div className="container mx-auto p-4 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Gift Finder Visibility</CardTitle>
                <CardDescription>
                    Control whether the Gift Finder banner is displayed on the homepage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <GiftFinderSettingsForm showGiftFinder={siteContent.showGiftFinder} />
            </CardContent>
        </Card>

        <GiftSpinnerForm 
            allProducts={productsWithPlaceholders} 
            giftFinderProductIds={giftFinderProductIds} 
        />
    </div>
  );
}
