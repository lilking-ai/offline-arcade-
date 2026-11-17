// Shared full-screen "party" layout for 2–4 player button games.
// Each player gets a big button in their own corner. Players sitting at the top
// get their button and text upside-down so they can read it across the table.
// First to WIN points takes the match.
import { sfx, confetti } from './fx.js';
import { store } from './util.js';

export const PLAYERS = [
  { name: 'Red', color: '#ff4d5e', corner: 'bl' },
  { name: 'Blue', color: '#3b7bff', corner: 'tr' },
  { name: 'Green', color: '#38e08a', corner: 'br' },
  { name: 'Yellow', color: '#ffc34d', corner: 'tl' },
];
const WIN = 5;

export function party(stage, roundOver, game) {
  let count = store.get('party-players', 4), score, players, live = false, timers = [], raf = null;
  const root = document.createElement('div');
  root.className = 'party';
  root.innerHTML = `
    <button class="party-x" aria-label="Exit">✕</button>
    <div class="party-center">
      <div class="party-title">${game.name}</div>
      <div class="party-arena" id="arena"></div>
      <div class="party-msg" id="msg"></div>
      <div class="party-setup" id="setup">
        <p class="hint">${game.how}</p>
        <div class="seg" role="group" aria-label="Players"><button data-n="2">2 Players</button><button data-n="3">3 Players</button><button data-n="4">4 Players</button></div>
        <button class="btn primary" id="go">Start</button>
      </div>
    </div>
    ${PLAYERS.map((p, i) => `<button class="pbtn ${p.corner}" data-p="${i}" style="--c:${p.color}" aria-label="${p.name} button"><span class="pname">${p.name}</span><b class="pscore">0</b><span class="plabel"></span></button>`).join('')}`;
  stage.appendChild(root);
  document.body.classList.add('party-mode');
  const el = (id) => root.querySelector('#' + id);
  const btns = [...root.querySelectorAll('.pbtn')];

  const ctx = {
    arena: el('arena'),
    get players() { return players; },
    color: (i) => PLAYERS[i].color,
    name: (i) => PLAYERS[i].name,
    msg: (t) => { el('msg').textContent = t; },
    label: (i, t) => { btns[i].querySelector('.plabel').textContent = t; },
    out: (i) => btns[i].classList.add('out'),
    isOut: (i) => btns[i].classList.contains('out'),
    after: (ms, fn) => { const t = setTimeout(() => live && fn(), ms); timers.push(t); return t; },
    frame: (fn) => { let last = performance.now(); const loop = (now) => { if (!live) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt) !== false) raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); },
    win: (i) => endRound(i),
    draw: () => endRound(-1),
  };

  function pickCount(n) {
    count = n; store.set('party-players', n);
    root.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) === n));
    // 2 players sit opposite each other; 3–4 fill the corners.
    btns.forEach((b, i) => { b.hidden = i >= n; });
  }
  function startMatch() {
    players = [...Array(count).keys()];
    score = players.map(() => 0);
    el('setup').hidden = true;
    renderScores();
    nextRound();
  }
  function nextRound() {
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
    btns.forEach((b) => { b.classList.remove('out', 'won', 'hit'); b.querySelector('.plabel').textContent = ''; });
    ctx.arena.innerHTML = '';
    el('msg').textContent = '';
    live = true;
    game.round(ctx);
  }
  function endRound(winner) {
    if (!live) return;
    live = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    if (winner >= 0) {
      score[winner]++;
      btns[winner].classList.add('won');
      sfx.good();
      el('msg').innerHTML = `<span style="color:${PLAYERS[winner].color}">${PLAYERS[winner].name}</span> gets a point!`;
    } else {
      sfx.bad();
      el('msg').textContent = 'Nobody scores!';
    }
    renderScores();
    const champ = score.findIndex((s) => s >= WIN);
    if (champ >= 0) {
      setTimeout(() => {
        el('msg').innerHTML = `<span style="color:${PLAYERS[champ].color}">${PLAYERS[champ].name}</span> wins the match!`;
        sfx.win(); confetti(160);
        el('setup').hidden = false; el('go').textContent = 'Play again';
        roundOver();
      }, 900);
    } else {
      const t = setTimeout(nextRound, 1700); timers.push(t);
    }
  }
  function renderScores() {
    btns.forEach((b, i) => { b.querySelector('.pscore').textContent = score && i < count ? score[i] : 0; });
  }

  btns.forEach((b, i) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!live || i >= count || b.classList.contains('out')) return;
    b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
    game.press(i, ctx);
  }));
  root.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => pickCount(Number(b.dataset.n))));
  el('go').addEventListener('click', startMatch);
  root.querySelector('.party-x').addEventListener('click', () => history.back());
  pickCount(count);

  return () => {
    live = false; timers.forEach(clearTimeout); cancelAnimationFrame(raf);
    document.body.classList.remove('party-mode');
    if (game.cleanup) game.cleanup();
    root.remove();
  };
}
