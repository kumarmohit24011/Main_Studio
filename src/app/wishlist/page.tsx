
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

// This page is now effectively deprecated, but we keep it to handle old bookmarks gracefully.
export default function WishlistPage() {
  const router = useRouter();
  const { authLoading, user } = useAuth();
  
  useEffect(() => {
    if (!authLoading) {
      // Always redirect to the account page with the wishlist tab.
      router.replace('/account?tab=wishlist');
    }
  }, [router, authLoading, user]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-2xl font-bold mb-4">Redirecting to your account...</h1>
        <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    </div>
  );
}
