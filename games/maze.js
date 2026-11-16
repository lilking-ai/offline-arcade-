// Maze: 500 generated levels. The mazes grow as you go.
import { rng, onSwipe, levelBar } from './util.js';

const MAX = 500, PX = 360;

function build(level) {
  const n = Math.min(25, 7 + Math.floor(level / 20));
  const rand = rng(level * 104729 + 7);
  // walls[i] = [top, right, bottom, left]
  const walls = Array.from({ length: n * n }, () => [1, 1, 1, 1]);
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const i = stack[stack.length - 1], r = Math.floor(i / n), c = i % n;
    const opts = [[-1, 0, 0, 2], [0, 1, 1, 3], [1, 0, 2, 0], [0, -1, 3, 1]]
      .filter(([dr, dc]) => r + dr >= 0 && r + dr < n && c + dc >= 0 && c + dc < n && !seen.has((r + dr) * n + c + dc));
    if (!opts.length) { stack.pop(); continue; }
    const [dr, dc, w, ow] = opts[Math.floor(rand() * opts.length)];
    const j = (r + dr) * n + c + dc;
    walls[i][w] = 0; walls[j][ow] = 0;
    seen.add(j); stack.push(j);
  }
  return { n, walls };
}

export function mount(stage, { roundOver }) {
  let maze, pos, done, steps;
  stage.innerHTML = '';
  const lv = levelBar(stage, { key: 'maze', max: MAX, onChange: load });
  const wrap = document.createElement('div');
  wrap.className = 'stage';
  wrap.innerHTML = `
    <div class="status" id="status" role="status"></div>
    <div class="snake-wrap"><canvas id="cv" width="${PX}" height="${PX}" aria-label="Maze"></canvas></div>
    <div class="pad">
      <button class="up" data-d="0,-1" aria-label="Up">▲</button>
      <button class="left" data-d="-1,0" aria-label="Left">◀</button>
      <button class="down" data-d="0,1" aria-label="Down">▼</button>
      <button class="right" data-d="1,0" aria-label="Right">▶</button>
    </div>
    <button class="btn primary" id="next" hidden>Next level</button>`;
  stage.appendChild(wrap);
  const el = (id) => wrap.querySelector('#' + id);
  const ctx = el('cv').getContext('2d');

  function load(level) {
    maze = build(level);
    pos = 0; done = false; steps = 0;
    draw();
  }

  function move(dx, dy) {
    if (done) return;
    const { n, walls } = maze;
    // slide until a junction, so swipes feel fast on big mazes
    const w = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
    let moved = false;
    while (!walls[pos][w]) {
      pos += dy * n + dx; steps++; moved = true;
      const open = walls[pos].filter((x) => !x).length;
      if (pos === n * n - 1 || open !== 2 || walls[pos][w]) break;
    }
    if (moved && pos === n * n - 1) { done = true; lv.complete(); roundOver(); }
    draw();
  }

  function draw() {
    const { n, walls } = maze, s = PX / n;
    ctx.fillStyle = '#06070c'; ctx.fillRect(0, 0, PX, PX);
    ctx.fillStyle = 'rgba(56,224,138,0.18)';
    ctx.fillRect((n - 1) * s, (n - 1) * s, s, s);
    ctx.strokeStyle = '#3b7bff'; ctx.lineWidth = Math.max(2, s / 7); ctx.lineCap = 'round';
    ctx.shadowBlur = 8; ctx.shadowColor = '#3b7bff';
    ctx.beginPath();
    walls.forEach((w, i) => {
      const x = (i % n) * s, y = Math.floor(i / n) * s;
      if (w[0]) { ctx.moveTo(x, y); ctx.lineTo(x + s, y); }
      if (w[1]) { ctx.moveTo(x + s, y); ctx.lineTo(x + s, y + s); }
      if (w[2]) { ctx.moveTo(x, y + s); ctx.lineTo(x + s, y + s); }
      if (w[3]) { ctx.moveTo(x, y); ctx.lineTo(x, y + s); }
    });
    ctx.stroke();
    ctx.shadowColor = '#ff6a2b'; ctx.shadowBlur = 14; ctx.fillStyle = '#ff6a2b';
    ctx.beginPath(); ctx.arc((pos % n) * s + s / 2, Math.floor(pos / n) * s + s / 2, s / 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    el('status').textContent = done ? `Escaped in ${steps} steps!` : 'Get the orange dot to the green corner';
    el('next').hidden = !done || lv.level >= MAX;
  }

  wrap.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => move(...b.dataset.d.split(',').map(Number))));
  el('next').addEventListener('click', () => lv.next());
  const stop = onSwipe(el('cv'), move);
  load(lv.level);
  return stop;
}
