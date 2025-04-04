import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Désactivation temporaire de la vérification d'authentification
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};