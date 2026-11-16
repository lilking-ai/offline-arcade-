// Shared helpers for games.

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('oa-' + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('oa-' + key, JSON.stringify(value)); } catch (e) {}
  },
};

// Seeded random numbers, so "Level 37" is the same puzzle every time.
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Swipe + arrow keys → callback(dx, dy). Returns a cleanup function.
export function onSwipe(el, cb) {
  let t = null;
  const start = (e) => { t = e.touches[0]; };
  const end = (e) => {
    if (!t) return;
    const c = e.changedTouches[0];
    const dx = c.clientX - t.clientX, dy = c.clientY - t.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
      Math.abs(dx) > Math.abs(dy) ? cb(Math.sign(dx), 0) : cb(0, Math.sign(dy));
    }
    t = null;
  };
  const key = (e) => {
    const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
    if (m) { e.preventDefault(); cb(...m); }
  };
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('touchend', end);
  window.addEventListener('keydown', key);
  return () => window.removeEventListener('keydown', key);
}

// A "Level N" bar with previous/next buttons for games with generated levels.
export function levelBar(stage, { key, max, onChange }) {
  const bar = document.createElement('div');
  bar.className = 'level-bar';
  bar.innerHTML = `<button class="icon-btn" data-l="-1" aria-label="Previous level">‹</button>
    <span class="level-label"></span>
    <button class="icon-btn" data-l="1" aria-label="Next level">›</button>`;
  let level = store.get(key + '-level', 1);
  const unlocked = () => store.get(key + '-unlocked', 1);
  const render = () => {
    bar.querySelector('.level-label').textContent = `Level ${level} / ${max}`;
    bar.querySelector('[data-l="-1"]').disabled = level <= 1;
    bar.querySelector('[data-l="1"]').disabled = level >= Math.min(max, unlocked());
  };
  bar.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => {
    level += Number(b.dataset.l);
    store.set(key + '-level', level);
    render();
    onChange(level);
  }));
  stage.appendChild(bar);
  render();
  return {
    get level() { return level; },
    complete() {
      if (level >= unlocked()) store.set(key + '-unlocked', Math.min(max, level + 1));
      render();
    },
    next() {
      if (level < max) { level++; store.set(key + '-level', level); render(); onChange(level); }
    },
  };
}
