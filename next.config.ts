import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { buildContentSecurityPolicy } from './src/lib/security-headers';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs', 'sharp', '@libsql/client', 'libsql'],
  allowedDevOrigins: ['198.18.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'camo.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.shields.io' },
      { protocol: 'https', hostname: 'badge.fury.io' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [];
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

export default withNextIntl(nextConfig)
