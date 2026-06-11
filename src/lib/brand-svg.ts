type LocaleKey = 'ru' | 'en'

const text: Record<LocaleKey, {
  catalogTitle: string
  catalogSubtitle: string
  findServer: string
  catalogIntegrations: string
  openCatalog: string
  addServer: string
  /** Narrow layout splits headline across two lines */
  findLine1: string
  findLine2: string
  /** Narrow layout splits subtitle across two lines */
  integrationsLine1: string
  integrationsLine2: string
}> = {
  ru: {
    catalogTitle: 'Каталог MCP‑серверов',
    catalogSubtitle: 'поиск, рейтинги и интеграции для вашего AI‑стека',
    findServer: 'Найдите MCP‑сервер',
    catalogIntegrations: 'каталог интеграций, клиентов и remote endpoints',
    openCatalog: 'Открыть каталог',
    addServer: 'Добавить сервер',
    findLine1: 'Найдите',
    findLine2: 'MCP‑сервер',
    integrationsLine1: 'каталог интеграций, клиентов',
    integrationsLine2: 'и remote endpoints',
  },
  en: {
    catalogTitle: 'MCP Server Catalog',
    catalogSubtitle: 'search, ratings & integrations for your AI stack',
    findServer: 'Find an MCP Server',
    catalogIntegrations: 'catalog of integrations, clients & remote endpoints',
    openCatalog: 'Open Catalog',
    addServer: 'Add Server',
    findLine1: 'Find an',
    findLine2: 'MCP Server',
    integrationsLine1: 'catalog of integrations, clients',
    integrationsLine2: '& remote endpoints',
  },
}

function t(locale: string): (typeof text)['ru'] {
  return locale === 'en' ? text.en : text.ru
}

export const BRAND_NAME = 'MCP Servers'
export const BRAND_SUBTITLE = 'PROTOCOL CATALOG'
export const BRAND_DOMAIN = 'MCPSERVERS.ORG'

export const BRAND_COLORS = {
  cream: '#FFF4DA',
  mutedCream: '#D8C7A8',
  gold: '#F0C579',
  goldLight: '#F7D99B',
  amber: '#C88632',
  brown: '#6E3F17',
  espresso: '#201208',
  ink: '#080706',
  paper: '#F8F1E1',
} as const

