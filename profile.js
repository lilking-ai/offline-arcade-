// Player profile, Game Center style: pick a nickname + avatar once,
// then get a "Welcome back, NAME" banner every time the app opens.
// Saved on this device only.
const KEY = 'oa-profile';
const ADJ = ['Raspberry', 'Turbo', 'Cosmic', 'Sneaky', 'Golden', 'Fluffy', 'Neon', 'Mighty', 'Lucky', 'Frosty', 'Spicy', 'Silent', 'Rapid', 'Jolly', 'Shadow', 'Pixel'];
const NOUN = ['Hi', 'Panda', 'Falcon', 'Ninja', 'Tiger', 'Comet', 'Wizard', 'Mango', 'Rocket', 'Fox', 'Dragon', 'Otter', 'Knight', 'Shark', 'Koala', 'Phoenix'];
export const AVATARS = [
  ['#ff6a2b', '#ffc34d'], ['#3b7bff', '#33d1e0'], ['#38e08a', '#c9ff8a'], ['#c26bff', '#ff7ab6'],
  ['#ff4d5e', '#ff9a5a'], ['#1b1c28', '#6197ff'], ['#ffc34d', '#fff3c2'], ['#33d1e0', '#3b7bff'],
];

export const getProfile = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
const save = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
const suggest = () => `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;

export function avatarHTML(p, size = 40) {
  const [a, b] = AVATARS[p ? p.avatar : 0];
  const letters = p ? p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${size * 0.38}px;background:linear-gradient(135deg, ${a}, ${b})">${letters}</span>`;
}

function welcome(p) {
  const b = document.createElement('div');
  b.className = 'gc-banner';
  b.innerHTML = `${avatarHTML(p, 40)}<div><small>Welcome back</small><b></b></div>`;
  b.querySelector('b').textContent = p.name;
  document.body.appendChild(b);
  requestAnimationFrame(() => b.classList.add('in'));
  setTimeout(() => { b.classList.remove('in'); setTimeout(() => b.remove(), 500); }, 3200);
}

export function openSignUp(onDone) {
  const existing = getProfile();
  let name = existing ? existing.name : suggest(), avatar = existing ? existing.avatar : Math.floor(Math.random() * AVATARS.length);
  const sheet = document.createElement('div');
  sheet.className = 'gc-sheet-wrap';
  sheet.innerHTML = `
    <div class="gc-sheet" role="dialog" aria-label="Sign up">
      <div class="gc-icon"><img src="icons/apple-touch-icon.png" alt="" width="64" height="64"></div>
      <h2>${existing ? 'Your profile' : 'Sign in to Offline Arcade'}</h2>
      <p class="hint">Pick a nickname and avatar. Your scores are saved on this device.</p>
      <div class="gc-preview" id="gc-prev"></div>
      <label class="gc-field"><span>Nickname</span>
        <div class="gc-row"><input id="gc-name" maxlength="20" autocomplete="nickname" spellcheck="false"><button class="icon-btn" id="gc-dice" aria-label="Random nickname">🎲</button></div>
      </label>
      <div class="gc-avatars" role="group" aria-label="Avatar">${AVATARS.map((c, i) => `<button data-a="${i}" aria-label="Avatar ${i + 1}" style="background:linear-gradient(135deg, ${c[0]}, ${c[1]})"></button>`).join('')}</div>
      <button class="btn primary gc-continue" id="gc-go"></button>
      ${existing ? '<button class="btn gc-later" id="gc-close">Cancel</button>' : '<button class="btn gc-later" id="gc-skip">Not now</button>'}
    </div>`;
  document.body.appendChild(sheet);
  requestAnimationFrame(() => sheet.classList.add('in'));
  const $ = (id) => sheet.querySelector('#' + id);
  const input = $('gc-name');
  input.value = name;
  const render = () => {
    const p = { name: name.trim() || 'Player', avatar };
    $('gc-prev').innerHTML = avatarHTML(p, 72);
    $('gc-go').textContent = `Continue as ${p.name}`;
    sheet.querySelectorAll('[data-a]').forEach((b) => b.classList.toggle('on', Number(b.dataset.a) === avatar));
  };
  const close = () => { sheet.classList.remove('in'); setTimeout(() => sheet.remove(), 300); };
  input.addEventListener('input', () => { name = input.value; render(); });
  $('gc-dice').addEventListener('click', () => { name = suggest(); input.value = name; render(); });
  sheet.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { avatar = Number(b.dataset.a); render(); }));
  $('gc-go').addEventListener('click', () => {
    const p = { name: name.trim() || 'Player', avatar, since: existing ? existing.since : Date.now() };
    save(p); close(); onDone && onDone(p);
  });
  const later = $('gc-skip') || $('gc-close');
  later.addEventListener('click', () => { try { sessionStorage.setItem('oa-skip-signup', '1'); } catch (e) {} close(); });
  render();
}

// Call once at start-up.
export function initProfile(onChange) {
  const p = getProfile();
  let skipped = false;
  try { skipped = sessionStorage.getItem('oa-skip-signup') === '1'; } catch (e) {}
  if (p) setTimeout(() => welcome(p), 600);
  else if (!skipped) setTimeout(() => openSignUp(onChange), 700);
  onChange(p);
}
