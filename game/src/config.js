// config.js — every tunable number and name for The Sizzling Ladle.
// One job: hold the recipes, the ingredients, the round rules and the
// screen layout, so no other file hard-codes a value the game shows.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The six things on the counter. `key` is the keyboard shortcut, `color`
// is the fill the renderer draws for the ingredient.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8b06a', dark: '#b97f36' },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a26', dark: '#54331a' },
  { id: 'cheese', name: 'Cheese', key: '3', color: '#f7c948', dark: '#d9a41f' },
  { id: 'lettuce', name: 'Lettuce', key: '4', color: '#58b368', dark: '#2f7d3d' },
  { id: 'tomato', name: 'Tomato', key: '5', color: '#e4572e', dark: '#a82f14' },
  { id: 'onion', name: 'Onion', key: '6', color: '#c9a7eb', dark: '#8a63b8' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

// Three dishes, three ingredients each. A dish is served only when the
// plate holds exactly these three, in any order.
export const RECIPES = [
  { id: 'garden-burger', name: 'Garden Burger', needs: ['bun', 'patty', 'lettuce'], price: 12 },
  { id: 'melty-burger', name: 'Melty Burger', needs: ['bun', 'patty', 'cheese'], price: 14 },
  { id: 'crunchy-salad', name: 'Crunchy Salad', needs: ['lettuce', 'tomato', 'onion'], price: 10 },
];

export function recipeById(id) {
  return RECIPES.find((dish) => dish.id === id);
}

// One round: serve this many dishes before the clock runs out.
export const ROUND = {
  seconds: 120,
  targetServed: 5,
  hearts: 3,
  patienceStart: 26,
  patienceMin: 15,
  patienceStep: 2,
};

// Screen layout, shared by the renderer and the click handling.
export const LAYOUT = {
  board: { x: 32, y: 108, w: 336, h: 452 },
  counter: { x: 400, y: 108, w: 480, h: 452 },
  plate: { x: 912, y: 108, w: 336, h: 452 },
  bins: { x: 412, y: 168, w: 148, h: 148, gapX: 14, gapY: 16, cols: 3 },
  serveButton: { x: 952, y: 462, w: 256, h: 56 },
  startButton: { x: 490, y: 560, w: 300, h: 72 },
  plateCenter: { x: 1080, y: 300, rx: 130, ry: 84 },
};

export function binRect(index) {
  const b = LAYOUT.bins;
  const col = index % b.cols;
  const row = Math.floor(index / b.cols);
  return {
    x: b.x + col * (b.w + b.gapX),
    y: b.y + row * (b.h + b.gapY),
    w: b.w,
    h: b.h,
  };
}
