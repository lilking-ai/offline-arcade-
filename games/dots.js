// Dots & Boxes: draw lines, close a box to score and go again.
const N = 5; // boxes per side

export function mount(stage, { roundOver }) {
  let h, v, owner, turn, score, over;
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1" id="s1"><span>Orange</span><b>0</b></div>
      <div class="score p2" id="s2"><span>Blue</span><b>0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="dots" id="board"></div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  const S = 2 * N + 1;
  boardEl.style.gridTemplateColumns = Array.from({ length: S }, (_, i) => (i % 2 ? '1fr' : '14px')).join(' ');
  boardEl.style.gridTemplateRows = boardEl.style.gridTemplateColumns;

  const cells = [];
  for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
    let node;
    if (r % 2 === 0 && c % 2 === 0) { node = document.createElement('span'); node.className = 'dot'; }
    else if (r % 2 === 0) { node = document.createElement('button'); node.className = 'line h'; node.dataset.k = `h${r / 2},${(c - 1) / 2}`; }
    else if (c % 2 === 0) { node = document.createElement('button'); node.className = 'line v'; node.dataset.k = `v${(r - 1) / 2},${c / 2}`; }
    else { node = document.createElement('span'); node.className = 'box'; node.dataset.b = `${(r - 1) / 2},${(c - 1) / 2}`; }
    if (node.tagName === 'BUTTON') {
      node.setAttribute('aria-label', 'Draw line');
      node.addEventListener('click', () => draw(node.dataset.k));
    }
    boardEl.appendChild(node);
    cells.push(node);
  }

  function reset() {
    h = Array.from({ length: N + 1 }, () => Array(N).fill(0));
    v = Array.from({ length: N }, () => Array(N + 1).fill(0));
    owner = Array.from({ length: N }, () => Array(N).fill(0));
    turn = 1; score = { 1: 0, 2: 0 }; over = false;
    render();
  }

  const done = (r, c) => h[r][c] && h[r + 1][c] && v[r][c] && v[r][c + 1];

  function draw(k) {
    if (over) return;
    const [r, c] = k.slice(1).split(',').map(Number);
    const arr = k[0] === 'h' ? h : v;
    if (arr[r][c]) return;
    arr[r][c] = turn;
    let closed = 0;
    for (let br = 0; br < N; br++) for (let bc = 0; bc < N; bc++) {
      if (!owner[br][bc] && done(br, bc)) { owner[br][bc] = turn; closed++; }
    }
    score[turn] += closed;
    if (!closed) turn = turn === 1 ? 2 : 1;
    if (score[1] + score[2] === N * N) { over = true; roundOver(); }
    render();
  }

  function render() {
    cells.forEach((n) => {
      if (n.dataset.k) {
        const [r, c] = n.dataset.k.slice(1).split(',').map(Number);
        const p = (n.dataset.k[0] === 'h' ? h : v)[r][c];
        n.className = `line ${n.dataset.k[0]}${p ? ' p' + p : ''}`;
        n.disabled = !!p;
      } else if (n.dataset.b) {
        const [r, c] = n.dataset.b.split(',').map(Number);
        n.className = 'box' + (owner[r][c] ? ' p' + owner[r][c] : '');
      }
    });
    el('s1').querySelector('b').textContent = score[1];
    el('s2').querySelector('b').textContent = score[2];
    el('s1').classList.toggle('turn', !over && turn === 1);
    el('s2').classList.toggle('turn', !over && turn === 2);
    el('status').textContent = over
      ? score[1] === score[2] ? 'Draw!' : `${score[1] > score[2] ? 'Orange' : 'Blue'} wins!`
      : `${turn === 1 ? 'Orange' : 'Blue'}'s turn`;
  }

  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
