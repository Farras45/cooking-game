// render.js — every pixel of The Sizzling Ladle.
// One job: draw the kitchen, the order board, the counter, the plate and
// the overlays from the state, with plain canvas shapes and no images.

import { CANVAS_W, CANVAS_H, INGREDIENTS, ROUND, LAYOUT, binRect, ingredientById } from './config.js';

const CREAM = '#fff4dd';
const WOOD = '#8a5a33';
const WOOD_DARK = '#6e4525';
const INK = '#2e2118';
const BOARD = '#3d2b1f';
const GREEN = '#3f9d4e';
const RED = '#d64541';
const GOLD = '#f7c948';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// A small drawn picture of one ingredient, centred at (x, y).
export function drawIngredientIcon(ctx, id, x, y, r) {
  const item = ingredientById(id);
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, 6, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    ctx.fillRect(-r, 6, r * 2, 8);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.3, 3, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.5, 3, 0, Math.PI * 2);
    ctx.arc(0, -r * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = item.color;
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, 10);
    ctx.fill();
    ctx.fillStyle = item.dark;
    ctx.fillRect(-r * 0.6, -2, r * 0.5, 4);
    ctx.fillRect(r * 0.1, -2, r * 0.6, 4);
  } else if (id === 'cheese') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(0, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    ctx.beginPath();
    ctx.arc(-r * 0.3, r * 0.3, 4, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.1, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = item.color;
    for (const [dx, dy] of [[-r * 0.5, 0], [r * 0.5, 0], [0, -r * 0.4], [0, r * 0.4]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.quadraticCurveTo(0, r * 0.5, r * 0.7, 0);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(-r * 0.4, -r * 0.4);
    ctx.lineTo(r * 0.4, -r * 0.4);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'onion') {
    ctx.fillStyle = '#f3e8ff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 3;
    for (const rr of [0.6, 0.35]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * rr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-12, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 12, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? RED : '#ffffff55';
  ctx.fill();
  ctx.restore();
}

function drawBar(ctx, x, y, w, h, frac, color) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#00000033';
  ctx.fill();
  if (frac > 0) {
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = BOARD;
  ctx.fillRect(0, 0, CANVAS_W, 84);
  text(ctx, 'THE SIZZLING LADLE', 32, 54, 30, GOLD);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  text(ctx, `TIME ${clock}`, 560, 54, 30, state.timeLeft <= 15 ? '#ff8a80' : '#fff', 'bold', 'center');
  drawBar(ctx, 470, 64, 180, 10, state.timeLeft / ROUND.seconds, state.timeLeft <= 15 ? RED : GOLD);
  text(ctx, `SCORE ${state.score}`, 700, 54, 26, '#fff');
  text(ctx, `COINS ${state.coins}`, 900, 54, 26, GOLD);
  for (let i = 0; i < ROUND.hearts; i += 1) drawHeart(ctx, 1022 + i * 28, 46, 20, i < state.hearts);
  text(ctx, `SERVED ${state.served}/${ROUND.targetServed}`, 1120, 54, 22, '#fff');
}

function drawOrderCard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'ORDER BOARD', b.x + 20, b.y + 38, 22, INK);
  if (!state.order) {
    text(ctx, 'No orders yet.', b.x + 20, b.y + 90, 20, INK, 'normal');
    return;
  }
  const order = state.order;
  text(ctx, order.recipe.name, b.x + 20, b.y + 82, 30, INK);
  text(ctx, `$${order.recipe.price}  ·  patience bonus +2/sec left`, b.x + 20, b.y + 110, 16, '#6b543a', 'normal');
  order.recipe.needs.forEach((id, i) => {
    const y = b.y + 150 + i * 62;
    const done = state.plate.includes(id);
    ctx.fillStyle = done ? '#dff0d8' : '#f3ead9';
    roundRect(ctx, b.x + 20, y, b.w - 40, 50, 10);
    ctx.fill();
    drawIngredientIcon(ctx, id, b.x + 48, y + 25, 18);
    text(ctx, ingredientById(id).name, b.x + 78, y + 32, 20, INK);
    text(ctx, done ? 'ON PLATE ✓' : 'NEEDED', b.x + b.w - 34, y + 32, 16, done ? GREEN : '#8a6d4b', 'bold', 'right');
  });
  const frac = order.patience / order.patienceMax;
  text(ctx, 'PATIENCE', b.x + 20, b.y + 360, 16, INK);
  drawBar(ctx, b.x + 20, b.y + 372, b.w - 40, 16, frac, frac > 0.5 ? GREEN : frac > 0.25 ? GOLD : RED);
  text(ctx, `${Math.ceil(order.patience)}s`, b.x + b.w - 20, b.y + 362, 16, INK, 'bold', 'right');
  if (state.nextOrder) {
    text(ctx, `NEXT: ${state.nextOrder.name}`, b.x + 20, b.y + 428, 18, '#6b543a', 'normal');
  }
}

function drawCounter(ctx) {
  const c = LAYOUT.counter;
  ctx.fillStyle = WOOD;
  roundRect(ctx, c.x, c.y, c.w, c.h, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff22';
  ctx.fillRect(c.x, c.y, c.w, 10);
  text(ctx, 'COUNTER — click or press 1–6', c.x + 20, c.y + 38, 22, '#fff');
  INGREDIENTS.forEach((item, i) => {
    const r = binRect(i);
    ctx.fillStyle = CREAM;
    roundRect(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.fill();
    ctx.strokeStyle = WOOD_DARK;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredientIcon(ctx, item.id, r.x + r.w / 2, r.y + 62, 34);
    text(ctx, item.name, r.x + r.w / 2, r.y + 122, 20, INK, 'bold', 'center');
    text(ctx, `[${item.key}]`, r.x + r.w / 2, r.y + 142, 14, '#8a6d4b', 'normal', 'center');
  });
}

function drawPlateArea(ctx, state) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, p.x, p.y, p.w, p.h, 16);
  ctx.fill();
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'YOUR PLATE', p.x + 20, p.y + 38, 22, INK);
  const c = LAYOUT.plateCenter;
  ctx.fillStyle = '#f1e6cf';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c39a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fffdf6';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.rx - 22, c.ry - 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // The dish mid-assembly: one stacked layer per ingredient on the plate.
  const layers = state.plate;
  layers.forEach((id, i) => {
    const item = ingredientById(id);
    const y = c.y + 34 - i * 26;
    ctx.fillStyle = item.color;
    roundRect(ctx, c.x - 82, y - 13, 164, 26, 12);
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, item.name, c.x, y + 6, 16, INK, 'bold', 'center');
  });
  if (layers.length === 0) {
    text(ctx, 'Empty plate', c.x, c.y + 6, 18, '#a08a68', 'normal', 'center');
  }
  const btn = LAYOUT.serveButton;
  ctx.fillStyle = state.plate.length > 0 ? GREEN : '#9aa08a';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, 'SERVE  [Space]', btn.x + btn.w / 2, btn.y + 37, 24, '#fff', 'bold', 'center');
  const note = state.flash === 'bad' ? 'That did not match the order.' : state.flash === 'good' ? 'Looking tasty!' : '';
  if (note) text(ctx, note, p.x + p.w / 2, p.y + 444, 16, state.flash === 'bad' ? RED : GREEN, 'bold', 'center');
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = BOARD;
  ctx.fillRect(0, 600, CANVAS_W, 200);
  text(ctx, state.message, 32, 648, 24, '#fff', 'normal');
  text(ctx, 'How to play: read the order board, click ingredients (or press 1–6) to stack them on the plate, then SERVE.', 32, 692, 17, '#d8c39a', 'normal');
  text(ctx, 'Progress:', 32, 736, 18, GOLD);
  for (let i = 0; i < ROUND.targetServed; i += 1) {
    ctx.fillStyle = i < state.served ? GOLD : '#ffffff33';
    ctx.beginPath();
    ctx.arc(150 + i * 34, 730, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'The Sizzling Ladle — an original kitchen game', 1120, 736, 16, '#d8c39a', 'normal', 'right');
}

