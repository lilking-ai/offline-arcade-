// Pong: each player drags their own half of the screen. Or play the CPU. First to 7.
const W = 360, H = 600, PW = 80, PH = 12, R = 8, WIN = 7;

export function mount(stage, { roundOver }) {
  let mode = '2p';
  stage.innerHTML = `
    <div class="seg" role="group" aria-label="Mode">
      <button data-mode="2p" class="on">2 Players</button>
      <button data-mode="cpu">vs CPU</button>
    </div>
    <div class="snake-wrap">
      <canvas id="cv" width="${W}" height="${H}" aria-label="Pong table"></canvas>
      <div class="overlay" id="ov">
        <div class="status" id="msg">Pong</div>
        <p class="hint">Drag on your half to move your paddle. First to ${WIN}.</p>
        <button class="btn primary" id="go">Start</button>
      </div>
    </div>`;
  const el = (id) => stage.querySelector('#' + id);
  const cv = el('cv'), ctx = cv.getContext('2d');
  let p1, p2, ball, s1, s2, raf = null, running = false, last = 0;

  function serve(dir) {
    ball = { x: W / 2, y: H / 2, vx: (Math.random() * 2 - 1) * 150, vy: 300 * dir };
  }
  function start() {
    p1 = W / 2; p2 = W / 2; s1 = 0; s2 = 0;
    serve(Math.random() < 0.5 ? 1 : -1);
    el('ov').hidden = true;
    running = true;
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function toLocal(clientX, clientY) {
    const r = cv.getBoundingClientRect();
    return { x: (clientX - r.left) * (W / r.width), y: (clientY - r.top) * (H / r.height) };
  }
  function control(e) {
    e.preventDefault();
    const pts = e.touches ? [...e.touches] : [e];
    for (const t of pts) {
      const p = toLocal(t.clientX, t.clientY);
      if (p.y > H / 2) p1 = p.x;
      else if (mode === '2p') p2 = p.x;
    }
  }
  cv.addEventListener('touchstart', control, { passive: false });
  cv.addEventListener('touchmove', control, { passive: false });
  cv.addEventListener('mousemove', control);

  function loop(t) {
    const dt = Math.min(0.03, (t - last) / 1000);
    last = t;
    if (mode === 'cpu') p2 += Math.max(-260 * dt, Math.min(260 * dt, ball.x - p2));
    p1 = Math.max(PW / 2, Math.min(W - PW / 2, p1));
    p2 = Math.max(PW / 2, Math.min(W - PW / 2, p2));
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < R || ball.x > W - R) { ball.vx *= -1; ball.x = Math.max(R, Math.min(W - R, ball.x)); }
    const hit = (px, py, dir) => {
      if (Math.abs(ball.y - py) < R + PH / 2 && Math.abs(ball.x - px) < PW / 2 + R && Math.sign(ball.vy) === dir) {
        ball.vy = -ball.vy * 1.06;
        ball.vx += (ball.x - px) * 6;
      }
    };
    hit(p1, H - 30, 1);
    hit(p2, 30, -1);
    if (ball.y > H + R) { s2++; serve(1); }
    if (ball.y < -R) { s1++; serve(-1); }
    draw();
    if (s1 >= WIN || s2 >= WIN) {
      running = false;
      el('msg').textContent = s1 >= WIN ? 'Bottom player wins!' : mode === 'cpu' ? 'CPU wins!' : 'Top player wins!';
      el('go').textContent = 'Play again';
      el('ov').hidden = false;
      roundOver();
      return;
    }
    if (running) raf = requestAnimationFrame(loop);
  }

  function draw() {
    ctx.fillStyle = '#06070c';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '900 54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(s2, W / 2, H / 2 - 40);
    ctx.fillText(s1, W / 2, H / 2 + 80);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#3b7bff'; ctx.fillStyle = '#6197ff';
    ctx.beginPath(); ctx.roundRect(p2 - PW / 2, 30 - PH / 2, PW, PH, 6); ctx.fill();
    ctx.shadowColor = '#ff6a2b'; ctx.fillStyle = '#ff8a4f';
    ctx.beginPath(); ctx.roundRect(p1 - PW / 2, H - 30 - PH / 2, PW, PH, 6); ctx.fill();
    ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  stage.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    stage.querySelectorAll('[data-mode]').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    mode = b.dataset.mode;
  }));
  el('go').addEventListener('click', start);
  p1 = p2 = W / 2; s1 = s2 = 0; ball = { x: W / 2, y: H / 2 };
  draw();
  return () => { running = false; cancelAnimationFrame(raf); };
}
