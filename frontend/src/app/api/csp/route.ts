import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.googleusercontent.com https://*.google-analytics.com https://*.googleapis.com https://*.gstatic.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    connect-src 'self' 
      https://*.firebase.googleapis.com 
      https://*.google-analytics.com 
      https://*.googleapis.com 
      https://*.firebaseio.com 
      wss://*.firebaseio.com 
      https://firestore.googleapis.com 
      https://*.cloudfunctions.net;
    frame-ancestors 'none';
    media-src 'self';
    manifest-src 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  return new NextResponse(null, {
    headers: {
      'Content-Security-Policy': cspHeader,
    },
  });
}
