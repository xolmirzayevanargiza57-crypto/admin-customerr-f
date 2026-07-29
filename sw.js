// ============================================================
// SERVICE WORKER - ADMIN CUSTOMER (PUSH NOTIFICATIONS)
// Loyiha: Admin-Customer Frontend
// Fayl: sw.js
// ============================================================

const CACHE_NAME = 'admin-customer-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/notifications.html',
    '/css/style.css',
    '/js/api.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/notifications.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// ============================================================
// INSTALL - CACHE STATIC ASSETS
// ============================================================
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// ============================================================
// ACTIVATE - CLEAN OLD CACHES
// ============================================================
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ============================================================
// FETCH - NETWORK FIRST, CACHE FALLBACK
// ============================================================
self.addEventListener('fetch', (event) => {
    // API so'rovlarini cache qilma
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cachega saqlash
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Offline bo'lsa cachedan olish
                return caches.match(event.request);
            })
    );
});

// ============================================================
// ⭐ PUSH NOTIFICATION - ASOSIY FUNKSIYA
// ============================================================
self.addEventListener('push', (event) => {
    console.log('🔔 Push notification received:', event);

    let data = {};
    try {
        data = event.data ? event.data.json() : {};
        console.log('📨 Push data:', data);
    } catch (error) {
        console.error('❌ Push data parse error:', error);
        data = {
            title: 'Yangi xabar',
            body: 'Admin Main dan yangi xabar keldi',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'notification',
            data: { url: '/notifications.html' }
        };
    }

    // ⭐ XABAR KO'RSATISH
    const options = {
        body: data.body || 'Admin Main dan yangi xabar keldi',
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/icon-192x192.png',
        tag: data.tag || 'notification',
        data: data.data || { url: '/notifications.html' },
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: '📨 Ko\'rish'
            },
            {
                action: 'close',
                title: '❌ Yopish'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Yangi xabar', options)
    );
});

// ============================================================
// ⭐ NOTIFICATION CLICK - XABAR BOSILGANDA
// ============================================================
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event);

    event.notification.close();

    const url = event.notification.data?.url || '/notifications.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Agar ochiq oyna bo'lsa, uni fokusla
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Yo'q bo'lsa yangi oyna och
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// ============================================================
// ⭐ BACKGROUND SYNC - OFFLINE BO'LSA SAQLAB QO'YISH
// ============================================================
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    try {
        // Offline bo'lgan vaqtda yuborilmagan xabarlarni qayta yuborish
        const cache = await caches.open('pending-notifications');
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
                console.log('✅ Sync completed for:', request.url);
            }
        }
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}
