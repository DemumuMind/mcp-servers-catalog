import clientUrlData from '@/lib/client-urls.json'


export function getClientUrl(key: string): string {
  return (clientUrlData.urls as Record<string, string>)[key] || ''
}

export function getClientFavicon(name: string): string {
  return (clientUrlData.favicons as Record<string, string>)[name] || ''
}
