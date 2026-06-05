export function buildContentSecurityPolicy(nodeEnv = process.env.NODE_ENV) {
  const scriptSources = ["'self'"]

  if (nodeEnv === 'development') {
    scriptSources.push("'unsafe-inline'")
  }

  scriptSources.push("'unsafe-eval'", 'https://plausible.io', 'https://unpkg.com')

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.sentry.io https://unpkg.com",
    "font-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ') + ';'
}
