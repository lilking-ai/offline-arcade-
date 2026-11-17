// Sliding Puzzle: put the tiles in order. 300 levels, 3×3 up to 5×5.
// Number or picture mode, sliding animation, timer, stars for few moves.
import { rng, levelBar, store } from './util.js';
import { sfx, confetti, stars } from './fx.js';

const MAX = 300;
const SCENES = [
  ['#ff9a5a', '#ff5e7e', '#3a1c5a', '#1a0f30', '#ffd28a'],
  ['#7fd6ff', '#3b7bff', '#163a7a', '#0a1a3a', '#ffffff'],
  ['#c9ff8a', '#38e08a', '#11603a', '#06301c', '#fff6c2'],
  ['#ffd6f0', '#c26bff', '#4a1a7a', '#1c0a33', '#ffe9a8'],
];
function sceneURI(level) {
  const [sky1, sky2, hill1, hill2, sun] = SCENES[level % SCENES.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
    <defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${sky1}'/><stop offset='1' stop-color='${sky2}'/></linearGradient></defs>
    <rect width='300' height='300' fill='url(#s)'/>
    <circle cx='${90 + (level % 5) * 30}' cy='110' r='42' fill='${sun}' opacity='.95'/>
    <path d='M0 190 L60 120 L110 170 L170 90 L240 165 L300 120 V300 H0 Z' fill='${hill1}'/>
    <path d='M0 240 L80 180 L150 230 L220 185 L300 230 V300 H0 Z' fill='${hill2}'/>
    <g fill='${hill2}'><path d='M40 250 l12 -40 l12 40 z'/><path d='M230 255 l14 -46 l14 46 z'/><path d='M260 262 l10 -30 l10 30 z'/></g>
    <g fill='#fff' opacity='.8'><circle cx='40' cy='40' r='1.5'/><circle cx='250' cy='60' r='1.5'/><circle cx='200' cy='30' r='1.2'/></g>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function mount(stage, { roundOver }) {
  let n, tiles, moves, done, t0, timer, mode = store.get('puzzle15-mode', 'numbers'), level;
  stage.innerHTML = '';
  const seg = document.createElement('div');
  seg.className = 'seg'; seg.setAttribute('role', 'group');
  seg.innerHTML = `<button data-m="numbers">Numbers</button><button data-m="picture">Picture</button>`;
  stage.appendChild(seg);
  const lv = levelBar(stage, { key: 'puzzle15', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="scores"><div class="score p1"><span>Moves</span><b id="mv">0</b></div><div class="score p2"><span>Time</span><b id="tm">0:00</b></div></div>
    <div class="status" id="status" role="status"></div>
    <div class="slide2" id="board"></div>
    <div class="row-btns"><button class="btn" id="peek">Show answer</button><button class="btn primary" id="next" hidden>Next level</button></div>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const board = el('board');
  el('next').addEventListener('click', () => lv.next());
  el('peek').addEventListener('pointerdown', () => board.classList.add('peek'));
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el('peek').addEventListener(ev, () => board.classList.remove('peek')));
  seg.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; store.set('puzzle15-mode', mode); paintMode(); }));

  const neighbours = (i) => {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n); if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1); if (c < n - 1) out.push(i + 1);
    return out;
  };
  const solved = () => tiles.every((t, k) => t === (k + 1) % (n * n));
  const par = () => Math.round((20 + level * 2) * 0.8);

  function load(lvl) {
    level = lvl;
    n = lvl <= 100 ? 3 : lvl <= 220 ? 4 : 5;
    tiles = [...Array(n * n).keys()].map((i) => (i + 1) % (n * n));
    const rand = rng(lvl * 2654435761);
    let blank = n * n - 1, prev = -1;
    for (let s = 0; s < 20 + lvl * 2 || solved(); s++) {
      const opts = neighbours(blank).filter((x) => x !== prev);
      const pick = opts[Math.floor(rand() * opts.length)];
      [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
      prev = blank; blank = pick;
    }
    moves = 0; done = false; clearInterval(timer); t0 = 0;
    el('tm').textContent = '0:00';
    build();
    render();
  }
  function build() {
    board.innerHTML = '';
    board.style.setProperty('--n', n);
    board.style.setProperty('--img', sceneURI(level));
    for (let t = 1; t < n * n; t++) {
      const b = document.createElement('button');
      b.className = 'tile2';
      b.dataset.t = t;
      const hr = Math.floor((t - 1) / n), hc = (t - 1) % n;
      b.style.backgroundPosition = `${(hc / (n - 1)) * 100}% ${(hr / (n - 1)) * 100}%`;
      b.innerHTML = `<span>${t}</span>`;
      b.setAttribute('aria-label', `Tile ${t}`);
      b.addEventListener('click', () => tap(tiles.indexOf(t)));
      board.appendChild(b);
    }
    paintMode();
  }
  function paintMode() {
    seg.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
    board.classList.toggle('picture', mode === 'picture');
    el('peek').hidden = mode !== 'picture' || done;
  }
  function tap(i) {
    if (done) return;
    const blank = tiles.indexOf(0);
    if (!neighbours(blank).includes(i)) return;
    if (!t0) { t0 = Date.now(); timer = setInterval(clock, 500); }
    [tiles[blank], tiles[i]] = [tiles[i], tiles[blank]];
    moves++; sfx.tap();
    if (solved()) {
      done = true; clearInterval(timer); lv.complete(); sfx.win(); confetti(); roundOver();
    }
    render();
  }
  function clock() {
    const s = Math.floor((Date.now() - t0) / 1000);
    el('tm').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  function render() {
    board.querySelectorAll('.tile2').forEach((b) => {
      const t = Number(b.dataset.t), i = tiles.indexOf(t);
      b.style.transform = `translate(${(i % n) * 100}%, ${Math.floor(i / n) * 100}%)`;
      b.classList.toggle('home', i === t - 1);
    });
    el('mv').textContent = moves;
    const s = moves <= par() ? 3 : moves <= par() * 2 ? 2 : 1;
    el('status').textContent = done ? `Solved! ${stars(s)}` : `Beat ${par()} moves for ★★★`;
    el('next').hidden = !done || lv.level >= MAX;
    paintMode();
  }
  load(lv.level);
  return () => clearInterval(timer);
}
