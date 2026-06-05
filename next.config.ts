import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import { buildContentSecurityPolicy } from './src/lib/security-headers';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@electric-sql/pglite', 'pglite-prisma-adapter', '@prisma/adapter-pg', 'pg'],
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
            value: buildContentSecurityPolicy(),
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
