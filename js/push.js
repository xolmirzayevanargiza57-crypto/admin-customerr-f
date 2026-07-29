const VAPID_PUBLIC_KEY = 'BGVIxfi_Mo7-TtKGYXtpLjzDlMBNmA9StNv_44QGhFjtUO-p5GU9Fjj1-mWgh8ScgAq2cM6PSLCFcYlmVI_xlpk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    await fetch(window.__API_BASE_URL__ + '/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(sub)
    });
    console.log('✅ Push obuna bo\'ldi!');
  } catch (err) {
    console.error('Push xatolik:', err);
  }
}

document.addEventListener('DOMContentLoaded', registerPush);
