// Color Match: colors flash in the middle. Tap only when it shows YOUR color.
// Tap on the wrong color and you're frozen for the round.
import { party } from './party.js';
import { sfx } from './fx.js';

export function mount(stage, { roundOver }) {
  let current;
  return party(stage, roundOver, {
    name: 'Color Match',
    how: 'Colors flash in the middle. Tap the moment it shows YOUR color. Wrong color and you\'re frozen for the round.',
    round(ctx) {
      current = -1;
      ctx.arena.innerHTML = '<div class="cm-orb"></div>';
      const orb = ctx.arena.firstChild;
      ctx.msg('Watch the colors…');
      const pool = ctx.players.concat([-2, -3]); // -2 / -3 are decoy colors nobody owns
      const decoy = { '-2': '#c26bff', '-3': '#f3f1ec' };
      let flips = 0;
      const flip = () => {
        flips++;
        let next;
        do { next = flips < 3 ? pool[pool.length - 1 - (flips % 2)] : pool[Math.floor(Math.random() * pool.length)]; } while (next === current);
        current = next;
        const col = current >= 0 ? ctx.color(current) : decoy[current];
        orb.style.setProperty('--c', col);
        orb.classList.remove('pulse'); void orb.offsetWidth; orb.classList.add('pulse');
        sfx.tap();
        ctx.after(Math.max(450, 1100 - flips * 25), flip);
      };
      ctx.after(900, flip);
    },
    press(i, ctx) {
      if (current === i) ctx.win(i);
      else { ctx.out(i); ctx.label(i, 'Frozen!'); sfx.bad(); if (ctx.players.every((p) => ctx.isOut(p))) ctx.draw(); }
    },
  });
}
