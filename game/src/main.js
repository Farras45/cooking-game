// main.js — the game loop and wiring for The Sizzling Ladle.
// One job: own the canvas, the clock and the screen flow, and hand the
// rules to state.js, the drawing to render.js and the keys to input.js.

import { CANVAS_W, CANVAS_H } from './config.js';
import { createGame, startRound, addIngredient, serveDish, tick } from './state.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { sounds } from './sound.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createGame();

function startPlaying() {
  startRound(state);
  sounds.add();
}

const actions = {
  onAdd(id) {
    const result = addIngredient(state, id);
    if (result === 'added') sounds.add();
    else if (result === 'wrong' || result === 'duplicate') sounds.wrong();
  },
  onServe() {
    const result = serveDish(state);
    if (result === 'served' || result === 'won') sounds.served();
    else if (result === 'mismatch' || result === 'empty') sounds.wrong();
    if (result === 'won') sounds.won();
  },
  onStart() {
    startPlaying();
  },
  onRestart() {
    startPlaying();
  },
};

attachInput(canvas, state, actions);
applyShot(state, window.location.search);

let last = performance.now();
let frozen = false;
document.addEventListener('visibilitychange', () => {
  frozen = document.hidden;
  last = performance.now();
});
function frame(now) {
  const dt = frozen ? 0 : Math.min(0.1, (now - last) / 1000);
  last = now;
  const before = state.screen;
  tick(state, dt);
  if (before === 'play' && state.screen === 'lost') sounds.lost();
  if (before === 'play' && state.screen === 'won') sounds.won();
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
drawGame(ctx, state);
requestAnimationFrame(frame);
