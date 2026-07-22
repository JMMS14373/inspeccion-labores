var CACHE_NAME = "inspeccion-labores-v3.2";
var APP_SHELL = [
  "/inspeccion-labores/",
  "/inspeccion-labores/index.html",
  "/inspeccion-labores/manifest.json"
];
self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.allSettled(
        APP_SHELL.map(function(url){
          return cache.add(url).catch(function(err){
            console.warn("No se pudo cachear:", url, err);
          });
        })
      );
    }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      ).then(function(){ return self.clients.claim(); });
    })
  );
});
self.addEventListener("fetch", function(e){
  var url = e.request.url;
  if(url.indexOf("google") !== -1 || url.indexOf("cloudflare") !== -1 ||
     url.indexOf("github.com") !== -1 || e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(response){
      if(response && response.status === 200 && response.type === "basic"){
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, clone); });
      }
      return response;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){
        return cached || caches.match("/inspeccion-labores/") || caches.match("/inspeccion-labores/index.html");
      });
    })
  );
});
self.addEventListener("message", function(e){
  if(e.data && e.data.action === "skipWaiting") self.skipWaiting();
});
