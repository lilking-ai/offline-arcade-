// Breakout: drag the paddle, tap to launch. 100 levels.
// Tougher bricks need 2–3 hits. Catch falling power-ups: W = wide paddle, M = multi-ball,
// S = slow ball, + = extra life.
import { levelBar } from './util.js';
import { sfx, particles, confetti } from './fx.js';

const W = 360, H = 560, MAX = 100, BR = 7;
const ROW_COLORS = ['#ff4d5e', '#ff6a2b', '#ffc34d', '#38e08a', '#33d1e0', '#3b7bff', '#c26bff', '#ff7ab6'];
const POWERS = { W: '#3b7bff', M: '#c26bff', S: '#38e08a', '+': '#ff4d5e' };

export function mount(stage, { roundOver }) {
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'breakout', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="scores"><div class="score p1"><span>Lives</span><b id="lives">3</b></div><div class="score p2"><span>Score</span><b id="score">0</b></div></div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Breakout"></canvas>
      <div class="overlay" id="ov"><div class="status" id="msg">Breakout</div><p class="hint" id="sub">Drag to move. Tap to launch.</p><button class="btn primary" id="go">Start</button></div>
    </div>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const cv = el('cv'), ctx = cv.getContext('2d');
  const fx = particles();
  let bricks, px, pw, balls, drops, lives, score, state = 'menu', raf, last, speed, wideT, slowT, action = 'start', shake = 0;

  function load(level) {
    cancelAnimationFrame(raf); state = 'menu';
    const rows = Math.min(8, 3 + Math.floor(level / 6));
    speed = 270 + Math.min(230, level * 4);
    bricks = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) {
      const pattern = level % 4;
      if (pattern === 1 && (r + c) % 2) continue;
      if (pattern === 2 && (c === 3 || c === 4) && r % 2) continue;
      if (pattern === 3 && Math.abs(c - 3.5) + r < 2) continue;
      const hp = level > 30 && r < 2 ? 3 : level > 8 && r < Math.floor(level / 10) + 1 ? 2 : 1;
      bricks.push({ x: 10 + c * 42.5, y: 54 + r * 22, hp, max: hp, color: ROW_COLORS[r % ROW_COLORS.length], power: Math.random() < 0.12 ? Object.keys(POWERS)[Math.floor(Math.random() * 4)] : null });
    }
    px = W / 2; pw = 80; lives = 3; score = 0; wideT = 0; slowT = 0; drops = [];
    stick();
    el('lives').textContent = lives; el('score').textContent = 0;
    action = 'start'; el('msg').textContent = `Level ${level}`; el('sub').textContent = 'Drag to move. Tap to launch.';
    el('go').textContent = 'Start'; el('ov').hidden = false;
    draw(0);
  }
  const stick = () => { balls = [{ x: px, y: H - 44, vx: 0, vy: 0, stuck: true }]; };
  function launch() {
    balls.forEach((b) => { if (b.stuck) { b.stuck = false; b.vx = speed * (Math.random() * 0.6 - 0.3); b.vy = -speed; } });
  }
  function start() { el('ov').hidden = true; state = 'play'; last = performance.now(); raf = requestAnimationFrame(loop); }

  const moveTo = (e) => {
    const r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    px = Math.max(pw / 2, Math.min(W - pw / 2, (t.clientX - r.left) * (W / r.width)));
    if (e.cancelable) e.preventDefault();
  };
  cv.addEventListener('touchmove', moveTo, { passive: false });
  cv.addEventListener('touchstart', moveTo, { passive: false });
  cv.addEventListener('touchend', () => { if (state === 'play') launch(); });
  cv.addEventListener('mousemove', moveTo);
  cv.addEventListener('click', () => { if (state === 'play') launch(); });

  function hitBrick(b) {
    b.hp--; score += 10; el('score').textContent = score;
    fx.burst(b.x + 20, b.y + 8, b.color, b.hp ? 6 : 14);
    if (b.hp) { sfx.tap(); return; }
    sfx.point();
    if (b.power) drops.push({ x: b.x + 20, y: b.y + 8, k: b.power });
  }

  function loop(now) {
    const dt = Math.min(0.025, (now - last) / 1000); last = now;
    wideT = Math.max(0, wideT - dt); slowT = Math.max(0, slowT - dt);
    pw = wideT ? 130 : 80;
    const mult = slowT ? 0.6 : 1;
    for (const ball of balls) {
      if (ball.stuck) { ball.x = px; ball.y = H - 44; continue; }
      ball.x += ball.vx * dt * mult; ball.y += ball.vy * dt * mult;
      if (ball.x < BR || ball.x > W - BR) { ball.vx *= -1; ball.x = Math.max(BR, Math.min(W - BR, ball.x)); sfx.tap(); }
      if (ball.y < BR) { ball.vy = Math.abs(ball.vy); sfx.tap(); }
      if (ball.vy > 0 && ball.y > H - 40 && ball.y < H - 24 && Math.abs(ball.x - px) < pw / 2 + BR) {
        const k = (ball.x - px) / (pw / 2);
        const sp = Math.hypot(ball.vx, ball.vy);
        ball.vx = sp * 0.85 * k; ball.vy = -Math.sqrt(Math.max(sp * sp - ball.vx * ball.vx, sp * sp * 0.3));
        sfx.drop();
      }
      for (const b of bricks) {
        if (b.hp > 0 && ball.x > b.x - BR && ball.x < b.x + 40 + BR && ball.y > b.y - BR && ball.y < b.y + 18 + BR) {
          const side = Math.min(Math.abs(ball.x - b.x), Math.abs(ball.x - (b.x + 40))) < Math.min(Math.abs(ball.y - b.y), Math.abs(ball.y - (b.y + 18)));
          if (side) ball.vx *= -1; else ball.vy *= -1;
          hitBrick(b);
          break;
        }
      }
    }
    balls = balls.filter((b) => b.y < H + 20);
    for (const d of drops) {
      d.y += 140 * dt;
      if (d.y > H - 40 && d.y < H - 18 && Math.abs(d.x - px) < pw / 2 + 10) {
        d.got = true; sfx.power();
        if (d.k === 'W') wideT = 12;
        if (d.k === 'S') slowT = 10;
        if (d.k === '+') { lives++; el('lives').textContent = lives; }
        if (d.k === 'M') { const src = balls.find((b) => !b.stuck) || balls[0]; if (src) [-1, 1].forEach((s) => balls.push({ x: src.x, y: src.y, vx: speed * 0.5 * s, vy: -speed, stuck: false })); }
      }
    }
    drops = drops.filter((d) => !d.got && d.y < H + 20);

    if (!bricks.some((b) => b.hp > 0)) return finish(true);
    if (!balls.length) {
      lives--; el('lives').textContent = lives; sfx.bad(); shake = 0.3;
      if (!lives) return finish(false);
      stick();
    }
    shake = Math.max(0, shake - dt);
    draw(dt);
    if (state === 'play') raf = requestAnimationFrame(loop);
  }

  function finish(won) {
    state = 'menu'; draw(0);
    if (won) {
      lv.complete(); sfx.win(); confetti();
      action = 'next'; el('msg').textContent = 'Level cleared!'; el('sub').textContent = `Score ${score}`; el('go').textContent = lv.level < MAX ? 'Next level' : 'Play again';
    } else {
      sfx.lose(); action = 'retry'; el('msg').textContent = 'Out of lives'; el('sub').textContent = `Score ${score}`; el('go').textContent = 'Try again';
    }
    el('ov').hidden = false;
    roundOver();
  }

  const shadeOf = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${(n >> 16) * 0.5 | 0},${((n >> 8) & 255) * 0.5 | 0},${(n & 255) * 0.5 | 0})`;
  };

  function draw(dt) {
    ctx.save();
    if (shake) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0a1f'); g.addColorStop(1, '#05060b');
    ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.strokeStyle = 'rgba(80,90,180,.12)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (const b of bricks) {
      if (b.hp <= 0) continue;
      const bg = ctx.createLinearGradient(0, b.y, 0, b.y + 18);
      bg.addColorStop(0, '#fff'); bg.addColorStop(0.18, b.color); bg.addColorStop(1, shadeOf(b.color));
      ctx.globalAlpha = 0.45 + 0.55 * (b.hp / b.max);
      ctx.shadowBlur = 10; ctx.shadowColor = b.color; ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, 40, 18, 5); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      if (b.max > 1) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = b.hp; ctx.strokeRect(b.x + 3, b.y + 3, 34, 12); }
      if (b.power) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.font = '900 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('★', b.x + 20, b.y + 13); }
    }
    for (const d of drops) {
      ctx.fillStyle = POWERS[d.k]; ctx.shadowBlur = 12; ctx.shadowColor = POWERS[d.k];
      ctx.beginPath(); ctx.roundRect(d.x - 14, d.y - 9, 28, 18, 9); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.font = '900 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(d.k, d.x, d.y + 5);
    }
    const pg = ctx.createLinearGradient(0, H - 32, 0, H - 20);
    pg.addColorStop(0, '#ffd2b8'); pg.addColorStop(0.4, '#ff8a4f'); pg.addColorStop(1, '#b23d0c');
    ctx.shadowBlur = 16; ctx.shadowColor = wideT ? '#3b7bff' : '#ff6a2b'; ctx.fillStyle = pg;
    ctx.beginPath(); ctx.roundRect(px - pw / 2, H - 32, pw, 12, 6); ctx.fill();
    for (const b of balls) {
      ctx.shadowColor = slowT ? '#38e08a' : '#fff'; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, BR, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    fx.step(dt, ctx);
    if (state === 'play' && balls.some((b) => b.stuck)) {
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Tap to launch', W / 2, H - 90);
    }
    ctx.restore();
  }

  el('go').addEventListener('click', () => {
    if (action === 'next') { if (lv.level < MAX) lv.next(); else load(lv.level); }
    else if (action === 'retry') load(lv.level);
    else start();
  });
  load(lv.level);
  return () => { state = 'menu'; cancelAnimationFrame(raf); };
}
