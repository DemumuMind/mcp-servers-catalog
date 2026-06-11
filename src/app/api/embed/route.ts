import { NextResponse } from 'next/server'
import { db, servers, ratings } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing server id' }, { status: 400 })
  }

  const server = await db.select().from(servers).where(eq(servers.id, id)).limit(1).then(r => r[0] ?? null)

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const serverRatings = await db.select({ value: ratings.value }).from(ratings).where(eq(ratings.serverId, id))

  const avgRating = serverRatings.length > 0
    ? serverRatings.reduce((s: number, r: any) => s + r.value, 0) / serverRatings.length
    : 0

  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      max-width: 100%;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #18181b;
        border-color: #27272a;
        color: #fafafa;
      }
      .tag { background: #27272a; color: #a1a1aa; }
      .stats { color: #a1a1aa; }
      .description { color: #71717a; }
    }
    a { text-decoration: none; color: inherit; }
    .card { padding: 16px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .title { font-size: 16px; font-weight: 600; line-height: 1.4; }
    .description { font-size: 13px; color: #6b7280; margin-top: 6px; line-height: 1.5; }
    .footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
    @media (prefers-color-scheme: dark) {
      .footer { border-color: #27272a; }
    }
    .stats { display: flex; gap: 12px; font-size: 13px; color: #6b7280; }
    .stat { display: flex; align-items: center; gap: 4px; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: #fef3c7;
      color: #92400e;
    }
    @media (prefers-color-scheme: dark) {
      .badge { background: #451a03; color: #fbbf24; }
    }
    .tag {
      display: inline-flex;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      background: #f3f4f6;
      color: #6b7280;
      margin-right: 4px;
    }
    .logo { font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <a href="${baseUrl}/ru/servers/${server.owner}/${server.repo}" target="_blank">
    <div class="card">
      <div class="header">
        <div>
          <div class="title">${escapeHtml(server.name)} ${server.isOfficial ? '<span class="badge">Official</span>' : ''}</div>
          <div class="description">${escapeHtml(server.description)}</div>
          ${server.tags.length > 0 ? `<div style="margin-top:8px">${server.tags.slice(0, 3).map((t: any) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div>
      <div class="footer">
        <div class="stats">
          <div class="stat">⭐ ${server.stars.toLocaleString()}</div>
          ${avgRating > 0 ? `<div class="stat">★ ${avgRating.toFixed(1)}</div>` : ''}
        </div>
        <div class="logo">mcpservers.org</div>
      </div>
    </div>
  </a>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
