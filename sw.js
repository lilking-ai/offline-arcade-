// Caches the whole app (games + ads) so it works with no internet after the first visit.
const CACHE = 'offline-arcade-v9';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './ads/ads.js',
  ...['util', 'xo', 'connect4', 'snake', 'checkers', 'pong', 'football', 'dots', 'memory', 'reaction',
    'g2048', 'minesweeper', 'sudoku', 'maze', 'words', 'simon', 'chess', 'ludo', 'gomoku', 'mancala',
    'fx', 'rps', 'flappy', 'breakout', 'whack', 'hangman', 'puzzle15', 'lightsout', 'hanoi'].map((g) => `./games/${g}.js`),
];
const ADS = ['volt-1', 'volt-2', 'volt-3', 'kettlecrow-coffee', 'fizzr-energy', 'loopa-app'].map((a) => `./ads/${a}.mp4`);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// iPhone/iPad Safari asks for videos in pieces ("Range" requests), so answer those from the cache too.
async function rangeResponse(request, cached) {
  const buf = await cached.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  const start = m && m[1] ? Number(m[1]) : 0;
  const end = m && m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

// Online: always fetch the newest file (and refresh the offline copy).
// Offline: use the saved copy. Videos use the cache first because they're big.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const isVideo = e.request.url.endsWith('.mp4');
    const cached = await caches.match(e.request, { ignoreSearch: true });
    if (isVideo && cached) return e.request.headers.has('range') ? rangeResponse(e.request, cached) : cached;
    try {
      const fresh = await fetch(e.request, { cache: 'no-store' });
      if (fresh.ok && fresh.status === 200 && new URL(e.request.url).origin === location.origin) {
        const copy = fresh.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      }
      return fresh;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  })());
});
