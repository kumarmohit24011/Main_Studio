
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Contact Us</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">We're here to help. Reach out to us with any questions or feedback.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Contact Information */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Our Information</CardTitle>
                    <CardDescription>Get in touch directly via email or phone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                     <a href="mailto:redbowofficial@gmail.com" className="flex items-start gap-4 hover:text-primary transition-colors">
                        <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <p>redbowofficial@gmail.com</p>
                            <p className="text-xs">We typically respond within 24 hours.</p>
                        </div>
                    </a>
                     <div className="flex items-start gap-4">
                         <div>
                            <p className="font-semibold text-foreground">Instagram</p>
                            <p>redbow.jewels</p>
                             <p className="text-xs">Mon - Fri, 9am - 5pm IST</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Direct Contact Buttons */}
        <div>
           <Card>
                <CardHeader>
                    <CardTitle>Connect with Us</CardTitle>
                    <CardDescription>Reach out on your favorite platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href="https://www.instagram.com/redbow.jewels" target="_blank" rel="noopener noreferrer">
                           Instagram
                        </Link>
                    </Button>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
