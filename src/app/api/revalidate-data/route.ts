
import { NextRequest } from 'next/server';
import { revalidateDataCache } from '@/lib/cache-revalidation';

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

export async function POST(request: NextRequest) {
  try {
    // Ensure proper content type before parsing the body
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const { type, specificPath }: { type: RevalidationType; specificPath?: string } = await request.json();
    
    if (!type) {
      return Response.json({ error: 'Revalidation type is required' }, { status: 400 });
    }

    // Same-origin protection: ensure request comes from a trusted interface
    const referer = request.headers.get('referer');
    if (!referer) {
      console.error('Cache revalidation blocked: missing referer header');
      return Response.json({ error: 'Invalid request: missing referer' }, { status: 403 });
    }

    let refUrl;
    try {
      refUrl = new URL(referer);
    } catch (error) {
      console.error('Cache revalidation blocked: invalid referer URL:', referer);
      return Response.json({ error: 'Invalid request: invalid referer URL' }, { status: 403 });
    }
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In production, allow requests from the admin studio and the main web app
    const prodAllowedOrigins = [
        'https://studio--redbow-24723.us-central1.hosted.app',
        'https://studio--redbow-24723.asia-east1.hosted.app',
        'https://redbow-24723.web.app' // Main production frontend
    ];

    const devAllowedOrigins = [
        'http://localhost:5000', 
        'http://0.0.0.0:5000',
        'http://127.0.0.1:5000',
    ];

    const allowedOrigins = isDevelopment ? devAllowedOrigins : prodAllowedOrigins;

    // Add dynamic dev origins for environments like Replit or Cloud Workstations
    if (isDevelopment) {
        const replitDomain = process.env.REPLIT_DEV_DOMAIN;
        if(replitDomain) allowedOrigins.push(`https://${replitDomain}`);
        
        if (refUrl.hostname.endsWith('.replit.dev') || refUrl.hostname.endsWith('.repl.co')) {
             allowedOrigins.push(refUrl.origin);
        }

        if (refUrl.hostname.endsWith('.cloudworkstations.dev')) {
            allowedOrigins.push(refUrl.origin);
        }
    }
    
    if (!allowedOrigins.some(origin => refUrl.origin.startsWith(origin))) {
      console.error(`[Cache Revalidation] referer origin mismatch. Expected one of [${allowedOrigins.join(', ')}], got ${refUrl.origin}`);
      return Response.json({ error: 'Invalid request: origin mismatch' }, { status: 403 });
    }
    
    // More nuanced path check:
    // Revalidation for orders and specific products is allowed from the main app (checkout flow).
    // All other revalidations must come from the admin interface.
    const isCheckoutAllowedType = type === 'orders' || (type === 'products' && specificPath);

    if (!refUrl.pathname.startsWith('/admin') && !isCheckoutAllowedType) {
      console.error(`Cache revalidation blocked: not from admin path or allowed flow. Path: ${refUrl.pathname}, Type: ${type}`);
      return Response.json({ error: 'Invalid request: not from admin interface or allowed flow' }, { status: 403 });
    }

    await revalidateDataCache(type, specificPath);
    
    console.log(`Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`);
    
    return Response.json({ 
      success: true,
      message: `Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API cache revalidation error:', error);
    return Response.json(
      { error: 'Failed to revalidate cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
