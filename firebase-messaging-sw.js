// ============================================================
// FIREBASE MESSAGING SERVICE WORKER - ADMIN CUSTOMER
// Loyiha: Admin-Customer Frontend
// Fayl: firebase-messaging-sw.js
// ============================================================

// ⭐ FIREBASE CONFIG
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBkHn6FkZg1gZ2gZ3gZ4gZ5gZ6gZ7gZ8gZ9",
    authDomain: "admin-customer.firebaseapp.com",
    projectId: "admin-customer",
    storageBucket: "admin-customer.appspot.com",
    messagingSenderId: "103953800507",
    appId: "1:103953800507:web:abc123def456"
};

// ⭐ FIREBASE SDK NI YUKLASH
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⭐ FIREBASE INIT
firebase.initializeApp(FIREBASE_CONFIG);

// ⭐ MESSAGING
const messaging = firebase.messaging();

// ============================================================
// ⭐ BACKGROUND MESSAGES - LOCK SCREEN DA HAM ISHLAYDI
// ============================================================
messaging.onBackgroundMessage(function(payload) {
    console.log('🔔 Background message received:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Yangi xabar';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Admin Main dan yangi xabar keldi',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: payload.notification?.badge || '/icon-192x192.png',
        tag: payload.data?.tag || 'notification',
        data: payload.data || { url: '/notifications.html' },
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

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================================
// ⭐ NOTIFICATION CLICK
// ============================================================
self.addEventListener('notificationclick', function(event) {
    console.log('🔔 Notification clicked:', event);

    event.notification.close();

    const url = event.notification.data?.url || '/notifications.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
