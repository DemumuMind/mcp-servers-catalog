const CACHE_NAME = 'mcpservers-v1'
const STATIC_ASSETS = [
  '/',
  '/ru',
  '/en',
  '/offline',
]

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
  
  // Skip non-HTTP requests (like chrome-extension://)
  if (!request.url.startsWith('http')) return
  
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
          
          // For navigation requests, return offline page
          if (request.mode === 'navigate') {
            return caches.match('/offline')
          }
          
          return new Response('Network error', { status: 408 })
        })
      
      // Return cached version immediately while revalidating in background
      return cachedResponse || fetchPromise
    })
  )
})
