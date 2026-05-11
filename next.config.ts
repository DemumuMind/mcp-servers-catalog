import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@electric-sql/pglite', 'pglite-prisma-adapter'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'camo.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.shields.io' },
      { protocol: 'https', hostname: 'badge.fury.io' },
    ],
    unoptimized: true, // Required for static export/standalone with external images
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      // Admin routes are locale-free; no redirects needed
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.io https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://*.sentry.io https://unpkg.com; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

const sentryOrg = process.env.SENTRY_ORG
const sentryProject = process.env.SENTRY_PROJECT
const sentryDsn = process.env.SENTRY_DSN

const sentryOptions = {
  silent: !sentryDsn,
  sourcemaps: {
    disable: true,
  },
} as any

if (sentryOrg) sentryOptions.org = sentryOrg
if (sentryProject) sentryOptions.project = sentryProject

const config = withNextIntl(nextConfig);

const sentryWrapped = sentryDsn
  ? withSentryConfig(config, sentryOptions)
  : config

export default sentryWrapped
