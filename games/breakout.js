// Breakout: drag the paddle, break every brick. Levels get more rows and speed.
import { levelBar } from './util.js';
const W = 360, H = 540, MAX = 100;

export function mount(stage, { roundOver }) {
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'breakout', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="scores"><div class="score p1"><span>Lives</span><b id="lives">3</b></div><div class="score p2"><span>Bricks</span><b id="left">0</b></div></div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Breakout"></canvas>
      <div class="overlay" id="ov"><div class="status" id="msg">Breakout</div><p class="hint">Drag to move the paddle.</p><button class="btn primary" id="go">Start</button></div>
    </div>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const cv = el('cv'), ctx = cv.getContext('2d');
  let bricks, px, ball, lives, running = false, raf, last, speed, action = 'start';
  const COLS = ['#ff4d5e', '#ff6a2b', '#ffc34d', '#38e08a', '#3b7bff', '#c26bff'];

  function load(level) {
    running = false; cancelAnimationFrame(raf);
    const rows = Math.min(8, 3 + Math.floor(level / 8));
    speed = 260 + Math.min(240, level * 4);
    bricks = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) {
      if ((level % 3 === 2 && (r + c) % 2) || (level % 5 === 4 && c % 3 === 1)) continue;
      bricks.push({ x: 8 + c * 43.5, y: 50 + r * 22, alive: true, color: COLS[r % COLS.length] });
    }
    px = W / 2; lives = 3; resetBall();
    el('lives').textContent = lives; el('left').textContent = bricks.length;
    action = 'start'; el('msg').textContent = `Level ${level}`; el('go').textContent = 'Start'; el('ov').hidden = false;
    draw();
  }
  function resetBall() { ball = { x: px, y: H - 60, vx: speed * 0.5, vy: -speed }; }
  function start() { el('ov').hidden = true; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }

  const moveTo = (e) => {
    const r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    px = Math.max(40, Math.min(W - 40, (t.clientX - r.left) * (W / r.width)));
    if (e.cancelable) e.preventDefault();
  };
  cv.addEventListener('touchmove', moveTo, { passive: false });
  cv.addEventListener('touchstart', moveTo, { passive: false });
  cv.addEventListener('mousemove', moveTo);

  function loop(t) {
    const dt = Math.min(0.025, (t - last) / 1000); last = t;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < 7 || ball.x > W - 7) { ball.vx *= -1; ball.x = Math.max(7, Math.min(W - 7, ball.x)); }
    if (ball.y < 7) { ball.vy = Math.abs(ball.vy); }
    if (ball.vy > 0 && ball.y > H - 34 && ball.y < H - 20 && Math.abs(ball.x - px) < 46) {
      const k = (ball.x - px) / 46;
      ball.vx = speed * 1.1 * k; ball.vy = -Math.sqrt(Math.max(speed * speed - ball.vx * ball.vx * 0.5, speed * speed * 0.4));
    }
    for (const b of bricks) {
      if (b.alive && ball.x > b.x - 6 && ball.x < b.x + 46 && ball.y > b.y - 6 && ball.y < b.y + 24) {
        b.alive = false; ball.vy *= -1; break;
      }
    }
    const left = bricks.filter((b) => b.alive).length;
    el('left').textContent = left;
    if (!left) { running = false; lv.complete(); roundOver(); el('msg').textContent = 'Level cleared!'; el('go').textContent = 'Next level'; el('ov').hidden = false; action = 'next'; draw(); return; }
    if (ball.y > H + 10) {
      lives--; el('lives').textContent = lives;
      if (!lives) { running = false; roundOver(); el('msg').textContent = 'Out of lives'; el('go').textContent = 'Try again'; el('ov').hidden = false; action = 'retry'; draw(); return; }
      resetBall();
    }
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }
  function draw() {
    ctx.fillStyle = '#06070c'; ctx.fillRect(0, 0, W, H);
    for (const b of bricks) if (b.alive) { ctx.shadowBlur = 10; ctx.shadowColor = b.color; ctx.fillStyle = b.color; ctx.beginPath(); ctx.roundRect(b.x, b.y, 40, 16, 4); ctx.fill(); }
    ctx.shadowColor = '#ff6a2b'; ctx.fillStyle = '#ff8a4f';
    ctx.beginPath(); ctx.roundRect(px - 42, H - 30, 84, 10, 5); ctx.fill();
    ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  el('go').addEventListener('click', () => {
    if (action === 'next') { if (lv.level < MAX) lv.next(); else load(lv.level); }
    else if (action === 'retry') load(lv.level);
    else start();
  });
  load(lv.level);
  return () => { running = false; cancelAnimationFrame(raf); };
}
