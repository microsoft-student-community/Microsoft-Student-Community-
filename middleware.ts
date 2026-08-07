import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "./utils/rateLimiter";

// CORS configuration: Load allowed origins from environment or default to local/production values
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
    'https://mscsrmap.edu.in',
    'https://msc-srmap.web.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://msc-srmap.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL || ''
  ].filter(Boolean);

export async function middleware(request: NextRequest) {
  try {
    const currentPath = request.nextUrl.pathname;
    const origin = request.headers.get('origin');
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
    const isApiRequest = currentPath.startsWith('/api/');

    if (isApiRequest && origin && !isAllowedOrigin) {
      return new NextResponse(JSON.stringify({ error: 'CORS policy violation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Vary': 'Origin' }
      });
    }

    if (request.method === 'OPTIONS') {
      if (!origin || !isAllowedOrigin) {
        return new NextResponse(JSON.stringify({ error: 'CORS policy violation' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Vary': 'Origin' }
        });
      }

      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '600',
          'Vary': 'Origin',
        },
      });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;
      const session = user ? { user } : null;

      if (origin && isAllowedOrigin) {
        supabaseResponse.headers.set('Access-Control-Allow-Origin', origin);
        supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch');
        supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        supabaseResponse.headers.set('Vary', 'Origin');
      }

      // Rate Limiting
      const clientIp = getClientIp(request);
      const rateLimitKey = session ? `user:${session.user.id}` : `ip:${clientIp}`;

      let limiterName = 'default';
      let windowMs = parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW_MS || '60000', 10);
      let max = parseInt(process.env.RATE_LIMIT_DEFAULT_MAX_REQUESTS || '100', 10);

      if (currentPath.startsWith('/login') || request.headers.get('next-action')?.includes('login') || currentPath.includes('password_actions')) {
        limiterName = 'auth';
        windowMs = parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '60000', 10);
        max = parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '10', 10);
      } else if (currentPath.startsWith('/events') || currentPath.includes('actions')) {
        limiterName = 'api';
        windowMs = parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '60000', 10);
        max = parseInt(process.env.RATE_LIMIT_API_MAX_REQUESTS || '30', 10);
      }

      const rateLimitResult = await checkRateLimit(limiterName, rateLimitKey, windowMs, max);

      supabaseResponse.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      supabaseResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      supabaseResponse.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

      if (!rateLimitResult.success) {
        const errorBody = {
          error: 'Too Many Requests',
          message: 'You have exceeded your request quota. Please try again later.'
        };
        return new NextResponse(JSON.stringify(errorBody), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        });
      }

      // Protection & Auth Guards
      const isProtected = currentPath.startsWith('/admin') ||
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/onboarding') ||
        currentPath.startsWith('/core-dashboard');

      const isApiOrAction = request.headers.get('accept')?.includes('application/json') ||
        request.headers.get('x-action') !== null ||
        request.headers.get('next-action') !== null ||
        currentPath.startsWith('/api/');

      if (isProtected) {


        if (!session) {
          if (isApiOrAction) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized: Missing session' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return NextResponse.redirect(new URL('/login', request.url));
        }

        const { data: profile } = await supabase
          .from('member_profiles')
          .select('role, is_onboarded')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const { role, is_onboarded } = profile;
          const exemptFromOnboarding = role === 'admin';

          if (currentPath.startsWith('/onboarding')) {
            if (is_onboarded || exemptFromOnboarding) {
              return NextResponse.redirect(new URL(role === 'admin' || role === 'core_member' ? '/admin' : '/dashboard', request.url));
            }
          } else {
            if (!is_onboarded && !exemptFromOnboarding) {
              return NextResponse.redirect(new URL('/onboarding', request.url));
            }
          }

          if (currentPath.startsWith('/admin') && role !== 'admin' && role !== 'core_member') {
            if (isApiOrAction) {
              return new NextResponse(JSON.stringify({ error: 'Forbidden: Insufficient privileges' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return NextResponse.redirect(new URL('/login?message=Unauthorized', request.url));
          }
        }
      }
    }

    const csp = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
      img-src 'self' blob: data: https://*.supabase.co https://avatars.githubusercontent.com https://upload.wikimedia.org;
      font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-src 'self' https://checkout.razorpay.com;
    `.replace(/\s{2,}/g, ' ').trim();

    supabaseResponse.headers.set('Content-Security-Policy', csp);
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
    supabaseResponse.headers.set('X-Frame-Options', 'DENY');
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    supabaseResponse.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=(self), usb=()');
    supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    supabaseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'off');
    supabaseResponse.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    supabaseResponse.headers.set('Origin-Agent-Cluster', '?1');
    if (request.nextUrl.protocol === 'https:') {
      supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return supabaseResponse;
  } catch (err) {
    console.error("Middleware caught error:", err);

    // Safely fallback by redirecting to login if trying to access protected routes during an error state
    const currentPath = request.nextUrl.pathname;
    const isProtected = currentPath.startsWith('/admin') ||
      currentPath.startsWith('/dashboard') ||
      currentPath.startsWith('/onboarding') ||
      currentPath.startsWith('/core-dashboard');

    if (isProtected) {
      return NextResponse.redirect(new URL('/login?error=system_error', request.url));
    }

    // Allow public routes to proceed even if Supabase session checks fail
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
