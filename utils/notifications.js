let swRegistration = null;

export const initializeNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    swRegistration = registration;
    console.log('Service Worker registered successfully');
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const subscribeUserToPush = async () => {
  if (!swRegistration) {
    console.error('Service worker not registered');
    return null;
  }

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    });

    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userEmail: localStorage.getItem('userEmail')
      }),
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe user to push:', error);
    return null;
  }
};

export const sendNotification = async (title, options = {}) => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/riot-icon.png',
      badge: '/riot-badge.png',
      ...options
    });
    return true;
  }

  return false;
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
