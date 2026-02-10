import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('peerlypay_user')?.value;

  if (!userCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    const path = request.nextUrl.pathname;

    // Market Maker routes — block freelancers
    if (path.startsWith('/pro') && user.role !== 'MARKET_MAKER') {
      return NextResponse.redirect(new URL('/quick-trade', request.url));
    }

    // Freelancer routes — block market makers
    if (path === '/quick-trade' && user.role !== 'FREELANCER') {
      return NextResponse.redirect(new URL('/pro', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quick-trade', '/pro/:path*'],
};
