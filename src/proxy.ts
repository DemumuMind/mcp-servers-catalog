import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'ru',
})

function logRequest(request: NextRequest, response: NextResponse, startTime: number) {
  const duration = Date.now() - startTime
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const method = request.method
  const url = request.url
  const status = response.status

  // Log to console (can be replaced with structured logging service)
  console.log(`[${new Date().toISOString()}] ${method} ${url} status=${status} duration=${duration}ms ip=${ip}`)
}

function generateRandomHex(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getCsrfToken(request: NextRequest): string {
  const existing = request.cookies.get('csrf-token')?.value
  if (existing && existing.length === 64) return existing
  return generateRandomHex(32)
}

function assignABVariant(request: NextRequest, response: NextResponse) {
  // A/B test: homepage sorting algorithm
  // Variants: 'featured' (control) vs 'trending' (test)
  const abCookie = request.cookies.get('ab-home-sort')
  if (!abCookie) {
    const variant = crypto.randomUUID().charCodeAt(0) % 2 === 0 ? 'featured' : 'trending'
    response.cookies.set('ab-home-sort', variant, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    // Also set a header so Server Components can read it without cookies()
    response.headers.set('x-ab-variant', variant)
  } else {
    response.headers.set('x-ab-variant', abCookie.value)
  }
}

export default function middleware(request: NextRequest) {
  const startTime = Date.now()
  const pathname = request.nextUrl.pathname

  // CSRF protection: always set/update csrf-token cookie
  const csrfToken = getCsrfToken(request)

  // Redirects for non-locale paths
  const redirects: Record<string, string> = {
    '/login': '/ru/login',
    '/register': '/ru/register',
    '/submit': '/ru/submit',
    '/bookmarks': '/ru/bookmarks',
    '/all': '/ru/all',
    '/official': '/ru/official',
    '/clients': '/ru/clients',
    '/remote-mcp-servers': '/ru/remote-mcp-servers',
    '/profile': '/ru/profile',
    '/compare': '/ru/compare',
    '/ecosystem': '/ru/ecosystem',
    '/whats-new': '/ru/whats-new',
    '/rankings': '/ru/rankings',
  }

  if (redirects[pathname]) {
    const response = NextResponse.redirect(new URL(redirects[pathname], request.url))
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
    })
    assignABVariant(request, response)
    logRequest(request, response, startTime)
    return response
  }

  // Profile subpaths
  if (pathname.startsWith('/profile/')) {
    const response = NextResponse.redirect(new URL(`/ru${pathname}`, request.url))
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
    })
    assignABVariant(request, response)
    logRequest(request, response, startTime)
    return response
  }

  // Server detail pages
  if (pathname.match(/^\/servers\/[^\/]+\/[^\/]+$/)) {
    const response = NextResponse.redirect(new URL(`/ru${pathname}`, request.url))
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
    })
    assignABVariant(request, response)
    logRequest(request, response, startTime)
    return response
  }

  // Skip locale middleware for admin routes (they are locale-free)
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
    })
    assignABVariant(request, response)
    logRequest(request, response, startTime)
    return response
  }

  const response = intlMiddleware(request)
  response.cookies.set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
  })
  assignABVariant(request, response as NextResponse)
  logRequest(request, response as NextResponse, startTime)
  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
