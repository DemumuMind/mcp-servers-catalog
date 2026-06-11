import { NextResponse } from 'next/server'
import { db, servers, ratings } from '@/lib/db'
import { eq, avg, count } from 'drizzle-orm'
import { BRAND_DOMAIN, BRAND_NAME, BRAND_SUBTITLE, brandMarkInnerSvg } from '@/lib/brand-svg'

function generateOGSVG(
  name: string,
  description: string,
  stars: number,
  rating: number,
  ratingCount: number,
  category: string
): string {
  const truncatedName = name.length > 42 ? name.slice(0, 39) + '...' : name
  const truncatedDesc = description.length > 120 ? description.slice(0, 117) + '...' : description
  const starText = stars > 0 ? `⭐ ${stars.toLocaleString()}` : ''
  const ratingText = ratingCount > 0 ? `★ ${rating.toFixed(1)} (${ratingCount})` : ''
  const categoryWidth = Math.max(160, Math.min(390, category.length * 17 + 58))
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2A1B10"/>
        <stop offset="0.48" stop-color="#18120D"/>
        <stop offset="1" stop-color="#0D0B09"/>
      </linearGradient>
      <radialGradient id="gold-glow" cx="0" cy="0" r="1" gradientTransform="matrix(620 -370 390 655 196 0)" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E6B86E" stop-opacity="0.48"/>
        <stop offset="0.45" stop-color="#8E5D24" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#18110C" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sage-glow" cx="0" cy="0" r="1" gradientTransform="matrix(370 250 -240 355 1020 118)" gradientUnits="userSpaceOnUse">
        <stop stop-color="#86A68F" stop-opacity="0.25"/>
        <stop offset="1" stop-color="#15100C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#gold-glow)"/>
    <rect width="1200" height="630" fill="url(#sage-glow)"/>
    <g opacity="0.13">
      <path d="M0 86.5H1200M0 173.5H1200M0 260.5H1200M0 347.5H1200M0 434.5H1200M0 521.5H1200" stroke="#FFF3D8"/>
      <path d="M86.5 0V630M173.5 0V630M260.5 0V630M347.5 0V630M434.5 0V630M521.5 0V630M608.5 0V630M695.5 0V630M782.5 0V630M869.5 0V630M956.5 0V630M1043.5 0V630M1130.5 0V630" stroke="#FFF3D8"/>
    </g>
    <rect x="54" y="54" width="1092" height="522" rx="42" fill="#FFF8E8" fill-opacity="0.035" stroke="#F0C579" stroke-opacity="0.23"/>
    
    <!-- Logo area -->
    <g transform="translate(78 76) scale(1.34375)">${brandMarkInnerSvg()}</g>
    <text x="190" y="111" font-family="Manrope, Inter, system-ui, sans-serif" font-size="30" font-weight="800" fill="#FFF4DA" letter-spacing="-1.5">${BRAND_NAME}</text>
    <text x="192" y="145" font-family="JetBrains Mono, ui-monospace, monospace" font-size="12" font-weight="700" fill="#D6AA60" letter-spacing="5">${BRAND_SUBTITLE}</text>
    
    <!-- Title -->
    <text x="76" y="252" font-family="Manrope, Inter, system-ui, sans-serif" font-size="62" font-weight="800" fill="#FFF4DA" letter-spacing="-3">${escapeXML(truncatedName)}</text>
    
    <!-- Description -->
    <text x="78" y="322" font-family="Manrope, Inter, system-ui, sans-serif" font-size="29" font-weight="500" fill="#D8C7A8">${escapeXML(truncatedDesc)}</text>
    
    <!-- Category badge -->
    <rect x="76" y="410" width="${categoryWidth}" height="52" rx="18" fill="#FFF6E5" fill-opacity="0.08" stroke="#F0C579" stroke-opacity="0.35"/>
    <text x="102" y="444" font-family="JetBrains Mono, ui-monospace, monospace" font-size="22" font-weight="700" fill="#F0C579" letter-spacing="2">${escapeXML(category.toUpperCase())}</text>
    
    <!-- Stats -->
    <text x="76" y="528" font-family="JetBrains Mono, ui-monospace, monospace" font-size="31" font-weight="700" fill="#F0C579">${starText}</text>
    ${ratingText ? `<text x="${starText ? 284 : 76}" y="528" font-family="JetBrains Mono, ui-monospace, monospace" font-size="31" font-weight="700" fill="#F0C579">${ratingText}</text>` : ''}
    
    <!-- Footer -->
    <text x="1128" y="528" font-family="JetBrains Mono, ui-monospace, monospace" font-size="18" font-weight="700" fill="#D6AA60" text-anchor="end" letter-spacing="3">${BRAND_DOMAIN}</text>
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
  const fullSlug = `${owner}/${repo}`

  const server = await db.select({
    name: servers.name,
    description: servers.description,
    stars: servers.stars,
    category: servers.category,
    id: servers.id,
  }).from(servers).where(eq(servers.fullSlug, fullSlug)).get()

  if (!server) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const ratingAgg = await db.select({
    avgValue: avg(ratings.value),
    countValue: count(ratings.value),
  }).from(ratings).where(eq(ratings.serverId, server.id)).get()

  const svg = generateOGSVG(
    server.name,
    server.description,
    server.stars,
    ratingAgg?.avgValue ? Number(ratingAgg.avgValue) : 0,
    ratingAgg?.countValue ?? 0,
    server.category
  )

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
