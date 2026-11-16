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

Full-screen ads show after every 3 finished rounds and **run for 30 seconds. Players can't skip them.**

To add your own ads:
1. Put your ad files (`.mp4`, `.jpg`, `.png`) in the `ads/` folder.
2. List them in `ads/ads.js`, for example `{ type: 'video', src: 'ad1.mp4', link: 'https://your-site.com' }`.

Change `AD_SECONDS` or `ROUNDS_BETWEEN_ADS` in `ads/ads.js` to adjust. Ads are stored inside the app, so they play offline too.

## Add a game

1. Create `games/<id>.js` that exports `mount(stage, { roundOver })` and returns a cleanup function.
2. Add it to `GAMES` in `app.js`.
3. Add the file to `FILES` in `sw.js` and bump `CACHE` so it's available offline.

## Play it online for free

Turn on **GitHub Pages** (Settings → Pages → Branch: `main`, folder `/`). The app will be live at `https://lilking-ai.github.io/offline-arcade/`. Open it once, then it works offline.

---

*Looking for the SBK clan app? It now lives on the [`sbk` branch](../../tree/sbk).*
