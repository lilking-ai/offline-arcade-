// 2048: swipe to slide tiles, merge equal numbers.
import { onSwipe, store } from './util.js';

export function mount(stage, { roundOver }) {
  let grid, score, over;
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Best</span><b id="bs">0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="g2048" id="board" aria-label="2048 board"></div>
    <p class="hint">Swipe (or use arrow keys) to move the tiles.</p>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < 16; i++) boardEl.appendChild(document.createElement('div'));

  function addTile() {
    const empty = [];
    grid.forEach((v, i) => !v && empty.push(i));
    if (empty.length) grid[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  }
  function reset() {
    grid = Array(16).fill(0); score = 0; over = false;
    addTile(); addTile(); render();
  }

  function slide(line) {
    const nums = line.filter(Boolean), out = [];
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === nums[i + 1]) { out.push(nums[i] * 2); score += nums[i] * 2; i++; }
      else out.push(nums[i]);
    }
    while (out.length < 4) out.push(0);
    return out;
  }

  function move(dx, dy) {
    if (over) return;
    const before = grid.join();
    for (let k = 0; k < 4; k++) {
      const idx = [0, 1, 2, 3].map((i) => {
        const j = dx === 1 || dy === 1 ? 3 - i : i;
        return dx ? k * 4 + j : j * 4 + k;
      });
      const res = slide(idx.map((i) => grid[i]));
      idx.forEach((i, n) => { grid[i] = res[n]; });
    }
    if (grid.join() !== before) addTile();
    if (!canMove()) { over = true; roundOver(); }
    render();
  }

  function canMove() {
    for (let i = 0; i < 16; i++) {
      if (!grid[i]) return true;
      if (i % 4 < 3 && grid[i] === grid[i + 1]) return true;
      if (i < 12 && grid[i] === grid[i + 4]) return true;
    }
    return false;
  }

  function render() {
    const best = Math.max(store.get('2048-best', 0), score);
    store.set('2048-best', best);
    [...boardEl.children].forEach((d, i) => {
      d.textContent = grid[i] || '';
      d.className = 't t' + Math.min(grid[i], 4096);
    });
    el('sc').textContent = score;
    el('bs').textContent = best;
    el('status').textContent = over ? 'No moves left!' : grid.includes(2048) ? 'You made 2048!' : '';
  }

  const stopSwipe = onSwipe(boardEl, move);
  el('again').addEventListener('click', reset);
  reset();
  return stopSwipe;
}
