// Service worker de la VERSIÓN DE PRUEBA SIN INTERNET del Planeador Docente NEM.
// Guarda la app en el equipo para que abra sin conexión. Los datos de los maestros NO pasan por aquí:
// siguen en localStorage. Las llamadas a la IA / licencia (workers.dev) y a las cuentas (Google/Firebase) nunca se interceptan.
const VERSION = 'nem-sin-internet-18079a6ccf';
const ARCHIVOS = [
  './',
  'auth.js?v=202611191500',
  'bitacora.js?v=202611180600',
  'correos-temporales.js?v=202611180600',
  'curriculum.js?v=202611180600',
  'escaner.js?v=202611241200',
  'fechas-plan.js?v=202611231800',
  'firebase-config.js?v=202611180600',
  'generators.js?v=202611232300',
  'gestion.js?v=202611241200',
  'libreta.js?v=202611182230',
  'licencia.js?v=202611241200',
  'metodologias.js?v=202611232100',
  'privacidad.js?v=202611241200',
  'projects.js?v=202611180600',
  'rezago.js?v=202611181700',
  'ruta-ui.js?v=202611180600',
  'secuencias.js?v=202611241200',
  'sugerencias-plano.js?v=202611180600',
  'index.html',
  'manifest.webmanifest',
  'suscripcion.html',
  'icons/icono-32.png',
  'icons/icono-180.png',
  'icons/icono-192.png',
  'icons/icono-512.png'
];
// Librerías externas que la app carga al usarlas: se guardan de antemano para que funcionen sin internet
const EXTERNOS = [
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
];
const HOSTS_EXTERNOS = ['cdnjs.cloudflare.com', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await Promise.all(ARCHIVOS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));   // la app debe quedar completa
    await Promise.all(EXTERNOS.map(u => fetch(u).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})));   // mejor esfuerzo
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('nem-sin-internet-') && k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Red primero con tiempo límite (para que las páginas se actualicen cuando hay internet); si falla o tarda, lo guardado
function redOCache(req, ms) {
  return new Promise(resolve => {
    let listo = false;
    const usarCache = async () => { const r = await caches.match(req, { ignoreSearch: false }) || await caches.match(req, { ignoreSearch: true }); return r; };
    const t = setTimeout(async () => { const r = await usarCache(); if (r && !listo) { listo = true; resolve(r); } }, ms);
    fetch(req).then(async r => {
      clearTimeout(t);
      if (r && r.ok) { const c = await caches.open(VERSION); c.put(req, r.clone()); }
      if (!listo) { listo = true; resolve(r); }
    }).catch(async () => {
      clearTimeout(t); const r = await usarCache();
      if (!listo) { listo = true; resolve(r || new Response('Sin conexión', { status: 503, statusText: 'Sin conexión' })); }
    });
  });
}
async function cachePrimero(req) {
  const r = await caches.match(req);
  if (r) return r;
  const resp = await fetch(req);
  if (resp && resp.ok) { const c = await caches.open(VERSION); c.put(req, resp.clone()); }
  return resp;
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {   // abrir la app: si no hay internet, se abre la guardada
      e.respondWith((async () => (await redOCache(req, 3500)) || (await caches.match('index.html')) || (await caches.match('./')))());
      return;
    }
    if (/\.(pdf)$/i.test(url.pathname)) { e.respondWith(cachePrimero(req).catch(() => new Response('', { status: 503 }))); return; }
    if (url.search.includes('v=')) { e.respondWith(cachePrimero(req).catch(() => new Response('', { status: 503 }))); return; }   // archivos con versión: no cambian
    e.respondWith(redOCache(req, 3500));
    return;
  }
  if (HOSTS_EXTERNOS.includes(url.hostname)) { e.respondWith(cachePrimero(req).catch(() => new Response('', { status: 503 }))); return; }
  // todo lo demás (IA, licencias, cuentas de Google/Firebase) pasa directo a internet
});
