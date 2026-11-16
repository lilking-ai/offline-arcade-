// Simon: watch the pattern light up, then repeat it. It gets one step longer each round.
import { store } from './util.js';

const PADS = ['#ff6a2b', '#3b7bff', '#ffc34d', '#38e08a'];

export function mount(stage, { roundOver }) {
  let seq = [], input = 0, busy = false, alive = true, timers = [];
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Round</span><b id="sc">0</b></div>
      <div class="score p2"><span>Best</span><b id="bs">${store.get('simon-best', 0)}</b></div>
    </div>
    <div class="status" id="status" role="status">Watch, then repeat</div>
    <div class="simon" id="board">${PADS.map((c, i) => `<button data-i="${i}" style="--c:${c}" aria-label="Pad ${i + 1}"></button>`).join('')}</div>
    <button class="btn primary" id="go">Start</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const pads = [...stage.querySelectorAll('[data-i]')];
  const later = (fn, ms) => timers.push(setTimeout(() => alive && fn(), ms));

  function flash(i, ms = 380) {
    pads[i].classList.add('lit');
    later(() => pads[i].classList.remove('lit'), ms);
  }

  function play() {
    busy = true;
    el('status').textContent = 'Watch…';
    const speed = Math.max(260, 600 - seq.length * 20);
    seq.forEach((p, k) => later(() => flash(p, speed * 0.7), 500 + k * speed));
    later(() => { busy = false; input = 0; el('status').textContent = 'Your turn'; }, 500 + seq.length * speed);
  }

  function next() {
    seq.push(Math.floor(Math.random() * 4));
    el('sc').textContent = seq.length;
    play();
  }

  pads.forEach((p, i) => p.addEventListener('click', () => {
    if (busy || !seq.length) return;
    flash(i, 200);
    if (i !== seq[input]) {
      const round = seq.length - 1;
      if (round > store.get('simon-best', 0)) { store.set('simon-best', round); el('bs').textContent = round; }
      el('status').textContent = `Wrong pad! You reached round ${round}.`;
      seq = [];
      el('go').hidden = false;
      el('go').textContent = 'Try again';
      roundOver();
      return;
    }
    input++;
    if (input === seq.length) { busy = true; later(next, 700); }
  }));

  el('go').addEventListener('click', () => { el('go').hidden = true; seq = []; next(); });
  return () => { alive = false; timers.forEach(clearTimeout); };
}
