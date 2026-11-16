// Ludo: 2–4 players on one phone. Roll a 6 to leave base, 6 rolls again,
// landing on a rival sends them home (except on star/start squares). Exact roll to finish.
const COLORS = ['#ff4d5e', '#38e08a', '#ffc34d', '#3b7bff'];
const NAMES = ['Red', 'Green', 'Yellow', 'Blue'];
const TRACK = [];
(() => {
  const seg = (r0, c0, dr, dc, n) => { for (let i = 0; i < n; i++) TRACK.push([r0 + dr * i, c0 + dc * i]); };
  seg(6, 1, 0, 1, 5); seg(5, 6, -1, 0, 6); seg(0, 7, 0, 0, 1); seg(0, 8, 1, 0, 6);
  seg(6, 9, 0, 1, 6); seg(7, 14, 0, 0, 1); seg(8, 14, 0, -1, 6); seg(9, 8, 1, 0, 6);
  seg(14, 7, 0, 0, 1); seg(14, 6, -1, 0, 6); seg(8, 5, 0, -1, 6); seg(7, 0, 0, 0, 1); seg(6, 0, 0, 0, 1);
})();
const START = [0, 13, 26, 39];
const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const HOME_COL = [
  [1, 2, 3, 4, 5].map((c) => [7, c]),
  [1, 2, 3, 4, 5].map((r) => [r, 7]),
  [13, 12, 11, 10, 9].map((c) => [7, c]),
  [13, 12, 11, 10, 9].map((r) => [r, 7]),
];
const YARD = [[[2, 2], [2, 3], [3, 2], [3, 3]], [[2, 11], [2, 12], [3, 11], [3, 12]], [[11, 11], [11, 12], [12, 11], [12, 12]], [[11, 2], [11, 3], [12, 2], [12, 3]]];
const FINISH = 56; // 0–50 on the track, 51–55 home column, 56 finished

export function mount(stage, { roundOver }) {
  let count = 4, players, tokens, turn, roll, rolled, over;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Players">
      <button data-n="2">2 Players</button><button data-n="3">3 Players</button><button data-n="4" class="on">4 Players</button>
    </div>
    <div class="ludo" id="board"></div>
    <div class="ludo-bar">
      <div class="status" id="status" role="status"></div>
      <button class="dice" id="dice" aria-label="Roll dice"></button>
    </div>
    <button class="btn" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');
  const cells = [];
  const trackIdx = new Map(TRACK.map(([r, c], i) => [r * 15 + c, i]));
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
    const d = document.createElement('div');
    let cls = 'lc';
    const corner = r < 6 && c < 6 ? 0 : r < 6 && c > 8 ? 1 : r > 8 && c > 8 ? 2 : r > 8 && c < 6 ? 3 : -1;
    if (corner >= 0) { cls += ' yard'; d.style.setProperty('--pc', COLORS[corner]); }
    else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) cls += ' centre';
    else if (trackIdx.has(r * 15 + c)) {
      const i = trackIdx.get(r * 15 + c);
      cls += ' path';
      const st = START.indexOf(i);
      if (st >= 0) { cls += ' start'; d.style.setProperty('--pc', COLORS[st]); }
      else if (SAFE.has(i)) cls += ' star';
    }
    HOME_COL.forEach((col, p) => { if (col.some(([hr, hc]) => hr === r && hc === c)) { cls += ' homecol'; d.style.setProperty('--pc', COLORS[p]); } });
    d.className = cls;
    boardEl.appendChild(d);
    cells.push(d);
  }

  function reset() {
    players = count === 2 ? [0, 2] : count === 3 ? [0, 1, 2] : [0, 1, 2, 3];
    tokens = [0, 1, 2, 3].map(() => [-1, -1, -1, -1]);
    turn = 0; roll = 0; rolled = false; over = false;
    render();
  }

  const pos = (p, prog) => (prog < 0 ? null : prog <= 50 ? TRACK[(START[p] + prog) % 52] : prog < FINISH ? HOME_COL[p][prog - 51] : null);
  const canMove = (p, t) => {
    const prog = tokens[p][t];
    if (prog === FINISH) return false;
    if (prog < 0) return roll === 6;
    return prog + roll <= FINISH;
  };

  function rollDice() {
    if (over || rolled) return;
    roll = 1 + Math.floor(Math.random() * 6);
    rolled = true;
    const p = players[turn];
    const movable = [0, 1, 2, 3].filter((t) => canMove(p, t));
    render();
    if (!movable.length) setTimeout(nextTurn, 800);
    else if (movable.length === 1 || movable.every((t) => tokens[p][t] === tokens[p][movable[0]])) setTimeout(() => move(movable[0]), 450);
  }

  function move(t) {
    const p = players[turn];
    if (!rolled || !canMove(p, t)) return;
    let captured = false;
    tokens[p][t] = tokens[p][t] < 0 ? 0 : tokens[p][t] + roll;
    const prog = tokens[p][t];
    if (prog <= 50) {
      const sq = (START[p] + prog) % 52;
      if (!SAFE.has(sq)) {
        players.forEach((q) => {
          if (q === p) return;
          tokens[q].forEach((qp, qt) => {
            if (qp >= 0 && qp <= 50 && (START[q] + qp) % 52 === sq) { tokens[q][qt] = -1; captured = true; }
          });
        });
      }
    }
    if (tokens[p].every((x) => x === FINISH)) { over = true; rolled = false; render(); roundOver(); return; }
    const again = roll === 6 || captured || prog === FINISH;
    rolled = false;
    if (!again) turn = (turn + 1) % players.length;
    render();
  }

  function nextTurn() {
    rolled = false;
    turn = (turn + 1) % players.length;
    render();
  }

  function render() {
    cells.forEach((c) => { c.innerHTML = ''; });
    const p = players[turn];
    players.forEach((q) => {
      tokens[q].forEach((prog, t) => {
        let rc = prog < 0 ? YARD[q][t] : pos(q, prog);
        const btn = document.createElement('button');
        btn.className = 'tok' + (q === p && rolled && canMove(q, t) ? ' can' : '');
        btn.style.setProperty('--pc', COLORS[q]);
        btn.setAttribute('aria-label', `${NAMES[q]} token ${t + 1}`);
        btn.addEventListener('click', () => { if (q === p) move(t); });
        if (!rc) { rc = [6 + Math.floor(q / 2) * 2, 6 + (q === 1 || q === 2 ? 2 : 0)]; btn.classList.add('done'); }
        cells[rc[0] * 15 + rc[1]].appendChild(btn);
      });
    });
    cells.forEach((c) => c.classList.toggle('multi', c.children.length > 1));
    const dice = el('dice');
    dice.style.setProperty('--pc', COLORS[p]);
    dice.textContent = roll ? '⚀⚁⚂⚃⚄⚅'[roll - 1] : '⚀';
    dice.disabled = over || rolled;
    el('status').textContent = over ? `${NAMES[p]} wins!` : rolled ? `${NAMES[p]} rolled ${roll}: tap a token` : `${NAMES[p]}: roll the dice`;
    el('status').style.color = COLORS[p];
  }

  stage.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-n]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); count = Number(b.dataset.n); reset();
  }));
  el('dice').addEventListener('click', rollDice);
  el('again').addEventListener('click', reset);
  reset();
  return () => { over = true; };
}
