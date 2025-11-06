import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');

    // Crear respuesta con headers de seguridad
    const response = NextResponse.next();
    
    // Headers de seguridad
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    
    // Content Security Policy
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', cspHeader);

    // Allow API routes to handle their own auth
    if (isApiRoute) {
      return response;
    }

    // If not authenticated and not on auth page, redirect to login
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If authenticated and on auth page, redirect based on role
    if (isAuth && isAuthPage) {
      // Todos van al dashboard después de login
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If authenticated, check role-based access
    if (isAuth) {
      const isRegistrarPage = req.nextUrl.pathname.startsWith('/registrar');

      // Copias y oficiales pueden acceder a registrar
      if (isRegistrarPage && token.role !== 'copias' && token.role !== 'oficial') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isApiRoute = req.nextUrl.pathname.startsWith('/api');
        const isAuthPage = req.nextUrl.pathname.startsWith('/login');

        // Allow API routes and auth pages
        if (isApiRoute || isAuthPage) {
          return true;
        }

        // For protected pages, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
