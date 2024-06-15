const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Save in cache
function updateCache(cacheName, req, res) {
  if (res.ok) {
    return caches.open(cacheName).then((cache) => {
      cache.put(req, res.clone());

      return res.clone();
    });
  } else {
    return res;
  }
}

// Cache with network update
function handleFetchRequests(e) {
  return caches.match(e.request).then((cache) => {
    if (cache) {
      updateStaticCache(e.request);
      return cache;
    } else {
      return fetch(e.request).then((newRes) => {
        return updateCache(DYNAMIC_CACHE, e.request, newRes);
      });
    }
  });
}
function updateStaticCache(req) {
  if (APP_SHELL_INMUTABLE.includes(req.url)) return;

  fetch(req)
    .then((res) => updateCache(STATIC_CACHE, req, res))
    .catch((err) => console.log('Error on updateStaticCache: ', err));
}

// Network with cache fallback
function handleApiRequests(cacheName, req) {
  if (req.url.includes('/api/key') || req.url.includes('/api/subscribe')) {
    return fetch(req);
  }

  if (req.clone().method === 'POST') {
    if (self.registration.sync) {
      return req
        .clone()
        .text()
        .then((body) => {
          return saveMessageInIndexedDB(JSON.parse(body));
        });
    }
    return fetch(req);
  }

  return fetch(req)
    .then((res) => {
      if (res.ok) {
        updateCache(cacheName, req, res.clone());
        return res.clone();
      }
      return caches.match(req);
    })
    .catch(() => caches.match(req));
}
