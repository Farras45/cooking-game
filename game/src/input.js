// input.js — keyboard and mouse for The Sizzling Ladle.
// One job: turn clicks and key presses into game actions, and nothing else.

import { INGREDIENTS, LAYOUT, binRect } from './config.js';

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function canvasPoint(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * canvas.width,
    y: ((event.clientY - box.top) / box.height) * canvas.height,
  };
}

// actions: { onAdd(id), onServe(), onStart(), onRestart() }
// state is read only to decide which button a click means.
export function attachInput(canvas, state, actions) {
  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(canvas, event);
    if (state.screen === 'start') {
      if (pointInRect(p.x, p.y, LAYOUT.startButton)) actions.onStart();
      return;
    }
    if (state.screen === 'won' || state.screen === 'lost') {
      if (pointInRect(p.x, p.y, LAYOUT.startButton)) actions.onRestart();
      return;
    }
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (pointInRect(p.x, p.y, binRect(i))) {
        actions.onAdd(INGREDIENTS[i].id);
        return;
      }
    }
    if (pointInRect(p.x, p.y, LAYOUT.serveButton)) actions.onServe();
  });

  window.addEventListener('keydown', (event) => {
    if (state.screen === 'play') {
      const hit = INGREDIENTS.find((item) => item.key === event.key);
      if (hit) {
        actions.onAdd(hit.id);
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        actions.onServe();
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (state.screen === 'start') actions.onStart();
      else actions.onRestart();
    }
    if ((event.key === 'r' || event.key === 'R') && (state.screen === 'won' || state.screen === 'lost')) {
      actions.onRestart();
    }
  });
}
