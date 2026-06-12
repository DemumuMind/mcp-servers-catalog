import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dsn = process.env.SENTRY_DSN
    if (!dsn) {
      // Sentry disabled — set SENTRY_DSN in .env to enable
      return
    }

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || process.env.npm_package_version || 'unknown',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      debug: false,
    })
  }
}

export const onRequestError = async (
  error: unknown,
  request: {
    path: string
    method: string
  },
  context: {
    routerKind: 'AppRouter' | 'PagesRouter' | 'Turbopack'
  }
) => {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  const Sentry = await import('@sentry/nextjs')
  Sentry.captureException(error, {
    tags: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
    },
  })
}
