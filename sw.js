/* مصاريف — service worker
   Caches the app shell so the tool opens offline.
   IMPORTANT: this caches CODE only. Your data lives in
   localStorage on your device and is never touched here. */
const CACHE='masareef-v2';   // ⬅️ زِد الرقم مع كل تحديث ترفعه (v3, v4…) ليجلب Safari النسخة الجديdة
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
  const isDoc=e.request.mode==='navigate'||e.request.destination==='document';
  if(isDoc){
    // network-first for the page: get updates immediately, fall back to cache offline
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(res.ok&&e.request.url.startsWith(self.location.origin)){
        const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
