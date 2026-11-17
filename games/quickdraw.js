// Quick Draw: wait for GO, then be the first to tap. Tap early and you're out this round.
import { party } from './party.js';
import { sfx } from './fx.js';

export function mount(stage, { roundOver }) {
  let state;
  return party(stage, roundOver, {
    name: 'Quick Draw',
    how: 'Wait for the screen to turn green, then tap first. Tap too early and you sit out the round.',
    round(ctx) {
      state = 'wait';
      ctx.arena.innerHTML = '<div class="draw-light wait"></div>';
      ctx.msg('Wait for it…');
      // fake-outs: sometimes the light flashes orange first
      const fake = Math.random() < 0.4;
      if (fake) ctx.after(900 + Math.random() * 1200, () => { ctx.arena.firstChild.className = 'draw-light fake'; ctx.after(350, () => { ctx.arena.firstChild.className = 'draw-light wait'; }); });
      ctx.after(2200 + Math.random() * 3000, () => {
        state = 'go';
        ctx.arena.firstChild.className = 'draw-light go';
        ctx.msg('TAP!'); sfx.power();
      });
    },
    press(i, ctx) {
      if (state === 'wait') {
        ctx.out(i); ctx.label(i, 'Too early!'); sfx.bad();
        if (ctx.players.every((p) => ctx.isOut(p))) ctx.draw();
      } else if (state === 'go') {
        state = 'done'; ctx.win(i);
      }
    },
  });
}
