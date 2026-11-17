// Offline Arcade — hub, routing, ads and offline support.
import { ADS, AD_SECONDS, ROUNDS_BETWEEN_ADS, ADS_ENABLED } from './ads/ads.js';

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
  { id: 'chess', name: 'Chess', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #2b2b36, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M70 170 h70 l-6 -22 q16 -12 12 -34 l-12 -12 q8 -12 -4 -20 l-16 4 -24 24 q-8 12 4 20 l16 -8 q-12 16 -10 26 z' fill='#e8e6e1'/></svg>`) },
  { id: 'ludo', name: 'Ludo', tag: '2–4 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #3a2a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='55' y='55' width='90' height='90' rx='18' fill='#f3f1ec'/><circle cx='78' cy='78' r='9' fill='#111'/><circle cx='122' cy='78' r='9' fill='#111'/><circle cx='100' cy='100' r='9' fill='#111'/><circle cx='78' cy='122' r='9' fill='#111'/><circle cx='122' cy='122' r='9' fill='#111'/></svg>`) },
  { id: 'football', name: 'Football', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 30%, #0e3a1a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='30' width='120' height='170' rx='6' fill='none' stroke='rgba(255,255,255,.35)' stroke-width='4'/><line x1='40' y1='115' x2='160' y2='115' stroke='rgba(255,255,255,.35)' stroke-width='4'/><circle cx='100' cy='100' r='26' fill='#f3f1ec'/><path d='M100 88 l11 8 -4 13 h-14 l-4 -13 z' fill='#111'/><circle cx='70' cy='160' r='16' fill='#ff6a2b'/></svg>`) },
  { id: 'checkers', name: 'Checkers', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #3a1a0a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='80' cy='95' r='30' fill='#ff6a2b'/><circle cx='80' cy='88' r='30' fill='#ff8a4f'/><circle cx='125' cy='140' r='30' fill='#1a3ea8'/><circle cx='125' cy='133' r='30' fill='#3b7bff'/><circle cx='125' cy='133' r='18' fill='none' stroke='#ffc34d' stroke-width='5'/></svg>`) },
  { id: 'pong', name: 'Pong', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 50%, #1b1b30, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='60' y='40' width='80' height='12' rx='6' fill='#3b7bff'/><rect x='60' y='170' width='80' height='12' rx='6' fill='#ff6a2b'/><circle cx='118' cy='105' r='10' fill='#fff'/><line x1='30' y1='112' x2='170' y2='112' stroke='rgba(255,255,255,.2)' stroke-width='3' stroke-dasharray='8 8'/></svg>`) },
  { id: 'dots', name: 'Dots & Boxes', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 40% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='55' y='55' width='45' height='45' fill='rgba(255,106,43,.35)'/><rect x='100' y='100' width='45' height='45' fill='rgba(59,123,255,.35)'/><path d='M55 55 h45 v45 h-45 z' fill='none' stroke='#ff6a2b' stroke-width='6'/><path d='M100 100 h45 v45 h-45 z' fill='none' stroke='#3b7bff' stroke-width='6'/>${[55, 100, 145].map(x => [55, 100, 145].map(y => `<circle cx='${x}' cy='${y}' r='7' fill='#f3f1ec'/>`).join('')).join('')}</svg>`) },
  { id: 'memory', name: 'Memory', tag: 'Solo · 2 players', filters: ['2p', 'solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2a0f2e, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='50' width='55' height='75' rx='10' fill='#1b1c28' stroke='#ff6a2b' stroke-width='3'/><rect x='105' y='50' width='55' height='75' rx='10' fill='#171824'/><circle cx='132' cy='87' r='16' fill='#c26bff'/><rect x='40' y='135' width='55' height='75' rx='10' fill='#171824'/><circle cx='67' cy='172' r='16' fill='#c26bff'/><rect x='105' y='135' width='55' height='75' rx='10' fill='#1b1c28' stroke='#ff6a2b' stroke-width='3'/></svg>`) },
  { id: 'reaction', name: 'Reaction Duel', tag: '2 players · fastest finger', filters: ['2p'],
    style: art('radial-gradient(circle at 50% 50%, #0f3d2a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M110 30 L60 130 H100 L85 210 L145 100 H105 Z' fill='#38e08a'/></svg>`) },
  { id: 'g2048', name: '2048', tag: 'Solo · high score', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #3a1a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='45' y='50' width='50' height='50' rx='10' fill='#ff6a2b'/><rect x='105' y='50' width='50' height='50' rx='10' fill='#ffc34d'/><rect x='45' y='110' width='50' height='50' rx='10' fill='#383848'/><rect x='105' y='110' width='50' height='50' rx='10' fill='#6b4dff'/><text x='130' y='143' font-family='sans-serif' font-weight='900' font-size='20' fill='#fff' text-anchor='middle'>2048</text></svg>`) },
  { id: 'minesweeper', name: 'Minesweeper', tag: 'Solo · 3 sizes', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2e0a12, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='100' cy='110' r='34' fill='#f3f1ec'/><g stroke='#f3f1ec' stroke-width='8' stroke-linecap='round'><path d='M100 60 v-12 M100 160 v12 M50 110 h-12 M150 110 h12 M66 76 l-9 -9 M134 144 l9 9 M134 76 l9 -9 M66 144 l-9 9'/></g><circle cx='90' cy='100' r='8' fill='#ff4d5e'/></svg>`) },
  { id: 'sudoku', name: 'Sudoku', tag: '500 levels', filters: ['solo', 'puzzle'], levels: 500,
    style: art('radial-gradient(circle at 50% 30%, #121f44, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='45' width='120' height='120' rx='8' fill='none' stroke='#5a5a6e' stroke-width='4'/><path d='M80 45 v120 M120 45 v120 M40 85 h120 M40 125 h120' stroke='#5a5a6e' stroke-width='3'/><g font-family='sans-serif' font-weight='900' font-size='26' text-anchor='middle'><text x='60' y='75' fill='#f3f1ec'>5</text><text x='100' y='115' fill='#6197ff'>3</text><text x='140' y='155' fill='#ff6a2b'>9</text></g></svg>`) },
  { id: 'maze', name: 'Maze', tag: '500 levels', filters: ['solo', 'puzzle'], levels: 500,
    style: art('radial-gradient(circle at 50% 30%, #0f1e48, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M40 40 H160 V170 H40 Z M70 40 V100 H110 M130 70 V140 H70 M40 130 H100' fill='none' stroke='#3b7bff' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/><circle cx='55' cy='155' r='9' fill='#ff6a2b'/></svg>`) },
  { id: 'words', name: 'Word Guess', tag: '150+ words', filters: ['solo', 'puzzle'], levels: 150,
    style: art('radial-gradient(circle at 50% 30%, #1d2a12, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${'GAMES'.split('').map((ch, i) => `<rect x='${22 + i * 32}' y='90' width='28' height='28' rx='5' fill='${['#2e9e5b', '#c99a1a', '#2a2a36', '#2e9e5b', '#2e9e5b'][i]}'/><text x='${36 + i * 32}' y='111' font-family='sans-serif' font-weight='900' font-size='18' fill='#fff' text-anchor='middle'>${ch}</text>`).join('')}</svg>`) },
  { id: 'simon', name: 'Simon', tag: 'Solo · memory', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='45' y='45' width='52' height='52' rx='14' fill='#ff6a2b'/><rect x='103' y='45' width='52' height='52' rx='14' fill='#3b7bff' opacity='.4'/><rect x='45' y='103' width='52' height='52' rx='14' fill='#ffc34d' opacity='.4'/><rect x='103' y='103' width='52' height='52' rx='14' fill='#38e08a' opacity='.4'/></svg>`) },
  { id: 'gomoku', name: 'Five in a Row', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #4a3416, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${[0, 1, 2, 3, 4].map(i => `<circle cx='${50 + i * 25}' cy='${50 + i * 25}' r='11' fill='#ff6a2b'/>`).join('')}<circle cx='150' cy='60' r='11' fill='#3b7bff'/><circle cx='60' cy='150' r='11' fill='#3b7bff'/></svg>`) },
  { id: 'mancala', name: 'Mancala', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #4a2a10, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='25' y='70' width='150' height='90' rx='40' fill='#5a3a1c'/>${[0, 1, 2].map(i => `<circle cx='${70 + i * 30}' cy='97' r='11' fill='#1e1208'/><circle cx='${70 + i * 30}' cy='133' r='11' fill='#1e1208'/>`).join('')}<circle cx='70' cy='97' r='4' fill='#ffc34d'/><circle cx='100' cy='133' r='4' fill='#ff6a2b'/></svg>`) },
  { id: 'rps', name: 'Rock Paper Scissors', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='70' cy='90' r='30' fill='#ff6a2b'/><rect x='110' y='60' width='50' height='64' rx='6' fill='#f3f1ec'/><path d='M80 180 L130 130 M120 180 L70 130' stroke='#3b7bff' stroke-width='12' stroke-linecap='round'/></svg>`) },
  { id: 'flappy', name: 'Flappy', tag: 'Solo · high score', filters: ['solo'],
    style: art('radial-gradient(circle at 50% 30%, #2a1a40, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='130' y='0' width='40' height='80' rx='8' fill='#2a5ad0'/><rect x='130' y='150' width='40' height='100' rx='8' fill='#2a5ad0'/><circle cx='80' cy='115' r='22' fill='#ffc34d'/><circle cx='88' cy='108' r='4' fill='#111'/><path d='M100 113 l14 5 -14 5 z' fill='#ff6a2b'/></svg>`) },
  { id: 'breakout', name: 'Breakout', tag: '100 levels', filters: ['solo'], levels: 100,
    style: art('radial-gradient(circle at 50% 30%, #2e0a12, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${['#ff4d5e', '#ff6a2b', '#ffc34d', '#38e08a'].map((c, r) => [0, 1, 2, 3].map(k => `<rect x='${30 + k * 36}' y='${40 + r * 20}' width='32' height='14' rx='3' fill='${c}'/>`).join('')).join('')}<circle cx='110' cy='150' r='8' fill='#fff'/><rect x='70' y='190' width='70' height='10' rx='5' fill='#ff8a4f'/></svg>`) },
  { id: 'whack', name: 'Whack-a-Mole', tag: 'Solo · 30 seconds', filters: ['solo'],
    style: art('radial-gradient(circle at 50% 30%, #3a2614, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><ellipse cx='100' cy='160' rx='60' ry='18' fill='#050508'/><path d='M65 160 q0 -70 35 -70 q35 0 35 70 z' fill='#a06a45'/><circle cx='88' cy='115' r='5' fill='#111'/><circle cx='112' cy='115' r='5' fill='#111'/><ellipse cx='100' cy='130' rx='9' ry='6' fill='#ff7ab6'/></svg>`) },
  { id: 'hangman', name: 'Hangman', tag: '120 words', filters: ['solo', 'puzzle'], levels: 120,
    style: art('radial-gradient(circle at 50% 30%, #1d1d2e, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M40 190 H130 M70 190 V40 H140 V60' stroke='#5a5a6e' stroke-width='8' fill='none' stroke-linecap='round'/><g stroke='#ff6a2b' stroke-width='7' fill='none' stroke-linecap='round'><circle cx='140' cy='78' r='18'/><path d='M140 96 V140 M140 108 L120 126 M140 108 L160 126'/></g></svg>`) },
  { id: 'puzzle15', name: 'Sliding Puzzle', tag: '300 levels', filters: ['solo', 'puzzle'], levels: 300,
    style: art('radial-gradient(circle at 50% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${[1, 2, 3, 4, 5, 6, 7, 8, 0].map((t, i) => t ? `<rect x='${40 + (i % 3) * 42}' y='${45 + Math.floor(i / 3) * 42}' width='38' height='38' rx='7' fill='${t === i + 1 ? '#ff6a2b' : '#3a3a4a'}'/><text x='${59 + (i % 3) * 42}' y='${71 + Math.floor(i / 3) * 42}' font-family='sans-serif' font-weight='900' font-size='18' fill='#fff' text-anchor='middle'>${t}</text>` : '').join('')}</svg>`) },
  { id: 'lightsout', name: 'Lights Out', tag: '300 levels', filters: ['solo', 'puzzle'], levels: 300,
    style: art('radial-gradient(circle at 50% 30%, #3a2a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${[...Array(16).keys()].map(i => `<rect x='${40 + (i % 4) * 31}' y='${45 + Math.floor(i / 4) * 31}' width='27' height='27' rx='6' fill='${[1, 4, 5, 6, 9, 14].includes(i) ? '#ffc34d' : '#1c1d28'}'/>`).join('')}</svg>`) },
  { id: 'hanoi', name: 'Tower of Hanoi', tag: '8 levels · 3–10 discs', filters: ['solo', 'puzzle'], levels: 8,
    style: art('radial-gradient(circle at 50% 30%, #1d1d2e, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='97' y='50' width='6' height='130' rx='3' fill='#5a5a6e'/><rect x='60' y='160' width='80' height='18' rx='9' fill='#3b7bff'/><rect x='70' y='138' width='60' height='18' rx='9' fill='#38e08a'/><rect x='80' y='116' width='40' height='18' rx='9' fill='#ffc34d'/><rect x='88' y='94' width='24' height='18' rx='9' fill='#ff6a2b'/></svg>`) },
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
  GAMES.filter((g) => filter === 'all' || g.filters.includes(filter)).sort((a, b) => !!a.soon - !!b.soon).forEach((g) => {
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
// Full-screen ads come from ads/ads.js and run for AD_SECONDS, no skipping.
// Because the ad files live inside the app, they also play offline.
let adIndex = 0, adTimer = null;

function roundOver() {
  if (!ADS_ENABLED) return;
  roundsSinceAd++;
  if (roundsSinceAd >= ROUNDS_BETWEEN_ADS) {
    roundsSinceAd = 0;
    setTimeout(showAd, 900);
  }
}

function showAd() {
  const ad = ADS.length ? ADS[adIndex++ % ADS.length] : null;
  const media = $('#ad-media');
  media.innerHTML = '';
  if (ad && ad.type === 'video') {
    const v = document.createElement('video');
    Object.assign(v, { src: `ads/${ad.src}`, playsInline: true, loop: true });
    v.setAttribute('playsinline', '');
    media.appendChild(v);
    // try with sound first; phones may block that, so fall back to muted with a sound button
    const snd = document.createElement('button');
    snd.className = 'ad-sound';
    snd.type = 'button';
    const setIcon = () => { snd.textContent = v.muted ? 'Tap for sound' : 'Sound on'; };
    snd.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); v.muted = !v.muted; v.play().catch(() => {}); setIcon(); });
    media.appendChild(snd);
    v.play().then(setIcon).catch(() => { v.muted = true; setIcon(); v.play().catch(() => {}); });
  } else if (ad) {
    const img = document.createElement('img');
    img.src = `ads/${ad.src}`;
    img.alt = 'Advertisement';
    media.appendChild(img);
  } else {
    media.innerHTML = '<p class="ad-empty">Your ad here<br><small>Add ad files in ads/ads.js</small></p>';
  }
  if (ad && ad.link) media.href = ad.link; else media.removeAttribute('href');

  const btn = $('#close-ad');
  let left = AD_SECONDS;
  btn.disabled = true;
  $('#interstitial').hidden = false;
  const tick = () => {
    $('#ad-timer').textContent = left;
    $('#ad-progress').style.width = `${((AD_SECONDS - left) / AD_SECONDS) * 100}%`;
    btn.textContent = left > 0 ? `Continue in ${left}s` : 'Continue';
    btn.disabled = left > 0;
    if (left <= 0) clearInterval(adTimer);
    left--;
  };
  clearInterval(adTimer);
  tick();
  adTimer = setInterval(tick, 1000);
}

$('#close-ad').addEventListener('click', () => {
  if ($('#close-ad').disabled) return;
  $('#interstitial').hidden = true;
  $('#ad-media').innerHTML = '';
});

function updateNet() {
  const online = navigator.onLine;
  const net = $('#net');
  net.textContent = online ? 'Online' : 'Offline mode';
  net.classList.toggle('off', !online);
  document.querySelectorAll('[data-ad="banner"]').forEach((slot) => {
    slot.hidden = !online || !ADS_ENABLED;
    slot.innerHTML = '<span class="ad-tag">AD</span> Banner ad · 320×50';
  });
}
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);

// ---------- install hint (iPhone/iPad Safari) ----------
const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let hintDismissed = false;
try { hintDismissed = localStorage.getItem('oa-install-x') === '1'; } catch (e) {}
if (ios && !standalone && !hintDismissed) $('#install').hidden = false;
$('#install-x').addEventListener('click', () => {
  $('#install').hidden = true;
  try { localStorage.setItem('oa-install-x', '1'); } catch (e) {}
});

// ---------- offline ----------
// The app checks for updates every time it opens (when online) and reloads itself
// onto the new version, so players never get stuck on an old copy.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) { reloading = true; location.reload(); }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      check();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    }).catch(() => {});
  });
}

const live = GAMES.filter((g) => !g.soon);
const levels = live.reduce((n, g) => n + (g.levels || 1), 0);
$('#count').textContent = `${live.length} games · ${levels.toLocaleString()} levels`;
renderGrid();
updateNet();
const start = location.hash.slice(1);
if (start) openGame(start);
