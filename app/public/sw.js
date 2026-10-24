// Service worker: precachea el shell para que la app abra sin red y quede
// instalable. No cachea respuestas de la API a propósito: los datos siempre
// se piden a la red, sólo el shell (HTML, JS, CSS, fuentes, imágenes) se
// guarda en el dispositivo.
const CACHE = "hexario-shell-v2";
const SHELL = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/favicon.svg",
    "/favicon.png",
    "/icons/icon.svg",
    "/icons/icon-maskable.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/apple-touch-icon.png"
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
                    caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
                    return response;
                })
                .catch(async () => (await caches.match("/index.html")) || offlineFallback())
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