export function brandMarkInnerSvg() {
  return `
  <defs>
    <linearGradient id="mcp-brand-shell" x1="8" y1="5" x2="58" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#3A2516"/><stop offset="0.5" stop-color="#1C120C"/><stop offset="1" stop-color="#080706"/></linearGradient>
    <linearGradient id="mcp-brand-plate" x1="11" y1="8" x2="52" y2="55" gradientUnits="userSpaceOnUse"><stop stop-color="#C88632"/><stop offset="0.45" stop-color="#6E3F17"/><stop offset="1" stop-color="#201208"/></linearGradient>
    <radialGradient id="mcp-brand-ambient" cx="0" cy="0" r="1" gradientTransform="matrix(26 -24 27 29 18 12)" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE4AA" stop-opacity="0.45"/><stop offset="0.48" stop-color="#C88632" stop-opacity="0.12"/><stop offset="1" stop-color="#080706" stop-opacity="0"/></radialGradient>
    <linearGradient id="mcp-brand-line" x1="13" y1="42" x2="51" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF1CB"/><stop offset="0.48" stop-color="#F0C579"/><stop offset="1" stop-color="#A56C29"/></linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="61" height="61" rx="18.5" fill="url(#mcp-brand-shell)"/>
  <rect x="4.5" y="4.5" width="55" height="55" rx="16" fill="url(#mcp-brand-plate)"/>
  <rect x="4.5" y="4.5" width="55" height="55" rx="16" fill="url(#mcp-brand-ambient)"/>
  <rect x="6.3" y="6.3" width="51.4" height="51.4" rx="14.4" fill="none" stroke="#F5D08F" stroke-opacity="0.32" stroke-width="1.15"/>
  <rect x="10" y="10" width="44" height="44" rx="11.5" fill="#120B07" fill-opacity="0.18" stroke="#FFF2D2" stroke-opacity="0.08"/>
  <path d="M14.8 41.2L22.8 22.8L32 39.8L41.2 22.8L49.2 41.2" fill="none" stroke="#070403" stroke-opacity="0.38" stroke-width="6.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.8 41.2L22.8 22.8L32 39.8L41.2 22.8L49.2 41.2" fill="none" stroke="url(#mcp-brand-line)" stroke-width="3.45" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.8 41.2H11.8M49.2 41.2H52.2M32 39.8V47.2M22.8 22.8V16.8M41.2 22.8V16.8" fill="none" stroke="#F0C579" stroke-width="1.45" stroke-linecap="round" opacity="0.68"/>
  <circle cx="14.8" cy="41.2" r="3.8" fill="#F7D99B"/><circle cx="14.8" cy="41.2" r="1.71" fill="#27150B"/><circle cx="14.8" cy="41.2" r="0.684" fill="#FFF0C9" fill-opacity="0.55"/>
  <circle cx="22.8" cy="22.8" r="3.65" fill="#F7D99B"/><circle cx="22.8" cy="22.8" r="1.6425" fill="#27150B"/><circle cx="22.8" cy="22.8" r="0.657" fill="#FFF0C9" fill-opacity="0.55"/>
  <circle cx="32" cy="39.8" r="3.75" fill="#F7D99B"/><circle cx="32" cy="39.8" r="1.6875" fill="#27150B"/><circle cx="32" cy="39.8" r="0.675" fill="#FFF0C9" fill-opacity="0.55"/>
  <circle cx="41.2" cy="22.8" r="3.65" fill="#F7D99B"/><circle cx="41.2" cy="22.8" r="1.6425" fill="#27150B"/><circle cx="41.2" cy="22.8" r="0.657" fill="#FFF0C9" fill-opacity="0.55"/>
  <circle cx="49.2" cy="41.2" r="3.8" fill="#F7D99B"/><circle cx="49.2" cy="41.2" r="1.71" fill="#27150B"/><circle cx="49.2" cy="41.2" r="0.684" fill="#FFF0C9" fill-opacity="0.55"/>
  <rect x="18.9" y="11.6" width="7.8" height="6" rx="2.2" fill="#23140B" stroke="#F7D99B" stroke-width="1.12"/>
  <rect x="37.3" y="11.6" width="7.8" height="6" rx="2.2" fill="#23140B" stroke="#F7D99B" stroke-width="1.12"/>
  <rect x="28" y="47" width="8" height="5.6" rx="2" fill="#23140B" stroke="#DDA558" stroke-width="1.08" opacity="0.9"/>
`
}

export function brandMarkSvg(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${brandMarkInnerSvg()}</svg>`
}

export function maskableBrandMarkSvg(size = 512) {
  const pad = size * 0.155
  const markSize = size - pad * 2
  const scale = markSize / 64

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="mask-bg-a" cx="0" cy="0" r="1" gradientTransform="matrix(${size * 0.7} ${size * 0.44} -${size * 0.44} ${size * 0.7} ${size * 0.18} ${size * 0.12})" gradientUnits="userSpaceOnUse"><stop stop-color="#F3CB7D" stop-opacity="0.34"/><stop offset="0.55" stop-color="#DDA558" stop-opacity="0.12"/><stop offset="1" stop-color="#F8F1E1" stop-opacity="0"/></radialGradient>
    <radialGradient id="mask-bg-b" cx="0" cy="0" r="1" gradientTransform="matrix(${size * 0.55} ${size * 0.34} -${size * 0.34} ${size * 0.55} ${size * 0.82} ${size * 0.86})" gradientUnits="userSpaceOnUse"><stop stop-color="#5B3614" stop-opacity="0.16"/><stop offset="1" stop-color="#F8F1E1" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#F8F1E1"/><rect width="${size}" height="${size}" fill="url(#mask-bg-a)"/><rect width="${size}" height="${size}" fill="url(#mask-bg-b)"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">${brandMarkInnerSvg()}</g>
</svg>`
}

export function miniBrandMarkSvg(size = 64) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="60" height="60" rx="18" fill="#1c120c"/><rect x="6" y="6" width="52" height="52" rx="15" fill="#7a4618"/><path d="M14.8 41.2 22.8 22.8 32 39.8 41.2 22.8 49.2 41.2" fill="none" stroke="#f0c579" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14.8" cy="41.2" r="4" fill="#f7d99b"/><circle cx="22.8" cy="22.8" r="4" fill="#f7d99b"/><circle cx="32" cy="39.8" r="4" fill="#f7d99b"/><circle cx="41.2" cy="22.8" r="4" fill="#f7d99b"/><circle cx="49.2" cy="41.2" r="4" fill="#f7d99b"/></svg>`
}

