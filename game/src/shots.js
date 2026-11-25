// shots.js — deterministic staging for the maker's screenshots.
// One job: read ?shot=start|play|end from the page URL and put the game in
// that exact state, so each screenshot is a real render of the game's code.

import { recipeById } from './config.js';

export function shotFromUrl(search) {
  const params = new URLSearchParams(search);
  return params.get('shot');
}

// The cover: a dish mid-assembly, an order on the board, the clock running.
function stagePlay(state) {
  state.screen = 'play';
  state.score = 214;
  state.coins = 26;
  state.served = 2;
  state.hearts = 3;
  state.timeLeft = 64;
  state.plate = ['bun', 'patty'];
  state.flash = 'good';
  const recipe = recipeById('garden-burger');
  state.order = { recipe, patience: 17, patienceMax: 22 };
  state.nextOrder = recipeById('melty-burger');
  state.message = 'Patty added — 2 of 3 on the plate.';
}

// The end shot: the win screen after a full service.
function stageEnd(state) {
  state.screen = 'won';
  state.score = 486;
  state.coins = 60;
  state.served = 5;
  state.hearts = 2;
  state.timeLeft = 12;
  state.plate = [];
  state.flash = null;
  state.order = null;
  state.nextOrder = null;
  state.message = 'Service complete! 5 dishes served.';
}

export function applyShot(state, search) {
  const shot = shotFromUrl(search);
  if (shot === 'play') stagePlay(state);
  else if (shot === 'end') stageEnd(state);
  // 'start' and anything else: leave the title screen as it is.
  return shot;
}
