# Offline Arcade

Classic games that work with no internet. Play solo or pass the phone to friends.

It's a Progressive Web App (PWA): open it once while online, then it keeps working offline, and it can be added to the home screen.

## Games

| Game | Mode | Status |
|---|---|---|
| XO | 2 players / vs CPU | ✅ |
| Connect 4 | 2 players | ✅ |
| Snake | Solo, saves best score | ✅ |
| Chess | 2 players | Coming soon |
| Ludo | 2–4 players | Coming soon |
| Football | 2 players | Coming soon |

## Run it locally

```bash
git clone https://github.com/lilking-ai/offline-arcade
cd offline-arcade
npx serve .
```

Then open the address it prints. Service workers need `http://localhost` or HTTPS, so opening `index.html` straight from disk won't work.

## Ads

Ads only show while the device is online:

- **Banner** at the bottom of the game list (`.ad-slot[data-ad="banner"]`)
- **Full-screen ad** after every 3 finished rounds (`ONLINE_ADS_EVERY` in `app.js`)

Both are placeholders for now. To earn money, plug in AdSense (web) or wrap the app for Android and use AdMob.

## Add a game

1. Create `games/<id>.js` that exports `mount(stage, { roundOver })` and returns a cleanup function.
2. Add it to `GAMES` in `app.js`.
3. Add the file to `FILES` in `sw.js` and bump `CACHE` so it's available offline.

## Play it online for free

Turn on **GitHub Pages** (Settings → Pages → Branch: `main`, folder `/`). The app will be live at `https://lilking-ai.github.io/offline-arcade/`. Open it once, then it works offline.

---

*Looking for the SBK clan app? It now lives on the [`sbk` branch](../../tree/sbk).*
