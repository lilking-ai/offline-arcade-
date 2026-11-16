// Whack-a-Mole: hit the moles before they hide. 30 seconds, don't hit the bombs.
import { store } from './util.js';

export function mount(stage, { roundOver }) {
  let score, time, holes, timers = [], tick = null, running = false;
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Time</span><b id="tm">30</b></div>
    </div>
    <div class="status" id="status" role="status">Best: ${store.get('whack-best', 0)}</div>
    <div class="whack" id="board">${Array.from({ length: 9 }, (_, i) => `<button data-i="${i}" aria-label="Hole ${i + 1}"><span class="mole"></span></button>`).join('')}</div>
    <button class="btn primary" id="go">Start</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const btns = [...stage.querySelectorAll('[data-i]')];

  function pop() {
    if (!running) return;
    const free = holes.map((h, i) => (!h ? i : -1)).filter((i) => i >= 0);
    if (free.length) {
      const i = free[Math.floor(Math.random() * free.length)];
      holes[i] = Math.random() < 0.15 ? 'bomb' : 'mole';
      render();
      const stay = Math.max(450, 1100 - (30 - time) * 20);
      timers.push(setTimeout(() => { if (holes[i] && holes[i] !== 'hit') { holes[i] = null; render(); } }, stay));
    }
    timers.push(setTimeout(pop, Math.max(280, 750 - (30 - time) * 15)));
  }

  function start() {
    score = 0; time = 30; holes = Array(9).fill(null); running = true;
    el('go').hidden = true; el('sc').textContent = 0; el('tm').textContent = 30; el('status').textContent = 'Whack!';
    pop();
    tick = setInterval(() => {
      time--; el('tm').textContent = time;
      if (time <= 0) end();
    }, 1000);
  }
  function end() {
    running = false; clearInterval(tick); timers.forEach(clearTimeout); timers = [];
    holes = Array(9).fill(null); render();
    const best = store.get('whack-best', 0);
    if (score > best) store.set('whack-best', score);
    el('status').textContent = `Time! You scored ${score}${score > best ? ' · new best!' : ''}`;
    el('go').hidden = false; el('go').textContent = 'Play again';
    roundOver();
  }
  btns.forEach((b, i) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!running || !holes[i] || holes[i] === 'hit') return;
    if (holes[i] === 'bomb') { score = Math.max(0, score - 3); holes[i] = null; b.classList.add('boom'); setTimeout(() => b.classList.remove('boom'), 300); }
    else { score++; holes[i] = 'hit'; timers.push(setTimeout(() => { holes[i] = null; render(); }, 200)); }
    el('sc').textContent = score;
    render();
  }));
  function render() {
    btns.forEach((b, i) => { b.className = holes && holes[i] ? 'up ' + holes[i] : ''; });
  }
  el('go').addEventListener('click', start);
  return () => { running = false; clearInterval(tick); timers.forEach(clearTimeout); };
}
