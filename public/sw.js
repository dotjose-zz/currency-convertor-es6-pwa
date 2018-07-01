const staticCacheName = 'cc-app-v5';
const dataCache = 'cc-app-data-v5';
const rate_URL = '/currencies';
let allCaches = [
  staticCacheName,
  dataCache
];

let urlsToCache = [
  '/',
  '/currencies',
  '/js/init.js',
  '/js/index.js',
  '/js/materialize.js',
  '/css/materialize.css',
  '/css/style.css',
  'https://code.jquery.com/jquery-2.1.1.min.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
];

self.addEventListener('install', function(event) {
  console.log('installed');
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('activating...');
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('cc-app') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('waiting', function() {
  console.log('SW is in waiting state')
});

self.addEventListener('fetch', function(event) {

  const url = new URL(event.request.url);

  // cache material icons
  if (url.hostname === 'fonts.gstatic.com') {
    caches.match(url.href).then(function(response) {
      return response || fetch(event.request);
    })
  }

  // cache data
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(dataCache).then(function(cache) {
        return fetch(event.request).then(function(response) {
          cache.put(event.request.url, response.clone());
          return response;
        }).catch(function() {
          if (url.pathname.startsWith('/api/convert')) {
            let baseCurrency = url.searchParams.get('from');
            let quoteCurrency = url.searchParams.get('to');
            return caches.match(`/api/convert?from=${baseCurrency.value}&to=${quoteCurrency.value}`)
              .then(function(response) {
                console.log(response);
                let convertedAmount = response.rates[quoteCurrency] * baseCurrency.value;
                return {time: response.time, amount: convertedAmount.toString()}
              })  
          }
          return caches.match(event.request.url).then(function(response) {
            if (response) 
             return response;
          });
        });
      })
    );
  }

  else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});


self.addEventListener('sync', (event) => {
  if (event.tag === 'currencies') {
    // Fetch the rates once the user gains connectivity.
    event.waitUntil(fetch(RATE_URL)
        .then((response) => response.json())
        .then((json) => {
          let idb = self.indexedDB;
          if (idb) {
            let req = idb.open('db', 1);
            if (req) {
              req.onsuccess = (event) => {
                let db = event.target.result;
                db.transaction('kv', 'readwrite').objectStore('kv')
                    .put(json, 'rates');
              };
              req.onupgradeneeded = (event) => {
                let db = event.target.result;
                db.createObjectStore('kv');
              };
            }
          }
        })
        .then(() => {
          console.log('New Update');
        }));
  }
});