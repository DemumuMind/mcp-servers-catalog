import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 120, // purge expired every 2 minutes
  useClones: false, // faster, but mutations affect cache
})

export function getCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&')
  return `${prefix}:${sorted}`
}

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key)
}

export function setCache<T>(key: string, value: T, ttlSeconds?: number): void {
  cache.set(key, value, ttlSeconds ?? (cache.options.stdTTL || 300))
}

export function delCache(key: string): void {
  cache.del(key)
}

export function delCachePattern(pattern: string): void {
  const keys = cache.keys().filter((k) => k.startsWith(pattern))
  cache.del(keys)
}

export function flushCache(): void {
  cache.flushAll()
}

export { cache }
