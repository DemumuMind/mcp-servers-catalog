export async function register() {
  // Sentry disabled — no SENTRY_DSN configured
  // Re-enable by installing @sentry/nextjs and adding SENTRY_DSN to .env
}

// Stub for @sentry/nextjs — currently not installed.
// To enable Sentry: install @sentry/nextjs, add SENTRY_DSN to .env, and uncomment the import in register().
export const onRequestError = () => {}
