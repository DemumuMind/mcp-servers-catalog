import clientUrlData from '@/lib/client-urls.json'

type ClientUrlKey = keyof typeof clientUrlData
type FaviconKey = keyof typeof clientUrlData.favicons

export function getClientUrl(key: string): string {
  return (clientUrlData.urls as Record<string, string>)[key] || ''
}

export function getClientFavicon(name: string): string {
  return (clientUrlData.favicons as Record<string, string>)[name] || ''
}
