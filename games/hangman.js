// Hangman: guess the word one letter at a time. 6 wrong guesses and you're out.
import { levelBar } from './util.js';

const WORDS = [
  ['ANIMALS', 'ELEPHANT GIRAFFE PENGUIN DOLPHIN KANGAROO CHEETAH OCTOPUS BUTTERFLY CROCODILE FLAMINGO HEDGEHOG JAGUAR LOBSTER MONKEY PANTHER RABBIT SQUIRREL TORTOISE WALRUS ZEBRA'],
  ['FOOD', 'PIZZA BURGER NOODLES PANCAKE SANDWICH AVOCADO BROCCOLI CHOCOLATE DUMPLING KEBAB LASAGNA MUFFIN OMELETTE PRETZEL SHAWARMA SPAGHETTI TACO WAFFLE YOGURT POPCORN'],
  ['SPORTS', 'FOOTBALL BASKETBALL TENNIS CRICKET HOCKEY BOXING SURFING CYCLING ARCHERY BADMINTON BASEBALL FENCING GOLF KARATE RUGBY SKATING SWIMMING VOLLEYBALL WRESTLING MARATHON'],
  ['COUNTRIES', 'BRAZIL CANADA EGYPT FRANCE GERMANY INDIA JAPAN KENYA MEXICO NORWAY OMAN PERU QATAR SPAIN TURKEY UKRAINE VIETNAM JORDAN MOROCCO PORTUGAL'],
  ['GAMING', 'CONTROLLER JOYSTICK CONSOLE ARCADE LEVEL BOSSFIGHT CHECKPOINT POWERUP GAMEPAD HIGHSCORE MULTIPLAYER SPEEDRUN TROPHY RESPAWN SIDEQUEST LOBBY AVATAR PIXEL QUEST INVENTORY'],
  ['SPACE', 'GALAXY PLANET ASTEROID COMET NEBULA ROCKET SATELLITE ORBIT METEOR ECLIPSE JUPITER SATURN MERCURY NEPTUNE TELESCOPE ASTRONAUT GRAVITY UNIVERSE SUPERNOVA MOONLIGHT'],
].flatMap(([cat, list]) => list.split(' ').map((w) => ({ cat, w })));
const MAX = WORDS.length;

export function mount(stage, { roundOver }) {
  let word, cat, guessed, wrong, done;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'hangman', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <svg class="gallows" viewBox="0 0 200 160" aria-hidden="true">
      <path d="M20 150 H120 M50 150 V15 H130 V32" stroke="#5a5a6e" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g stroke="#ff6a2b" stroke-width="5" fill="none" stroke-linecap="round" id="man">
        <circle cx="130" cy="47" r="15"/><path d="M130 62 V100"/><path d="M130 72 L112 88"/><path d="M130 72 L148 88"/><path d="M130 100 L114 126"/><path d="M130 100 L146 126"/>
      </g>
    </svg>
    <div class="hint" id="cat"></div>
    <div class="hang-word" id="word"></div>
    <div class="status" id="status" role="status"></div>
    <div class="hang-keys" id="keys">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>
    <button class="btn primary" id="next" hidden>Next word</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const parts = [...el('man').children];
  wrap.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => guess(b.dataset.k)));
  const onKey = (e) => { if (/^[a-z]$/i.test(e.key)) guess(e.key.toUpperCase()); };
  window.addEventListener('keydown', onKey);
  el('next').addEventListener('click', () => (lv.level < MAX ? lv.next() : load(lv.level)));

  function load(level) {
    ({ w: word, cat } = WORDS[((level - 1) * 41) % MAX]);
    guessed = new Set(); wrong = 0; done = false;
    render();
  }
  function guess(k) {
    if (done || guessed.has(k)) return;
    guessed.add(k);
    if (!word.includes(k)) wrong++;
    const won = [...word].every((c) => guessed.has(c));
    if (won || wrong >= 6) { done = true; if (won) lv.complete(); roundOver(); }
    render();
  }
  function render() {
    parts.forEach((p, i) => { p.style.opacity = i < wrong ? 1 : 0.08; });
    el('cat').textContent = `Category: ${cat}`;
    el('word').innerHTML = [...word].map((c) => `<span>${guessed.has(c) || (done && wrong >= 6) ? c : ''}</span>`).join('');
    wrap.querySelectorAll('[data-k]').forEach((b) => {
      const k = b.dataset.k;
      b.disabled = guessed.has(k) || done;
      b.className = guessed.has(k) ? (word.includes(k) ? 'hit' : 'miss') : '';
    });
    el('status').textContent = done ? (wrong >= 6 ? `Out! The word was ${word}` : 'You got it!') : `${6 - wrong} wrong guesses left`;
    el('next').hidden = !done;
  }
  load(lv.level);
  return () => window.removeEventListener('keydown', onKey);
}
