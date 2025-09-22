
'use client';

/**
 * Client-side cache invalidation utility
 * Calls the secure server-side API to trigger cache revalidation
 */

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

const getApiUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
}

/**
 * Trigger cache revalidation from client-side by calling secure server endpoint
 * Uses same-origin protection to ensure requests come from admin interface
 */
export async function triggerCacheRevalidation(type: RevalidationType, specificPath?: string) {
  try {
    const apiUrl = getApiUrl();
    const fullUrl = `${apiUrl}/api/revalidate-data`;
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        specificPath
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Cache Revalidation] Failed for ${type}:`, error);
      return;
    }

    const result = await response.json();
    console.log(`Cache revalidated successfully for ${type}:`, result.message);
  } catch (error) {
    console.error(`Error triggering cache revalidation for ${type}:`, error);
    // Don't throw - cache revalidation failure shouldn't break the user operation
  }
}

/**
 * Trigger product cache revalidation including specific product page
 */
export async function triggerProductCacheRevalidation(productId?: string) {
  await triggerCacheRevalidation('products', productId ? `/products/${productId}` : undefined);
}

/**
 * Trigger category cache revalidation
 */
export async function triggerCategoryCacheRevalidation() {
  await triggerCacheRevalidation('categories');
}
