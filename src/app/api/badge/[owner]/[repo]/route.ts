import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function generateBadgeSVG(
  label: string,
  message: string,
  color: string = '#000000'
): string {
  const labelWidth = label.length * 7 + 10
  const messageWidth = message.length * 7 + 10
  const totalWidth = labelWidth + messageWidth

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
    <path fill="${color}" d="M${labelWidth} 0h${messageWidth}v20H${labelWidth}z"/>
    <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + messageWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${labelWidth + messageWidth / 2}" y="14">${message}</text>
  </g>
</svg>`
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
      stars: true,
      category: true,
      isOfficial: true,
    },
  })

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const searchParams = new URL(request.url).searchParams
  const type = searchParams.get('type') || 'default'

  let label: string
  let message: string
  let color: string

  switch (type) {
    case 'stars':
      label = '⭐ stars'
      message = server.stars.toString()
      color = '#ffc107'
      break
    case 'official':
      label = 'MCP'
      message = server.isOfficial ? 'official ✓' : 'community'
      color = server.isOfficial ? '#28a745' : '#6c757d'
      break
    case 'category':
      label = 'MCP'
      message = server.category
      color = '#007bff'
      break
    default:
      label = 'MCP'
      message = 'Listed'
      color = '#000000'
  }

  const svg = generateBadgeSVG(label, message, color)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
