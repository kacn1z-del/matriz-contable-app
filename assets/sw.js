// Service worker de Matriz Contable CR (versión web / Microsoft Store)
// - La hoja (HTML) se pide siempre a internet primero, para que cada
//   actualización subida a GitHub llegue enseguida; sin conexión se usa la
//   última copia guardada.
// - Librerías de CDN, íconos y fuentes: se sirven de la copia y se renuevan
//   por detrás.
// - Firebase, Hacienda, Sibö y demás servicios: nunca se guardan (van directo).
const VERSION = 'matriz-v1';
const BASICOS = ['./hoja-matriz-contable.html', './manifest.webmanifest', './pwa/icon-192.png', './pwa/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const NUNCA = /firestore\.googleapis|identitytoolkit|securetoken|firebaseio|workers\.dev|vercel\.app|hacienda|bccr|api\.|googleapis\.com\/(identity|v1)/;
const ESTATICOS = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs/;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (NUNCA.test(url)) return;

  // La hoja: primero internet, si no hay, la copia
  if (req.mode === 'navigate' || /hoja-matriz-contable\.html/.test(url)) {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r && r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put('./hoja-matriz-contable.html', copia)); }
          return r;
        })
        .catch(() => caches.match('./hoja-matriz-contable.html'))
    );
    return;
  }

  // Librerías y archivos fijos: copia al instante y se renueva por detrás
  if (ESTATICOS.test(url) || url.startsWith(self.registration.scope)) {
    e.respondWith(
      caches.open(VERSION).then((c) => c.match(req).then((guardada) => {
        const red = fetch(req).then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => guardada);
        return guardada || red;
      }))
    );
  }
});
