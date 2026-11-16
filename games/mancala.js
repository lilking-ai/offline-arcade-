// Mancala (Kalah): sow stones counter-clockwise. Land in your store = go again;
// land in your own empty pit = capture the opposite pit. Most stones wins.
export function mount(stage, { roundOver }) {
  // pits 0–5 = bottom player (Orange), 6 = Orange store, 7–12 = top player (Blue), 13 = Blue store
  let b, turn, over, mode = '2p';
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode"><button data-mode="2p" class="on">2 Players</button><button data-mode="cpu">vs CPU</button></div>
    <div class="status" id="status" role="status"></div>
    <div class="mancala">
      <div class="store p2" id="st13"></div>
      <div class="pits">
        <div class="row top" id="top"></div>
        <div class="row bottom" id="bottom"></div>
      </div>
      <div class="store p1" id="st6"></div>
    </div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const pitBtns = [];
  for (let i = 0; i < 14; i++) {
    if (i === 6 || i === 13) continue;
    const btn = document.createElement('button');
    btn.className = 'pit ' + (i < 6 ? 'p1' : 'p2');
    btn.addEventListener('click', () => tap(i));
    pitBtns[i] = btn;
  }
  for (let i = 12; i >= 7; i--) el('top').appendChild(pitBtns[i]);
  for (let i = 0; i < 6; i++) el('bottom').appendChild(pitBtns[i]);

  function reset() { b = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]; turn = 1; over = false; render(); }
  const mine = (i, p) => (p === 1 ? i < 6 : i > 6 && i < 13);

  function sow(board, i, p) {
    const s = board.slice();
    let n = s[i]; s[i] = 0; let j = i;
    while (n) { j = (j + 1) % 14; if (j === (p === 1 ? 13 : 6)) continue; s[j]++; n--; }
    if (mine(j, p) && s[j] === 1 && s[12 - j]) { s[p === 1 ? 6 : 13] += s[12 - j] + 1; s[j] = 0; s[12 - j] = 0; }
    const again = j === (p === 1 ? 6 : 13);
    const side1 = s.slice(0, 6).every((x) => !x), side2 = s.slice(7, 13).every((x) => !x);
    if (side1 || side2) {
      for (let k = 0; k < 6; k++) { s[6] += s[k]; s[k] = 0; }
      for (let k = 7; k < 13; k++) { s[13] += s[k]; s[k] = 0; }
    }
    return { s, again, end: side1 || side2 };
  }
  function tap(i) {
    if (over || !mine(i, turn) || !b[i] || (mode === 'cpu' && turn === 2)) return;
    move(i);
  }
  function move(i) {
    const r = sow(b, i, turn);
    b = r.s;
    if (r.end) { over = true; roundOver(); }
    else if (!r.again) turn = turn === 1 ? 2 : 1;
    render();
    if (!over && mode === 'cpu' && turn === 2) setTimeout(() => move(cpu()), 600);
  }
  function cpu() {
    let best = -1, bestScore = -Infinity;
    for (let i = 7; i < 13; i++) {
      if (!b[i]) continue;
      const r = sow(b, i, 2);
      const sc = r.s[13] - r.s[6] + (r.again ? 3 : 0) + Math.random() * 0.5;
      if (sc > bestScore) { bestScore = sc; best = i; }
    }
    return best;
  }
  function render() {
    pitBtns.forEach((btn, i) => {
      if (!btn) return;
      btn.textContent = b[i];
      btn.disabled = over || !mine(i, turn) || !b[i] || (mode === 'cpu' && turn === 2);
      btn.setAttribute('aria-label', `Pit with ${b[i]} stones`);
    });
    el('st6').textContent = b[6]; el('st13').textContent = b[13];
    const name = (p) => (p === 1 ? 'Orange' : mode === 'cpu' ? 'CPU' : 'Blue');
    el('status').textContent = over
      ? b[6] === b[13] ? 'Draw!' : `${name(b[6] > b[13] ? 1 : 2)} wins ${Math.max(b[6], b[13])}–${Math.min(b[6], b[13])}!`
      : `${name(turn)}'s turn (${turn === 1 ? 'bottom' : 'top'} row)`;
  }
  stage.querySelectorAll('[data-mode]').forEach((x) => x.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((y) => y.classList.remove('on'));
    x.classList.add('on'); mode = x.dataset.mode; reset();
  }));
  el('again').addEventListener('click', reset);
  reset();
  return () => { over = true; };
}
