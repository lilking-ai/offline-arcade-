// Five in a Row (Gomoku): get five in a line on a 13×13 board.
const N = 13;

export function mount(stage, { roundOver }) {
  let grid, turn, over, last, mode = '2p';
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode"><button data-mode="2p" class="on">2 Players</button><button data-mode="cpu">vs CPU</button></div>
    <div class="scores"><div class="score p1" id="s1"><span>Orange</span><b>●</b></div><div class="score p2" id="s2"><span id="n2">Blue</span><b>●</b></div></div>
    <div class="status" id="status" role="status"></div>
    <div class="gomoku" id="board"></div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < N * N; i++) {
    const b = document.createElement('button');
    b.addEventListener('click', () => tap(i));
    boardEl.appendChild(b);
  }

  function reset() { grid = Array(N * N).fill(0); turn = 1; over = false; last = -1; render(); }

  function line(i, p, dr, dc) {
    const r = Math.floor(i / N), c = i % N;
    let n = 1;
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < N && cc >= 0 && cc < N && grid[rr * N + cc] === p) { n++; rr += dr * s; cc += dc * s; }
    }
    return n;
  }
  const wins = (i, p) => [[0, 1], [1, 0], [1, 1], [1, -1]].some(([dr, dc]) => line(i, p, dr, dc) >= 5);

  function place(i) {
    grid[i] = turn; last = i;
    if (wins(i, turn)) { over = turn; roundOver(); }
    else if (!grid.includes(0)) { over = 'draw'; roundOver(); }
    else turn = turn === 1 ? 2 : 1;
    render();
  }
  function tap(i) {
    if (over || grid[i] || (mode === 'cpu' && turn === 2)) return;
    place(i);
    if (!over && mode === 'cpu') setTimeout(() => place(cpu()), 300);
  }
  function cpu() {
    let best = -1, bestScore = -1;
    grid.forEach((v, i) => {
      if (v) return;
      let sc = 0;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        grid[i] = 2; const mine = line(i, 2, dr, dc);
        grid[i] = 1; const theirs = line(i, 1, dr, dc);
        grid[i] = 0;
        sc += mine >= 5 ? 100000 : 10 ** mine;
        sc += theirs >= 5 ? 50000 : 10 ** theirs * 0.9;
      }
      const r = Math.floor(i / N), c = i % N;
      sc += (N - Math.abs(r - 6) - Math.abs(c - 6)) * 0.1 + Math.random();
      if (sc > bestScore) { bestScore = sc; best = i; }
    });
    return best;
  }
  function render() {
    [...boardEl.children].forEach((b, i) => {
      b.className = (grid[i] ? 'st p' + grid[i] : '') + (i === last ? ' last' : '');
      b.setAttribute('aria-label', `Point ${i + 1}${grid[i] ? (grid[i] === 1 ? ' orange' : ' blue') : ''}`);
    });
    const name = (p) => (p === 1 ? 'Orange' : mode === 'cpu' ? 'CPU' : 'Blue');
    el('n2').textContent = name(2);
    el('s1').classList.toggle('turn', !over && turn === 1);
    el('s2').classList.toggle('turn', !over && turn === 2);
    el('status').textContent = over === 'draw' ? 'Draw!' : over ? `${name(over)} wins!` : `${name(turn)}'s turn · get 5 in a row`;
  }
  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); mode = b.dataset.mode; reset();
  }));
  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
