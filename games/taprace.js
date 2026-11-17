// Tap Race: smash your button as fast as you can. First runner to the finish line wins.
import { party } from './party.js';
import { sfx } from './fx.js';

const GOAL = 30;
export function mount(stage, { roundOver }) {
  let pos;
  return party(stage, roundOver, {
    name: 'Tap Race',
    how: 'Smash your button as fast as you can. First to the finish line gets a point.',
    round(ctx) {
      pos = ctx.players.map(() => 0);
      ctx.arena.innerHTML = `<div class="race">${ctx.players.map((p) => `<div class="lane"><span class="runner" style="--c:${ctx.color(p)}"></span></div>`).join('')}<span class="finish"></span></div>`;
      let n = 3;
      ctx.msg('3');
      const count = () => {
        n--;
        if (n > 0) { ctx.msg(String(n)); sfx.tap(); ctx.after(700, count); }
        else { ctx.msg('GO!'); sfx.power(); this.go = true; }
      };
      this.go = false;
      ctx.after(700, count);
    },
    press(i, ctx) {
      if (!this.go) return;
      pos[i]++; sfx.tap();
      const r = ctx.arena.querySelectorAll('.runner')[ctx.players.indexOf(i)];
      r.style.left = `calc(${(pos[i] / GOAL) * 100}% - ${(pos[i] / GOAL) * 28}px)`;
      if (pos[i] >= GOAL) ctx.win(i);
    },
  });
}
