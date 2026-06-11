import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/profile', '/backup'],
      },
    ],
    sitemap: 'https://mcpservers.org/sitemap.xml',
  }
}
