
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCouponByCode } from "@/services/couponService";
import type { Coupon } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface CouponFormProps {
    applyCoupon: (coupon: Coupon) => void;
}

export function CouponForm({ applyCoupon }: CouponFormProps) {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a coupon code.' });
            return;
        }

        setLoading(true);
        try {
            const coupon = await getCouponByCode(couponCode.trim().toUpperCase());
            if (coupon && coupon.isActive) {
                applyCoupon(coupon);
                toast({ title: 'Success', description: 'Coupon applied successfully!'});
            } else {
                toast({ variant: 'destructive', title: 'Invalid Coupon', description: 'This coupon code is not valid or has expired.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not apply coupon.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
            <Input 
                placeholder="Discount code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={loading}
                className="bg-background"
            />
            <Button type="submit" disabled={loading} variant="secondary" className="px-3">
                {loading ? 'Applying...' : <ArrowRight className="h-5 w-5"/>}
            </Button>
        </form>
    );
}
