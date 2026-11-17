// Offline Arcade — hub, routing, ads and offline support.
import { ADS, AD_SECONDS, ROUNDS_BETWEEN_ADS, ADS_ENABLED } from './ads/ads.js';

const art = (bg, svg) =>
  `background:${bg};` +
  `background-image:url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}"),${bg};` +
  `background-size:cover;background-position:center;`;

const GAMES = [
  {
    id: 'xo', name: 'XO', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 70% 30%, #5a1d08, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><g fill='none' stroke-linecap='round'><path d='M40 50 L110 120 M110 50 L40 120' stroke='#ff6a2b' stroke-width='20'/><circle cx='140' cy='150' r='34' stroke='#3b7bff' stroke-width='18'/></g></svg>`),
  },
  {
    id: 'connect4', name: 'Connect 4', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 30% 30%, #1a2d6b, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><g>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx='${40 + c * 40}' cy='${50 + r * 40}' r='15' fill='${(r + c) % 3 === 0 ? '#ff6a2b' : (r + c) % 3 === 1 ? '#ffc34d' : '#070a18'}'/>`).join('')).join('')}</g></svg>`),
  },
  {
    id: 'snake', name: 'Snake', tag: 'Solo · high score', filters: ['solo'],
    style: art('radial-gradient(circle at 60% 40%, #0f3d2a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M30 160 H90 V90 H150 V50' fill='none' stroke='#38e08a' stroke-width='18' stroke-linejoin='round' stroke-linecap='round'/><circle cx='150' cy='130' r='9' fill='#ff6a2b'/></svg>`),
  },
  { id: 'chess', name: 'Chess', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #2b2b36, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M70 170 h70 l-6 -22 q16 -12 12 -34 l-12 -12 q8 -12 -4 -20 l-16 4 -24 24 q-8 12 4 20 l16 -8 q-12 16 -10 26 z' fill='#e8e6e1'/></svg>`) },
  { id: 'ludo', name: 'Ludo', tag: '2–4 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #3a2a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='55' y='55' width='90' height='90' rx='18' fill='#f3f1ec'/><circle cx='78' cy='78' r='9' fill='#111'/><circle cx='122' cy='78' r='9' fill='#111'/><circle cx='100' cy='100' r='9' fill='#111'/><circle cx='78' cy='122' r='9' fill='#111'/><circle cx='122' cy='122' r='9' fill='#111'/></svg>`) },
  { id: 'football', name: 'Football', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 30%, #0e3a1a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='30' width='120' height='170' rx='6' fill='none' stroke='rgba(255,255,255,.35)' stroke-width='4'/><line x1='40' y1='115' x2='160' y2='115' stroke='rgba(255,255,255,.35)' stroke-width='4'/><circle cx='100' cy='100' r='26' fill='#f3f1ec'/><path d='M100 88 l11 8 -4 13 h-14 l-4 -13 z' fill='#111'/><circle cx='70' cy='160' r='16' fill='#ff6a2b'/></svg>`) },
  { id: 'checkers', name: 'Checkers', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #3a1a0a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='80' cy='95' r='30' fill='#ff6a2b'/><circle cx='80' cy='88' r='30' fill='#ff8a4f'/><circle cx='125' cy='140' r='30' fill='#1a3ea8'/><circle cx='125' cy='133' r='30' fill='#3b7bff'/><circle cx='125' cy='133' r='18' fill='none' stroke='#ffc34d' stroke-width='5'/></svg>`) },
  { id: 'pong', name: 'Pong', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 50%, #1b1b30, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='60' y='40' width='80' height='12' rx='6' fill='#3b7bff'/><rect x='60' y='170' width='80' height='12' rx='6' fill='#ff6a2b'/><circle cx='118' cy='105' r='10' fill='#fff'/><line x1='30' y1='112' x2='170' y2='112' stroke='rgba(255,255,255,.2)' stroke-width='3' stroke-dasharray='8 8'/></svg>`) },
  { id: 'dots', name: 'Dots & Boxes', tag: '2 players', filters: ['2p', 'board'],
    style: art('radial-gradient(circle at 40% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='55' y='55' width='45' height='45' fill='rgba(255,106,43,.35)'/><rect x='100' y='100' width='45' height='45' fill='rgba(59,123,255,.35)'/><path d='M55 55 h45 v45 h-45 z' fill='none' stroke='#ff6a2b' stroke-width='6'/><path d='M100 100 h45 v45 h-45 z' fill='none' stroke='#3b7bff' stroke-width='6'/>${[55, 100, 145].map(x => [55, 100, 145].map(y => `<circle cx='${x}' cy='${y}' r='7' fill='#f3f1ec'/>`).join('')).join('')}</svg>`) },
  { id: 'memory', name: 'Memory', tag: 'Solo · 2 players', filters: ['2p', 'solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2a0f2e, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='50' width='55' height='75' rx='10' fill='#1b1c28' stroke='#ff6a2b' stroke-width='3'/><rect x='105' y='50' width='55' height='75' rx='10' fill='#171824'/><circle cx='132' cy='87' r='16' fill='#c26bff'/><rect x='40' y='135' width='55' height='75' rx='10' fill='#171824'/><circle cx='67' cy='172' r='16' fill='#c26bff'/><rect x='105' y='135' width='55' height='75' rx='10' fill='#1b1c28' stroke='#ff6a2b' stroke-width='3'/></svg>`) },
  { id: 'reaction', name: 'Reaction Duel', tag: '2 players · fastest finger', filters: ['2p'],
    style: art('radial-gradient(circle at 50% 50%, #0f3d2a, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M110 30 L60 130 H100 L85 210 L145 100 H105 Z' fill='#38e08a'/></svg>`) },
  { id: 'g2048', name: '2048', tag: 'Solo · high score', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #3a1a05, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='45' y='50' width='50' height='50' rx='10' fill='#ff6a2b'/><rect x='105' y='50' width='50' height='50' rx='10' fill='#ffc34d'/><rect x='45' y='110' width='50' height='50' rx='10' fill='#383848'/><rect x='105' y='110' width='50' height='50' rx='10' fill='#6b4dff'/><text x='130' y='143' font-family='sans-serif' font-weight='900' font-size='20' fill='#fff' text-anchor='middle'>2048</text></svg>`) },
  { id: 'minesweeper', name: 'Minesweeper', tag: 'Solo · 3 sizes', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2e0a12, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='100' cy='110' r='34' fill='#f3f1ec'/><g stroke='#f3f1ec' stroke-width='8' stroke-linecap='round'><path d='M100 60 v-12 M100 160 v12 M50 110 h-12 M150 110 h12 M66 76 l-9 -9 M134 144 l9 9 M134 76 l9 -9 M66 144 l-9 9'/></g><circle cx='90' cy='100' r='8' fill='#ff4d5e'/></svg>`) },
  { id: 'sudoku', name: 'Sudoku', tag: '500 levels', filters: ['solo', 'puzzle'], levels: 500,
    style: art('radial-gradient(circle at 50% 30%, #121f44, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='40' y='45' width='120' height='120' rx='8' fill='none' stroke='#5a5a6e' stroke-width='4'/><path d='M80 45 v120 M120 45 v120 M40 85 h120 M40 125 h120' stroke='#5a5a6e' stroke-width='3'/><g font-family='sans-serif' font-weight='900' font-size='26' text-anchor='middle'><text x='60' y='75' fill='#f3f1ec'>5</text><text x='100' y='115' fill='#6197ff'>3</text><text x='140' y='155' fill='#ff6a2b'>9</text></g></svg>`) },
  { id: 'maze', name: 'Maze', tag: '500 levels', filters: ['solo', 'puzzle'], levels: 500,
    style: art('radial-gradient(circle at 50% 30%, #0f1e48, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><path d='M40 40 H160 V170 H40 Z M70 40 V100 H110 M130 70 V140 H70 M40 130 H100' fill='none' stroke='#3b7bff' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/><circle cx='55' cy='155' r='9' fill='#ff6a2b'/></svg>`) },
  { id: 'words', name: 'Word Guess', tag: '150+ words', filters: ['solo', 'puzzle'], levels: 150,
    style: art('radial-gradient(circle at 50% 30%, #1d2a12, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${'GAMES'.split('').map((ch, i) => `<rect x='${22 + i * 32}' y='90' width='28' height='28' rx='5' fill='${['#2e9e5b', '#c99a1a', '#2a2a36', '#2e9e5b', '#2e9e5b'][i]}'/><text x='${36 + i * 32}' y='111' font-family='sans-serif' font-weight='900' font-size='18' fill='#fff' text-anchor='middle'>${ch}</text>`).join('')}</svg>`) },
  { id: 'simon', name: 'Simon', tag: 'Solo · memory', filters: ['solo', 'puzzle'],
    style: art('radial-gradient(circle at 50% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='45' y='45' width='52' height='52' rx='14' fill='#ff6a2b'/><rect x='103' y='45' width='52' height='52' rx='14' fill='#3b7bff' opacity='.4'/><rect x='45' y='103' width='52' height='52' rx='14' fill='#ffc34d' opacity='.4'/><rect x='103' y='103' width='52' height='52' rx='14' fill='#38e08a' opacity='.4'/></svg>`) },
  { id: 'gomoku', name: 'Five in a Row', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #4a3416, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>${[0, 1, 2, 3, 4].map(i => `<circle cx='${50 + i * 25}' cy='${50 + i * 25}' r='11' fill='#ff6a2b'/>`).join('')}<circle cx='150' cy='60' r='11' fill='#3b7bff'/><circle cx='60' cy='150' r='11' fill='#3b7bff'/></svg>`) },
  { id: 'mancala', name: 'Mancala', tag: '2 players · vs CPU', filters: ['2p', 'solo', 'board'],
    style: art('radial-gradient(circle at 50% 30%, #4a2a10, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='25' y='70' width='150' height='90' rx='40' fill='#5a3a1c'/>${[0, 1, 2].map(i => `<circle cx='${70 + i * 30}' cy='97' r='11' fill='#1e1208'/><circle cx='${70 + i * 30}' cy='133' r='11' fill='#1e1208'/>`).join('')}<circle cx='70' cy='97' r='4' fill='#ffc34d'/><circle cx='100' cy='133' r='4' fill='#ff6a2b'/></svg>`) },
  { id: 'rps', name: 'Rock Paper Scissors', tag: '2 players · vs CPU', filters: ['2p', 'solo'],
    style: art('radial-gradient(circle at 50% 30%, #2a1408, #0d0e16 70%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><circle cx='70' cy='90' r='30' fill='#ff6a2b'/><rect x='110' y='60' width='50' height='64' rx='6' fill='#f3f1ec'/><path d='M80 180 L130 130 M120 180 L70 130' stroke='#3b7bff' stroke-width='12' stroke-linecap='round'/></svg>`) },
  { id: 'flappy', name: 'Flappy', tag: 'Solo · high score', filters: ['solo'],
    style: art('radial-gradient(circle at 70% 20%, #3a1650, #0d0e16 75%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><linearGradient id='sk' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#0b0820'/><stop offset='.6' stop-color='#3a1650'/><stop offset='1' stop-color='#ff7a3d'/></linearGradient><linearGradient id='pp' x1='0' x2='1'><stop offset='0' stop-color='#1b8a4c'/><stop offset='.4' stop-color='#5ef29a'/><stop offset='1' stop-color='#0f5a31'/></linearGradient><radialGradient id='bd' cx='.4' cy='.35'><stop offset='0' stop-color='#fff2b0'/><stop offset='1' stop-color='#ffb020'/></radialGradient></defs><rect width='200' height='250' fill='url(#sk)'/><circle cx='150' cy='45' r='16' fill='#fff3d6'/><path d='M0 200 h30 v-40 h20 v40 h25 v-60 h18 v60 h30 v-30 h22 v30 h55 v50 H0z' fill='#120b22'/><rect x='130' y='0' width='40' height='70' fill='url(#pp)'/><rect x='124' y='62' width='52' height='16' rx='3' fill='url(#pp)'/><rect x='130' y='150' width='40' height='60' fill='url(#pp)'/><rect x='124' y='142' width='52' height='16' rx='3' fill='url(#pp)'/><circle cx='100' cy='105' r='9' fill='#ffc34d'/><g transform='translate(62 112) rotate(-12)'><ellipse rx='20' ry='16' fill='url(#bd)'/><ellipse cx='-5' cy='-2' rx='11' ry='6' fill='#ff8a2b' transform='rotate(-30)'/><circle cx='9' cy='-6' r='6' fill='#fff'/><circle cx='11' cy='-6' r='3' fill='#111'/><path d='M16 0 l11 4 l-11 5z' fill='#ff5a1f'/></g></svg>`) },
  { id: 'breakout', name: 'Breakout', tag: '100 levels', filters: ['solo'], levels: 100,
    style: art('radial-gradient(circle at 50% 20%, #2a0f30, #0d0e16 75%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><filter id='g'><feGaussianBlur stdDeviation='3'/></filter></defs><rect x='18' y='38' width='38' height='15' rx='4' fill='#ff4d5e'/><rect x='18' y='38' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='60' y='38' width='38' height='15' rx='4' fill='#ff4d5e'/><rect x='60' y='38' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='102' y='38' width='38' height='15' rx='4' fill='#ff4d5e'/><rect x='102' y='38' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='144' y='38' width='38' height='15' rx='4' fill='#ff4d5e'/><rect x='144' y='38' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='18' y='58' width='38' height='15' rx='4' fill='#ff6a2b'/><rect x='18' y='58' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='60' y='58' width='38' height='15' rx='4' fill='#ff6a2b'/><rect x='60' y='58' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='102' y='58' width='38' height='15' rx='4' fill='#ff6a2b'/><rect x='102' y='58' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='144' y='58' width='38' height='15' rx='4' fill='#ff6a2b'/><rect x='144' y='58' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='18' y='78' width='38' height='15' rx='4' fill='#ffc34d'/><rect x='18' y='78' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='60' y='78' width='38' height='15' rx='4' fill='#ffc34d'/><rect x='60' y='78' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='102' y='78' width='38' height='15' rx='4' fill='#ffc34d'/><rect x='102' y='78' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='144' y='78' width='38' height='15' rx='4' fill='#ffc34d'/><rect x='144' y='78' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='18' y='98' width='38' height='15' rx='4' fill='#38e08a'/><rect x='18' y='98' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='60' y='98' width='38' height='15' rx='4' fill='#38e08a'/><rect x='60' y='98' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><rect x='144' y='98' width='38' height='15' rx='4' fill='#38e08a'/><rect x='144' y='98' width='38' height='4' rx='2' fill='#fff' opacity='.5'/><circle cx='120' cy='150' r='14' fill='#fff' filter='url(#g)' opacity='.6'/><circle cx='120' cy='150' r='8' fill='#fff'/><path d='M120 150 L90 200' stroke='#fff' stroke-width='2' opacity='.3' stroke-dasharray='4 4'/><rect x='55' y='200' width='80' height='12' rx='6' fill='#ff8a4f'/><rect x='55' y='200' width='80' height='4' rx='2' fill='#ffd2b8'/><rect x='150' y='120' width='26' height='16' rx='8' fill='#c26bff'/><text x='163' y='132' font-family='sans-serif' font-weight='900' font-size='11' fill='#fff' text-anchor='middle'>M</text></svg>`) },
  { id: 'whack', name: 'Whack-a-Mole', tag: 'Solo · 30 seconds', filters: ['solo'],
    style: art('radial-gradient(circle at 50% 40%, #2b6e22, #0d0e16 80%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><radialGradient id='f' cx='.45' cy='.35' r='.7'><stop offset='0' stop-color='#a87452'/><stop offset='1' stop-color='#5c3820'/></radialGradient><radialGradient id='gr' cx='.5' cy='0' r='1'><stop offset='0' stop-color='#4fa83c'/><stop offset='1' stop-color='#1d4d17'/></radialGradient></defs><rect width='200' height='250' fill='url(#gr)'/><ellipse cx='100' cy='165' rx='62' ry='20' fill='#050302'/><path d='M52 168 C52 100 70 75 100 75 C130 75 148 100 148 168 Z' fill='url(#f)'/><ellipse cx='100' cy='138' rx='24' ry='26' fill='#f0c9a0' opacity='.5'/><circle cx='86' cy='108' r='8' fill='#fff'/><circle cx='114' cy='108' r='8' fill='#fff'/><circle cx='87' cy='109' r='4.5' fill='#111'/><circle cx='115' cy='109' r='4.5' fill='#111'/><ellipse cx='100' cy='124' rx='9' ry='7' fill='#ff7ab6'/><path d='M93 134 q7 6 14 0' stroke='#3a2010' stroke-width='2.5' fill='none'/><path d='M40 175 q60 -14 120 0 v20 q-60 14 -120 0z' fill='#7a4c26'/><g transform='translate(150 60) rotate(30)'><rect x='-5' y='0' width='10' height='60' rx='4' fill='#c28a4f'/><rect x='-22' y='-16' width='44' height='22' rx='6' fill='#ff4d5e'/><rect x='-22' y='-16' width='44' height='6' rx='3' fill='#fff' opacity='.35'/></g></svg>`) },
  { id: 'hangman', name: 'Hangman', tag: '120 words', filters: ['solo', 'puzzle'], levels: 120,
    style: art('radial-gradient(circle at 50% 30%, #2f4a3a, #0d0e16 80%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><rect x='14' y='22' width='172' height='196' rx='12' fill='#6b4423'/><rect x='24' y='32' width='152' height='176' rx='6' fill='#24392d'/><g stroke='#e9e6dc' stroke-width='5' fill='none' stroke-linecap='round' opacity='.9'><path d='M40 180 H120 M64 180 V50 H130 V64 M64 76 L88 50'/></g><g stroke='#ffb59a' stroke-width='5' fill='none' stroke-linecap='round'><circle cx='130' cy='80' r='14'/><path d='M130 94 V128 M130 104 L114 118 M130 104 L146 118'/></g></svg>`) },
  { id: 'puzzle15', name: 'Sliding Puzzle', tag: '300 levels', filters: ['solo', 'puzzle'], levels: 300,
    style: art('radial-gradient(circle at 50% 30%, #3a1c5a, #0d0e16 80%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ff9a5a'/><stop offset='1' stop-color='#ff5e7e'/></linearGradient><clipPath id='c'><rect x='34' y='44' width='132' height='132' rx='10'/></clipPath></defs><rect x='26' y='36' width='148' height='148' rx='16' fill='#0d0e16'/><g clip-path='url(#c)'><rect x='34' y='44' width='132' height='132' fill='url(#s)'/><circle cx='86' cy='92' r='20' fill='#ffd28a'/><path d='M34 130 L64 100 L88 122 L118 86 L150 118 L166 104 V176 H34Z' fill='#3a1c5a'/><path d='M34 156 L70 132 L104 152 L140 134 L166 150 V176 H34Z' fill='#1a0f30'/></g><g fill='none' stroke='#0d0e16' stroke-width='4'><path d='M78 44 V176 M122 44 V176 M34 88 H166 M34 132 H166'/></g><rect x='124' y='134' width='42' height='42' fill='#0d0e16'/><rect x='80' y='134' width='40' height='40' rx='6' fill='none' stroke='#fff' stroke-width='2' opacity='.6'/><path d='M128 155 h22 m-8 -7 l8 7 l-8 7' stroke='#ffc34d' stroke-width='3' fill='none' stroke-linecap='round'/></svg>`) },
  { id: 'lightsout', name: 'Lights Out', tag: '300 levels', filters: ['solo', 'puzzle'], levels: 300,
    style: art('radial-gradient(circle at 50% 35%, #3a2a05, #0d0e16 75%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><radialGradient id='on' cx='.4' cy='.35'><stop offset='0' stop-color='#fffbe6'/><stop offset='.45' stop-color='#ffd36a'/><stop offset='1' stop-color='#f0a020'/></radialGradient><radialGradient id='off' cx='.4' cy='.35'><stop offset='0' stop-color='#3a3a4a'/><stop offset='1' stop-color='#15151e'/></radialGradient><filter id='gl'><feGaussianBlur stdDeviation='6'/></filter></defs><circle cx='50' cy='58' r='11' fill='url(#off)'/><circle cx='83' cy='58' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='83' cy='58' r='11' fill='url(#on)'/><circle cx='116' cy='58' r='11' fill='url(#off)'/><circle cx='149' cy='58' r='11' fill='url(#off)'/><circle cx='50' cy='91' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='50' cy='91' r='11' fill='url(#on)'/><circle cx='83' cy='91' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='83' cy='91' r='11' fill='url(#on)'/><circle cx='116' cy='91' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='116' cy='91' r='11' fill='url(#on)'/><circle cx='149' cy='91' r='11' fill='url(#off)'/><circle cx='50' cy='124' r='11' fill='url(#off)'/><circle cx='83' cy='124' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='83' cy='124' r='11' fill='url(#on)'/><circle cx='116' cy='124' r='11' fill='url(#off)'/><circle cx='149' cy='124' r='11' fill='url(#off)'/><circle cx='50' cy='157' r='11' fill='url(#off)'/><circle cx='83' cy='157' r='11' fill='url(#off)'/><circle cx='116' cy='157' r='16' fill='#ffc34d' opacity='.55' filter='url(#gl)'/><circle cx='116' cy='157' r='11' fill='url(#on)'/><circle cx='149' cy='157' r='11' fill='url(#off)'/></svg>`) },
  { id: 'hanoi', name: 'Tower of Hanoi', tag: '8 levels · 3–10 discs', filters: ['solo', 'puzzle'], levels: 8,
    style: art('radial-gradient(circle at 50% 30%, #22243a, #0d0e16 80%)',
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'><defs><linearGradient id='w' x1='0' x2='1'><stop offset='0' stop-color='#6b4423'/><stop offset='.45' stop-color='#c28a4f'/><stop offset='1' stop-color='#6b4423'/></linearGradient></defs><rect x='20' y='182' width='160' height='14' rx='5' fill='url(#w)'/><rect x='47' y='70' width='6' height='112' rx='3' fill='url(#w)'/><rect x='97' y='70' width='6' height='112' rx='3' fill='url(#w)'/><rect x='147' y='70' width='6' height='112' rx='3' fill='url(#w)'/><rect x='15.0' y='164' width='70' height='15' rx='7.5' fill='#3b7bff'/><rect x='19.0' y='165' width='62' height='4' rx='2' fill='#fff' opacity='.45'/><rect x='22.0' y='147' width='56' height='15' rx='7.5' fill='#38e08a'/><rect x='26.0' y='148' width='48' height='4' rx='2' fill='#fff' opacity='.45'/><rect x='29.0' y='130' width='42' height='15' rx='7.5' fill='#ffc34d'/><rect x='33.0' y='131' width='34' height='4' rx='2' fill='#fff' opacity='.45'/><rect x='128' y='164' width='44' height='15' rx='7.5' fill='#ff4d5e'/><rect x='132' y='165' width='36' height='4' rx='2' fill='#fff' opacity='.45'/><rect x='82' y='46' width='36' height='15' rx='7.5' fill='#ff6a2b'/><path d='M100 66 v14' stroke='#ff6a2b' stroke-width='2' stroke-dasharray='3 3'/></svg>`) },
];

const $ = (s) => document.querySelector(s);
const hub = $('#hub');
const gameScreen = $('#game');
const stage = $('#stage');
let cleanup = null;
let roundsSinceAd = 0;

// ---------- hub ----------
function renderGrid(filter = 'all') {
  const grid = $('#grid');
  grid.innerHTML = '';
  GAMES.filter((g) => filter === 'all' || g.filters.includes(filter)).sort((a, b) => !!a.soon - !!b.soon).forEach((g) => {
    const b = document.createElement('button');
    b.className = 'card' + (g.soon ? ' soon' : '');
    b.setAttribute('aria-label', g.soon ? `${g.name}, coming soon` : `Play ${g.name}`);
    b.innerHTML = `<div class="art"></div>
      ${g.soon ? '<span class="badge">SOON</span>' : ''}
      <div class="meta"><span class="name">${g.name}</span><span class="tag">${g.tag}</span></div>`;
    b.querySelector('.art').style.cssText = g.style;
    if (!g.soon) b.addEventListener('click', () => openGame(g.id));
    grid.appendChild(b);
  });
}

document.querySelectorAll('.chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('on'));
    chip.classList.add('on');
    renderGrid(chip.dataset.filter);
  }));

document.querySelectorAll('[data-open]').forEach((el) =>
  el.addEventListener('click', () => openGame(el.dataset.open)));

// ---------- routing ----------
async function openGame(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g || g.soon) return;
  const mod = await import(`./games/${id}.js`);
  $('#game-title').textContent = g.name;
  hub.classList.remove('active');
  gameScreen.classList.add('active');
  stage.innerHTML = '';
  cleanup = mod.mount(stage, { roundOver });
  history.pushState({ game: id }, '', `#${id}`);
}

function closeGame() {
  if (cleanup) cleanup();
  cleanup = null;
  gameScreen.classList.remove('active');
  hub.classList.add('active');
}

$('#back').addEventListener('click', () => history.back());
window.addEventListener('popstate', () => { if (gameScreen.classList.contains('active')) closeGame(); });

// ---------- ads ----------
// Full-screen ads come from ads/ads.js and run for AD_SECONDS, no skipping.
// Because the ad files live inside the app, they also play offline.
let adIndex = 0, adTimer = null;

function roundOver() {
  if (!ADS_ENABLED) return;
  roundsSinceAd++;
  if (roundsSinceAd >= ROUNDS_BETWEEN_ADS) {
    roundsSinceAd = 0;
    setTimeout(showAd, 900);
  }
}

function showAd() {
  const ad = ADS.length ? ADS[adIndex++ % ADS.length] : null;
  const media = $('#ad-media');
  media.innerHTML = '';
  if (ad && ad.type === 'video') {
    const v = document.createElement('video');
    Object.assign(v, { src: `ads/${ad.src}`, playsInline: true, loop: true });
    v.setAttribute('playsinline', '');
    media.appendChild(v);
    // try with sound first; phones may block that, so fall back to muted with a sound button
    const snd = document.createElement('button');
    snd.className = 'ad-sound';
    snd.type = 'button';
    const setIcon = () => { snd.textContent = v.muted ? 'Tap for sound' : 'Sound on'; };
    snd.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); v.muted = !v.muted; v.play().catch(() => {}); setIcon(); });
    media.appendChild(snd);
    v.play().then(setIcon).catch(() => { v.muted = true; setIcon(); v.play().catch(() => {}); });
  } else if (ad) {
    const img = document.createElement('img');
    img.src = `ads/${ad.src}`;
    img.alt = 'Advertisement';
    media.appendChild(img);
  } else {
    media.innerHTML = '<p class="ad-empty">Your ad here<br><small>Add ad files in ads/ads.js</small></p>';
  }
  if (ad && ad.link) media.href = ad.link; else media.removeAttribute('href');

  const btn = $('#close-ad');
  let left = AD_SECONDS;
  btn.disabled = true;
  $('#interstitial').hidden = false;
  const tick = () => {
    $('#ad-timer').textContent = left;
    $('#ad-progress').style.width = `${((AD_SECONDS - left) / AD_SECONDS) * 100}%`;
    btn.textContent = left > 0 ? `Continue in ${left}s` : 'Continue';
    btn.disabled = left > 0;
    if (left <= 0) clearInterval(adTimer);
    left--;
  };
  clearInterval(adTimer);
  tick();
  adTimer = setInterval(tick, 1000);
}

$('#close-ad').addEventListener('click', () => {
  if ($('#close-ad').disabled) return;
  $('#interstitial').hidden = true;
  $('#ad-media').innerHTML = '';
});

function updateNet() {
  const online = navigator.onLine;
  const net = $('#net');
  net.textContent = online ? 'Online' : 'Offline mode';
  net.classList.toggle('off', !online);
  document.querySelectorAll('[data-ad="banner"]').forEach((slot) => {
    slot.hidden = !online || !ADS_ENABLED;
    slot.innerHTML = '<span class="ad-tag">AD</span> Banner ad · 320×50';
  });
}
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);

// ---------- install hint (iPhone/iPad Safari) ----------
const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let hintDismissed = false;
try { hintDismissed = localStorage.getItem('oa-install-x') === '1'; } catch (e) {}
if (ios && !standalone && !hintDismissed) $('#install').hidden = false;
$('#install-x').addEventListener('click', () => {
  $('#install').hidden = true;
  try { localStorage.setItem('oa-install-x', '1'); } catch (e) {}
});

// ---------- offline ----------
// The app checks for updates every time it opens (when online) and reloads itself
// onto the new version, so players never get stuck on an old copy.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) { reloading = true; location.reload(); }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      check();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    }).catch(() => {});
  });
}

const live = GAMES.filter((g) => !g.soon);
const levels = live.reduce((n, g) => n + (g.levels || 1), 0);
$('#count').textContent = `${live.length} games · ${levels.toLocaleString()} levels`;
renderGrid();
updateNet();
const start = location.hash.slice(1);
if (start) openGame(start);
