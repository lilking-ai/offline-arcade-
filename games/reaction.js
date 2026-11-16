// Reaction Duel: phone flat on the table, one player each end. Tap your side when it turns green.
export function mount(stage, { roundOver }) {
  let state = 'idle', timer = null, score = { 1: 0, 2: 0 };
  stage.innerHTML = `
    <p class="hint">Put the phone flat between you. Wait for green, then tap your side first. Tapping early loses the point.</p>
    <div class="duel" id="duel">
      <button class="pad-half top" id="p2" aria-label="Blue player's button"><span class="flip" id="t2">Blue · 0</span></button>
      <div class="duel-mid" id="mid">Tap Start</div>
      <button class="pad-half bottom" id="p1" aria-label="Orange player's button"><span id="t1">Orange · 0</span></button>
    </div>
    <button class="btn primary" id="go">Start round</button>`;
  const el = (id) => stage.querySelector('#' + id);

  function setMid(text, cls) {
    el('mid').textContent = text;
    el('duel').className = 'duel ' + (cls || '');
  }
  function start() {
    clearTimeout(timer);
    state = 'wait';
    setMid('Wait…', 'wait');
    timer = setTimeout(() => { state = 'go'; setMid('TAP!', 'go'); }, 1200 + Math.random() * 2800);
  }
  function tap(p) {
    if (state === 'wait') {
      clearTimeout(timer);
      const other = p === 1 ? 2 : 1;
      score[other]++;
      end(`${p === 1 ? 'Orange' : 'Blue'} tapped too early!`);
    } else if (state === 'go') {
      score[p]++;
      end(`${p === 1 ? 'Orange' : 'Blue'} wins the point!`);
    }
  }
  function end(msg) {
    state = 'idle';
    setMid(msg, '');
    el('t1').textContent = `Orange · ${score[1]}`;
    el('t2').textContent = `Blue · ${score[2]}`;
    roundOver();
  }
  el('p1').addEventListener('pointerdown', (e) => { e.preventDefault(); tap(1); });
  el('p2').addEventListener('pointerdown', (e) => { e.preventDefault(); tap(2); });
  el('go').addEventListener('click', start);
  return () => clearTimeout(timer);
}
