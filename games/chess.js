// Chess: 2 players on one phone, or vs a simple CPU. Full rules: castling, en passant,
// promotion (to queen), check, checkmate and stalemate.
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function initial() {
  const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const b = Array(64).fill(null);
  for (let c = 0; c < 8; c++) {
    b[c] = { t: back[c], w: false };
    b[8 + c] = { t: 'p', w: false };
    b[48 + c] = { t: 'p', w: true };
    b[56 + c] = { t: back[c], w: true };
  }
  return { b, white: true, castle: { K: true, Q: true, k: true, q: true }, ep: -1 };
}

const rc = (i) => [Math.floor(i / 8), i % 8];
const at = (r, c) => (r >= 0 && r < 8 && c >= 0 && c < 8 ? r * 8 + c : -1);

function attacked(b, sq, byWhite) {
  const [r, c] = rc(sq);
  const dir = byWhite ? 1 : -1;
  for (const dc of [-1, 1]) {
    const i = at(r + dir, c + dc);
    if (i >= 0 && b[i] && b[i].w === byWhite && b[i].t === 'p') return true;
  }
  for (const [dr, dc] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
    const i = at(r + dr, c + dc);
    if (i >= 0 && b[i] && b[i].w === byWhite && b[i].t === 'n') return true;
  }
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const i = at(r + dr, c + dc);
    if (i >= 0 && b[i] && b[i].w === byWhite && b[i].t === 'k') return true;
  }
  const rays = [[[1, 0], [-1, 0], [0, 1], [0, -1]], [[1, 1], [1, -1], [-1, 1], [-1, -1]]];
  for (const [k, set] of rays.entries()) {
    for (const [dr, dc] of set) {
      let rr = r + dr, cc = c + dc;
      while (at(rr, cc) >= 0) {
        const p = b[at(rr, cc)];
        if (p) {
          if (p.w === byWhite && (p.t === 'q' || p.t === (k ? 'b' : 'r'))) return true;
          break;
        }
        rr += dr; cc += dc;
      }
    }
  }
  return false;
}

