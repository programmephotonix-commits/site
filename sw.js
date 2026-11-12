// PHOTONIX : mise en cache pour l'ouverture rapide et la consultation hors connexion (hors vidéos).
const CACHE = 'photonix-v1';
const FICHIERS = ['./', 'en/', 'logo-disques.png', 'tube-detail.png', 'tube-detail-en.png', 'affiche.jpg', 'affiche-en.jpg', 'icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  const police = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (r.method !== 'GET' || (u.origin !== location.origin && !police) || r.headers.has('range') || u.pathname.endsWith('.mp4')) return;
  if (r.mode === 'navigate') {   // pages : le réseau d'abord, la copie en cache si l'on est hors connexion
    e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(CACHE).then(k => k.put(r, c)); return x; }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(x => {   // images, polices locales : le cache d'abord, rafraîchi en arrière-plan
    const net = fetch(r).then(y => { if (y.ok || y.type === 'opaque') { const c = y.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return y; }).catch(() => x);
    return x || net;
  }));
});
