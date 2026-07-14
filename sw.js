// Service Worker — Inspeccion de Labores v3.1
var CACHE_NAME = "inspeccion-labores-v3.1";

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(["/"]);
    }).then(function(){
      return self.skipWaiting();
    })
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

  // NUNCA interceptar peticiones externas — solo cachear la app local
  if(url.indexOf("script.google.com") !== -1 ||
     url.indexOf("drive.google.com")  !== -1 ||
     url.indexOf("sheets.google.com") !== -1 ||
     url.indexOf("googleapis.com")    !== -1 ||
     url.indexOf("cdnjs.cloudflare.com") !== -1 ||
     event.request.method !== "GET"){
    // Dejar pasar directamente sin interceptar
    return;
  }

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
