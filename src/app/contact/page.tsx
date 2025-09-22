
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


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
                     <a href="mailto:support@redbow.com" className="flex items-start gap-4 hover:text-primary transition-colors">
                        <Mail className="h-6 w-6 mt-1 flex-shrink-0" /> 
                        <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <p>support@redbow.com</p>
                            <p className="text-xs">We typically respond within 24 hours.</p>
                        </div>
                    </a>
                     <a href="tel:+919876543210" className="flex items-start gap-4 hover:text-primary transition-colors">
                        <Phone className="h-6 w-6 mt-1 flex-shrink-0" />
                         <div>
                            <p className="font-semibold text-foreground">Phone</p>
                            <p>+91 987 654 3210</p>
                             <p className="text-xs">Mon - Fri, 9am - 5pm IST</p>
                        </div>
                    </a>
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
                    <Button asChild className="w-full" size="lg">
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                           <WhatsAppIcon className="mr-2 h-5 w-5" />
                           Chat on WhatsApp
                        </a>
                    </Button>
                     <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href="https://www.instagram.com/redbow.jewels" target="_blank" rel="noopener noreferrer">
                           <Instagram className="mr-2 h-5 w-5" />
                           Message on Instagram
                        </Link>
                    </Button>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
