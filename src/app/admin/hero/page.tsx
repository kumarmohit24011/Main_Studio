
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";
import { HeroForm } from "./_components/hero-form";


export default async function AdminHeroPage() {
  const siteContent: SiteContent = await getSiteContent();

  // Convert Firestore Timestamp to a serializable format with validation
  const plainHeroData = {
    ...siteContent.heroSection,
    updatedAt: (siteContent.heroSection.updatedAt?.seconds && !isNaN(siteContent.heroSection.updatedAt.seconds)) 
      ? new Date(siteContent.heroSection.updatedAt.seconds * 1000).toISOString() 
      : new Date().toISOString(), // Fallback to current date if updatedAt is invalid
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Hero Section</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Homepage Hero</CardTitle>
          <CardDescription>
            Update the content and background image of your homepage's hero section.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <HeroForm heroData={plainHeroData} />
        </CardContent>
      </Card>
    </div>
  );
}
