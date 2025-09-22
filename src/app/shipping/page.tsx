
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Undo } from "lucide-react";

export default function ShippingAndReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Shipping & Returns</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Everything you need to know about how we get our products to you and our returns process.</p>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Shipping Policy */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-primary"/>
                <span>Shipping Policy</span>
            </CardTitle>
            <CardDescription>Our shipping process and timelines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We are committed to delivering your order accurately, in good condition, and always on time.
            </p>
            <div>
              <h4 className="font-semibold text-foreground">Processing Time</h4>
              <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Shipping Rates & Delivery Estimates</h4>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Standard Shipping:</strong> ₹50 (Free on orders over ₹1000). Delivery in 5-7 business days.</li>
                <li><strong>Express Shipping:</strong> ₹150. Delivery in 2-3 business days.</li>
              </ul>
            </div>
            <p>
              You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).
            </p>
          </CardContent>
        </Card>

        {/* Returns Policy */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Undo className="h-8 w-8 text-primary"/> 
                <span>Return & Exchange Policy</span>
            </CardTitle>
            <CardDescription>How to return or exchange an item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We want you to be completely satisfied with your purchase. If you are not, you can return the product to us.
            </p>
            <div>
              <h4 className="font-semibold text-foreground">Return Period</h4>
              <p>Our policy lasts 15 days. If 15 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange.</p>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Conditions for Return</h4>
               <ul className="list-disc list-inside space-y-2">
                <li>Item must be unused and in the same condition that you received it.</li>
                <li>It must also be in the original packaging.</li>
                <li>Proof of purchase is required.</li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">How to Start a Return</h4>
              <p>To initiate a return, please email us at <a href="mailto:support@redbow.com" className="text-primary hover:underline font-medium">support@redbow.com</a> with your order number and reason for return.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
