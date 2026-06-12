import { NextResponse } from 'next/server'
import { rateLimit, getClientIP } from './rate-limit'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  identifier?: (req: Request) => string
}

export function apiRateLimit(config: RateLimitConfig = { maxRequests: 100, windowMs: 60 * 1000 }) {
  return async function checkRateLimit(request: Request): Promise<NextResponse | null> {
    const ip = await getClientIP(request)
    const identifier = config.identifier 
      ? config.identifier(request)
      : `api:${ip}:${request.url}`
    
    const result = await rateLimit(identifier, config.maxRequests, config.windowMs)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((result.reset - Date.now()) / 1000) },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          }
        }
      )
    }
    
    return null
  }
}

export const rateLimits = {
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  
  search: { maxRequests: 30, windowMs: 60 * 1000 },
  
  submit: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  
  graphql: { maxRequests: 60, windowMs: 60 * 1000 },
  
  cron: { maxRequests: 10, windowMs: 60 * 1000 },
  
  proxy: { maxRequests: 200, windowMs: 60 * 1000 },
}