export function brandOgSvg(locale: string = 'ru') {
  const l = t(locale)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="topGlow" cx="0" cy="0" r="1" gradientTransform="matrix(610 -360 380 645 210 20)" gradientUnits="userSpaceOnUse"><stop stop-color="#E6B86E" stop-opacity="0.45"/><stop offset="0.42" stop-color="#8E5D24" stop-opacity="0.18"/><stop offset="1" stop-color="#18110C" stop-opacity="0"/></radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse"><stop stop-color="#2A1B10"/><stop offset="0.45" stop-color="#19120D"/><stop offset="1" stop-color="#0D0B09"/></linearGradient>
    <linearGradient id="line" x1="120" y1="120" x2="1080" y2="520" gradientUnits="userSpaceOnUse"><stop stop-color="#F0C579"/><stop offset="1" stop-color="#86A68F" stop-opacity="0.45"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#panel)"/><rect width="1200" height="630" fill="url(#topGlow)"/>
  <g opacity="0.13"><path d="M0 86.5H1200M0 173.5H1200M0 260.5H1200M0 347.5H1200M0 434.5H1200M0 521.5H1200" stroke="#FFF3D8"/><path d="M86.5 0V630M173.5 0V630M260.5 0V630M347.5 0V630M434.5 0V630M521.5 0V630M608.5 0V630M695.5 0V630M782.5 0V630M869.5 0V630M956.5 0V630M1043.5 0V630M1130.5 0V630" stroke="#FFF3D8"/></g>
  <rect x="54" y="54" width="1092" height="522" rx="42" fill="#FFF8E8" fill-opacity="0.035" stroke="#F0C579" stroke-opacity="0.23"/>
  <g transform="translate(86 86) scale(1.35)">${brandMarkInnerSvg()}</g>
  <text x="204" y="129" font-family="Manrope, Inter, system-ui, sans-serif" font-size="28" font-weight="800" fill="#FFF4DA" letter-spacing="-1.4">${BRAND_NAME}</text>
  <text x="205" y="158" font-family="JetBrains Mono, ui-monospace, monospace" font-size="12" font-weight="700" fill="#D6AA60" letter-spacing="5">${BRAND_SUBTITLE}</text>
  <text x="84" y="348" font-family="Manrope, Inter, system-ui, sans-serif" font-size="74" font-weight="800" fill="#FFF4DA" letter-spacing="-4.8">${l.catalogTitle}</text>
  <text x="88" y="407" font-family="Manrope, Inter, system-ui, sans-serif" font-size="28" font-weight="500" fill="#D8C7A8">${l.catalogSubtitle}</text>
  <path d="M84 485H570" stroke="url(#line)" stroke-width="3" stroke-linecap="round"/>
  <text x="84" y="526" font-family="JetBrains Mono, ui-monospace, monospace" font-size="18" font-weight="700" fill="#D6AA60" letter-spacing="3">${BRAND_DOMAIN}</text>
</svg>`
}

function screenshotBaseSvg(width: number, height: number) {
  const grid: string[] = []
  for (let y = 80; y < height; y += 80) grid.push(`<path d="M0 ${y}.5H${width}" stroke="#FFF3D8"/>`)
  for (let x = 80; x < width; x += 80) grid.push(`<path d="M${x}.5 0V${height}" stroke="#FFF3D8"/>`)

  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse"><stop stop-color="#2B1B10"/><stop offset="0.52" stop-color="#1A120D"/><stop offset="1" stop-color="#0C0A08"/></linearGradient><radialGradient id="gold" cx="0" cy="0" r="1" gradientTransform="matrix(${width * 0.72} -${height * 0.54} ${height * 0.58} ${width * 0.62} ${width * 0.18} 0)" gradientUnits="userSpaceOnUse"><stop stop-color="#E6B86E" stop-opacity="0.52"/><stop offset=".48" stop-color="#8E5D24" stop-opacity="0.16"/><stop offset="1" stop-color="#18110C" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#bg)"/><rect width="${width}" height="${height}" fill="url(#gold)"/><g opacity="0.13">${grid.join('')}</g>`
}

