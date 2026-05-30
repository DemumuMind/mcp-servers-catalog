import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const checkProxyRateLimit = apiRateLimit(rateLimits.proxy)

export async function GET(request: Request) {
  // Rate limit image proxy
  const limited = await checkProxyRateLimit(request)
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const width = parseInt(searchParams.get('w') || '0', 10)
  const quality = parseInt(searchParams.get('q') || '80', 10)

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Security: only allow known image hosts
  const allowedHosts = [
    'raw.githubusercontent.com',
    'github.com',
    'githubusercontent.com',
    'user-images.githubusercontent.com',
    'camo.githubusercontent.com',
    'img.shields.io',
    'badge.fury.io',
    'codecov.io',
    'coveralls.io',
    'snyk.io',
  ]

  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    if (!allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'mcpservers-org/1.0',
        'Accept': 'image/*,*/*',
      },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: 502 }
      )
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)

    // Optimize with sharp if it's an image and resize is requested
    if (contentType.startsWith('image/') && width > 0 && width <= 2000) {
      try {
        const pipeline = sharp(buffer).resize(width, undefined, { withoutEnlargement: true })
        if (contentType !== 'image/gif') {
          pipeline.webp({ quality })
        }
        buffer = Buffer.from(await pipeline.toBuffer())
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } catch (sharpError) {
        console.warn('Sharp optimization failed, serving original:', sharpError)
        // Fall through to original response
      }
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}
