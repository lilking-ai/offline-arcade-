// Snake: swipe, D-pad or arrow keys. Saves your best score on the device.
const N = 20;
const SIZE = 400;
const CELL = SIZE / N;

export function mount(stage, { roundOver }) {
  let best = 0;
  try { best = Number(localStorage.getItem('oa-snake-best')) || 0; } catch (e) {}

  stage.innerHTML = `
    <div class="scores">
      <div class="score p1"><span>Score</span><b id="sc">0</b></div>
      <div class="score p2"><span>Best</span><b id="bs">${best}</b></div>
    </div>
    <div class="snake-wrap">
      <canvas id="cv" width="${SIZE}" height="${SIZE}" aria-label="Snake board"></canvas>
      <div class="overlay" id="ov">
        <div class="status" id="msg">Snake</div>
        <button class="btn primary" id="go">Start</button>
      </div>
    </div>
    <div class="pad">
      <button class="up" data-d="0,-1" aria-label="Up">▲</button>
      <button class="left" data-d="-1,0" aria-label="Left">◀</button>
      <button class="down" data-d="0,1" aria-label="Down">▼</button>
      <button class="right" data-d="1,0" aria-label="Right">▶</button>
    </div>`;

  const el = (id) => stage.querySelector('#' + id);
  const ctx = el('cv').getContext('2d');
  let snake, dir, nextDir, food, score, timer = null;

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (snake.some((s) => s.x === food.x && s.y === food.y));
  }

  function start() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = nextDir = { x: 1, y: 0 };
    score = 0;
    el('sc').textContent = 0;
    placeFood();
    el('ov').hidden = true;
    clearInterval(timer);
    timer = setInterval(step, 120);
  }

  function setDir(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hit = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some((s) => s.x === head.x && s.y === head.y);
    if (hit) return end();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      el('sc').textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function end() {
    clearInterval(timer);
    if (score > best) {
      best = score;
      try { localStorage.setItem('oa-snake-best', best); } catch (e) {}
      el('bs').textContent = best;
    }
    el('msg').textContent = `Game over · ${score}`;
    el('go').textContent = 'Play again';
    el('ov').hidden = false;
    roundOver();
  }

  function draw() {
    ctx.fillStyle = '#06070c';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 1; i < N; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ff6a2b';
    ctx.fillStyle = '#ff6a2b';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#38e08a';
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#7dffbb' : '#38e08a';
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, 5);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  const onKey = (e) => {
    const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
    if (m) { e.preventDefault(); setDir(...m); }
  };
  let touch = null;
  const onStart = (e) => { touch = e.touches[0]; };
  const onEnd = (e) => {
    if (!touch) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.clientX, dy = t.clientY - touch.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
      Math.abs(dx) > Math.abs(dy) ? setDir(Math.sign(dx), 0) : setDir(0, Math.sign(dy));
    }
    touch = null;
  };

  window.addEventListener('keydown', onKey);
  el('cv').addEventListener('touchstart', onStart, { passive: true });
  el('cv').addEventListener('touchend', onEnd);
  stage.querySelectorAll('[data-d]').forEach((b) =>
    b.addEventListener('click', () => setDir(...b.dataset.d.split(',').map(Number))));
  el('go').addEventListener('click', start);

  snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
  food = { x: 14, y: 10 };
  draw();

  return () => {
    clearInterval(timer);
    window.removeEventListener('keydown', onKey);
  };
}
