// Hangman: guess the word one letter at a time. 6 wrong guesses and you're out.
// Hint reveals a letter but costs a guess. Keep a win streak going.
import { levelBar, store } from './util.js';
import { sfx, confetti } from './fx.js';

const WORDS = [
  ['ANIMALS', 'ELEPHANT GIRAFFE PENGUIN DOLPHIN KANGAROO CHEETAH OCTOPUS BUTTERFLY CROCODILE FLAMINGO HEDGEHOG JAGUAR LOBSTER MONKEY PANTHER RABBIT SQUIRREL TORTOISE WALRUS ZEBRA'],
  ['FOOD', 'PIZZA BURGER NOODLES PANCAKE SANDWICH AVOCADO BROCCOLI CHOCOLATE DUMPLING KEBAB LASAGNA MUFFIN OMELETTE PRETZEL SHAWARMA SPAGHETTI TACO WAFFLE YOGURT POPCORN'],
  ['SPORTS', 'FOOTBALL BASKETBALL TENNIS CRICKET HOCKEY BOXING SURFING CYCLING ARCHERY BADMINTON BASEBALL FENCING GOLF KARATE RUGBY SKATING SWIMMING VOLLEYBALL WRESTLING MARATHON'],
  ['COUNTRIES', 'BRAZIL CANADA EGYPT FRANCE GERMANY INDIA JAPAN KENYA MEXICO NORWAY OMAN PERU QATAR SPAIN TURKEY UKRAINE VIETNAM JORDAN MOROCCO PORTUGAL'],
  ['GAMING', 'CONTROLLER JOYSTICK CONSOLE ARCADE LEVEL CHECKPOINT POWERUP GAMEPAD HIGHSCORE MULTIPLAYER SPEEDRUN TROPHY RESPAWN SIDEQUEST LOBBY AVATAR PIXEL QUEST INVENTORY CHAMPION'],
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
    <div class="chalkboard">
      <div class="chalk-top"><span id="cat"></span><span id="streak"></span></div>
      <svg class="gallows" viewBox="0 0 200 170" aria-hidden="true">
        <g class="chalk-line" stroke="#e9e6dc" stroke-width="5" fill="none" stroke-linecap="round">
          <path d="M16 160 H130"/><path d="M48 160 V14"/><path d="M48 14 H132"/><path d="M48 44 L78 14"/><path d="M132 14 V32"/>
        </g>
        <g stroke="#ffb59a" stroke-width="5" fill="none" stroke-linecap="round" id="man">
          <circle cx="132" cy="48" r="16"/><path d="M132 64 V106"/><path d="M132 76 L112 94"/><path d="M132 76 L152 94"/><path d="M132 106 L116 136"/><path d="M132 106 L148 136"/>
        </g>
        <g id="face" stroke="#ffb59a" stroke-width="2.5" stroke-linecap="round" opacity="0"><path d="M125 43 l5 5 M130 43 l-5 5 M134 43 l5 5 M139 43 l-5 5"/><path d="M126 56 q6 -4 12 0" fill="none"/></g>
      </svg>
      <div class="lives" id="lives"></div>
      <div class="hang-word" id="word"></div>
    </div>
    <div class="status" id="status" role="status"></div>
    <div class="hang-keys" id="keys">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>
    <div class="row-btns"><button class="btn" id="hint">Hint (−1 guess)</button><button class="btn primary" id="next" hidden>Next word</button></div>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const parts = [...el('man').children];
  wrap.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => guess(b.dataset.k)));
  const onKey = (e) => { if (/^[a-z]$/i.test(e.key)) guess(e.key.toUpperCase()); };
  window.addEventListener('keydown', onKey);
  el('next').addEventListener('click', () => (lv.level < MAX ? lv.next() : load(lv.level)));
  el('hint').addEventListener('click', hint);

  function load(level) {
    ({ w: word, cat } = WORDS[((level - 1) * 41) % MAX]);
    guessed = new Set(); wrong = 0; done = false;
    parts.forEach((p) => p.classList.remove('drawn'));
    render();
  }
  function finish(won) {
    done = true;
    const s = store.get('hangman-streak', 0);
    store.set('hangman-streak', won ? s + 1 : 0);
    if (won) { lv.complete(); sfx.win(); confetti(80); } else sfx.lose();
    roundOver();
  }
  function guess(k) {
    if (done || guessed.has(k)) return;
    guessed.add(k);
    if (word.includes(k)) sfx.good(); else { wrong++; sfx.bad(); }
    const won = [...word].every((c) => guessed.has(c));
    if (won || wrong >= 6) finish(won);
    render();
  }
  function hint() {
    if (done || wrong >= 5) return;
    const missing = [...new Set(word)].filter((c) => !guessed.has(c));
    if (!missing.length) return;
    wrong++;
    guess(missing[Math.floor(Math.random() * missing.length)]);
  }
  function render() {
    parts.forEach((p, i) => p.classList.toggle('drawn', i < wrong));
    el('face').style.opacity = wrong >= 6 ? 1 : 0;
    el('cat').textContent = cat;
    const streak = store.get('hangman-streak', 0);
    el('streak').textContent = streak ? `Streak ${streak}` : '';
    el('lives').innerHTML = Array.from({ length: 6 }, (_, i) => `<span class="${i < 6 - wrong ? 'on' : ''}"></span>`).join('');
    el('word').innerHTML = [...word].map((c) => {
      const show = guessed.has(c) || done;
      const cls = show && !guessed.has(c) ? 'missed' : show ? 'got' : '';
      return `<span class="${cls}">${show ? c : ''}</span>`;
    }).join('');
    wrap.querySelectorAll('[data-k]').forEach((b) => {
      const k = b.dataset.k;
      b.disabled = guessed.has(k) || done;
      b.className = guessed.has(k) ? (word.includes(k) ? 'hit' : 'miss') : '';
    });
    el('status').textContent = done ? (wrong >= 6 ? `Out! The word was ${word}` : 'You got it!') : `${6 - wrong} wrong guesses left`;
    el('next').hidden = !done;
    el('hint').hidden = done;
    el('hint').disabled = wrong >= 5;
  }
  load(lv.level);
  return () => window.removeEventListener('keydown', onKey);
}
