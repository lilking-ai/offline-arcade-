// Lights Out: tapping a light flips it and its neighbours. Turn them all off. 300 levels.
// Solve in the target number of moves for 3 stars. Undo and restart any time.
import { rng, levelBar } from './util.js';
import { sfx, confetti, stars } from './fx.js';
const MAX = 300;

export function mount(stage, { roundOver }) {
  let n, on, start, moves, done, par, history;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'lightsout', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="scores"><div class="score p1"><span>Moves</span><b id="mv">0</b></div><div class="score p2"><span>Target</span><b id="par">0</b></div></div>
    <div class="status" id="status" role="status"></div>
    <div class="lights2" id="board"></div>
    <div class="row-btns"><button class="btn" id="undo">Undo</button><button class="btn" id="restart">Restart</button></div>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const board = el('board');
  el('next').addEventListener('click', () => lv.next());
  el('undo').addEventListener('click', () => { if (done || !history.length) return; flip(history.pop()); moves--; sfx.drop(); render(); });
  el('restart').addEventListener('click', () => { on = start.slice(); moves = 0; history = []; done = false; render(); });

  function flip(i) {
    const r = Math.floor(i / n), c = i % n;
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < n && cc >= 0 && cc < n) on[rr * n + cc] = !on[rr * n + cc];
    });
  }
  function load(level) {
    n = level <= 120 ? 5 : level <= 240 ? 6 : 7;
    on = Array(n * n).fill(false);
    const rand = rng(level * 97 + 3), pressed = new Set();
    const count = Math.min(n * n - 4, 3 + Math.floor(level / 12));
    while (pressed.size < count) pressed.add(Math.floor(rand() * n * n));
    pressed.forEach(flip);
    if (!on.some(Boolean)) { flip(Math.floor(n * n / 2)); pressed.add(Math.floor(n * n / 2)); }
    par = pressed.size;
    start = on.slice(); moves = 0; done = false; history = [];
    board.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    board.innerHTML = '';
    for (let i = 0; i < n * n; i++) {
      const b = document.createElement('button');
      b.innerHTML = '<span class="bulb"></span>';
      b.addEventListener('click', () => tap(i));
      board.appendChild(b);
    }
    render();
  }
  function tap(i) {
    if (done) return;
    flip(i); moves++; history.push(i);
    sfx.tap();
    const cells = board.children, r = Math.floor(i / n), c = i % n;
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
        const b = cells[rr * n + cc];
        b.classList.remove('ripple'); void b.offsetWidth; b.classList.add('ripple');
      }
    });
    if (!on.some(Boolean)) { done = true; lv.complete(); sfx.win(); confetti(); roundOver(); }
    render();
  }
  function render() {
    [...board.children].forEach((b, i) => {
      b.classList.toggle('on', on[i]);
      b.setAttribute('aria-label', `Light ${i + 1} ${on[i] ? 'on' : 'off'}`);
    });
    el('mv').textContent = moves;
    el('par').textContent = par;
    const s = moves <= par ? 3 : moves <= par * 2 ? 2 : 1;
    el('status').textContent = done ? `Lights out! ${stars(s)}` : `${on.filter(Boolean).length} lights on`;
    el('next').hidden = !done || lv.level >= MAX;
    el('undo').disabled = done || !history.length;
  }
  load(lv.level);
  return () => {};
}
