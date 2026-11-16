// Connect 4: two players, pass and play.
const COLS = 7, ROWS = 6;

export function mount(stage, { roundOver }) {
  let grid, turn, over;
  const score = { 1: 0, 2: 0 };

  stage.innerHTML = `
    <div class="scores">
      <div class="score p1" id="s1"><span>Orange</span><b>0</b></div>
      <div class="score p2" id="s2"><span>Gold</span><b>0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="c4" id="board"></div>
    <p class="hint">Tap any column to drop a disc.</p>
    <button class="btn primary" id="again">Rematch</button>`;

  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const b = document.createElement('button');
      b.dataset.c = c;
      b.setAttribute('aria-label', `Column ${c + 1}`);
      b.addEventListener('click', () => drop(c));
      boardEl.appendChild(b);
    }
  }

  function reset() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    turn = 1;
    over = false;
    render([]);
  }

  function winLine(r, c) {
    const p = grid[r][c];
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = [[r, c]];
      for (const s of [1, -1]) {
        let rr = r + dr * s, cc = c + dc * s;
        while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && grid[rr][cc] === p) {
          cells.push([rr, cc]);
          rr += dr * s; cc += dc * s;
        }
      }
      if (cells.length >= 4) return cells;
    }
    return null;
  }

  function drop(c) {
    if (over) return;
    let r = ROWS - 1;
    while (r >= 0 && grid[r][c]) r--;
    if (r < 0) return;
    grid[r][c] = turn;
    const line = winLine(r, c);
    if (line || grid[0].every(Boolean)) {
      over = true;
      if (line) score[turn]++;
      roundOver();
      render(line || [], line ? turn : 0);
      return;
    }
    turn = turn === 1 ? 2 : 1;
    render([]);
  }

  function render(line, won = 0) {
    [...boardEl.children].forEach((b, i) => {
      const r = Math.floor(i / COLS), c = i % COLS;
      b.className = grid[r][c] ? 'p' + grid[r][c] : '';
      if (line.some(([lr, lc]) => lr === r && lc === c)) b.classList.add('win');
    });
    el('s1').querySelector('b').textContent = score[1];
    el('s2').querySelector('b').textContent = score[2];
    el('s1').classList.toggle('turn', !over && turn === 1);
    el('s2').classList.toggle('turn', !over && turn === 2);
    const name = (p) => (p === 1 ? 'Orange' : 'Gold');
    el('status').textContent = won ? `${name(won)} wins!` : over ? 'Draw!' : `${name(turn)}'s turn`;
  }

  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
