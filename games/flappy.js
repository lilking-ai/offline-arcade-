// Flappy: tap to flap through the gaps. Bird waits until your first tap.
// Gets faster as you score; grab coins for +1. Medals at 10 / 25 / 50.
import { store } from './util.js';
import { sfx, particles, confetti } from './fx.js';

const W = 360, H = 560, PIPE = 62, GROUND = 50;

export function mount(stage, { roundOver }) {
  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Best</span><b id="bs">${store.get('flappy-best', 0)}</b></div>
    </div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Flappy game"></canvas>
      <div class="overlay" id="ov"><div class="status" id="msg">Flappy</div><p class="hint" id="sub">Tap to flap. Coins are worth +1.</p><button class="btn primary" id="go">Play</button></div>
    </div>`;
  const el = (id) => stage.querySelector('#' + id);
  const ctx = el('cv').getContext('2d');
  const fx = particles();
  let y, vy, pipes, coins, score, state = 'menu', raf, last, t = 0, speed, groundX = 0, wing = 0;

  // Background layers: stars, far skyline, near skyline.
  const stars = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * (H * 0.6), s: Math.random() * 1.6 + 0.3 }));
  const skyline = (n, minH, maxH) => Array.from({ length: n }, (_, i) => ({ x: i * (W / (n - 2)), w: 22 + Math.random() * 30, h: minH + Math.random() * (maxH - minH), lit: Math.random() }));
  const far = skyline(14, 60, 140), near = skyline(10, 40, 100);

  const newGap = () => 110 + Math.random() * (H - GROUND - 280);
  const gapSize = () => Math.max(128, 170 - score * 1.2);

  function reset() {
    y = H / 2 - 40; vy = 0; score = 0; speed = 150; t = 0;
    pipes = []; coins = [];
    for (let i = 0; i < 3; i++) {
      const p = { x: W + 120 + i * 210, gap: newGap(), size: 170, passed: false };
      pipes.push(p);
      coins.push({ x: p.x + PIPE / 2 + 105, y: 140 + Math.random() * 240, got: false });
    }
    el('sc').textContent = 0;
  }
  function begin() {
    reset(); state = 'ready';
    el('ov').hidden = true;
    last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function flap(e) {
    if (e) e.preventDefault();
    if (state === 'ready') state = 'play';
    if (state !== 'play') return;
    vy = -340; wing = 1; sfx.flap();
  }

  function loop(now) {
    const dt = Math.min(0.03, (now - last) / 1000); last = now; t += dt;
    if (state === 'ready') {
      y = H / 2 - 40 + Math.sin(t * 4) * 8;
    } else if (state === 'play' || state === 'dying') {
      vy += 1150 * dt; y += vy * dt;
      if (state === 'play') {
        speed = Math.min(260, 150 + score * 3);
        for (const p of pipes) {
          p.x -= speed * dt;
          if (p.x < -PIPE) { p.x += 630; p.gap = newGap(); p.size = gapSize(); p.passed = false; }
          if (!p.passed && p.x + PIPE < 80) { p.passed = true; score++; el('sc').textContent = score; sfx.point(); }
          if (80 + 13 > p.x && 80 - 13 < p.x + PIPE && (y - 12 < p.gap || y + 12 > p.gap + p.size)) die();
        }
        for (const c of coins) {
          c.x -= speed * dt;
          if (c.x < -20) { c.x += 630; c.y = 120 + Math.random() * 260; c.got = false; }
          if (!c.got && Math.hypot(c.x - 80, c.y - y) < 24) { c.got = true; score++; el('sc').textContent = score; sfx.good(); fx.burst(c.x, c.y, '#ffc34d', 14); }
        }
        if (y < -20) { y = -20; vy = 0; }
      }
      if (y > H - GROUND - 12) { y = H - GROUND - 12; if (state === 'play') die(); else return end(); }
    }
    if (state !== 'dying') groundX = (groundX - speed * dt) % 24;
    wing = Math.max(0, wing - dt * 5);
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  function die() {
    state = 'dying'; vy = -200; sfx.hit();
    fx.burst(80, y, '#ffc34d', 20, 220);
  }
  function end() {
    state = 'menu';
    const best = store.get('flappy-best', 0);
    if (score > best) { store.set('flappy-best', score); el('bs').textContent = score; }
    const medal = score >= 50 ? 'Gold medal' : score >= 25 ? 'Silver medal' : score >= 10 ? 'Bronze medal' : '';
    el('msg').textContent = `Score ${score}`;
    el('sub').textContent = (medal ? medal + ' · ' : '') + (score > best ? 'New best!' : `Best ${Math.max(best, score)}`);
    el('go').textContent = 'Play again';
    el('ov').hidden = false;
    if (score > best && score >= 5) { sfx.win(); confetti(); } else sfx.lose();
    draw(0);
    roundOver();
  }

  function building(b, base, color, windowColor, scroll) {
    const x = ((b.x + scroll) % (W + 60) + W + 60) % (W + 60) - 40;
    ctx.fillStyle = color; ctx.fillRect(x, base - b.h, b.w, b.h);
    ctx.fillStyle = windowColor;
    for (let wy = base - b.h + 8; wy < base - 8; wy += 12) for (let wx = x + 5; wx < x + b.w - 5; wx += 9) {
      if (((wx * 7 + wy * 13) | 0) % 5 < b.lit * 3) ctx.fillRect(wx, wy, 3, 4);
    }
  }

  function draw(dt) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b0820'); sky.addColorStop(0.55, '#2a1240'); sky.addColorStop(1, '#ff7a3d');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    stars.forEach((s) => { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + s.x)); ctx.fillRect(s.x, s.y, s.s, s.s); });
    ctx.globalAlpha = 1;
    // moon
    ctx.fillStyle = '#fff3d6'; ctx.shadowBlur = 30; ctx.shadowColor = '#ffd9a0';
    ctx.beginPath(); ctx.arc(280, 90, 26, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    const base = H - GROUND;
    far.forEach((b) => building(b, base, '#1c1235', 'rgba(255,200,120,.35)', groundX * 0.2 + t * -6));
    near.forEach((b) => building(b, base, '#120b22', 'rgba(255,220,150,.6)', groundX * 0.5 + t * -18));

    // pipes
    for (const p of pipes) {
      const g = ctx.createLinearGradient(p.x, 0, p.x + PIPE, 0);
      g.addColorStop(0, '#1b8a4c'); g.addColorStop(0.35, '#5ef29a'); g.addColorStop(1, '#0f5a31');
      ctx.fillStyle = g;
      ctx.fillRect(p.x, 0, PIPE, p.gap - 22);
      ctx.fillRect(p.x, p.gap + p.size + 22, PIPE, base - p.gap - p.size - 22);
      ctx.fillRect(p.x - 6, p.gap - 26, PIPE + 12, 26);
      ctx.fillRect(p.x - 6, p.gap + p.size, PIPE + 12, 26);
      ctx.strokeStyle = '#0a3a20'; ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 6, p.gap - 26, PIPE + 12, 26);
      ctx.strokeRect(p.x - 6, p.gap + p.size, PIPE + 12, 26);
    }
    // coins
    for (const c of coins) {
      if (c.got) continue;
      const sq = Math.abs(Math.cos(t * 4 + c.x * 0.05));
      ctx.fillStyle = '#ffc34d'; ctx.shadowBlur = 12; ctx.shadowColor = '#ffc34d';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 10 * sq + 2, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#c98a10';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, (10 * sq + 2) * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    // ground
    ctx.fillStyle = '#3a2410'; ctx.fillRect(0, base, W, GROUND);
    ctx.fillStyle = '#5ef29a'; ctx.fillRect(0, base, W, 8);
    ctx.fillStyle = '#4a3018';
    for (let x = groundX; x < W; x += 24) ctx.fillRect(x, base + 14, 12, 6);

    // bird
    const tilt = state === 'ready' ? 0 : Math.max(-0.5, Math.min(1.4, vy / 500));
    ctx.save(); ctx.translate(80, y); ctx.rotate(tilt);
    ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(255,195,77,.6)';
    const body = ctx.createRadialGradient(-4, -6, 2, 0, 0, 16);
    body.addColorStop(0, '#fff2b0'); body.addColorStop(1, '#ffb020');
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff8a2b';
    ctx.beginPath(); ctx.ellipse(-4, 2 - wing * 8, 9, 5, -0.4 - wing * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7, -5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(8.5, -5, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a1f'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(22, 3); ctx.lineTo(13, 7); ctx.fill();
    ctx.restore();

    fx.step(dt, ctx);
    if (state === 'ready') {
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '800 22px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Tap to start', W / 2, H / 2 + 60);
    }
  }

  const key = (e) => { if (e.code === 'Space') flap(e); };
  el('cv').addEventListener('pointerdown', flap);
  window.addEventListener('keydown', key);
  el('go').addEventListener('click', begin);
  reset(); draw(0);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
}