function drawOverlay(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = '#1d130bcc';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = CREAM;
  roundRect(ctx, 340, 150, 600, 470, 20);
  ctx.fill();
  text(ctx, title, 640, 230, 40, INK, 'bold', 'center');
  lines.forEach((line, i) => text(ctx, line, 640, 300 + i * 40, 21, '#5a4632', 'normal', 'center'));
  const b = LAYOUT.startButton;
  ctx.fillStyle = GREEN;
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  text(ctx, buttonLabel, b.x + b.w / 2, b.y + 46, 26, '#fff', 'bold', 'center');
  text(ctx, 'or press Enter', 640, b.y + 104, 16, '#8a6d4b', 'normal', 'center');
}

export function drawGame(ctx, state) {
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Kitchen wall tiles and floor strip behind the stations.
  ctx.fillStyle = '#e8d3a8';
  for (let x = 0; x < CANVAS_W; x += 64) ctx.fillRect(x, 84, 2, 24);
  drawTopBar(ctx, state);
  drawOrderCard(ctx, state);
  drawCounter(ctx);
  drawPlateArea(ctx, state);
  drawBottomBar(ctx, state);
  if (state.screen === 'start') {
    drawOverlay(ctx, 'THE SIZZLING LADLE', [
      'You run a tiny kitchen with a big lunch rush.',
      'Build each order on the plate, then serve it.',
      'Serve 5 dishes in 2 minutes. Three hearts.',
      'Click ingredients or press 1–6. Space serves.',
    ], 'START COOKING');
  } else if (state.screen === 'won') {
    drawOverlay(ctx, 'SERVICE COMPLETE!', [
      `You served ${state.served} dishes and earned ${state.score} points.`,
      'The lunch rush is fed. The ladle rests.',
      'Press R or click below to cook again.',
    ], 'COOK AGAIN');
  } else if (state.screen === 'lost') {
    drawOverlay(ctx, 'KITCHEN CLOSED', [
      state.message,
      `Score: ${state.score}  ·  Dishes served: ${state.served}`,
      'Press R or click below to try again.',
    ], 'TRY AGAIN');
  }
}
