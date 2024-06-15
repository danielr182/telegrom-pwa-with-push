// imports
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js');
importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');

const APP_SHELL = [
  '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/camera.js',
  'js/app.js',
  'js/sw-utils.js',
];

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
  'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js',
  'https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js',
];

self.addEventListener('install', (e) => {
  const staticCache = caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL));

  const inmutableCache = caches.open(INMUTABLE_CACHE).then((cache) => cache.addAll(APP_SHELL_INMUTABLE));
  e.waitUntil(Promise.all([staticCache, inmutableCache]));
});

self.addEventListener('activate', (e) => {
  const response = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes('static')) {
        return caches.delete(key);
      }

      if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
        return caches.delete(key);
      }
    });
  });

  e.waitUntil(response);
});

self.addEventListener('fetch', (e) => {
  const response = e.request.url.includes('/api')
    ? handleApiRequests(DYNAMIC_CACHE, e.request)
    : handleFetchRequests(e);

  e.respondWith(response);
});

self.addEventListener('sync', (e) => {
  console.log('sw: Sync');
  if (e.tag === 'new-post') {
    const promise = postMessagesToApi();
    e.waitUntil(promise);
  }
});

self.addEventListener('push', (e) => {
  console.log('sw: push: ', e.data.text());
  const data = JSON.parse(e.data.text());
  const options = {
    body: data.body || '',
    icon: `img/avatars/${data.user}.jpg`,
    badge: 'img/favicon.ico',
    image: 'https://ap2hyc.com/wp-content/uploads/2017/04/avengers-tower.jpg',
    vibrate: [125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600],
    openUrl: '/',
    actions: [],
    data: {
      url: '/',
    },
  };

  const notificationProm = self.registration.showNotification(data.title, options);
  e.waitUntil(notificationProm);
});

self.addEventListener('notificationclick', (e) => {
  const notification = e.notification;
  const promise = clients.matchAll().then((allClients) => {
    const visibleClient = allClients.find((c) => c.visibilityState === 'visible');
    if (visibleClient) {
      visibleClient.navigate(notification.data.url);
      visibleClient.focus();
    } else {
      clients.openWindow(notification.data.url);
    }
    return notification.close();
  });
  e.waitUntil(promise);
});
