// Football (air-hockey style): drag your striker, smash the ball into the other goal. First to 5.
const W = 360, H = 600, GOAL = 130, SR = 26, BR = 14, WIN = 5;

export function mount(stage, { roundOver }) {
  let mode = '2p';
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode">
      <button data-mode="2p" class="on">2 Players</button>
      <button data-mode="cpu">vs CPU</button>
    </div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Football pitch"></canvas>
      <div class="overlay" id="ov">
        <div class="status" id="msg">Football</div>
        <p class="hint">Drag your striker on your half. First to ${WIN} goals.</p>
        <button class="btn primary" id="go">Kick off</button>
      </div>
    </div>`;
  const el = (id) => stage.querySelector('#' + id);
  const cv = el('cv'), ctx = cv.getContext('2d');
  let a, b, ball, sa, sb, raf = null, running = false, last = 0;

  const striker = (x, y) => ({ x, y, px: x, py: y, vx: 0, vy: 0 });
  function kickoff(towards) {
    ball = { x: W / 2, y: H / 2 + towards * 40, vx: 0, vy: 0 };
    a = striker(W / 2, H - 70);
    b = striker(W / 2, 70);
  }
  function start() {
    sa = sb = 0;
    kickoff(Math.random() < 0.5 ? 1 : -1);
    el('ov').hidden = true;
    running = true;
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  const toLocal = (t) => {
    const r = cv.getBoundingClientRect();
    return { x: (t.clientX - r.left) * (W / r.width), y: (t.clientY - r.top) * (H / r.height) };
  };
  function control(e) {
    e.preventDefault();
    for (const t of e.touches ? [...e.touches] : [e]) {
      const p = toLocal(t);
      if (p.y > H / 2) { a.x = p.x; a.y = p.y; } else if (mode === '2p') { b.x = p.x; b.y = p.y; }
    }
  }
  cv.addEventListener('touchstart', control, { passive: false });
  cv.addEventListener('touchmove', control, { passive: false });
  cv.addEventListener('mousemove', control);

  function clampStriker(s, top) {
    s.x = Math.max(SR, Math.min(W - SR, s.x));
    s.y = top ? Math.max(SR, Math.min(H / 2 - SR, s.y)) : Math.max(H / 2 + SR, Math.min(H - SR, s.y));
  }

  function collide(s, dt) {
    s.vx = (s.x - s.px) / dt; s.vy = (s.y - s.py) / dt;
    s.px = s.x; s.py = s.y;
    const dx = ball.x - s.x, dy = ball.y - s.y, d = Math.hypot(dx, dy);
    if (d < SR + BR && d > 0) {
      const nx = dx / d, ny = dy / d;
      ball.x = s.x + nx * (SR + BR);
      ball.y = s.y + ny * (SR + BR);
      const rel = (ball.vx - s.vx) * nx + (ball.vy - s.vy) * ny;
      if (rel < 0) { ball.vx -= 1.9 * rel * nx; ball.vy -= 1.9 * rel * ny; }
      const sp = Math.hypot(ball.vx, ball.vy), max = 1100;
      if (sp > max) { ball.vx *= max / sp; ball.vy *= max / sp; }
    }
  }

  function loop(t) {
    const dt = Math.max(0.008, Math.min(0.03, (t - last) / 1000));
    last = t;
    if (mode === 'cpu') {
      const tx = ball.x, ty = ball.y < H / 2 ? ball.y - 10 : 80;
      b.x += Math.max(-300 * dt, Math.min(300 * dt, tx - b.x));
      b.y += Math.max(-300 * dt, Math.min(300 * dt, ty - b.y));
    }
    clampStriker(a, false); clampStriker(b, true);
    collide(a, dt); collide(b, dt);
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    ball.vx *= 0.992; ball.vy *= 0.992;
    if (ball.x < BR || ball.x > W - BR) { ball.vx *= -0.9; ball.x = Math.max(BR, Math.min(W - BR, ball.x)); }
    const inGoal = Math.abs(ball.x - W / 2) < GOAL / 2;
    if (ball.y < BR && !inGoal) { ball.vy = Math.abs(ball.vy) * 0.9; ball.y = BR; }
    if (ball.y > H - BR && !inGoal) { ball.vy = -Math.abs(ball.vy) * 0.9; ball.y = H - BR; }
    if (ball.y < -BR) { sa++; kickoff(-1); }
    if (ball.y > H + BR) { sb++; kickoff(1); }
    draw();
    if (sa >= WIN || sb >= WIN) {
      running = false;
      el('msg').textContent = sa >= WIN ? 'Orange wins!' : mode === 'cpu' ? 'CPU wins!' : 'Blue wins!';
      el('go').textContent = 'Play again';
      el('ov').hidden = false;
      roundOver();
      return;
    }
    if (running) raf = requestAnimationFrame(loop);
  }

  function draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c3a1e'); g.addColorStop(1, '#082a15');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent'; ctx.fillRect(0, i * H / 8, W, H / 8); }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, W - 12, H - 12);
    ctx.beginPath(); ctx.moveTo(6, H / 2); ctx.lineTo(W - 6, H / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(W / 2 - 80, 6, 160, 60); ctx.strokeRect(W / 2 - 80, H - 66, 160, 60);
    ctx.fillStyle = '#fff';
    ctx.fillRect(W / 2 - GOAL / 2, 0, GOAL, 6); ctx.fillRect(W / 2 - GOAL / 2, H - 6, GOAL, 6);
    ctx.font = '900 48px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText(sb, W / 2, H / 2 - 70); ctx.fillText(sa, W / 2, H / 2 + 105);
    const disc = (s, c1, c2) => {
      ctx.shadowBlur = 20; ctx.shadowColor = c1;
      const gr = ctx.createRadialGradient(s.x - 8, s.y - 8, 2, s.x, s.y, SR);
      gr.addColorStop(0, c2); gr.addColorStop(1, c1);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(s.x, s.y, SR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    };
    disc(a, '#ff6a2b', '#ffc3a3'); disc(b, '#3b7bff', '#b8d0ff');
    ctx.shadowBlur = 12; ctx.shadowColor = '#fff'; ctx.fillStyle = '#f3f1ec';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2); ctx.fill();
  }

  stage.querySelectorAll('[data-mode]').forEach((btn) => btn.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    btn.classList.add('on');
    mode = btn.dataset.mode;
  }));
  el('go').addEventListener('click', start);
  sa = sb = 0; kickoff(1); draw();
  return () => { running = false; cancelAnimationFrame(raf); };
}
