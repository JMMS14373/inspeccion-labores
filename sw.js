// Service Worker — Inspeccion de Labores v3.2
// Solo cachea recursos locales, NUNCA intercepta peticiones externas

var CACHE_NAME = "inspeccion-labores-v3.2";

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.add("/inspeccion-labores/");
    }).catch(function(){ return; })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  var url = event.request.url;

  // NUNCA interceptar peticiones externas o no-GET
  if(event.request.method !== "GET") return;
  if(url.indexOf("script.google.com") !== -1) return;
  if(url.indexOf("google.com") !== -1) return;
  if(url.indexOf("googleapis.com") !== -1) return;
  if(url.indexOf("cdnjs.cloudflare.com") !== -1) return;
  if(url.indexOf("github.com") !== -1) return;

  // Solo cachear recursos locales de la app
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.match(event.request).then(function(cached){
        var network = fetch(event.request).then(function(response){
          if(response && response.status === 200){
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(function(){ return cached; });
        return cached || network;
      });
    })
  );
});
