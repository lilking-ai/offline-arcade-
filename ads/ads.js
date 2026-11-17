// ─────────────────────────────────────────────────────────────
//  YOUR ADS
//  Put your ad files in this /ads folder, then list them below.
//  Every ad shows for AD_SECONDS and can't be skipped before that.
//
//  type: 'image' or 'video'
//  src:  file name inside /ads (e.g. 'my-ad.mp4')
//  link: optional, opens when the player taps the ad
// ─────────────────────────────────────────────────────────────

export const AD_SECONDS = 30;

// Show a full-screen ad after this many finished rounds.
// Ads are switched OFF for now. Set ADS_ENABLED = true to turn them back on.
export const ADS_ENABLED = false;

export const ROUNDS_BETWEEN_ADS = 3;

export const ADS = [
  { type: 'video', src: 'volt-1.mp4' },
  { type: 'video', src: 'kettlecrow-coffee.mp4' },
  { type: 'video', src: 'volt-2.mp4' },
  { type: 'video', src: 'fizzr-energy.mp4' },
  { type: 'video', src: 'volt-3.mp4' },
  { type: 'video', src: 'loopa-app.mp4' },
  // Add a link so tapping the ad opens a website, e.g.
  // { type: 'video', src: 'volt-1.mp4', link: 'https://volt.example.com' },
];
