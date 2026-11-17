// Tower of Hanoi: move the whole stack to the right peg. Never put a big disc on a small one.
// Pick 3–10 discs. Perfect solutions get 3 stars.
import { store } from './util.js';
import { sfx, confetti, stars } from './fx.js';
const MAX = 8;
const COLORS = ['#ff4d5e', '#ff6a2b', '#ffc34d', '#38e08a', '#33d1e0', '#3b7bff', '#8b5cff', '#ff7ab6', '#e8e4da', '#9a98a6'];

export function mount(stage, { roundOver }) {
  let pegs, held, moves, done, discs, history;
  stage.innerHTML = '';
  const picker = document.createElement('div');
  picker.className = 'disc-pick'; picker.setAttribute('role', 'group'); picker.setAttribute('aria-label', 'Number of discs');
  picker.innerHTML = '<span>Discs</span>' + [3, 4, 5, 6, 7, 8, 9, 10].map((d) => `<button data-n="${d}">${d}</button>`).join('');
  stage.appendChild(picker);
  let chosen = store.get('hanoi-discs', 5);
  const lv = { get level() { return chosen - 2; }, complete() {}, next() { if (chosen < 10) pick(chosen + 1); } };
  function pick(d) { chosen = d; store.set('hanoi-discs', d); picker.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) === d)); load(d - 2); }
  picker.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => pick(Number(b.dataset.n))));
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="scores"><div class="score p1"><span>Moves</span><b id="mv">0</b></div><div class="score p2"><span>Perfect</span><b id="best">7</b></div></div>
    <div class="status" id="status" role="status"></div>
    <div class="hanoi2" id="board">
      ${[0, 1, 2].map((p) => `<button data-p="${p}" aria-label="Peg ${p + 1}"><span class="pole"></span><div class="stack"></div>${p === 2 ? '<span class="goal">GOAL</span>' : ''}</button>`).join('')}
      <span class="hbase"></span>
    </div>
    <p class="hint">Tap a peg to lift its top disc, then tap where to drop it.</p>
    <div class="row-btns"><button class="btn" id="undo">Undo</button><button class="btn" id="restart">Restart</button></div>
    <button class="btn primary" id="next" hidden>Try more discs</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const pegEls = [...wrap.querySelectorAll('[data-p]')];
  el('next').addEventListener('click', () => lv.next());
  el('restart').addEventListener('click', () => load(lv.level));
  el('undo').addEventListener('click', () => {
    if (done || !history.length) return;
    const [from, to] = history.pop();
    pegs[from].push(pegs[to].pop()); moves--; held = null; sfx.drop(); render();
  });

  function load(level) {
    discs = level + 2;
    pegs = [[...Array(discs).keys()].map((i) => discs - i), [], []];
    held = null; moves = 0; done = false; history = [];
    render();
  }
  function tap(p) {
    if (done) return;
    if (held === null) {
      if (pegs[p].length) { held = p; sfx.pick(); }
    } else if (p === held) {
      held = null; sfx.drop();
    } else {
      const d = pegs[held][pegs[held].length - 1], top = pegs[p][pegs[p].length - 1];
      if (!top || top > d) {
        pegs[p].push(pegs[held].pop()); moves++; history.push([held, p]); held = null; sfx.drop();
        if (pegs[2].length === discs) { done = true; lv.complete(); sfx.win(); confetti(); roundOver(); }
      } else {
        sfx.bad();
        pegEls[p].classList.remove('nope'); void pegEls[p].offsetWidth; pegEls[p].classList.add('nope');
        return;
      }
    }
    render();
  }
  function render() {
    pegEls.forEach((b, p) => {
      b.classList.toggle('held', held === p);
      b.querySelector('.stack').innerHTML = pegs[p].map((d, i) => {
        const c = COLORS[(d - 1) % COLORS.length];
        return `<span class="disc2${held === p && i === pegs[p].length - 1 ? ' lift' : ''}" style="--c:${c};width:${26 + (d / discs) * 70}%;height:${Math.max(14, 26 - discs)}px"></span>`;
      }).join('');
    });
    const best = 2 ** discs - 1;
    el('mv').textContent = moves;
    el('best').textContent = best;
    const s = moves === best ? 3 : moves <= best * 1.5 ? 2 : 1;
    el('status').textContent = done ? `Done in ${moves} moves ${stars(s)}` : `${discs} discs`;
    el('next').hidden = !done || lv.level >= MAX;
    el('undo').disabled = done || !history.length;
  }
  pegEls.forEach((b, p) => b.addEventListener('click', () => tap(p)));
  pick(chosen);
  return () => {};
}
