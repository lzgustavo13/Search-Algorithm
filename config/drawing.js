import { TILE_SIZE, GRID_ROWS, GRID_COLS, COLORS } from './settings.js';

export function drawGrid(grid) {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const terrainType = grid[y][x].type;
      fill(COLORS[terrainType]);
      stroke(200);
      rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

export function drawAgent(agent) {
  fill(COLORS.AGENT);
  rect(agent.x * TILE_SIZE, agent.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

export function drawFood(food) {
  fill(COLORS.FOOD);
  rect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

export function drawSearchVisualization(visited, path) {
  // falta implementar
}

export function drawPath(path) {
    // falta implementar
}

window.drawGrid = drawGrid;
window.drawAgent = drawAgent;
window.drawFood = drawFood;
window.drawSearchVisualization = drawSearchVisualization;
