// Tower of Hanoi: move the whole stack to the right peg. Never put a big disc on a small one.
import { levelBar } from './util.js';
const MAX = 8; // levels = 3 to 10 discs
const COLORS = ['#ff4d5e', '#ff6a2b', '#ffc34d', '#38e08a', '#33d1e0', '#3b7bff', '#c26bff', '#ff7ab6', '#f3f1ec', '#9a98a6'];

export function mount(stage, { roundOver }) {
  let pegs, held, moves, done, discs;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'hanoi', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="hanoi" id="board">${[0, 1, 2].map((p) => `<button data-p="${p}" aria-label="Peg ${p + 1}"><span class="pole"></span><div class="stack"></div></button>`).join('')}</div>
    <p class="hint">Tap a peg to pick up its top disc, then tap where to drop it.</p>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const pegEls = [...wrap.querySelectorAll('[data-p]')];
  el('next').addEventListener('click', () => lv.next());

  function load(level) {
    discs = level + 2;
    pegs = [[...Array(discs).keys()].map((i) => discs - i), [], []];
    held = null; moves = 0; done = false;
    render();
  }
  function tap(p) {
    if (done) return;
    if (held === null) { if (pegs[p].length) held = p; }
    else {
      const d = pegs[held][pegs[held].length - 1], top = pegs[p][pegs[p].length - 1];
      if (p !== held && (!top || top > d)) { pegs[p].push(pegs[held].pop()); moves++; }
      held = null;
      if (pegs[2].length === discs) { done = true; lv.complete(); roundOver(); }
    }
    render();
  }
  function render() {
    pegEls.forEach((b, p) => {
      b.classList.toggle('held', held === p);
      b.querySelector('.stack').innerHTML = pegs[p].map((d, i) =>
        `<span class="disc${held === p && i === pegs[p].length - 1 ? ' lift' : ''}" style="width:${28 + (d / discs) * 68}%;background:${COLORS[(d - 1) % COLORS.length]}"></span>`).join('');
    });
    const best = 2 ** discs - 1;
    el('status').textContent = done ? `Done in ${moves} moves${moves === best ? ' (perfect!)' : ` · best possible is ${best}`}` : `${discs} discs · ${moves} moves`;
    el('next').hidden = !done || lv.level >= MAX;
  }
  pegEls.forEach((b, p) => b.addEventListener('click', () => tap(p)));
  load(lv.level);
  return () => {};
}
