// Visitor stats with GoatCounter (free, no cookies).
// Your dashboard shows visitors, countries, devices and which games get played.
//
// 1. Sign up free at https://www.goatcounter.com/signup
// 2. Pick a "code", e.g. offlinearcade -> your dashboard is https://offlinearcade.goatcounter.com
// 3. Put that code below and push. That's it.
export const GOATCOUNTER_CODE = '';

export function initStats() {
  if (!GOATCOUNTER_CODE || !navigator.onLine) return;
  window.goatcounter = { no_onload: false };
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  document.head.appendChild(s);
}

// Count each game that gets opened, so the dashboard shows the most-played games.
export function countGame(id, name) {
  try {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: `/game/${id}`, title: name, event: false });
    }
  } catch (e) {}
}
