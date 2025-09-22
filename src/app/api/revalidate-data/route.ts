
import { NextRequest } from 'next/server';
import { revalidateDataCache } from '@/lib/cache-revalidation';

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

export async function POST(request: NextRequest) {
  try {
    // Same-origin protection: ensure request comes from admin interface
    const referer = request.headers.get('referer');
    const requestOrigin = new URL(request.url).origin;
    
    // Verify request originates from admin interface using Referer header
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
    
    // Ensure request comes from same origin and admin path
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const allowedOrigins = isDevelopment 
      ? [
          'http://localhost:5000', 
          'http://0.0.0.0:5000',
          'http://127.0.0.1:5000',
        ] 
      : [
          'https://studio--redbow-24723.us-central1.hosted.app',
          'https://studio--redbow-24723.asia-east1.hosted.app'
        ];

    // Add dynamic dev origins for environments like Replit or Cloud Workstations
    if (isDevelopment) {
        const replitDomain = process.env.REPLIT_DEV_DOMAIN;
        if(replitDomain) allowedOrigins.push(`https://${replitDomain}`);
        
        // Allow any replit dev domain
        if (refUrl.hostname.endsWith('.replit.dev') || refUrl.hostname.endsWith('.repl.co')) {
             allowedOrigins.push(refUrl.origin);
        }
         // Allow any cloud workstation domain
        if (refUrl.hostname.endsWith('.cloudworkstations.dev')) {
            allowedOrigins.push(refUrl.origin);
        }
    }
    
    if (!allowedOrigins.some(origin => refUrl.origin.startsWith(origin))) {
      console.error(`[Cache Revalidation] referer origin mismatch. Expected one of [${allowedOrigins.join(', ')}], got ${refUrl.origin}`);
      return Response.json({ error: 'Invalid request: origin mismatch' }, { status: 403 });
    }
    
    if (!refUrl.pathname.startsWith('/admin')) {
      console.error(`Cache revalidation blocked: not from admin path. Path: ${refUrl.pathname}`);
      return Response.json({ error: 'Invalid request: not from admin interface' }, { status: 403 });
    }

    // Ensure proper content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const { type, specificPath }: { type: RevalidationType; specificPath?: string } = await request.json();
    
    if (!type) {
      return Response.json({ error: 'Revalidation type is required' }, { status: 400 });
    }

    await revalidateDataCache(type, specificPath);
    
    console.log(`Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`);
    
    return Response.json({ 
      success: true,
      message: `Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin cache revalidation error:', error);
    return Response.json(
      { error: 'Failed to revalidate cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
