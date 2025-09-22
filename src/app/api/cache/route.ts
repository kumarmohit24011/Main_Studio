
import { NextRequest } from 'next/server';
import { manualCacheRevalidation } from '@/lib/cache-revalidation';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('secret');
  
  // Check for secret token to prevent unauthorized cache refresh
  if (secret !== process.env.REVALIDATE_TOKEN) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }
  
  try {
    const tag = request.nextUrl.searchParams.get('tag');
    const path = request.nextUrl.searchParams.get('path');
    
    // Support both query params and JSON body
    let paths: string[] = [];
    let tags: string[] = [];
    
    if (path) {
      paths = [path];
    }
    if (tag) {
      tags = [tag];
    }
    
    // Try to get from JSON body if not in query params
    if (!path && !tag) {
      try {
        const body = await request.json();
        paths = body.paths || ['/'];
        tags = body.tags || [];
      } catch {
        // Default revalidation if no specific instructions
        paths = ['/', '/products', '/admin'];
      }
    }
    
    await manualCacheRevalidation(paths, tags);
    
    return Response.json({ 
      revalidated: true, 
      now: Date.now(),
      message: `Successfully revalidated paths: ${paths.join(', ')}, tags: ${tags.join(', ')}`
    });
  } catch (err) {
    console.error('Cache revalidation error:', err);
    return Response.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
