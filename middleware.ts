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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://vercel.live wss://*.vercel.live",
      "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', cspHeader);

    // Allow API routes to handle their own auth
    if (isApiRoute) {
      return response;
    }

    // Evitar bucles de redirección: solo redirigir si realmente es necesario
    // Si no está autenticado y no está en la página de login, redirigir a login
    if (!isAuth && !isAuthPage) {
      const loginUrl = new URL('/login', req.url);
      // Añadir callbackUrl para redirigir después del login
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si está autenticado y está en la página de login, redirigir al dashboard
    // Pero solo si no hay un callbackUrl (para evitar bucles)
    if (isAuth && isAuthPage) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      const redirectUrl = callbackUrl || '/dashboard';
      // Evitar redirección a la misma URL
      if (redirectUrl !== req.nextUrl.pathname) {
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    // If authenticated, check role-based access
    if (isAuth) {
      const isRegistrarPage = req.nextUrl.pathname.startsWith('/registrar');

      // Copistas y oficiales pueden acceder a registrar
      if (isRegistrarPage && token.role !== 'copista' && token.role !== 'oficial') {
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
