// Stop the Bar: every player's bar fills up. Tap to stop yours as close to the line as you can.
// Go past the top and you're out. Closest to the line wins.
import { party } from './party.js';
import { sfx } from './fx.js';

export function mount(stage, { roundOver }) {
  let fill, stopped, target, speed, bars;
  return party(stage, roundOver, {
    name: 'Stop the Bar',
    how: 'Your bar fills up. Tap to stop it as close to the white line as you can. Closest wins the point.',
    round(ctx) {
      target = 0.55 + Math.random() * 0.35;
      speed = 0.32 + Math.random() * 0.2;
      fill = ctx.players.map(() => 0);
      stopped = ctx.players.map(() => false);
      ctx.arena.innerHTML = `<div class="bars">${ctx.players.map((p) => `<div class="bar" style="--c:${ctx.color(p)}"><i></i><span class="line" style="bottom:${target * 100}%"></span></div>`).join('')}</div>`;
      bars = [...ctx.arena.querySelectorAll('.bar i')];
      ctx.msg('Get ready…');
      ctx.after(1100, () => {
        ctx.msg('Stop on the line!');
        ctx.frame((dt) => {
          let running = false;
          ctx.players.forEach((p, k) => {
            if (stopped[k]) return;
            fill[k] = Math.min(1, fill[k] + speed * dt);
            bars[k].style.height = `${fill[k] * 100}%`;
            if (fill[k] >= 1) { stopped[k] = 'bust'; ctx.label(p, 'Too far!'); ctx.out(p); }
            else running = true;
          });
          if (!running) { finish(ctx); return false; }
        });
      });
    },
    press(i, ctx) {
      const k = ctx.players.indexOf(i);
      if (stopped[k] || !bars[k] || fill[k] === 0) return;
      stopped[k] = true; sfx.drop();
      ctx.label(i, `${Math.round(Math.abs(fill[k] - target) * 100)} off`);
      if (stopped.every(Boolean)) finish(ctx);
    },
  });
  function finish(ctx) {
    let best = -1, bestD = Infinity;
    ctx.players.forEach((p, k) => {
      if (stopped[k] === 'bust') return;
      const d = Math.abs(fill[k] - target);
      if (d < bestD) { bestD = d; best = p; }
    });
    best >= 0 ? ctx.win(best) : ctx.draw();
  }
}
