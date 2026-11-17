# Offline Arcade

Classic games that work with no internet. Play solo or pass the phone to friends.

It's a Progressive Web App (PWA): open it once while online, then it keeps working offline, and it can be added to the home screen.

## Games

| Game | Mode | Status |
|---|---|---|
| XO | 2 players / vs CPU | ✅ |
| Connect 4 | 2 players | ✅ |
| Snake | Solo, saves best score | ✅ |
| Chess | 2 players / vs CPU | ✅ |
| Ludo | 2–4 players | ✅ |
| Football | 2 players / vs CPU | ✅ |

## Run it locally

```bash
git clone https://github.com/lilking-ai/offline-arcade
cd offline-arcade
npx serve .
```

Then open the address it prints. Service workers need `http://localhost` or HTTPS, so opening `index.html` straight from disk won't work.

## Ads

- A **small banner ad** sits at the bottom of the screen and plays your ad videos (muted), switching every 30 seconds.
- Tap the **✕** on the banner and enter the code to turn ads off on that device.
- Full-screen 30-second ads are turned **off** (`ADS_ENABLED` in `ads/ads.js`).

## Visitor stats

The app uses [GoatCounter](https://www.goatcounter.com) (free, no cookies). Put your GoatCounter code in `stats.js`, and your dashboard shows visitors, countries, devices and the most-played games.

## Profile

Players pick a nickname and avatar the first time ("Continue as …"), and get a "Welcome back" banner after that. It's saved on the device.

## Add a game

1. Create `games/<id>.js` that exports `mount(stage, { roundOver })` and returns a cleanup function.
2. Add it to `GAMES` in `app.js`.
3. Add the file to `FILES` in `sw.js` and bump `CACHE` so it's available offline.

## Play it online for free

Turn on **GitHub Pages** (Settings → Pages → Branch: `main`, folder `/`). The app will be live at `https://lilking-ai.github.io/offline-arcade/`. Open it once, then it works offline.

---

*Looking for the SBK clan app? It now lives on the [`sbk` branch](../../tree/sbk).*
