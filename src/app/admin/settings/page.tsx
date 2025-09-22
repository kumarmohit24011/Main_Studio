
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent, type PlainShippingSettingsData } from "@/services/siteContentService";
import { ShippingSettingsForm } from "./_components/shipping-settings-form";

export default async function AdminSettingsPage() {
  const siteContent: SiteContent = await getSiteContent();

  // The getSiteContent service now returns a serializable object, so we can use it directly.
  // We add a check to ensure updatedAt is a string before passing it down.
  const plainShippingSettings: PlainShippingSettingsData = {
    ...siteContent.shippingSettings,
    updatedAt: typeof siteContent.shippingSettings.updatedAt === 'string' 
      ? siteContent.shippingSettings.updatedAt 
      : undefined,
  };


  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            <p className="text-muted-foreground">Configure your website and admin preferences.</p>
        </div>
        
        <ShippingSettingsForm settings={plainShippingSettings} />

        {/* Other settings cards can be added here in the future */}
    </div>
  );
}
