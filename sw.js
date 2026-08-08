/* مصاريف — service worker
   Caches the app shell so the tool opens offline.
   IMPORTANT: this caches CODE only. Your data lives in
   localStorage on your device and is never touched here. */
const CACHE='masareef-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      // cache same-origin successful responses for next offline load
      if(res.ok&&e.request.url.startsWith(self.location.origin)){
        const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
