// Word Guess: find the 5-letter word in 6 tries. Green = right spot, yellow = in the word.
import { levelBar } from './util.js';

const WORDS = ('apple brave chair dance eagle flame grape house input jolly knife lemon mango noble ocean piano queen river storm tiger ultra vivid whale yacht zebra ' +
  'blaze candy delta ember frost giant honey ivory jelly koala laser magic ninja orbit pearl quest robot shark toast unity vapor wheat youth zesty ' +
  'arena beach cloud dream earth fairy ghost heart index joker karma light metal night olive party quick radio smile train urban voice world young ' +
  'alarm bacon cable drift elbow fiber globe hotel image juice kneel lucky medal nurse opera plant quiet roast salad table under valve water pixel ' +
  'actor bench crown dodge enjoy feast grill horse irony judge kitty lunar march nerve orange pilot rally score sword thumb uncle vital witch xenon ' +
  'amber blend crisp diver equal flock grain hatch inbox jumbo label mixer north onion pride quota ranch sheep tower usual venom wrist yield zonal ' +
  'audio bread coach daisy event fresh grand happy ideal jeans kebab laugh mouse novel outer paint quilt royal spice tulip upset visit worth')
  .split(/\s+/).filter((w) => w.length === 5);
const MAX = WORDS.length;
const KEYS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function mount(stage, { roundOver }) {
  let answer, rows, cur, done;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'words', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="words" id="board"></div>
    <div class="kb" id="kb">
      ${KEYS.map((row, i) => `<div>${i === 2 ? '<button data-k="enter" class="wide">Enter</button>' : ''}${[...row].map((k) => `<button data-k="${k}">${k}</button>`).join('')}${i === 2 ? '<button data-k="back" class="wide" aria-label="Delete">⌫</button>' : ''}</div>`).join('')}
    </div>
    <button class="btn primary" id="next" hidden>Next word</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const boardEl = el('board');
  for (let i = 0; i < 30; i++) boardEl.appendChild(document.createElement('div'));
  wrap.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => key(b.dataset.k)));
  el('next').addEventListener('click', () => lv.next());
  const onKey = (e) => {
    if (e.key === 'Enter') key('enter');
    else if (e.key === 'Backspace') key('back');
    else if (/^[a-z]$/i.test(e.key)) key(e.key.toLowerCase());
  };
  window.addEventListener('keydown', onKey);

  function load(level) {
    // shuffle the order with a fixed step so neighbouring levels aren't alphabetical
    answer = WORDS[((level - 1) * 37) % MAX];
    rows = []; cur = ''; done = false;
    render('');
  }

  function grade(guess) {
    const res = Array(5).fill('miss'), pool = [...answer];
    [...guess].forEach((ch, i) => { if (ch === answer[i]) { res[i] = 'hit'; pool[i] = null; } });
    [...guess].forEach((ch, i) => {
      if (res[i] === 'hit') return;
      const j = pool.indexOf(ch);
      if (j >= 0) { res[i] = 'near'; pool[j] = null; }
    });
    return res;
  }

  function key(k) {
    if (done) return;
    if (k === 'back') cur = cur.slice(0, -1);
    else if (k === 'enter') {
      if (cur.length < 5) return render('Not enough letters');
      rows.push({ word: cur, res: grade(cur) });
      const won = cur === answer;
      cur = '';
      if (won || rows.length === 6) {
        done = true;
        if (won) lv.complete();
        roundOver();
        return render(won ? `Got it in ${rows.length}!` : `The word was ${answer.toUpperCase()}`);
      }
    } else if (cur.length < 5) cur += k;
    render('');
  }

  function render(msg) {
    const cells = [...boardEl.children];
    cells.forEach((d) => { d.textContent = ''; d.className = 'wl'; });
    rows.forEach((r, ri) => [...r.word].forEach((ch, i) => {
      cells[ri * 5 + i].textContent = ch;
      cells[ri * 5 + i].className = 'wl ' + r.res[i];
    }));
    if (!done) [...cur].forEach((ch, i) => { cells[rows.length * 5 + i].textContent = ch; cells[rows.length * 5 + i].className = 'wl typed'; });
    const best = {};
    rows.forEach((r) => [...r.word].forEach((ch, i) => {
      const rank = { miss: 1, near: 2, hit: 3 }[r.res[i]];
      if (!best[ch] || rank > best[ch]) best[ch] = rank;
    }));
    wrap.querySelectorAll('[data-k]').forEach((b) => {
      const s = best[b.dataset.k];
      b.className = (b.classList.contains('wide') ? 'wide ' : '') + (s === 3 ? 'hit' : s === 2 ? 'near' : s === 1 ? 'miss' : '');
    });
    el('status').textContent = msg;
    el('next').hidden = !done || lv.level >= MAX;
  }

  load(lv.level);
  return () => window.removeEventListener('keydown', onKey);
}
