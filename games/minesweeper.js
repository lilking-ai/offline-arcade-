// Minesweeper: three sizes. Tap to dig, switch to flag mode to mark mines.
import { store } from './util.js';

const SIZES = { easy: [9, 10], medium: [12, 24], hard: [14, 40] };

export function mount(stage, { roundOver }) {
  let size = 'easy', n, mines, cells, flagMode, over, started, t0, timer;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Difficulty">
      <button data-size="easy" class="on">Easy</button>
      <button data-size="medium">Medium</button>
      <button data-size="hard">Hard</button>
    </div>
    <div class="scores">
      <div class="score p1"><span>Mines</span><b id="left">0</b></div>
      <div class="score p2"><span>Time</span><b id="time">0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="mines" id="board"></div>
    <div class="seg" role="group" aria-label="Tap action">
      <button data-flag="0" class="on">Dig</button>
      <button data-flag="1">Flag</button>
    </div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');

  function reset() {
    [n, mines] = SIZES[size];
    cells = Array.from({ length: n * n }, () => ({ mine: false, open: false, flag: false, num: 0 }));
    over = false; started = false; clearInterval(timer);
    el('time').textContent = 0;
    boardEl.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    boardEl.innerHTML = '';
    cells.forEach((_, i) => {
      const b = document.createElement('button');
      b.addEventListener('click', () => tap(i));
      b.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(i); });
      boardEl.appendChild(b);
    });
    render();
  }

  const around = (i) => {
    const r = Math.floor(i / n), c = i % n, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if ((dr || dc) && rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
    }
    return out;
  };

  function plant(safe) {
    const forbidden = new Set([safe, ...around(safe)]);
    let placed = 0;
    while (placed < mines) {
      const i = Math.floor(Math.random() * n * n);
      if (!cells[i].mine && !forbidden.has(i)) { cells[i].mine = true; placed++; }
    }
    cells.forEach((c, i) => { c.num = around(i).filter((j) => cells[j].mine).length; });
    started = true;
    t0 = Date.now();
    timer = setInterval(() => { el('time').textContent = Math.floor((Date.now() - t0) / 1000); }, 500);
  }

  function toggleFlag(i) {
    if (over || cells[i].open) return;
    cells[i].flag = !cells[i].flag;
    render();
  }

  function tap(i) {
    if (over) return;
    if (flagMode) return toggleFlag(i);
    const c = cells[i];
    if (c.flag || c.open) return;
    if (!started) plant(i);
    if (c.mine) {
      over = 'lost';
      cells.forEach((x) => { if (x.mine) x.open = true; });
      clearInterval(timer); roundOver(); render(); return;
    }
    const stack = [i];
    while (stack.length) {
      const j = stack.pop();
      if (cells[j].open || cells[j].flag) continue;
      cells[j].open = true;
      if (!cells[j].num) stack.push(...around(j));
    }
    if (cells.every((x) => x.mine || x.open)) {
      over = 'won';
      clearInterval(timer);
      const t = Math.floor((Date.now() - t0) / 1000), key = 'mines-best-' + size;
      const best = store.get(key, 0);
      if (!best || t < best) store.set(key, t);
      roundOver();
    }
    render();
  }

  function render() {
    [...boardEl.children].forEach((b, i) => {
      const c = cells[i];
      b.className = 'cell' + (c.open ? ' open' : '') + (c.open && c.mine ? ' boom' : '') + (c.open && c.num && !c.mine ? ' n' + c.num : '');
      b.textContent = c.open ? (c.mine ? '✹' : c.num || '') : c.flag ? '⚑' : '';
      b.setAttribute('aria-label', c.open ? (c.mine ? 'Mine' : `${c.num} mines around`) : c.flag ? 'Flagged' : 'Hidden');
    });
    el('left').textContent = mines - cells.filter((c) => c.flag).length;
    const best = store.get('mines-best-' + size, 0);
    el('status').textContent = over === 'won' ? `Cleared in ${el('time').textContent}s!` : over === 'lost' ? 'Boom! Try again.' : best ? `Best time: ${best}s` : '';
  }

  stage.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-size]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); size = b.dataset.size; reset();
  }));
  stage.querySelectorAll('[data-flag]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-flag]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); flagMode = b.dataset.flag === '1';
  }));
  el('again').addEventListener('click', reset);
  flagMode = false;
  reset();
  return () => clearInterval(timer);
}
