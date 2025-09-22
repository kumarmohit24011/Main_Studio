
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Terms of Service</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p>Welcome to Redbow! These Terms of Service ("Terms") govern your use of our website located at [Your Website URL] and any related services provided by Redbow. By accessing our website, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Redbow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          </section>

           <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">3. Disclaimer</h2>
            <p>The materials on Redbow's website are provided on an 'as is' basis. Redbow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

           <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">4. Limitations</h2>
            <p>In no event shall Redbow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Redbow's website.</p>
          </section>

           <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">5. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