export function screenshotWideSvg(locale: string = 'ru') {
  const l = t(locale)
  const width = 1280
  const height = 720
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${screenshotBaseSvg(width, height)}<rect x="48" y="42" width="1184" height="636" rx="44" fill="#FFF8E8" fill-opacity="0.045" stroke="#F0C579" stroke-opacity="0.24"/><g transform="translate(82 82) scale(1.75)">${brandMarkInnerSvg()}</g><text x="224" y="132" font-family="Manrope, Inter, system-ui, sans-serif" font-size="38" font-weight="800" fill="#FFF4DA" letter-spacing="-2">${BRAND_NAME}</text><text x="226" y="174" font-family="JetBrains Mono, ui-monospace, monospace" font-size="14" font-weight="700" fill="#D6AA60" letter-spacing="5">${BRAND_SUBTITLE}</text><text x="82" y="336" font-family="Manrope, Inter, system-ui, sans-serif" font-size="82" font-weight="800" fill="#FFF4DA" letter-spacing="-5.2">${l.findServer}</text><text x="87" y="408" font-family="Manrope, Inter, system-ui, sans-serif" font-size="32" font-weight="500" fill="#D8C7A8">${l.catalogIntegrations}</text><rect x="82" y="496" width="284" height="62" rx="20" fill="#F0C579"/><text x="118" y="536" font-family="Manrope, Inter, system-ui, sans-serif" font-size="22" font-weight="800" fill="#1C130C">${l.openCatalog}</text><rect x="390" y="496" width="268" height="62" rx="20" fill="#FFF6E5" fill-opacity="0.075" stroke="#F0C579" stroke-opacity="0.36"/><text x="425" y="536" font-family="Manrope, Inter, system-ui, sans-serif" font-size="22" font-weight="800" fill="#FFF4DA">${l.addServer}</text><text x="82" y="628" font-family="JetBrains Mono, ui-monospace, monospace" font-size="18" font-weight="700" fill="#D6AA60" letter-spacing="3">${BRAND_DOMAIN}</text></svg>`
}

export function screenshotNarrowSvg(locale: string = 'ru') {
  const l = t(locale)
  const width = 750
  const height = 1334
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${screenshotBaseSvg(width, height)}<rect x="34" y="34" width="682" height="1266" rx="42" fill="#FFF8E8" fill-opacity="0.045" stroke="#F0C579" stroke-opacity="0.24"/><g transform="translate(74 76) scale(1.85)">${brandMarkInnerSvg()}</g><text x="78" y="256" font-family="Manrope, Inter, system-ui, sans-serif" font-size="50" font-weight="800" fill="#FFF4DA" letter-spacing="-2.5">${BRAND_NAME}</text><text x="82" y="306" font-family="JetBrains Mono, ui-monospace, monospace" font-size="15" font-weight="700" fill="#D6AA60" letter-spacing="5">${BRAND_SUBTITLE}</text><text x="74" y="525" font-family="Manrope, Inter, system-ui, sans-serif" font-size="76" font-weight="800" fill="#FFF4DA" letter-spacing="-4.8">${l.findLine1}</text><text x="74" y="612" font-family="Manrope, Inter, system-ui, sans-serif" font-size="76" font-weight="800" fill="#FFF4DA" letter-spacing="-4.8">${l.findLine2}</text><text x="78" y="698" font-family="Manrope, Inter, system-ui, sans-serif" font-size="29" font-weight="500" fill="#D8C7A8">${l.integrationsLine1}</text><text x="78" y="740" font-family="Manrope, Inter, system-ui, sans-serif" font-size="29" font-weight="500" fill="#D8C7A8">${l.integrationsLine2}</text><rect x="74" y="842" width="310" height="66" rx="21" fill="#F0C579"/><text x="111" y="885" font-family="Manrope, Inter, system-ui, sans-serif" font-size="23" font-weight="800" fill="#1C130C">${l.openCatalog}</text><rect x="74" y="932" width="296" height="66" rx="21" fill="#FFF6E5" fill-opacity="0.075" stroke="#F0C579" stroke-opacity="0.36"/><text x="111" y="975" font-family="Manrope, Inter, system-ui, sans-serif" font-size="23" font-weight="800" fill="#FFF4DA">${l.addServer}</text><text x="74" y="1240" font-family="JetBrains Mono, ui-monospace, monospace" font-size="18" font-weight="700" fill="#D6AA60" letter-spacing="3">${BRAND_DOMAIN}</text></svg>`
}
