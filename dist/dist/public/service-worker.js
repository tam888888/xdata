self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', event => {
    console.log('Service Worker activated!');
  });
  
  self.addEventListener('backgroundfetchsuccess', event => {
    console.log('Background fetch successful:', event.registration);
  
    event.waitUntil(async function() {
      const records = await event.registration.matchAll();
      const cache = await caches.open('background-fetch-cache');
  
      for (const record of records) {
        const response = await record.responseReady;
        await cache.put(record.request, response);
      }
  
      console.log('Files cached successfully.');
    }());
  });
  
  self.addEventListener('backgroundfetchfail', event => {
    console.log('Background fetch failed:', event.registration);
  });
  
  self.addEventListener('backgroundfetchabort', event => {
    console.log('Background fetch aborted:', event.registration);
  });
  

  // Listen for fetch events and cache the result
// self.addEventListener('fetch', (event) => {
//     if (event.request.url.includes('/api/investordata')) {
//         event.respondWith(
//             caches.open('api-cache').then((cache) => {
//                 return cache.match(event.request).then((cachedResponse) => {
//                     return cachedResponse || fetch(event.request).then((networkResponse) => {
//                         cache.put(event.request, networkResponse.clone());
//                         return networkResponse;
//                     });
//                 });
//             })
//         );
//     }
// });


// self.addEventListener('fetch', (event) => {
//     if (event.request.url.includes('/api/investordata')) {
//         event.respondWith(
//             caches.open('api-cache').then((cache) => {
//                 return cache.match(event.request).then((cachedResponse) => {
//                     const currentTime = Date.now();
                    
//                     // Check if there is a cached response
//                     if (cachedResponse) {
//                         // Get the cached response and its timestamp
//                         const cachedData = cachedResponse.clone();
//                         const cacheTimestamp = cachedData.headers.get('sw-cache-timestamp');

//                         // Check if the cache has expired (5 hours = 5 * 60 * 60 * 1000 ms)
//                         if (cacheTimestamp && (currentTime - cacheTimestamp < 5 * 60 * 60 * 1000)) {
//                             return cachedResponse; // Return cached response if not expired
//                         }
//                     }

//                     // If no valid cached response, fetch from network
//                     return fetch(event.request).then((networkResponse) => {
//                         // Cache the network response
//                         const responseClone = networkResponse.clone();
//                         responseClone.headers.append('sw-cache-timestamp', currentTime); // Add timestamp
//                         cache.put(event.request, responseClone);
//                         return networkResponse; // Return the network response
//                     });
//                 });
//             })
//         );
//     }
// });

// self.addEventListener('fetch', (event) => {
//     if (event.request.url.includes('/api/investordata')) {
//         event.respondWith(
//             caches.open('api-cache').then((cache) => {
//                 return cache.match(event.request).then((cachedResponse) => {
//                     const currentTime = Date.now();

//                     // Check if there is a cached response
//                     if (cachedResponse) {
//                         // Clone the cached response to read its body
//                         return cachedResponse.json().then(cachedData => {
//                             const cacheTimestamp = cachedData.timestamp;

//                             // Check if the cache has expired (5 hours = 5 * 60 * 60 * 1000 ms)
//                             if (cacheTimestamp && (currentTime - cacheTimestamp < 5 * 60 * 60 * 1000)) {
//                                 return new Response(JSON.stringify(cachedData.data), {
//                                     headers: { 'Content-Type': 'application/json' }
//                                 }); // Return cached response if not expired
//                             }
//                         });
//                     }

//                     // If no valid cached response, fetch from network
//                     return fetch(event.request).then((networkResponse) => {
//                         return networkResponse.clone().json().then(networkData => {
//                             const responseToCache = {
//                                 timestamp: currentTime,
//                                 data: networkData
//                             };

//                             // Cache the network response with timestamp
//                             cache.put(event.request, new Response(JSON.stringify(responseToCache), {
//                                 headers: { 'Content-Type': 'application/json' }
//                             }));
//                             return networkResponse; // Return the network response
//                         });
//                     });
//                 });
//             })
//         );
//     }
// });


// Listen for fetch events and directly fetch from the network
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/investordata')) {
        event.respondWith(fetch(event.request)); // Simply fetch from the network
    }
});