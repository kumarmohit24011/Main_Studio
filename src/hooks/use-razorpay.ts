
'use client';

import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import type { CartItem, UserProfile, ShippingAddress } from '@/lib/types';
import { createOrder } from '@/services/orderService';
import { useCart } from './use-cart';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { triggerCacheRevalidation } from '@/lib/cache-client';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface OrderDetails {
    couponCode?: string;
    discountAmount?: number;
}

export function useRazorpay() {
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [isScriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const processPayment = useCallback(async (amount: number, shippingAddress: ShippingAddress, orderDetails: OrderDetails = {}) => {
        if (!RAZORPAY_KEY_ID) {
            toast({ variant: 'destructive', title: 'Configuration Error', description: 'Razorpay Key ID is not configured.' });
            return;
        }
        if (!isScriptLoaded) {
            toast({ variant: 'destructive', title: 'Error', description: 'Payment gateway is not ready. Please try again.' });
            return;
        }
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to proceed.' });
            router.push('/login');
            return;
        }

        // Get the auth token *before* entering the Razorpay callback
        const token = await user.getIdToken();

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100,
            currency: 'INR',
            name: 'Redbow',
            description: 'Order Payment',
            image: '/logo.png',
            handler: async (response: any) => {
                try {
                    const orderItems = cart.map(item => ({
                        productId: item.productId,
                        name: item.name || '',
                        price: item.price || 0,
                        quantity: item.quantity,
                        sku: item.sku,
                        imageUrl: item.imageUrl, // Added this line
                    }));

                    await createOrder({
                        userId: user.uid,
                        items: orderItems,
                        totalAmount: amount,
                        shippingAddress,
                        orderStatus: 'processing',
                        paymentStatus: 'paid',
                        razorpayPaymentId: response.razorpay_payment_id,
                        couponCode: orderDetails.couponCode,
                        discountAmount: orderDetails.discountAmount,
                    });
                    
                    // Pass the token to the revalidation function
                    await triggerCacheRevalidation(token, 'orders');
                    for (const item of orderItems) {
                        await triggerCacheRevalidation(token, 'products', `/products/${item.productId}`);
                    }

                    toast({ title: 'Payment Successful', description: 'Your order has been placed successfully!' });
                    clearCart();
                    router.push('/account?tab=orders');

                } catch (error) {
                    console.error("Error during order processing: ", error);
                    toast({ variant: 'destructive', title: 'Order Creation Failed', description: 'Your payment was successful, but we failed to create your order. Please contact support.' });
                }
            },
            prefill: {
                name: userProfile.name,
                email: userProfile.email,
                contact: userProfile.phone || '',
            },
            notes: {
                address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}`,
            },
            theme: {
                color: '#A30D2D',
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
            toast({ variant: 'destructive', title: 'Payment Failed', description: response.error.description || 'Something went wrong.' });
        });

        rzp.open();
    }, [user, userProfile, isScriptLoaded, cart, clearCart, router, toast]);

    return { processPayment, isReady: isScriptLoaded };
}
