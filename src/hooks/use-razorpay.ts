

'use client';

import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import type { CartItem, UserProfile, ShippingAddress } from '@/lib/types';
import { createOrder } from '@/services/orderService';
import { useCart } from './use-cart';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// You should store this in environment variables
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_5fLkz3F2hR3gYq';

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

    const processPayment = async (amount: number, shippingAddress: ShippingAddress, orderDetails: OrderDetails = {}) => {
        if (!isScriptLoaded) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Payment gateway is not ready. Please try again in a moment.'
            });
            return;
        }

        if (!user || !userProfile) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'You must be logged in to proceed with the payment.',
            });
            router.push('/login');
            return;
        }

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            name: 'Redbow',
            description: 'Order Payment',
            image: '/logo.png', // You should have a logo in your public folder
            handler: async (response: any) => {
                try {
                    // On successful payment
                    await createOrder({
                        userId: user.uid,
                        items: cart.map(item => ({
                            productId: item.productId,
                            name: item.name || '',
                            price: item.price || 0,
                            quantity: item.quantity,
                        })),
                        totalAmount: amount,
                        shippingAddress,
                        orderStatus: 'processing',
                        paymentStatus: 'paid',
                        razorpayPaymentId: response.razorpay_payment_id,
                        couponCode: orderDetails.couponCode,
                        discountAmount: orderDetails.discountAmount,
                    });
                    
                    toast({
                        title: 'Payment Successful',
                        description: 'Your order has been placed successfully!',
                    });
                    
                    clearCart();
                    router.push('/account?tab=orders'); // Redirect to an order history page

                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Order Creation Failed',
                        description: 'Your payment was successful, but we failed to create your order. Please contact support.',
                    });
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
                color: '#A30D2D', // Your primary theme color
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: response.error.description || 'Something went wrong. Please try again.',
            });
        });

        rzp.open();
    };

    return { processPayment, isReady: isScriptLoaded };
}
