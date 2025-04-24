import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];
// List of API routes that don't require authentication
const publicApiRoutes = ['/api/auth', '/api/register'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  
  // Check if the route is an API route
  const isApiRoute = pathname.startsWith('/api');
  
  // Allow public routes and API routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/auth/') || pathname.startsWith('/api/register')
  );
  
  // If not authenticated and trying to access a protected route
  if (!token && !isPublicRoute) {
    if (isApiRoute) {
      // Return unauthorized for API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      // Redirect to login for page routes
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure matcher for routes that should be checked
export const config = {
  // Exclude static files, auth routes, and public routes from middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};