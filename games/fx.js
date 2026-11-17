// Shared sound effects (made in code, so they work offline) and visual effects.
import { store } from './util.js';

let ctx = null;
const audio = () => {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};
export const soundOn = () => store.get('sound', true);
export const setSound = (v) => store.set('sound', v);

function tone(freq, dur = 0.1, type = 'sine', vol = 0.15, slide = 0, delay = 0) {
  if (!soundOn()) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur = 0.15, vol = 0.2) {
  if (!soundOn()) return;
  const a = audio(); if (!a) return;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), g = a.createGain();
  s.buffer = buf; g.gain.value = vol; s.connect(g).connect(a.destination); s.start();
}

export const sfx = {
  tap: () => tone(520, 0.05, 'triangle', 0.08),
  pick: () => tone(440, 0.08, 'triangle', 0.1, 220),
  drop: () => tone(330, 0.09, 'triangle', 0.12, -120),
  good: () => { tone(660, 0.08, 'square', 0.06); tone(990, 0.12, 'square', 0.06, 0, 0.07); },
  bad: () => tone(180, 0.25, 'sawtooth', 0.08, -90),
  hit: () => { noise(0.08, 0.25); tone(140, 0.12, 'square', 0.1, -60); },
  boom: () => { noise(0.35, 0.35); tone(90, 0.4, 'sawtooth', 0.12, -60); },
  flap: () => tone(300, 0.09, 'sine', 0.1, 320),
  point: () => tone(880, 0.07, 'square', 0.05),
  power: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, 'square', 0.05, 0, i * 0.05)),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, 0, i * 0.09)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, 0, i * 0.12)),
};

// Confetti over the whole screen for a win.
export function confetti(n = 120) {
  const cv = document.createElement('canvas');
  cv.className = 'confetti';
  cv.width = innerWidth; cv.height = innerHeight;
  document.body.appendChild(cv);
  const c = cv.getContext('2d');
  const cols = ['#ff6a2b', '#3b7bff', '#ffc34d', '#38e08a', '#c26bff', '#ff4d7a'];
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.4,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 4,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, col: cols[Math.floor(Math.random() * cols.length)],
  }));
  let f = 0;
  (function tick() {
    c.clearRect(0, 0, cv.width, cv.height);
    ps.forEach((p) => {
      p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
    });
    if (++f < 150) requestAnimationFrame(tick); else cv.remove();
  })();
}

// Floating "+1" style text above an element.
export function popText(el, text, color = '#ffc34d') {
  const r = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'pop-text';
  s.textContent = text;
  s.style.left = `${r.left + r.width / 2}px`;
  s.style.top = `${r.top + r.height * 0.3}px`;
  s.style.color = color;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 800);
}

// Star rating (1–3) shown in a status line.
export const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

// Tiny particle system for canvas games.
export function particles() {
  const list = [];
  return {
    burst(x, y, color, n = 12, speed = 160) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random());
        list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color, size: 2 + Math.random() * 3 });
      }
    },
    step(dt, ctx2) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.vy += 400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.6;
        if (p.life <= 0) { list.splice(i, 1); continue; }
        ctx2.globalAlpha = p.life; ctx2.fillStyle = p.color;
        ctx2.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx2.globalAlpha = 1;
    },
  };
}