function pseudo(s, from) {
  const { b } = s, p = b[from], out = [];
  if (!p) return out;
  const [r, c] = rc(from);
  const push = (to, extra = {}) => out.push({ from, to, ...extra });
  const slide = (dirs, once) => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc;
      while (at(rr, cc) >= 0) {
        const t = at(rr, cc);
        if (b[t] && b[t].w === p.w) break;
        push(t);
        if (b[t] || once) break;
        rr += dr; cc += dc;
      }
    }
  };
  if (p.t === 'p') {
    const d = p.w ? -1 : 1, start = p.w ? 6 : 1, last = p.w ? 0 : 7;
    const one = at(r + d, c);
    if (one >= 0 && !b[one]) {
      push(one, { promo: r + d === last });
      const two = at(r + 2 * d, c);
      if (r === start && !b[two]) push(two, { double: true });
    }
    for (const dc of [-1, 1]) {
      const t = at(r + d, c + dc);
      if (t < 0) continue;
      if (b[t] && b[t].w !== p.w) push(t, { promo: r + d === last });
      if (t === s.ep) push(t, { enpassant: true });
    }
  } else if (p.t === 'n') slide([[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], true);
  else if (p.t === 'b') slide([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  else if (p.t === 'r') slide([[1, 0], [-1, 0], [0, 1], [0, -1]]);
  else if (p.t === 'q') slide([[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
  else if (p.t === 'k') {
    slide([[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]], true);
    const home = p.w ? 60 : 4, enemy = !p.w;
    if (from === home && !attacked(b, home, enemy)) {
      const [K, Q] = p.w ? ['K', 'Q'] : ['k', 'q'];
      if (s.castle[K] && !b[home + 1] && !b[home + 2] && !attacked(b, home + 1, enemy) && !attacked(b, home + 2, enemy)) push(home + 2, { castle: home + 3 });
      if (s.castle[Q] && !b[home - 1] && !b[home - 2] && !b[home - 3] && !attacked(b, home - 1, enemy) && !attacked(b, home - 2, enemy)) push(home - 2, { castle: home - 4 });
    }
  }
  return out;
}

function apply(s, m) {
  const b = s.b.slice(), p = b[m.from];
  const n = { b, white: !s.white, castle: { ...s.castle }, ep: -1, captured: b[m.to] };
  b[m.to] = m.promo ? { t: 'q', w: p.w } : p;
  b[m.from] = null;
  if (m.enpassant) { const cap = m.to + (p.w ? 8 : -8); n.captured = b[cap]; b[cap] = null; }
  if (m.double) n.ep = (m.from + m.to) / 2;
  if (m.castle !== undefined) { const rookTo = m.to > m.from ? m.to - 1 : m.to + 1; b[rookTo] = b[m.castle]; b[m.castle] = null; }
  if (p.t === 'k') { if (p.w) n.castle.K = n.castle.Q = false; else n.castle.k = n.castle.q = false; }
  for (const [sq, key] of [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']]) if (m.from === sq || m.to === sq) n.castle[key] = false;
  return n;
}

function legal(s) {
  const out = [];
  s.b.forEach((p, i) => {
    if (!p || p.w !== s.white) return;
    for (const m of pseudo(s, i)) {
      const n = apply(s, m);
      const king = n.b.findIndex((x) => x && x.t === 'k' && x.w === s.white);
      if (!attacked(n.b, king, !s.white)) out.push(m);
    }
  });
  return out;
}

const inCheck = (s) => attacked(s.b, s.b.findIndex((x) => x && x.t === 'k' && x.w === s.white), !s.white);

function evaluate(s) {
  return s.b.reduce((t, p, i) => {
    if (!p) return t;
    const centre = 3.5 - Math.abs(3.5 - (i % 8)) + 3.5 - Math.abs(3.5 - Math.floor(i / 8));
    return t + (p.w ? -1 : 1) * (VALUE[p.t] * 10 + (p.t === 'n' || p.t === 'p' ? centre * 0.3 : 0));
  }, 0);
}

function search(s, depth, alpha, beta) {
  const moves = legal(s);
  if (!moves.length) return { score: inCheck(s) ? (s.white ? 10000 : -10000) : 0 };
  if (!depth) return { score: evaluate(s) };
  moves.sort((a, b) => (s.b[b.to] ? VALUE[s.b[b.to].t] : 0) - (s.b[a.to] ? VALUE[s.b[a.to].t] : 0));
  let best = { score: s.white ? Infinity : -Infinity, move: moves[0] };
  for (const m of moves) {
    const sc = search(apply(s, m), depth - 1, alpha, beta).score + (Math.random() - 0.5) * 0.4;
    if (s.white ? sc < best.score : sc > best.score) best = { score: sc, move: m };
    if (s.white) beta = Math.min(beta, sc); else alpha = Math.max(alpha, sc);
    if (beta <= alpha) break;
  }
  return best;
}

export function mount(stage, { roundOver }) {
  let mode = '2p', s, sel, moves, last, over, lost;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode">
      <button data-mode="2p" class="on">2 Players</button>
      <button data-mode="cpu">vs CPU</button>
    </div>
    <div class="captured" id="capB"></div>
    <div class="status" id="status" role="status"></div>
    <div class="board8 chess" id="board"></div>
    <div class="captured" id="capW"></div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < 64; i++) {
    const btn = document.createElement('button');
    btn.addEventListener('click', () => tap(i));
    boardEl.appendChild(btn);
  }

  function reset() {
    s = initial(); sel = null; last = null; over = false; lost = { w: [], b: [] };
    moves = legal(s);
    render();
  }

  function tap(i) {
    if (over || (mode === 'cpu' && !s.white)) return;
    const m = sel !== null && moves.find((x) => x.from === sel && x.to === i);
    if (m) return play(m);
    sel = s.b[i] && s.b[i].w === s.white ? i : null;
    render();
  }

  function play(m) {
    s = apply(s, m);
    if (s.captured) lost[s.captured.w ? 'w' : 'b'].push(s.captured.t);
    last = m; sel = null;
    moves = legal(s);
    if (!moves.length) { over = true; roundOver(); }
    render();
    if (!over && mode === 'cpu' && !s.white) setTimeout(() => play(search(s, 2, -Infinity, Infinity).move), 250);
  }

  function render() {
    const targets = sel !== null ? moves.filter((m) => m.from === sel).map((m) => m.to) : [];
    const check = inCheck(s);
    [...boardEl.children].forEach((btn, i) => {
      const [r, c] = rc(i), p = s.b[i];
      btn.className = ((r + c) % 2 ? 'dark' : 'light') +
        (i === sel ? ' sel' : '') + (targets.includes(i) ? (p ? ' hit' : ' target') : '') +
        (last && (i === last.from || i === last.to) ? ' last' : '') +
        (check && p && p.t === 'k' && p.w === s.white ? ' check' : '');
      btn.innerHTML = p ? `<span class="cp ${p.w ? 'w' : 'b'}">${GLYPH[p.t]}</span>` : '';
      btn.setAttribute('aria-label', `${'abcdefgh'[c]}${8 - r}${p ? ` ${p.w ? 'white' : 'black'} ${{ k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }[p.t]}` : ''}`);
    });
    el('capW').innerHTML = lost.b.map((t) => `<span class="cp b">${GLYPH[t]}</span>`).join('');
    el('capB').innerHTML = lost.w.map((t) => `<span class="cp w">${GLYPH[t]}</span>`).join('');
    const side = s.white ? 'White' : mode === 'cpu' ? 'CPU' : 'Black';
    el('status').textContent = over
      ? check ? `Checkmate! ${s.white ? (mode === 'cpu' ? 'CPU' : 'Black') : 'White'} wins` : 'Stalemate: draw'
      : `${side} to move${check ? ' · Check!' : ''}`;
  }

  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); mode = b.dataset.mode; reset();
  }));
  el('again').addEventListener('click', reset);
  reset();
  return () => { over = true; };
}
