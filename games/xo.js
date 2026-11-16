// XO (tic-tac-toe): pass-and-play or vs an unbeatable CPU.
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const X_SVG = `<svg class="mx" viewBox="0 0 56 56" aria-hidden="true"><path d="M12 12 L44 44 M44 12 L12 44" stroke="#ff6a2b" stroke-width="9" stroke-linecap="round"/></svg>`;
const O_SVG = `<svg class="mo" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="17" fill="none" stroke="#3b7bff" stroke-width="9"/></svg>`;

function winner(b) {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { who: b[l[0]], line: l };
  return null;
}

function minimax(b, player) {
  const w = winner(b);
  if (w) return { score: w.who === 'O' ? 10 : -10 };
  if (b.every(Boolean)) return { score: 0 };
  let best = { score: player === 'O' ? -Infinity : Infinity };
  b.forEach((c, i) => {
    if (c) return;
    b[i] = player;
    const s = minimax(b, player === 'O' ? 'X' : 'O').score;
    b[i] = '';
    if (player === 'O' ? s > best.score : s < best.score) best = { score: s, move: i };
  });
  return best;
}

export function mount(stage, { roundOver }) {
  let mode = '2p';
  let board, turn, over;
  const score = { X: 0, O: 0 };

  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode">
      <button data-mode="2p" class="on">2 Players</button>
      <button data-mode="cpu">vs CPU</button>
    </div>
    <div class="scores">
      <div class="score p1" id="sx"><span>Player X</span><b>0</b></div>
      <div class="score p2" id="so"><span id="olabel">Player O</span><b>0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="xo" id="xo"></div>
    <button class="btn primary" id="again">Rematch</button>`;

  const el = (id) => stage.querySelector('#' + id);
  const grid = el('xo');
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.addEventListener('click', () => play(i));
    grid.appendChild(b);
  }

  function reset() {
    board = Array(9).fill('');
    turn = 'X';
    over = false;
    render();
  }

  function play(i) {
    if (over || board[i] || (mode === 'cpu' && turn === 'O')) return;
    move(i);
    if (!over && mode === 'cpu') setTimeout(() => move(minimax(board.slice(), 'O').move), 350);
  }

  function move(i) {
    board[i] = turn;
    const w = winner(board);
    if (w || board.every(Boolean)) {
      over = true;
      if (w) score[w.who]++;
      roundOver();
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    render();
  }

  function render() {
    const w = winner(board);
    [...grid.children].forEach((b, i) => {
      b.innerHTML = board[i] === 'X' ? X_SVG : board[i] === 'O' ? O_SVG : '';
      b.classList.toggle('win', !!w && w.line.includes(i));
      b.setAttribute('aria-label', `Square ${i + 1}: ${board[i] || 'empty'}`);
    });
    const oName = mode === 'cpu' ? 'CPU' : 'Player O';
    el('olabel').textContent = oName;
    el('sx').querySelector('b').textContent = score.X;
    el('so').querySelector('b').textContent = score.O;
    el('sx').classList.toggle('turn', !over && turn === 'X');
    el('so').classList.toggle('turn', !over && turn === 'O');
    el('status').textContent = w
      ? `${w.who === 'X' ? 'Player X' : oName} wins!`
      : over ? 'Draw!' : `${turn === 'X' ? 'Player X' : oName}'s turn`;
  }

  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    mode = b.dataset.mode;
    score.X = score.O = 0;
    reset();
  }));
  el('again').addEventListener('click', reset);

  reset();
  return () => {};
}
