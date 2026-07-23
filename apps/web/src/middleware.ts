import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * LegalOS Route Protection Middleware
 *
 * Protects authenticated routes by checking for accessToken cookie/header.
 * Public routes (landing, login, onboarding) are always accessible.
 *
 * 2026 Standard: All SPA apps must have server-side route guards
 * to prevent unauthorized page access even without API calls.
 */

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/onboarding',
  '/portal',        // Client portal has its own auth flow
];

// Static assets and API routes to skip
const SKIP_PREFIXES = [
  '/_next',
  '/api',
  '/icons',
  '/manifest.json',
  '/service-worker.js',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal Next.js routes
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  // In a real implementation, this would verify JWT signature server-side
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)',
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
