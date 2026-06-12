export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry disabled — install @sentry/nextjs and add SENTRY_DSN to enable
    return
  }
}

// Stub for @sentry/nextjs — currently not installed.
// To enable Sentry: install @sentry/nextjs, add SENTRY_DSN to .env, and uncomment the import in register().
export const onRequestError = () => {
    // Sentry stub — install @sentry/nextjs and add SENTRY_DSN to .env
    return
  }
