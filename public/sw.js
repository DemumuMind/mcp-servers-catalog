const CACHE_NAME = 'mcpservers-v3'
const STATIC_ASSETS = [
  '/ru/offline',
  '/en/offline',
  '/favicon.ico',
  '/apple-icon.png',
  '/icon.png',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/maskable-icon-192x192.png',
  '/maskable-icon-512x512.png',
  '/apple-touch-icon.png',
  '/og-brand.png',
  '/screenshot-wide.png',
  '/screenshot-narrow.png',
]
const CACHEABLE_PATHS = new Set(STATIC_ASSETS)

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch: stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Only handle GET requests
  if (request.method !== 'GET') return
  
  // Skip non-HTTP and cross-origin requests. Opaque third-party responses
  // are not useful for an app-shell cache and can break offline behavior.
  if (!request.url.startsWith('http')) return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Keep API responses and Next internals network-first. They are either
  // user-specific or already managed by the framework's own caching layer.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return

  // Navigation requests can contain authenticated UI, so do not put them in
  // the shared app-shell cache. Only fall back to the static offline page when
  // the network is unavailable.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        const locale = url.pathname.startsWith('/en') ? 'en' : 'ru'
        return caches.match(`/${locale}/offline`).then((offlineResponse) => {
          return offlineResponse || caches.match('/ru/offline')
        })
      })
    )
    return
  }

  if (!CACHEABLE_PATHS.has(url.pathname)) return
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Update cache with fresh response
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Network failed: return cached version or offline fallback
          if (cachedResponse) {
            return cachedResponse
          }
          
          return new Response('Network error', { status: 408 })
        })
      
      // Return cached version immediately while revalidating in background
      return cachedResponse || fetchPromise
    })
  )
})
