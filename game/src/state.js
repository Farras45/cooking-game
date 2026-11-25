// state.js — the pure rules of The Sizzling Ladle, with no DOM in it.
// One job: hold the round state and answer what each player action does,
// so the game loop, the input and the tests all read the same truth.

import { RECIPES, ROUND, ingredientById } from './config.js';

export function createGame() {
  return {
    screen: 'start', // 'start' | 'play' | 'won' | 'lost'
    score: 0,
    coins: 0,
    served: 0,
    hearts: ROUND.hearts,
    timeLeft: ROUND.seconds,
    order: null, // { recipe, patience, patienceMax }
    nextOrder: null, // recipe shown as "coming next"
    plate: [], // ingredient ids, in the order added
    message: 'Welcome to The Sizzling Ladle!',
    flash: null, // 'good' | 'bad' | null, for the plate feedback
    flashAt: 0,
  };
}

export function patienceFor(servedCount) {
  return Math.max(ROUND.patienceMin, ROUND.patienceStart - servedCount * ROUND.patienceStep);
}

function drawRecipe(avoidId) {
  const pool = RECIPES.filter((dish) => dish.id !== avoidId);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeOrder(state, recipe) {
  const patience = patienceFor(state.served);
  return { recipe, patience, patienceMax: patience };
}

export function startRound(state) {
  state.screen = 'play';
  state.score = 0;
  state.coins = 0;
  state.served = 0;
  state.hearts = ROUND.hearts;
  state.timeLeft = ROUND.seconds;
  state.plate = [];
  state.flash = null;
  state.order = makeOrder(state, drawRecipe(null));
  state.nextOrder = drawRecipe(state.order.recipe.id);
  state.message = 'First order is in — build it on the plate!';
}

// Add one ingredient to the plate. Returns what happened.
export function addIngredient(state, id) {
  if (state.screen !== 'play' || !state.order) return 'idle';
  if (!ingredientById(id)) return 'idle';
  if (state.plate.includes(id)) {
    state.message = 'That is already on the plate.';
    state.flash = 'bad';
    return 'duplicate';
  }
  if (!state.order.recipe.needs.includes(id)) {
    state.message = `${ingredientById(id).name} is not in this order!`;
    state.flash = 'bad';
    return 'wrong';
  }
  state.plate.push(id);
  state.flash = 'good';
  state.message = `${ingredientById(id).name} added — ${state.plate.length} of 3 on the plate.`;
  return 'added';
}

export function plateMatches(state) {
  if (!state.order || state.plate.length !== state.order.recipe.needs.length) return false;
  return state.order.recipe.needs.every((id) => state.plate.includes(id));
}

// Serve the plate. Returns what happened.
export function serveDish(state) {
  if (state.screen !== 'play' || !state.order) return 'idle';
  if (state.plate.length === 0) {
    state.message = 'The plate is empty — add ingredients first.';
    state.flash = 'bad';
    return 'empty';
  }
  if (!plateMatches(state)) {
    state.message = 'That is not the order — check the order board!';
    state.flash = 'bad';
    return 'mismatch';
  }
  const bonus = Math.ceil(state.order.patience) * 2;
  const earned = state.order.recipe.price + bonus;
  state.score += earned;
  state.coins += state.order.recipe.price;
  state.served += 1;
  state.plate = [];
  state.flash = 'good';
  if (state.served >= ROUND.targetServed) {
    state.screen = 'won';
    state.message = `Service complete! ${state.served} dishes served.`;
    return 'won';
  }
  state.order = makeOrder(state, state.nextOrder);
  state.nextOrder = drawRecipe(state.order.recipe.id);
  state.message = `Served! +${earned} points. Next order is in.`;
  return 'served';
}

// Advance the clocks by dt seconds. Handles order patience and the round timer.
export function tick(state, dt) {
  if (state.screen !== 'play') return;
  state.timeLeft -= dt;
  if (state.order) {
    state.order.patience -= dt;
    if (state.order.patience <= 0) {
      state.hearts -= 1;
      state.plate = [];
      state.flash = 'bad';
      if (state.hearts <= 0) {
        state.screen = 'lost';
        state.message = 'Too many orders walked out — the kitchen closes.';
        return;
      }
      state.message = 'Order timed out! A customer left unhappy.';
      state.order = makeOrder(state, state.nextOrder);
      state.nextOrder = drawRecipe(state.order.recipe.id);
    }
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = state.served >= ROUND.targetServed ? 'won' : 'lost';
    state.message =
      state.screen === 'won'
        ? `Service complete! ${state.served} dishes served.`
        : `Time! You served ${state.served} of ${ROUND.targetServed} dishes.`;
  }
}
