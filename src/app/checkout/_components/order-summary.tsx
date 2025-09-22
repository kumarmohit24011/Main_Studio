
'use client';
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import type { Coupon } from "@/lib/types";
import Image from "next/image";
import { CouponForm } from "./coupon-form";
import { Badge } from "@/components/ui/badge";

interface OrderSummaryProps {
    subtotal: number;
    shippingCost: number;
    total: number;
    discount: number;
    appliedCoupon: Coupon | null;
    applyCoupon: (coupon: Coupon) => void;
    removeCoupon: () => void;
}

export function OrderSummary({ subtotal, shippingCost, total, discount, appliedCoupon, applyCoupon, removeCoupon }: OrderSummaryProps) {
    const { cart } = useCart();

    return (
        <div className="space-y-6 rounded-lg">
            <h2 className="text-2xl font-semibold">Order Summary</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3 -mr-3">
                 {cart.map(item => (
                    <div key={item.productId} className="flex items-start justify-between text-sm gap-4">
                       <div className="flex items-start gap-4">
                         <div className="relative h-20 w-20 rounded-md overflow-hidden border flex-shrink-0 bg-white">
                            <Image 
                                src={item.imageUrl || "https://picsum.photos/100/100"} 
                                alt={item.name || 'product image'} 
                                fill 
                                className="object-cover"
                            />
                         </div>
                         <div>
                            <p className="font-medium leading-tight">{item.name}</p>
                            <p className="text-muted-foreground mt-1">Qty: {item.quantity}</p>
                         </div>
                       </div>
                       <p className="font-medium text-right flex-shrink-0">₹{(item.price! * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            
            <Separator />

            {!appliedCoupon ? (
                <CouponForm applyCoupon={applyCoupon} />
            ) : (
                <div className="flex justify-between items-center text-sm">
                    <div className="font-medium text-primary">Coupon Applied: <Badge variant="secondary" className="ml-2">{appliedCoupon.code}</Badge></div>
                    <button onClick={removeCoupon} className="font-semibold text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider">Remove</button>
                </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                 {appliedCoupon && (
                    <div className="flex justify-between text-primary font-medium">
                        <span className="text-muted-foreground">Discount</span>
                        <span>- ₹{discount.toFixed(2)}</span>
                    </div>
                )}
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
            </div>
        </div>
    );
}
