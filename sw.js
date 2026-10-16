const CACHE_NAME = 'daily-budget-v7';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// 인터넷이 되면 항상 최신 파일을 받고, 오프라인일 때만 저장된 파일을 사용
self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function(resp) {
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(req, copy); });
      return resp;
    }).catch(function() {
      return caches.match(req);
    })
  );
});
