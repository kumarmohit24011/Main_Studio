
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information that you provide to us directly, such as when you create an account, place an order, or contact customer service. This may include your name, email address, shipping address, and payment information.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you, and improve our services. We may also use your information to send you promotional emails, which you can opt out of at any time.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">4. Data Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">5. Your Consent</h2>
            <p>By using our site, you consent to our web site privacy policy.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
