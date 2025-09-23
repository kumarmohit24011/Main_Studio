
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCouponByCode } from '@/services/couponService';
import type { Coupon } from '@/lib/types';

interface CouponFormProps {
    onApplyCoupon: (coupon: Coupon) => void;
    onRemoveCoupon: () => void;
    appliedCoupon: Coupon | null;
    subtotal: number;
}

export function CouponForm({ onApplyCoupon, onRemoveCoupon, appliedCoupon, subtotal }: CouponFormProps) {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode) return;

        setLoading(true);
        try {
            const coupon = await getCouponByCode(couponCode);
            if (coupon) {
                if (subtotal < (coupon.minimumSpend || 0)) {
                    toast({
                        title: 'Coupon Requirement Not Met',
                        description: `You need to spend at least ₹${coupon.minimumSpend} to use this coupon.`,
                        variant: 'destructive',
                    });
                } else {
                    onApplyCoupon(coupon);
                    toast({ title: 'Success', description: 'Coupon applied successfully!' });
                }
            } else {
                toast({ title: 'Error', description: 'Invalid or expired coupon code.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to apply coupon. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
    };

    if (appliedCoupon) {
        const discountValue = appliedCoupon.discountType === 'fixed'
            ? `₹${appliedCoupon.discountValue.toFixed(2)}`
            : `${appliedCoupon.discountValue}%`;

        return (
            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                <div>
                    <p className="font-semibold text-sm">Coupon Applied: <span className="font-mono">{appliedCoupon.code}</span></p>
                    <p className="text-xs text-muted-foreground">You saved {discountValue}</p>
                </div>
                <Button onClick={onRemoveCoupon} variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4"/>
                </Button>
            </div>
        );
    }

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
