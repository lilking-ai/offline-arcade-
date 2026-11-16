// Flappy: tap to flap through the gaps.
import { store } from './util.js';
const W = 360, H = 560, GAP = 150, PIPE = 60;

export function mount(stage, { roundOver }) {
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Best</span><b id="bs">${store.get('flappy-best', 0)}</b></div>
    </div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Flappy game"></canvas>
      <div class="overlay" id="ov"><div class="status" id="msg">Flappy</div><p class="hint">Tap anywhere to flap.</p><button class="btn primary" id="go">Start</button></div>
    </div>`;
  const el = (id) => stage.querySelector('#' + id);
  const ctx = el('cv').getContext('2d');
  let y, vy, pipes, score, running = false, raf, last;

  function start() {
    y = H / 2; vy = 0; pipes = []; score = 0; el('sc').textContent = 0;
    for (let i = 0; i < 3; i++) pipes.push({ x: W + 60 + i * 200, gap: 120 + Math.random() * (H - 300), passed: false });
    el('ov').hidden = true; running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  const flap = (e) => { if (e) e.preventDefault(); if (running) vy = -330; };

  function loop(t) {
    const dt = Math.min(0.03, (t - last) / 1000); last = t;
    vy += 1100 * dt; y += vy * dt;
    for (const p of pipes) {
      p.x -= 150 * dt;
      if (p.x < -PIPE) { p.x += 600; p.gap = 120 + Math.random() * (H - 300); p.passed = false; }
      if (!p.passed && p.x + PIPE < 80) { p.passed = true; score++; el('sc').textContent = score; }
      if (80 + 14 > p.x && 80 - 14 < p.x + PIPE && (y - 14 < p.gap || y + 14 > p.gap + GAP)) return end();
    }
    if (y > H - 14 || y < 0) return end();
    draw();
    raf = requestAnimationFrame(loop);
  }
  function end() {
    running = false;
    if (score > store.get('flappy-best', 0)) { store.set('flappy-best', score); el('bs').textContent = score; }
    el('msg').textContent = `Score ${score}`; el('go').textContent = 'Play again'; el('ov').hidden = false;
    roundOver();
  }
  function draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120a24'); g.addColorStop(1, '#3a1608');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.shadowBlur = 14; ctx.shadowColor = '#3b7bff'; ctx.fillStyle = '#2a5ad0';
    for (const p of pipes) {
      ctx.beginPath(); ctx.roundRect(p.x, -10, PIPE, p.gap + 10, 10); ctx.fill();
      ctx.beginPath(); ctx.roundRect(p.x, p.gap + GAP, PIPE, H, 10); ctx.fill();
    }
    ctx.shadowColor = '#ffc34d'; ctx.fillStyle = '#ffc34d';
    ctx.beginPath(); ctx.arc(80, y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(86, y - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6a2b'; ctx.beginPath(); ctx.moveTo(92, y); ctx.lineTo(102, y + 3); ctx.lineTo(92, y + 6); ctx.fill();
  }
  el('cv').addEventListener('pointerdown', flap);
  const key = (e) => { if (e.code === 'Space') flap(e); };
  window.addEventListener('keydown', key);
  el('go').addEventListener('click', start);
  y = H / 2; pipes = []; draw();
  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
}
