const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'https://plausible.io'
const UNPKG_DOMAIN = process.env.NEXT_PUBLIC_UNPKG_DOMAIN || 'https://unpkg.com'

export function buildContentSecurityPolicy(nodeEnv = process.env.NODE_ENV) {
  const scriptSources = ["'self'"]

  if (nodeEnv === 'development') {
    scriptSources.push("'unsafe-inline'")
  }

  scriptSources.push("'unsafe-eval'", PLAUSIBLE_DOMAIN, UNPKG_DOMAIN)

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    `style-src 'self' 'unsafe-inline' ${UNPKG_DOMAIN}`,
    "img-src 'self' data: https:",
    `connect-src 'self' ${UNPKG_DOMAIN}`,
    "font-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(nodeEnv === 'production' ? ['upgrade-insecure-requests'] : []),
  ].join('; ') + ';'
}
