
'use client';

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getShippingSettings, type ShippingSettings } from "@/services/shippingService";
import { useEffect, useState } from "react";
import { CouponForm } from "./_components/coupon-form";
import type { Coupon } from "@/lib/types";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartLoading } = useCart();
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    async function fetchShipping() {
      try {
        const settings = await getShippingSettings();
        setShippingSettings(settings);
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
        // Use default settings on error to avoid breaking the page
        setShippingSettings({ fee: 50, threshold: 1000 });
      }
      setLoadingShipping(false);
    }

    fetchShipping();
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  const discount = appliedCoupon
  ? appliedCoupon.discountType === 'fixed'
    ? appliedCoupon.discountValue
    : (subtotal * appliedCoupon.discountValue) / 100
  : 0;

  const isFreeShipping = shippingSettings ? subtotal >= shippingSettings.threshold && shippingSettings.threshold > 0 : false;
  const shippingFee = shippingSettings ? (isFreeShipping ? 0 : shippingSettings.fee) : 0;
  const total = subtotal - discount + shippingFee;

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };
  
  if (cartLoading || loadingShipping) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-headline font-bold mb-6 md:mb-8">Your Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-20 w-20 md:h-24 md:w-24 text-muted-foreground" />
        <h1 className="mt-6 text-2xl md:text-3xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-headline font-bold mb-6 md:mb-8">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Cart Items ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.productId} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-24 sm:h-20 sm:w-20 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "https://picsum.photos/100/100"}
                        alt={item.name || "Product image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 80px"
                      />
                    </div>
                  </div>
                  <div className="flex-grow grid grid-cols-12 gap-x-4 gap-y-2 items-center w-full">
                    <div className="col-span-12 sm:col-span-5">
                      <h3 className="font-semibold truncate text-base">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">₹{item.price?.toFixed(2)}</p>
                    </div>
                    <div className="col-span-7 sm:col-span-4 flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-5 sm:col-span-3 flex items-center justify-end gap-2">
                      <p className="font-semibold text-right text-base sm:text-right w-full">
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mr-2" onClick={() => removeFromCart(item.productId)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3 lg:sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <CouponForm 
                        onApplyCoupon={handleApplyCoupon} 
                        onRemoveCoupon={handleRemoveCoupon} 
                        appliedCoupon={appliedCoupon}
                        subtotal={subtotal}
                    />
                </div>
                <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                    <div className="flex justify-between text-destructive">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                    </div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        {isFreeShipping ? (
                            <span className="font-semibold text-emerald-600">FREE</span>
                        ) : (
                            <span>₹{shippingFee.toFixed(2)}</span>
                        )}
                    </div>
                     {shippingSettings && shippingSettings.threshold > 0 && subtotal < shippingSettings.threshold && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                           Add ₹{(shippingSettings.threshold - subtotal).toFixed(2)} more to your cart for FREE shipping!
                        </p>
                    )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" size="lg">
                    <Link href={{
                        pathname: '/checkout',
                        query: { ...(appliedCoupon && { coupon: appliedCoupon.code }) }
                    }}>
                        Proceed to Checkout
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
