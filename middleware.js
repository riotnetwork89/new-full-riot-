import { NextResponse } from 'next/server'

export function middleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map()
  }
  
  const key = `${ip}-${request.nextUrl.pathname}`
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = request.nextUrl.pathname.includes('/api/') ? 30 : 100
  
  const requestLog = global.rateLimitStore.get(key) || []
  const recentRequests = requestLog.filter(time => now - time < windowMs)
  
  if (recentRequests.length >= maxRequests) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  recentRequests.push(now)
  global.rateLimitStore.set(key, recentRequests)
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/chat', '/stream']
}
