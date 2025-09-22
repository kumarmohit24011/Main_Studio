
import { getSiteContent, type PlainSiteContent, SiteContent } from "@/services/siteContentService";
import { PromoBannerForm } from "./_components/promo-banner-form";

// Helper function to convert Timestamp to string
const toPlainData = (data: any) => {
    if (data?.updatedAt?.seconds) {
        return { ...data, updatedAt: new Date(data.updatedAt.seconds * 1000).toISOString() };
    }
    return data;
}

export default async function AdminPromotionsPage() {
  const siteContent: SiteContent = await getSiteContent();

  const plainSiteContent: PlainSiteContent = {
    heroSection: toPlainData(siteContent.heroSection),
    promoBanner1: toPlainData(siteContent.promoBanner1),
    promoBanner2: toPlainData(siteContent.promoBanner2),
    shippingSettings: toPlainData(siteContent.shippingSettings),
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Promotional Banners</h1>
        <p className="text-muted-foreground">Update the content and images for the promotional banners on your homepage.</p>
      </div>

      <PromoBannerForm 
        bannerId="promoBanner1"
        bannerData={plainSiteContent.promoBanner1}
        title="Primary Promotion Banner"
        description="This is the first promotional banner displayed on the homepage."
      />

      <PromoBannerForm 
        bannerId="promoBanner2"
        bannerData={plainSiteContent.promoBanner2}
        title="Secondary Promotion Banner"
        description="This is the second promotional banner displayed on the homepage."
      />
      
    </div>
  );
}
