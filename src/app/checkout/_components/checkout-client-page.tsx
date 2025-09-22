
'use client';

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ShippingForm } from "./shipping-form";
import { OrderSummary } from "./order-summary";
import { useRazorpay } from "@/hooks/use-razorpay";
import { z } from "zod";
import { shippingSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coupon } from "@/lib/types";
import { CreditCard, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";

export function CheckoutClientPage() {
  const { cart, cartLoading } = useCart();
  const { user, userProfile, authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { processPayment, isReady } = useRazorpay();
  const [shippingAddress, setShippingAddress] = useState<z.infer<typeof shippingSchema> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingSettings, setShippingSettings] = useState<SiteContent['shippingSettings'] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
    const fetchSettings = async () => {
        const content = await getSiteContent();
        setShippingSettings(content.shippingSettings);
    };
    fetchSettings();
  }, [authLoading, user, router]);

  useEffect(() => {
    if (cart.length === 0 && !cartLoading) {
      router.push('/products');
    }
  }, [cart.length, cartLoading, router]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0), [cart]);

  const shippingCost = useMemo(() => {
    if (!shippingSettings) return 0; // Default to free if settings not loaded
    if (shippingSettings.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold) {
        return 0;
    }
    return shippingSettings.defaultFee;
  }, [subtotal, shippingSettings]);


  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
        return subtotal * (appliedCoupon.discountValue / 100);
    } else {
        return Math.min(subtotal, appliedCoupon.discountValue); // Ensure fixed discount isn't more than subtotal
    }
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
      const calculatedTotal = subtotal + shippingCost - discount;
      return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, shippingCost, discount]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon Removed", description: "The discount has been removed from your order." });
  }

  const handlePayment = async () => {
    if (!shippingAddress) {
      toast({
        variant: "destructive",
        title: "Shipping Address Required",
        description: "Please select or add a shipping address.",
      });
      return;
    }
    setIsSubmitting(true);
    const orderDetails = {
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
    }
    await processPayment(total, shippingAddress, orderDetails);
    setIsSubmitting(false);
  }

  if (authLoading || cartLoading || !userProfile || (cart.length === 0 && !cartLoading) || !shippingSettings) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <div><Skeleton className="h-[500px] w-full" /></div>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
        <main className="grid lg:grid-cols-2 lg:gap-8">
            <div className="py-8 lg:pr-8">
                <h1 className="text-2xl md:text-3xl font-headline font-bold mb-2">Redbow</h1>
                 <p className="text-muted-foreground mb-8">Complete your purchase</p>
                
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                        <ShippingForm onFormSubmit={setShippingAddress} />
                    </section>
                </div>


            </div>
            
            <div className="py-8 lg:pl-8 lg:border-l lg:bg-muted/30">
                 <div className="sticky top-20">
                    <OrderSummary 
                        subtotal={subtotal} 
                        shippingCost={shippingCost} 
                        discount={discount}
                        total={total}
                        appliedCoupon={appliedCoupon}
                        applyCoupon={setAppliedCoupon}
                        removeCoupon={removeCoupon}
                    />
                     <Button 
                        className="w-full mt-6" 
                        size="lg" 
                        onClick={handlePayment} 
                        disabled={!shippingAddress || isSubmitting || !isReady}
                    >
                        {isSubmitting ? "Processing..." : (isReady ? `Pay ₹${total.toFixed(2)}` : "Loading Payment...")}
                    </Button>
                </div>
            </div>
        </main>
    </div>
  );
}
