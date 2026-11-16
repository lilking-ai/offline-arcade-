// Caches the whole app so it works with no internet after the first visit.
const CACHE = 'offline-arcade-v3';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './games/xo.js',
  './games/connect4.js',
  './games/snake.js',
  './games/util.js',
  './games/checkers.js',
  './games/pong.js',
  './games/football.js',
  './games/dots.js',
  './games/memory.js',
  './games/reaction.js',
  './games/g2048.js',
  './games/minesweeper.js',
  './games/sudoku.js',
  './games/maze.js',
  './games/words.js',
  './games/simon.js',
  './games/chess.js',
  './games/ludo.js',
  './games/gomoku.js',
  './games/mancala.js',
  './games/rps.js',
  './games/flappy.js',
  './games/breakout.js',
  './games/whack.js',
  './games/hangman.js',
  './games/puzzle15.js',
  './games/lightsout.js',
  './games/hanoi.js',
  './ads/ads.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
