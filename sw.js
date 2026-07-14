var CACHE_NAME = "inspeccion-labores-v3.2";
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){
  var url = e.request.url;
  if(e.request.method !== "GET") return;
  if(url.indexOf("google") !== -1) return;
  if(url.indexOf("cloudflare") !== -1) return;
  e.respondWith(
    caches.open(CACHE_NAME).then(function(c){
      return c.match(e.request).then(function(cached){
        return fetch(e.request).then(function(r){
          if(r && r.status===200) c.put(e.request,r.clone());
          return r;
        }).catch(function(){ return cached; });
      });
    })
  );
});
