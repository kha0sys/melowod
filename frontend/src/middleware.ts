import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();
  
  // Add security headers
  const headers = response.headers;

  // Permitir todas las conexiones durante el desarrollo
  if (process.env.NODE_ENV === 'development') {
    return response;
  }

  // Cache Control
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' 
      https://*.firebaseapp.com 
      https://*.googleapis.com 
      https://identitytoolkit.googleapis.com 
      https://securetoken.googleapis.com 
      wss://*.firebaseio.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();

  headers.set('Content-Security-Policy', cspHeader);
  
  // X-Content-Type-Options
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Strict Transport Security
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // XSS Protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Set secure cookies
  const cookieHeader = response.headers.get('Set-Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(',').map(cookie => {
      if (!cookie.includes('Secure')) {
        return `${cookie}; Secure; SameSite=Strict; HttpOnly`;
      }
      return cookie;
    });
    headers.set('Set-Cookie', cookies.join(','));
  }

  // Cross-Origin-Opener-Policy
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Embedder-Policy
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin-Resource-Policy
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Permissions-Policy
  headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
