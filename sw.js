/**
 * COMPUZONE - SERVICE WORKER
 * PWA functionality and offline support
 */

const CACHE_NAME = 'compuzone-v1.0.0';
const STATIC_CACHE_NAME = 'compuzone-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'compuzone-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/3d-scene.js',
  '/js/admin.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
];

// Files to cache on demand
const DYNAMIC_FILES = [
  '/assets/',
  '/api/'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external domains (except CDNs)
  if (url.origin !== location.origin && 
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Decide which cache to use
            const cacheName = isStaticFile(request.url) ? 
              STATIC_CACHE_NAME : DYNAMIC_CACHE_NAME;
            
            // Cache the response
            caches.open(cacheName)
              .then(cache => {
                console.log('[SW] Caching new resource:', request.url);
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return placeholder for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#9ca3af">Image unavailable</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva notificación de CompuZone',
      icon: '/assets/images/icon-192.png',
      badge: '/assets/images/badge-72.png',
      tag: data.tag || 'compuzone-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/assets/images/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar',
          icon: '/assets/images/action-dismiss.png'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'CompuZone',
        options
      )
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    updateCache();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

// Utility functions
function isStaticFile(url) {
  return STATIC_FILES.some(staticFile => url.includes(staticFile)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.html');
}

function doBackgroundSync() {
  return new Promise((resolve, reject) => {
    // Implement background sync logic
    // For example, sync offline form submissions
    console.log('[SW] Performing background sync');
    
    // Get pending requests from IndexedDB
    // Send them to server
    // Clear them from storage
    
    resolve();
  });
}

function updateCache() {
  return caches.open(STATIC_CACHE_NAME)
    .then(cache => {
      return cache.addAll(STATIC_FILES);
    })
    .then(() => {
      console.log('[SW] Cache updated');
    });
}

function clearAllCaches() {
  return caches.keys()
    .then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    })
    .then(() => {
      console.log('[SW] All caches cleared');
    });
}

// Performance monitoring
self.addEventListener('fetch', event => {
  const startTime = performance.now();
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log performance metrics
        if (duration > 1000) { // Slow request
          console.warn('[SW] Slow request:', event.request.url, `${duration}ms`);
        }
        
        return response || fetch(event.request);
      })
  );
});

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');
