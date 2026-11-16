// Memory: flip two cards, find pairs. Solo (fewest moves) or 2 players take turns.
import { shuffle, store } from './util.js';

const COLORS = ['#ff6a2b', '#3b7bff', '#ffc34d', '#38e08a', '#c26bff', '#ff4d7a', '#33d1e0', '#f3f1ec'];
const SHAPES = [
  '<circle cx="24" cy="24" r="14"/>',
  '<rect x="11" y="11" width="26" height="26" rx="5"/>',
  '<path d="M24 8 L40 38 H8 Z"/>',
  '<path d="M24 6 L29 19 L43 19 L32 28 L36 42 L24 34 L12 42 L16 28 L5 19 L19 19 Z"/>',
  '<path d="M24 40 C8 28 6 18 14 12 C19 9 23 12 24 15 C25 12 29 9 34 12 C42 18 40 28 24 40 Z"/>',
  '<path d="M24 6 L42 24 L24 42 L6 24 Z"/>',
  '<path d="M14 8 h20 l10 16 -10 16 h-20 l-10 -16 z"/>',
  '<path d="M20 6 h8 v14 h14 v8 h-14 v14 h-8 v-14 h-14 v-8 h14 z"/>',
];

export function mount(stage, { roundOver }) {
  let mode = 'solo', deck, open, matched, moves, turn, score, lock;
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode">
      <button data-mode="solo" class="on">Solo</button>
      <button data-mode="2p">2 Players</button>
    </div>
    <div class="scores">
      <div class="score p1" id="s1"><span id="l1">Moves</span><b>0</b></div>
      <div class="score p2" id="s2"><span id="l2">Best</span><b>0</b></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="memory" id="board"></div>
    <button class="btn primary" id="again">New game</button>`;
  const el = (id) => stage.querySelector('#' + id);
  const boardEl = el('board');

  function reset() {
    deck = shuffle([...Array(8).keys(), ...Array(8).keys()]);
    open = []; matched = new Set(); moves = 0; turn = 1; score = { 1: 0, 2: 0 }; lock = false;
    boardEl.innerHTML = '';
    deck.forEach((id, i) => {
      const b = document.createElement('button');
      b.className = 'mcard';
      b.setAttribute('aria-label', `Card ${i + 1}`);
      b.innerHTML = `<span class="back"></span><span class="front"><svg viewBox="0 0 48 48" fill="${COLORS[id]}" aria-hidden="true">${SHAPES[id]}</svg></span>`;
      b.addEventListener('click', () => flip(i));
      boardEl.appendChild(b);
    });
    render();
  }

  function flip(i) {
    if (lock || open.includes(i) || matched.has(i)) return;
    open.push(i);
    boardEl.children[i].classList.add('up');
    if (open.length < 2) return;
    moves++;
    const [a, b] = open;
    if (deck[a] === deck[b]) {
      matched.add(a); matched.add(b); open = [];
      score[turn]++;
      if (matched.size === 16) finish();
      render();
    } else {
      lock = true;
      setTimeout(() => {
        boardEl.children[a].classList.remove('up');
        boardEl.children[b].classList.remove('up');
        open = []; lock = false;
        if (mode === '2p') turn = turn === 1 ? 2 : 1;
        render();
      }, 750);
      render();
    }
  }

  function finish() {
    if (mode === 'solo') {
      const best = store.get('memory-best', 0);
      if (!best || moves < best) store.set('memory-best', moves);
    }
    roundOver();
  }

  function render() {
    const done = matched.size === 16;
    if (mode === 'solo') {
      el('l1').textContent = 'Moves'; el('l2').textContent = 'Best';
      el('s1').querySelector('b').textContent = moves;
      el('s2').querySelector('b').textContent = store.get('memory-best', 0) || '–';
      el('status').textContent = done ? `Cleared in ${moves} moves!` : 'Find all the pairs';
      el('s1').classList.remove('turn'); el('s2').classList.remove('turn');
    } else {
      el('l1').textContent = 'Orange'; el('l2').textContent = 'Blue';
      el('s1').querySelector('b').textContent = score[1];
      el('s2').querySelector('b').textContent = score[2];
      el('s1').classList.toggle('turn', !done && turn === 1);
      el('s2').classList.toggle('turn', !done && turn === 2);
      el('status').textContent = done
        ? score[1] === score[2] ? 'Draw!' : `${score[1] > score[2] ? 'Orange' : 'Blue'} wins!`
        : `${turn === 1 ? 'Orange' : 'Blue'}'s turn`;
    }
  }

  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    mode = b.dataset.mode;
    reset();
  }));
  el('again').addEventListener('click', reset);
  reset();
  return () => {};
}
