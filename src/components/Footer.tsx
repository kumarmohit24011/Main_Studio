
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Send, Gem, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { FooterNewsletterForm } from "./footer-newsletter-form";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const PaymentIcon = ({ src, alt }: { src: string, alt: string }) => (
    <img src={src} alt={alt} className="h-6" />
  );

  return (
    <footer id="contact" className="bg-muted/40 text-foreground">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border/60">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl md:text-3xl font-headline font-semibold">Subscribe to our Newsletter</h2>
                    <p className="text-muted-foreground mt-2">Get exclusive access to new collections, sales, and events.</p>
                </div>
                <FooterNewsletterForm />
            </div>
        </div>
        
        {/* Main Footer Links */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
             <Link href="/" className="text-2xl font-headline font-bold text-primary tracking-wider mb-4 flex items-center gap-2">
                <Gem />
                REDBOW
            </Link>
            <p className="text-muted-foreground pr-4 mb-4">
              Crafting memories with every piece of jewelry. Timeless elegance for modern life.
            </p>
            <div className="space-y-2 text-muted-foreground">
                <a href="mailto:support@redbow.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" /> support@redbow.com
                </a>
                <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" /> +91 987 654 3210
                </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-base mb-4 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="/account" className="hover:text-primary transition-colors">My Account</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
               <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Social and Payment Methods */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/60">
             <div className="flex space-x-4">
                <Link href="https://www.instagram.com/redbow.jewels" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Instagram />
                  <span>Follow Us on Instagram</span>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
              <PaymentIcon src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" />
              <PaymentIcon src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
              <PaymentIcon src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
              <PaymentIcon src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" />
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 text-center text-xs text-muted-foreground">
          <p>© {currentYear} Redbow Inc. All Rights Reserved.</p>
           <div className="inline-flex gap-4 mt-2">
             <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
             <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
