
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
 * Trigger cache revalidation from client-side by calling secure server endpoint.
 * This function no longer uses hooks and requires the auth token to be passed in.
 */
export async function triggerCacheRevalidation(token: string | null, type: RevalidationType, specificPath?: string) {
  try {
    const apiUrl = getApiUrl();
    const fullUrl = `${apiUrl}/api/revalidate-data`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
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
