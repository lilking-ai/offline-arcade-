// Lights Out: tapping a light flips it and its neighbours. Turn them all off. 300 levels.
import { rng, levelBar } from './util.js';
const MAX = 300;

export function mount(stage, { roundOver }) {
  let n, on, moves, done;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'lightsout', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="lights" id="board"></div>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  el('next').addEventListener('click', () => lv.next());

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
    // build the puzzle by pressing random lights, so it's always solvable
    const rand = rng(level * 97 + 3);
    const presses = 3 + Math.floor(level / 15);
    for (let k = 0; k < presses; k++) flip(Math.floor(rand() * n * n));
    if (!on.some(Boolean)) flip(Math.floor(n * n / 2));
    moves = 0; done = false;
    el('board').style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    render();
  }
  function tap(i) {
    if (done) return;
    flip(i); moves++;
    if (!on.some(Boolean)) { done = true; lv.complete(); roundOver(); }
    render();
  }
  function render() {
    const b = el('board');
    b.innerHTML = '';
    on.forEach((v, i) => {
      const btn = document.createElement('button');
      btn.className = v ? 'on' : '';
      btn.setAttribute('aria-label', `Light ${i + 1} ${v ? 'on' : 'off'}`);
      btn.addEventListener('click', () => tap(i));
      b.appendChild(btn);
    });
    el('status').textContent = done ? `Lights out in ${moves} moves!` : `${on.filter(Boolean).length} lights on · ${moves} moves`;
    el('next').hidden = !done || lv.level >= MAX;
  }
  load(lv.level);
  return () => {};
}
