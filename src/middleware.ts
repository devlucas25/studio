
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname, searchParams } = request.nextUrl
  const isTestMode = searchParams.get('mode') === 'test';

  // Allow access in test mode
  if (isTestMode) {
    return response;
  }

  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/interviewer'))) {
    const loginUrl = pathname.startsWith('/admin') ? '/login/admin' : '/login/interviewer';
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  if (session && pathname.startsWith('/login')) {
    // Get user role and redirect to appropriate dashboard
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (userRole) {
      const dashboardPath = userRole.role === 'administrator'
        ? '/admin/dashboard'
        : '/interviewer/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  }

  // Role-based access control for admin and interviewer routes
  if (session) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (userRole) {
      // Prevent interviewers from accessing admin routes
      if (pathname.startsWith('/admin') && userRole.role !== 'administrator') {
        return NextResponse.redirect(new URL('/interviewer/dashboard', request.url))
      }

      // Prevent admins from accessing interviewer routes (optional, based on requirements)
      if (pathname.startsWith('/interviewer') && userRole.role !== 'interviewer') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    } else {
      // If no role found, redirect to appropriate login or handle accordingly
      if (pathname.startsWith('/admin') || pathname.startsWith('/interviewer')) {
        return NextResponse.redirect(new URL('/login/admin', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/interviewer/:path*',
    '/login/:path*',
  ],
}
