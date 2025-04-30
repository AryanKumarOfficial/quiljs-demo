import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of routes that don't require authentication
const publicPaths = ['/', '/login', '/register', '/api/auth', '/api/register'];

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Check if the path is public (no auth needed)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/register')
  );

  // Skip auth check for public paths and static assets
  if (isPublicPath || pathname.match(/\.(js|css|ico|png|jpg|svg|webp)$/)) {
    return NextResponse.next();
  }

  try {
    // Verify authentication token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token and trying to access a protected route
    if (!token) {
      // Return 401 Unauthorized for API routes
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'auth_required' }, 
          { status: 401 }
        );
      }
      
      // Redirect to login for page routes with a reason
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      url.searchParams.set('reason', 'unauthenticated');
      return NextResponse.redirect(url);
    }
    
    // Check for token expiration (optional additional check)
    const tokenExpiry = token.exp as number | undefined;
    if (tokenExpiry && Date.now() >= tokenExpiry * 1000) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Session expired', code: 'session_expired' },
          { status: 401 }
        );
      }
      
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      url.searchParams.set('reason', 'expired');
      return NextResponse.redirect(url);
    }
    
    // User is authenticated, continue
    return NextResponse.next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle errors gracefully
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Authentication error', code: 'auth_error' }, 
        { status: 500 }
      );
    }
    
    // Redirect to login on auth errors
    const url = new URL('/login', request.url);
    url.searchParams.set('reason', 'error');
    return NextResponse.redirect(url);
  }
}

// Configure matcher for routes that should be checked
export const config = {
  // Check all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};