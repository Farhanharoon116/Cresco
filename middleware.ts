import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const token = request.cookies.get('cresco_session')?.value
  let user = null

  if (token) {
    user = await verifyJWT(token)
  }

  const pathname = request.nextUrl.pathname

  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('cresco_admin_session')?.value
    const adminSession = adminToken ? await verifyJWT(adminToken) : null
    
    if (!adminSession || adminSession.id !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated admins away from admin login
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('cresco_admin_session')?.value
    const adminSession = adminToken ? await verifyJWT(adminToken) : null
    if (adminSession && adminSession.id === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    // Admin login is public, so allow access
    return response
  }

  // Public routes that don't need auth
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/admin/login')

  // Protected routes — redirect to login if not authenticated
  if (!isPublicRoute && !user && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
