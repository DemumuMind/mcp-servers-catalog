import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite', 'pglite-prisma-adapter'],
  turbopack: {
    root: './',
  },
};

export default nextConfig;
