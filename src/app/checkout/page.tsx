'use client';

import { Suspense, useEffect } from 'react';
import { CheckoutClientPage } from "./_components/checkout-client-page";
import { useAuth } from '@/hooks/use-auth';
import { triggerCacheRevalidation } from '@/lib/cache-client';

// A fallback component to show while the client component is loading
function CheckoutLoading() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="animate-pulse bg-muted rounded-md h-8 w-1/4"></div>
                    <div className="animate-pulse bg-muted rounded-md h-40 w-full"></div>
                    <div className="animate-pulse bg-muted rounded-md h-40 w-full"></div>
                </div>
                <div>
                    <div className="animate-pulse bg-muted rounded-md h-[500px] w-full"></div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
  const { user, authLoading } = useAuth();

  useEffect(() => {
    const revalidate = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          triggerCacheRevalidation(token, 'orders');
          triggerCacheRevalidation(token, 'products');
        } catch (error) {
          console.error('Error getting ID token for revalidation:', error);
        }
      }
    };

    if (!authLoading) {
      revalidate();
    }
  }, [user, authLoading]);

  return (
    <Suspense fallback={<CheckoutLoading />}>
        <CheckoutClientPage />
    </Suspense>
  );
}
