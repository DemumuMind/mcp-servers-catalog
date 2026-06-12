import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/profile', '/backup'],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
