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
// Full-screen 30-second ads are OFF. Set ADS_ENABLED = true to turn them back on.
export const ADS_ENABLED = false;

// Small banner ad fixed to the bottom of the screen.
export const BANNER_ENABLED = true;
export const BANNER_SECONDS = 30; // switch to the next ad after this long

// Password that turns ads off on a device. Only a scrambled (SHA-256) copy is
// stored here, so the password itself isn't readable in the code.
// To change it, put the SHA-256 of your new password here.
export const SKIP_CODE_SHA256 = 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f';

export const ROUNDS_BETWEEN_ADS = 3;

export const ADS = [
  { type: 'video', src: 'volt-1.mp4', name: 'VOLT' },
  { type: 'video', src: 'kettlecrow-coffee.mp4', name: 'KettleCrow Coffee' },
  { type: 'video', src: 'volt-2.mp4', name: 'VOLT' },
  { type: 'video', src: 'fizzr-energy.mp4', name: 'FIZZR Energy' },
  { type: 'video', src: 'volt-3.mp4', name: 'VOLT' },
  { type: 'video', src: 'loopa-app.mp4', name: 'Loopa' },
  // Add a link so tapping the ad opens a website, e.g.
  // { type: 'video', src: 'volt-1.mp4', link: 'https://volt.example.com' },
];
