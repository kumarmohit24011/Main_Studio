
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server-side cache revalidation utility
 * This should only be called from server-side contexts (API routes, server actions, etc.)
 * Never expose revalidation tokens to client-side code
 */

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

const REVALIDATION_CONFIG: Record<RevalidationType, { tags: string[]; paths: string[] }> = {
  products: {
    tags: ['products', 'new-arrivals', 'trending-products'],
    paths: ['/', '/products', '/admin/products']
  },
  categories: {
    tags: ['categories'],
    paths: ['/', '/products', '/admin/categories']
  },
  orders: {
    tags: ['orders'],
    paths: ['/admin/orders']
  },
  'site-content': {
    tags: ['site-content'],
    paths: ['/', '/products', '/about', '/contact', '/admin/settings']
  },
  promotions: {
    tags: ['promotions'],
    paths: ['/', '/products', '/admin/promotions']
  },
  coupons: {
    tags: ['coupons'],
    paths: ['/admin/coupons']
  }
};

/**
 * Revalidate cache after data mutations
 * Should be called after successful database writes
 */
export async function revalidateDataCache(type: RevalidationType, specificPath?: string) {
  const config = REVALIDATION_CONFIG[type];
  
  if (!config) {
    console.warn(`Unknown revalidation type: ${type}`);
    return;
  }

  try {
    // Revalidate by tags
    for (const tag of config.tags) {
      revalidateTag(tag);
    }

    // Force revalidation of the homepage to ensure data is fresh.
    revalidatePath('/');

    // Revalidate by other paths
    for (const path of config.paths) {
      revalidatePath(path);
    }

    // Revalidate specific path if provided (e.g., product detail page)
    if (specificPath) {
      revalidatePath(specificPath);
    }

    console.log(`Cache revalidated for type: ${type}${specificPath ? ` and path: ${specificPath}` : ''}`);
  } catch (error) {
    console.error(`Error revalidating cache for type ${type}:`, error);
  }
}

/**
 * Revalidate product-specific cache including detail page
 */
export async function revalidateProductCache(productId?: string) {
  await revalidateDataCache('products');
  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
}

/**
 * Revalidate category-specific cache
 */
export async function revalidateCategoryCache() {
  await revalidateDataCache('categories');
}

/**
 * Manual cache revalidation (for API endpoints)
 * Requires proper authentication check before calling
 */
export async function manualCacheRevalidation(paths: string[], tags: string[]) {
  try {
    for (const path of paths) {
      revalidatePath(path);
    }
    
    for (const tag of tags) {
      revalidateTag(tag);
    }
    
    console.log(`Manual cache revalidation completed for paths: ${paths.join(', ')}, tags: ${tags.join(', ')}`);
  } catch (error) {
    console.error('Error in manual cache revalidation:', error);
    throw error;
  }
}
