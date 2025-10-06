
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";
import { GiftFinderSettingsForm } from "./_components/gift-finder-settings-form";


export default async function AdminGiftFinderPage() {
  const siteContent: SiteContent = await getSiteContent();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Gift Finder</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Gift Finder Banner</CardTitle>
          <CardDescription>
            Control the visibility of the gift finder banner on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <GiftFinderSettingsForm showGiftFinder={siteContent.showGiftFinder} />
        </CardContent>
      </Card>
    </div>
  );
}
