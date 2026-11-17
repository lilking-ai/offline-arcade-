// Whack-a-Mole: 30 seconds. Moles +1, golden moles +3, bombs −3.
// Hit moles in a row for a combo bonus. Three difficulty levels.
import { store } from './util.js';
import { sfx, popText, confetti } from './fx.js';

const MOLE = `<svg viewBox="0 0 100 100" class="mole-svg" aria-hidden="true">
  <defs><radialGradient id="mf" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="var(--fur1)"/><stop offset="1" stop-color="var(--fur2)"/></radialGradient></defs>
  <path d="M18 100 C18 40 30 18 50 18 C70 18 82 40 82 100 Z" fill="url(#mf)"/>
  <ellipse cx="50" cy="66" rx="20" ry="22" fill="var(--belly)" opacity=".55"/>
  <circle cx="38" cy="44" r="7" fill="#fff"/><circle cx="62" cy="44" r="7" fill="#fff"/>
  <circle cx="39.5" cy="45" r="4" fill="#111" class="pupil"/><circle cx="63.5" cy="45" r="4" fill="#111" class="pupil"/>
  <circle cx="40.5" cy="43.5" r="1.3" fill="#fff"/><circle cx="64.5" cy="43.5" r="1.3" fill="#fff"/>
  <ellipse cx="50" cy="57" rx="8" ry="6" fill="#ff7ab6"/><ellipse cx="48" cy="55" rx="2.5" ry="1.5" fill="#fff" opacity=".6"/>
  <path d="M44 66 q6 5 12 0" stroke="#3a2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect x="46" y="66" width="3.5" height="5" rx="1" fill="#fff"/><rect x="50.5" y="66" width="3.5" height="5" rx="1" fill="#fff"/>
  <g stroke="#3a2010" stroke-width="1.4" stroke-linecap="round"><path d="M34 58 l-12 -3 M34 61 l-12 1 M66 58 l12 -3 M66 61 l12 1"/></g>
  <g class="dizzy"><path d="M33 40 l10 10 M43 40 l-10 10 M57 40 l10 10 M67 40 l-10 10" stroke="#111" stroke-width="3" stroke-linecap="round"/></g>
</svg>`;
const BOMB = `<svg viewBox="0 0 100 100" class="mole-svg" aria-hidden="true">
  <defs><radialGradient id="bf" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#6a6a7a"/><stop offset="1" stop-color="#101016"/></radialGradient></defs>
  <circle cx="50" cy="64" r="30" fill="url(#bf)"/><rect x="42" y="28" width="16" height="10" rx="3" fill="#2a2a34"/>
  <path d="M50 28 q4 -12 14 -14" stroke="#c9a46a" stroke-width="3" fill="none"/>
  <circle cx="65" cy="13" r="5" fill="#ffc34d" class="spark"/><circle cx="65" cy="13" r="2.5" fill="#fff"/>
  <ellipse cx="40" cy="54" rx="7" ry="4" fill="#fff" opacity=".25" transform="rotate(-30 40 54)"/>
  <path d="M38 66 l6 4 l6 -4 l6 4 l6 -4" stroke="#ff4d5e" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
const LEVELS = { easy: { stay: 1300, gap: 800, bomb: 0.08 }, normal: { stay: 1000, gap: 620, bomb: 0.14 }, hard: { stay: 720, gap: 440, bomb: 0.2 } };

export function mount(stage, { roundOver }) {
  let diff = 'normal', score, time, holes, timers = [], tick = null, running = false, combo = 0;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Difficulty"><button data-d="easy">Easy</button><button data-d="normal" class="on">Normal</button><button data-d="hard">Hard</button></div>
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Time</span><b id="tm">30</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="whack-field"><div class="whack" id="board">${Array.from({ length: 9 }, (_, i) => `<button data-i="${i}" aria-label="Hole ${i + 1}"><span class="hole"></span><span class="pop">${MOLE}</span><span class="mound"></span></button>`).join('')}</div></div>
    <button class="btn primary" id="go">Start</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const btns = [...stage.querySelectorAll('[data-i]')];
  const best = () => store.get('whack-best-' + diff, 0);
  el('status').textContent = `Best: ${best()}`;

  function show(i, kind) {
    holes[i] = kind;
    const b = btns[i];
    b.querySelector('.pop').innerHTML = kind === 'bomb' ? BOMB : MOLE;
    b.className = 'up ' + kind;
  }
  function hide(i) { holes[i] = null; btns[i].className = ''; }

  function pop() {
    if (!running) return;
    const L = LEVELS[diff], speedUp = (30 - time) * 12;
    const free = holes.map((h, i) => (!h ? i : -1)).filter((i) => i >= 0);
    if (free.length) {
      const i = free[Math.floor(Math.random() * free.length)];
      const r = Math.random();
      const kind = r < L.bomb ? 'bomb' : r < L.bomb + 0.08 ? 'gold' : 'mole';
      show(i, kind);
      timers.push(setTimeout(() => {
        if (holes[i] === kind) { hide(i); if (kind !== 'bomb') combo = 0; }
      }, Math.max(420, L.stay - speedUp)));
    }
    timers.push(setTimeout(pop, Math.max(260, L.gap - speedUp)));
  }

  function start() {
    score = 0; time = 30; combo = 0; holes = Array(9).fill(null); running = true;
    btns.forEach((_, i) => hide(i));
    el('go').hidden = true; el('sc').textContent = 0; el('tm').textContent = 30; el('status').textContent = 'Whack!';
    pop();
    tick = setInterval(() => {
      time--; el('tm').textContent = time;
      if (time <= 5 && time > 0) sfx.tap();
      if (time <= 0) end();
    }, 1000);
  }
  function end() {
    running = false; clearInterval(tick); timers.forEach(clearTimeout); timers = [];
    btns.forEach((_, i) => hide(i));
    const old = best();
    if (score > old) store.set('whack-best-' + diff, score);
    el('status').textContent = `Time! You scored ${score}${score > old ? ' · new best!' : ` · best ${old}`}`;
    if (score > old && score > 0) { sfx.win(); confetti(); } else sfx.lose();
    el('go').hidden = false; el('go').textContent = 'Play again';
    roundOver();
  }

  btns.forEach((b, i) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!running || !holes[i] || holes[i] === 'hit') return;
    const kind = holes[i];
    b.classList.add('whacked');
    setTimeout(() => b.classList.remove('whacked'), 180);
    if (kind === 'bomb') {
      score = Math.max(0, score - 3); combo = 0; hide(i); sfx.boom();
      b.classList.add('boom'); setTimeout(() => b.classList.remove('boom'), 400);
      popText(b, '−3', '#ff4d5e');
      stage.querySelector('.whack-field').classList.add('shake');
      setTimeout(() => stage.querySelector('.whack-field').classList.remove('shake'), 350);
    } else {
      combo++;
      const pts = (kind === 'gold' ? 3 : 1) + (combo >= 5 ? 1 : 0);
      score += pts; holes[i] = 'hit'; b.classList.add('hit');
      kind === 'gold' ? sfx.power() : sfx.hit();
      popText(b, `+${pts}${combo >= 5 ? ' combo!' : ''}`, kind === 'gold' ? '#ffc34d' : '#fff');
      timers.push(setTimeout(() => hide(i), 260));
    }
    el('sc').textContent = score;
  }));
  stage.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => {
    if (running) return;
    stage.querySelectorAll('[data-d]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on'); diff = b.dataset.d; el('status').textContent = `Best: ${best()}`;
  }));
  el('go').addEventListener('click', start);
  holes = Array(9).fill(null);
  return () => { running = false; clearInterval(tick); timers.forEach(clearTimeout); };
}
