import { next } from '@vercel/functions';

export const config = {
  // Skip static assets under /resources — those filenames are case-sensitive
  // on disk (e.g. Me.jpg, CHORIDOR_Logo.png) and must not be lowercased.
  matcher: '/((?!resources/).*)',
};

export default function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Anything with a file extension is a static asset (css/js/img/font/etc.);
  // only page routes (extensionless) should be case-normalized.
  if (/\.[^/]+$/.test(pathname)) {
    return next();
  }

  const lower = pathname.toLowerCase();
  if (pathname !== lower) {
    url.pathname = lower;
    return Response.redirect(url, 308);
  }

  return next();
}
