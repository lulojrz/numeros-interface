import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precargar assets compilados por Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Caching en tiempo real para las peticiones GET (Ej: Cargar turnos, números, experiencias)
registerRoute(
    ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: []
    })
);

registerRoute(
    ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/experiencias/traer'),
    new NetworkFirst({
        cacheName: 'experiencias-cache',
        plugins: []
    })
);

// 2. Background Sync para peticiones POST, PUT, DELETE
const bgSyncPlugin = new BackgroundSyncPlugin('api-sync-queue', {
    maxRetentionTime: 24 * 60, // Reintentar hasta por 24 horas
});

registerRoute(
    ({ request, url }) => ['POST', 'PUT', 'DELETE'].includes(request.method) && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/experiencias/')),
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    })
);

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});
