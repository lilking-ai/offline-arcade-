// Offline Arcade — hub, routing, ads and offline support.

const art = (bg, svg) =>
  `background:${bg};` +
  `background-image:url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}"),${bg};` +
  `background-size:cover;background-position:center;`;

const GAMES = [
  {
    id: 'xo', name: 'XO', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 70% 30%, #5a1d08, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><g fill='none' stroke-linecap='round'><path d='M40 50 L110 120 M110 50 L40 120' stroke='#ff6a2b' stroke-width='20'/><circle cx='140' cy='150' r='34' stroke='#3b7bff' stroke-width='18'/></g></svg>`),
  },
  {
    id: 'connect4', name: 'Connect 4', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 30% 30%, #1a2d6b, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><g>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx='${40 + c * 40}' cy='${50 + r * 40}' r='15' fill='${(r + c) % 3 === 0 ? '#ff6a2b' : (r + c) % 3 === 1 ? '#ffc34d' : '#070a18'}'/>`).join('')).join('')}</g></svg>`),
  },
  {
    id: 'snake', name: 'Snake', tag: 'Solo · high score', filters: ['solo'],
    style: art('radial-gradient(circle at 60% 40%, #0f3d2a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M30 160 H90 V90 H150 V50' fill='none' stroke='#38e08a' stroke-width='18' stroke-linejoin='round' stroke-linecap='round'/><circle cx='150' cy='130' r='9' fill='#ff6a2b'/></svg>`),
  },
  { id: 'chess', name: 'Chess', tag: 'Coming soon', filters: ['2p', 'board'], soon: true,
    style: art('radial-gradient(circle at 50% 30%, #2b2b36, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M70 170 h70 l-6 -22 q16 -12 12 -34 l-12 -12 q8 -12 -4 -20 l-16 4 -24 24 q-8 12 4 20 l16 -8 q-12 16 -10 26 z' fill='#e8e6e1'/></svg>`) },
  { id: 'ludo', name: 'Ludo', tag: 'Coming soon', filters: ['2p', 'board'], soon: true,
    style: art('radial-gradient(circle at 50% 30%, #3a2a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='55' y='55' width='90' height='90' rx='18' fill='#f3f1ec'/><circle cx='78' cy='78' r='9' fill='#111'/><circle cx='122' cy='78' r='9' fill='#111'/><circle cx='100' cy='100' r='9' fill='#111'/><circle cx='78' cy='122' r='9' fill='#111'/><circle cx='122' cy='122' r='9' fill='#111'/></svg>`) },
  { id: 'football', name: 'Football', tag: 'Coming soon', filters: ['2p'], soon: true,
    style: art('radial-gradient(circle at 50% 30%, #0e3a1a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='100' cy='100' r='46' fill='#f3f1ec'/><path d='M100 80 l18 13 -7 21 h-22 l-7 -21 z' fill='#111'/></svg>`) },
];

const $ = (s) => document.querySelector(s);
const hub = $('#hub');
const gameScreen = $('#game');
const stage = $('#stage');
let cleanup = null;
let roundsSinceAd = 0;

// ---------- hub ----------
function renderGrid(filter = 'all') {
  const grid = $('#grid');
  grid.innerHTML = '';
  GAMES.filter((g) => filter === 'all' || g.filters.includes(filter)).forEach((g) => {
    const b = document.createElement('button');
    b.className = 'card' + (g.soon ? ' soon' : '');
    b.setAttribute('aria-label', g.soon ? `${g.name}, coming soon` : `Play ${g.name}`);
    b.innerHTML = `<div class="art"></div>
      ${g.soon ? '<span class="badge">SOON</span>' : ''}
      <div class="meta"><span class="name">${g.name}</span><span class="tag">${g.tag}</span></div>`;
    b.querySelector('.art').style.cssText = g.style;
    if (!g.soon) b.addEventListener('click', () => openGame(g.id));
    grid.appendChild(b);
  });
}

document.querySelectorAll('.chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
    chip.classList.add('on');
    renderGrid(chip.dataset.filter);
  }));

document.querySelectorAll('[data-open]').forEach((el) =>
  el.addEventListener('click', () => openGame(el.dataset.open)));

// ---------- routing ----------
async function openGame(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g || g.soon) return;
  const mod = await import(`./games/${id}.js`);
  $('#game-title').textContent = g.name;
  hub.classList.remove('active');
  gameScreen.classList.add('active');
  stage.innerHTML = '';
  cleanup = mod.mount(stage, { roundOver });
  history.pushState({ game: id }, '', `#${id}`);
}

function closeGame() {
  if (cleanup) cleanup();
  cleanup = null;
  gameScreen.classList.remove('active');
  hub.classList.add('active');
}

$('#back').addEventListener('click', () => history.back());
window.addEventListener('popstate', () => { if (gameScreen.classList.contains('active')) closeGame(); });

// ---------- ads ----------
// Ads only show when the device is online. Swap the placeholders below for a real
// ad network (e.g. AdSense for web, AdMob if you wrap this as an Android app).
const ONLINE_ADS_EVERY = 3; // interstitial after every 3 finished rounds

function roundOver() {
  roundsSinceAd++;
  if (navigator.onLine && roundsSinceAd >= ONLINE_ADS_EVERY) {
    roundsSinceAd = 0;
    setTimeout(() => { $('#interstitial').hidden = false; }, 900);
  }
}
$('#close-ad').addEventListener('click', () => { $('#interstitial').hidden = true; });

function updateNet() {
  const online = navigator.onLine;
  const net = $('#net');
  net.textContent = online ? 'Online' : 'Offline mode';
  net.classList.toggle('off', !online);
  document.querySelectorAll('[data-ad="banner"]').forEach((slot) => {
    slot.hidden = !online;
    slot.innerHTML = '<span class="ad-tag">AD</span> Banner ad · 320×50';
  });
}
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);

// ---------- offline ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

renderGrid();
updateNet();
const start = location.hash.slice(1);
if (start) openGame(start);
