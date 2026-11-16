// Sliding Puzzle: put the tiles in order. 300 levels, from 3×3 up to 5×5.
import { rng, levelBar } from './util.js';
const MAX = 300;

export function mount(stage, { roundOver }) {
  let n, tiles, moves, done;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'puzzle15', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="slide" id="board"></div>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  el('next').addEventListener('click', () => lv.next());

  function load(level) {
    n = level <= 100 ? 3 : level <= 220 ? 4 : 5;
    tiles = [...Array(n * n).keys()].map((i) => (i + 1) % (n * n));
    // scramble with legal moves so every puzzle can be solved
    const rand = rng(level * 2654435761);
    let blank = n * n - 1, prev = -1;
    const steps = 20 + level * 2;
    for (let s = 0; s < steps; s++) {
      const opts = neighbours(blank).filter((x) => x !== prev);
      const pick = opts[Math.floor(rand() * opts.length)];
      [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
      prev = blank; blank = pick;
    }
    moves = 0; done = false;
    el('board').style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    render();
  }
  function neighbours(i) {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n); if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1); if (c < n - 1) out.push(i + 1);
    return out;
  }
  function tap(i) {
    if (done) return;
    const blank = tiles.indexOf(0);
    if (!neighbours(blank).includes(i)) return;
    [tiles[blank], tiles[i]] = [tiles[i], tiles[blank]];
    moves++;
    if (tiles.every((t, k) => t === (k + 1) % (n * n))) { done = true; lv.complete(); roundOver(); }
    render();
  }
  function render() {
    const board = el('board');
    board.innerHTML = '';
    tiles.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = t ? 'tile' + (t === i + 1 ? ' home' : '') : 'tile empty';
      b.textContent = t || '';
      b.disabled = !t;
      b.setAttribute('aria-label', t ? `Tile ${t}` : 'Empty');
      b.addEventListener('click', () => tap(i));
      board.appendChild(b);
    });
    el('status').textContent = done ? `Solved in ${moves} moves!` : `Moves: ${moves}`;
    el('next').hidden = !done || lv.level >= MAX;
  }
  load(lv.level);
  return () => {};
}
