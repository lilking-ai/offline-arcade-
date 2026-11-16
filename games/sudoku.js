// Sudoku: 500 generated levels that get harder as you go.
import { rng, shuffle, levelBar } from './util.js';

const MAX = 500;

function makePuzzle(level) {
  const rand = rng(level * 7919 + 13);
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rand);
  const groups = (n) => shuffle([0, 1, 2], rand).flatMap((g) => shuffle([0, 1, 2], rand).map((x) => g * 3 + x));
  const rows = groups(), cols = groups();
  const solution = rows.map((r) => cols.map((c) => digits[(r * 3 + Math.floor(r / 3) + c) % 9]));
  const holes = 30 + Math.floor((level / MAX) * 26);
  const puzzle = solution.map((row) => row.slice());
  shuffle([...Array(81).keys()], rand).slice(0, holes).forEach((i) => { puzzle[Math.floor(i / 9)][i % 9] = 0; });
  return puzzle;
}

export function mount(stage, { roundOver }) {
  let given, grid, sel, solved;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'sudoku', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="sudoku" id="board"></div>
    <div class="numpad" id="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-d="${d}">${d}</button>`).join('')}<button data-d="0" aria-label="Erase">⌫</button></div>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < 81; i++) {
    const b = document.createElement('button');
    b.addEventListener('click', () => { sel = i; render(); });
    boardEl.appendChild(b);
  }
  wrap.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => put(Number(b.dataset.d))));
  el('next').addEventListener('click', () => lv.next());
  const onKey = (e) => { if (/^[0-9]$/.test(e.key)) put(Number(e.key)); if (e.key === 'Backspace') put(0); };
  window.addEventListener('keydown', onKey);

  function load(level) {
    given = makePuzzle(level);
    grid = given.map((r) => r.slice());
    sel = null; solved = false;
    render();
  }

  function put(d) {
    if (sel === null || solved) return;
    const r = Math.floor(sel / 9), c = sel % 9;
    if (given[r][c]) return;
    grid[r][c] = d;
    if (grid.every((row) => row.every(Boolean)) && conflicts().size === 0) {
      solved = true; lv.complete(); roundOver();
    }
    render();
  }

  function conflicts() {
    const bad = new Set();
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9), c = i % 9, v = grid[r][c];
      if (!v) continue;
      for (let j = 0; j < 81; j++) {
        if (i === j) continue;
        const r2 = Math.floor(j / 9), c2 = j % 9;
        const same = r === r2 || c === c2 || (Math.floor(r / 3) === Math.floor(r2 / 3) && Math.floor(c / 3) === Math.floor(c2 / 3));
        if (same && grid[r2][c2] === v) bad.add(i);
      }
    }
    return bad;
  }

  function render() {
    const bad = conflicts();
    const sv = sel !== null ? grid[Math.floor(sel / 9)][sel % 9] : 0;
    [...boardEl.children].forEach((b, i) => {
      const r = Math.floor(i / 9), c = i % 9, v = grid[r][c];
      b.textContent = v || '';
      b.className = 'sq' + (given[r][c] ? ' given' : '') + (i === sel ? ' sel' : '') + (bad.has(i) ? ' bad' : '') +
        (sv && v === sv && i !== sel ? ' same' : '') + (c % 3 === 2 && c < 8 ? ' br' : '') + (r % 3 === 2 && r < 8 ? ' bb' : '');
      b.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}: ${v || 'empty'}`);
    });
    el('status').textContent = solved ? 'Solved!' : '';
    el('next').hidden = !solved || lv.level >= MAX;
  }

  load(lv.level);
  return () => window.removeEventListener('keydown', onKey);
}
