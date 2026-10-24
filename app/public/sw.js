// Service worker: precachea el shell para que la app abra sin red y quede
// instalable. No cachea respuestas de la API a propósito: los datos siempre
// se piden a la red, sólo el shell (HTML, JS, CSS, fuentes, imágenes) se
// guarda en el dispositivo.
const CACHE = "hexario-shell-v3";

// El SW se sirve desde /app/sw.js en producción. Resolver el shell contra su
// propia ubicación hace que funcione igual en local (donde vive en /).
const BASE = new URL("./", self.location).pathname;
const INDEX = `${BASE}index.html`;
const SHELL = [
    BASE,
    INDEX,
    `${BASE}manifest.webmanifest`,
    `${BASE}favicon.svg`,
    `${BASE}favicon.png`,
    `${BASE}icons/icon.svg`,
    `${BASE}icons/icon-maskable.svg`,
    `${BASE}icons/icon-192.png`,
    `${BASE}icons/icon-512.png`,
    `${BASE}icons/apple-touch-icon.png`
];
const CACHEABLE_DESTINATIONS = new Set(["script", "style", "font", "image", "worker"]);

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE)
            .then((cache) => cache.addAll(SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    // Sólo el shell propio: las teselas del mapa y la API siempre van a la red.
    if (url.origin !== self.location.origin) return;

    // Navegación (SPA): red primero, y si no hay red se sirve el shell cacheado
    // para que el router resuelva la ruta del lado del cliente.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(INDEX, copy));
                    return response;
                })
                .catch(async () => (await caches.match(INDEX)) || offlineFallback())
        );
        return;
    }

    if (!CACHEABLE_DESTINATIONS.has(request.destination)) return;

    // Assets con hash de Vite: cache primero, sin revalidar.
    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request).then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
        )
    );
});

// Último recurso: si el shell no quedó cacheado (p. ej. la primera visita fue
// sin red), igual hay que responder algo legible en vez del error del navegador.
function offlineFallback() {
    return new Response(
        '<!doctype html><meta charset="utf-8"><title>Sin conexión</title><p>Sin conexión. Volvé a abrir Hexario cuando tengas red.',
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
}
