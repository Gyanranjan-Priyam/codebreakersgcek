import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Handle forms subdomain: forms.cbgcek.dev
  if (host.startsWith('forms.') || host.includes('forms.cbgcek.dev')) {
    // If accessing root only (forms.cbgcek.dev or forms.cbgcek.dev/), redirect to main app login/dashboard
    if (pathname === '/' || pathname === '') {
      return NextResponse.redirect('https://app.codebreakersgcek.tech/login');
    }
    // If accessing /[formId] directly without /forms prefix, rewrite internally
    if (
      !pathname.startsWith('/forms') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/_next')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/forms${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Handle image optimization requests with better error handling
  if (pathname.startsWith('/_next/image')) {
    try {
      // Set cache headers for better performance
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      return response;
    } catch (error) {
      console.error('Image middleware error:', error);
      return new NextResponse('Image processing error', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|favicon.ico|assets).*)',
  ],
};