// Checkers: 2 players on one phone. Jumps can chain; reach the far side to become a king.
export function mount(stage, { roundOver }) {
  let board, turn, sel, chain, over;

  stage.innerHTML = `
    <div class="scores">
      <div class="score p1" id="s1"><span>Orange</span><b id="c1">12</b></div>
      <div class="score p2" id="s2"><span>Blue</span><b id="c2">12</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="board8" id="board"></div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < 64; i++) {
    const b = document.createElement('button');
    b.addEventListener('click', () => tap(Math.floor(i / 8), i % 8));
    boardEl.appendChild(b);
  }

  function reset() {
    board = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => {
      if ((r + c) % 2 === 0) return null;
      if (r < 3) return { p: 2, k: false };
      if (r > 4) return { p: 1, k: false };
      return null;
    }));
    turn = 1; sel = null; chain = false; over = false;
    render();
  }

  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

  function moves(r, c) {
    const pc = board[r][c];
    if (!pc) return [];
    const dirs = pc.k ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : pc.p === 1 ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];
    const out = [];
    for (const [dr, dc] of dirs) {
      const r1 = r + dr, c1 = c + dc, r2 = r + 2 * dr, c2 = c + 2 * dc;
      if (!chain && inside(r1, c1) && !board[r1][c1]) out.push({ r: r1, c: c1 });
      if (inside(r2, c2) && board[r1]?.[c1] && board[r1][c1].p !== pc.p && !board[r2][c2]) out.push({ r: r2, c: c2, jump: [r1, c1] });
    }
    return out;
  }

  function tap(r, c) {
    if (over) return;
    const pc = board[r][c];
    if (pc && pc.p === turn && !chain) { sel = { r, c }; render(); return; }
    if (!sel) return;
    const m = moves(sel.r, sel.c).find((x) => x.r === r && x.c === c);
    if (!m) return;
    const piece = board[sel.r][sel.c];
    board[r][c] = piece;
    board[sel.r][sel.c] = null;
    if (m.jump) board[m.jump[0]][m.jump[1]] = null;
    const crowned = !piece.k && ((piece.p === 1 && r === 0) || (piece.p === 2 && r === 7));
    if (crowned) piece.k = true;
    if (m.jump && !crowned) {
      chain = true;
      sel = { r, c };
      if (moves(r, c).some((x) => x.jump)) { render(); return; }
    }
    chain = false; sel = null;
    turn = turn === 1 ? 2 : 1;
    checkEnd();
    render();
  }

  function checkEnd() {
    let canMove = false, left = { 1: 0, 2: 0 };
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const pc = board[r][c];
      if (!pc) continue;
      left[pc.p]++;
      if (pc.p === turn && moves(r, c).length) canMove = true;
    }
    if (!left[1] || !left[2] || !canMove) { over = true; roundOver(); }
  }

  function render() {
    const counts = { 1: 0, 2: 0 };
    const targets = sel ? moves(sel.r, sel.c) : [];
    [...boardEl.children].forEach((b, i) => {
      const r = Math.floor(i / 8), c = i % 8, pc = board[r][c];
      if (pc) counts[pc.p]++;
      b.className = ((r + c) % 2 ? 'dark' : 'light') + (sel && sel.r === r && sel.c === c ? ' sel' : '') + (targets.some((t) => t.r === r && t.c === c) ? ' target' : '');
      b.innerHTML = pc ? `<span class="piece p${pc.p}${pc.k ? ' king' : ''}"></span>` : '';
      b.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}${pc ? (pc.p === 1 ? ' orange' : ' blue') + (pc.k ? ' king' : '') : ''}`);
    });
    el('c1').textContent = counts[1];
    el('c2').textContent = counts[2];
    el('s1').classList.toggle('turn', !over && turn === 1);
    el('s2').classList.toggle('turn', !over && turn === 2);
    const name = (p) => (p === 1 ? 'Orange' : 'Blue');
    el('status').textContent = over ? `${name(turn === 1 ? 2 : 1)} wins!` : chain ? `${name(turn)}: keep jumping!` : `${name(turn)}'s turn`;
  }

  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
