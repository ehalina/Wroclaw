const CACHE_NAME = 'tumski-island-tour-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Core CSS and JS (will be updated by build process)
  '/src/index.css',
  // Images
  '/src/assets/tumski-panorama.jpg',
  '/src/assets/cathedral-interior.jpg',
  '/src/assets/tumski-bridge.jpg',
  // Audio files (add when available)
  '/audio/town.mp3',
  '/audio/kostel.mp3',
  '/audio/birds.mp3',
  '/audio/hang.mp3',
  '/audio/quest.mp3',
  '/audio/opening-a-book.wav',
  '/audio/step.wav',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .catch((error) => {
        console.error('[SW] Failed to cache resources:', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, cache the response and return it
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request)
            .then((response) => {
              return response || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle API and asset requests
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Stale-while-revalidate strategy for most resources
          if (cachedResponse) {
            // Serve from cache immediately
            fetch(request)
              .then((fetchResponse) => {
                // Update cache in background
                if (fetchResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, fetchResponse.clone());
                    });
                }
              })
              .catch(() => {
                // Network error, cached version is still good
              });
            
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((fetchResponse) => {
              // Cache successful responses
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            })
            .catch((error) => {
              console.error('[SW] Fetch failed:', error);
              throw error;
            });
        })
    );
  }
});

// Handle background sync for data updates
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'location-update') {
    event.waitUntil(
      // Sync location data when connection is restored
      syncLocationData()
    );
  }
});

// Background sync function
async function syncLocationData() {
  try {
    // Update location data, user progress, etc.
    console.log('[SW] Syncing location data...');
    
    // This would typically sync with a backend API
    // For now, just log the sync event
    
    // Notify clients that data has been synced
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'DATA_SYNCED',
        timestamp: Date.now()
      });
    });
    
  } catch (error) {
    console.error('[SW] Failed to sync data:', error);
  }
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новая информация доступна в туре',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Исследовать',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Тумский остров', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});