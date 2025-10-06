
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";
import { PromoBannerSettingsForm } from "./_components/promo-banner-settings-form";
import { PromoBanner1Form } from "./_components/promo-banner-1-form";
import { PromoBanner2Form } from "./_components/promo-banner-2-form";

export default async function AdminPromoBannersPage() {
  const siteContent: SiteContent = await getSiteContent();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Promotional Banners</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Banner Visibility</CardTitle>
          <CardDescription>
            Control whether the promotional banners are displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <PromoBannerSettingsForm showPromoBanners={siteContent.showPromoBanners} />
        </CardContent>
      </Card>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <PromoBanner1Form data={siteContent.promoBanner1} />
            <PromoBanner2Form data={siteContent.promoBanner2} />
        </div>
    </div>
  );
}
