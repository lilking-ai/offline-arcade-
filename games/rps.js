// Rock Paper Scissors: best of 5 vs the CPU, or 2 players picking in secret.
const PICKS = {
  rock: '<svg viewBox="0 0 64 64"><path d="M16 30 q0 -12 10 -12 h12 q10 0 10 12 v10 q0 12 -16 12 q-16 0 -16 -12 z" fill="#ff6a2b"/><path d="M24 18 v10 M32 18 v10 M40 18 v10" stroke="#7a2a08" stroke-width="3" stroke-linecap="round"/></svg>',
  paper: '<svg viewBox="0 0 64 64"><rect x="16" y="8" width="32" height="48" rx="4" fill="#f3f1ec"/><path d="M22 20 h20 M22 28 h20 M22 36 h14" stroke="#9a98a6" stroke-width="3" stroke-linecap="round"/></svg>',
  scissors: '<svg viewBox="0 0 64 64"><circle cx="20" cy="46" r="8" fill="none" stroke="#3b7bff" stroke-width="5"/><circle cx="44" cy="46" r="8" fill="none" stroke="#3b7bff" stroke-width="5"/><path d="M25 40 L44 8 M39 40 L20 8" stroke="#c9c3b6" stroke-width="5" stroke-linecap="round"/></svg>',
};
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export function mount(stage, { roundOver }) {
  let mode = 'cpu', score, picks, done;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode"><button data-mode="cpu" class="on">vs CPU</button><button data-mode="2p">2 Players</button></div>
    <div class="scores"><div class="score p1"><span>Player 1</span><b id="s1">0</b></div><div class="score p2"><span id="n2">CPU</span><b id="s2">0</b></div></div>
    <div class="rps-arena" id="arena"><div id="a1"></div><span>vs</span><div id="a2"></div></div>
    <div class="status" id="status" role="status"></div>
    <div class="rps-picks">${Object.keys(PICKS).map((k) => `<button data-pick="${k}" aria-label="${k}">${PICKS[k]}<span>${k}</span></button>`).join('')}</div>
    <button class="btn primary" id="again" hidden>Play again</button>`;
  const el = (id) => stage.querySelector('#' + id);

  function reset() {
    score = { 1: 0, 2: 0 }; picks = []; done = false;
    el('a1').innerHTML = el('a2').innerHTML = '';
    el('n2').textContent = mode === 'cpu' ? 'CPU' : 'Player 2';
    el('again').hidden = true;
    render();
  }
  function pick(k) {
    if (done) return;
    picks.push(k);
    if (mode === 'cpu') picks.push(Object.keys(PICKS)[Math.floor(Math.random() * 3)]);
    if (picks.length < 2) { el('a1').innerHTML = '<div class="hidden-pick">?</div>'; render(); return; }
    const [p1, p2] = picks;
    el('a1').innerHTML = PICKS[p1]; el('a2').innerHTML = PICKS[p2];
    let msg = 'Draw!';
    if (BEATS[p1] === p2) { score[1]++; msg = `${p1} beats ${p2}: Player 1 scores`; }
    else if (BEATS[p2] === p1) { score[2]++; msg = `${p2} beats ${p1}: ${mode === 'cpu' ? 'CPU' : 'Player 2'} scores`; }
    picks = [];
    if (score[1] === 3 || score[2] === 3) {
      done = true;
      msg = score[1] === 3 ? 'Player 1 wins the match!' : `${mode === 'cpu' ? 'CPU' : 'Player 2'} wins the match!`;
      el('again').hidden = false;
      roundOver();
    }
    render(msg);
  }
  function render(msg) {
    el('s1').textContent = score[1]; el('s2').textContent = score[2];
    el('status').textContent = msg || (done ? '' : mode === '2p' ? (picks.length ? 'Player 2: pick in secret' : 'Player 1: pick in secret') : 'First to 3. Pick one!');
  }
  stage.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.pick)));
  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); mode = b.dataset.mode; reset();
  }));
  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
