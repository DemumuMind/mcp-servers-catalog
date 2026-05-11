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

// Preset configs
export const rateLimits = {
  // Public API: 100 req/min per IP
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  
  // Search: 30 req/min per IP
  search: { maxRequests: 30, windowMs: 60 * 1000 },
  
  // Submit form: 5 per hour per IP
  submit: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  
  // GraphQL: 60 per minute per IP
  graphql: { maxRequests: 60, windowMs: 60 * 1000 },
  
  // Cron endpoints: 10 per minute with secret
  cron: { maxRequests: 10, windowMs: 60 * 1000 },
  
  // Image proxy: 200 per minute per IP
  proxy: { maxRequests: 200, windowMs: 60 * 1000 },
}
