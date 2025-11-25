// ===================================
// SERVICE WORKER - Offline Support
// Version: 1.0.0
// ===================================

const CACHE_NAME = 'studytok-v1.0.0';
const RUNTIME_CACHE = 'studytok-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/timer.html',
    '/tipps.html',
    '/plan.html',
    '/musik.html',
    '/css/style.css',
    '/css/timer.css',
    '/css/tipps.css',
    '/css/lernplan.css',
    '/css/utils.css',
    '/js/main.js',
    '/js/shop.js',
    '/js/timer.js',
    '/js/tipps.js',
    '/js/utils.js',
    '/js/vendor/gsap-lite.js',
    '/image/1.png',
    '/image/2.png',
    '/image/3.png',
    '/image/4.png',
    '/image/5.png',
    '/image/cherry_petal.svg',
    '/image/background_branch.png',
    '/image/astraai.png',
    '/image/pause.png'
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
    /\.json$/
];

// Cache-first resources (prefer cache)
const CACHE_FIRST_PATTERNS = [
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.woff$/,
    /\.woff2$/,
    /\.ttf$/,
    /\.css$/,
    /\.js$/
];

// ===================================
// INSTALL - Cache assets
// ===================================

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                // Force activation immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Precaching failed:', error);
            })
    );
});

// ===================================
// ACTIVATE - Cleanup old caches
// ===================================

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Remove old caches
                            return cacheName !== CACHE_NAME &&
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

// ===================================
// FETCH - Handle requests with strategies
// ===================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (except TikTok embeds)
    if (url.origin !== self.location.origin && !url.origin.includes('tiktok.com')) {
        return;
    }

    // Determine strategy based on request
    if (shouldUseNetworkFirst(request)) {
        event.respondWith(networkFirst(request));
    } else if (shouldUseCacheFirst(request)) {
        event.respondWith(cacheFirst(request));
    } else {
        // Default: Cache-first with network fallback
        event.respondWith(cacheFirst(request));
    }
});

// ===================================
// CACHING STRATEGIES
// ===================================

/**
 * Network-first strategy: Try network, fallback to cache
 * Best for: API calls, dynamic content
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }

        throw error;
    }
}

/**
 * Cache-first strategy: Try cache, fallback to network
 * Best for: Images, CSS, JS, fonts
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Return cached version immediately
        // Update cache in background (stale-while-revalidate)
        updateCacheInBackground(request);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        // Cache the new response
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache and network both failed:', request.url);
        throw error;
    }
}

/**
 * Update cache in background (stale-while-revalidate)
 */
function updateCacheInBackground(request) {
    fetch(request)
        .then((response) => {
            if (response.ok) {
                return caches.open(RUNTIME_CACHE)
                    .then((cache) => cache.put(request, response));
            }
        })
        .catch(() => {
            // Silently fail - user already has cached version
        });
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function shouldUseNetworkFirst(request) {
    return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

function shouldUseCacheFirst(request) {
    return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

// ===================================
// MESSAGE HANDLING
// ===================================

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        caches.open(RUNTIME_CACHE)
            .then((cache) => cache.addAll(urls))
            .then(() => {
                event.ports[0].postMessage({ cached: true });
            })
            .catch((error) => {
                event.ports[0].postMessage({ cached: false, error: error.message });
            });
    }
});

// ===================================
// BACKGROUND SYNC (Future Enhancement)
// ===================================

// Uncomment when implementing background sync
// self.addEventListener('sync', (event) => {
//     if (event.tag === 'sync-stats') {
//         event.waitUntil(syncUserStats());
//     }
// });
