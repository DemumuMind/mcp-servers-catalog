import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function generateOGSVG(
  name: string,
  description: string,
  stars: number,
  rating: number,
  ratingCount: number,
  category: string
): string {
  const truncatedDesc = description.length > 120 ? description.slice(0, 117) + '...' : description
  const starText = stars > 0 ? `⭐ ${stars.toLocaleString()}` : ''
  const ratingText = ratingCount > 0 ? `★ ${rating.toFixed(1)} (${ratingCount})` : ''
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f0f0f"/>
        <stop offset="100%" style="stop-color:#1a1a2e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    
    <!-- Logo area -->
    <rect x="60" y="60" width="80" height="80" rx="16" fill="#fbbf24"/>
    <text x="100" y="115" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="#0f0f0f" text-anchor="middle">MCP</text>
    
    <!-- Title -->
    <text x="60" y="220" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${escapeXML(name)}</text>
    
    <!-- Description -->
    <text x="60" y="300" font-family="system-ui, sans-serif" font-size="32" fill="#a1a1aa">${escapeXML(truncatedDesc)}</text>
    
    <!-- Category badge -->
    <rect x="60" y="420" height="48" rx="24" fill="#3f3f46"/>
    <text x="84" y="452" font-family="system-ui, sans-serif" font-size="24" fill="#ffffff">${escapeXML(category)}</text>
    
    <!-- Stats -->
    <text x="60" y="540" font-family="system-ui, sans-serif" font-size="36" fill="#fbbf24">${starText}</text>
    ${ratingText ? `<text x="${starText ? 280 : 60}" y="540" font-family="system-ui, sans-serif" font-size="36" fill="#fbbf24">${ratingText}</text>` : ''}
    
    <!-- Footer -->
    <text x="1140" y="580" font-family="system-ui, sans-serif" font-size="24" fill="#71717a" text-anchor="end">mcpservers.org</text>
  </svg>`
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params

  const server = await prisma.server.findUnique({
    where: { fullSlug: `${owner}/${repo}` },
    select: {
      name: true,
      description: true,
      stars: true,
      category: true,
    },
  })

  if (!server) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Get rating
  const fullServer = await prisma.server.findUnique({
    where: { fullSlug: `${owner}/${repo}` },
    select: { id: true },
  })
  
  const ratingAgg = fullServer
    ? await prisma.rating.aggregate({
        where: { serverId: fullServer.id },
        _avg: { value: true },
        _count: { value: true },
      })
    : { _avg: { value: 0 }, _count: { value: 0 } }

  const svg = generateOGSVG(
    server.name,
    server.description,
    server.stars,
    ratingAgg._avg.value || 0,
    ratingAgg._count.value,
    server.category
  )

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
