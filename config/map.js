// criar mapa
import { TILE_SIZE, GRID_ROWS, GRID_COLS, TERRAIN, TERRAIN_COST, COLORS } from '../config/settings.js';

export function getRandomFreeCell(grid) {
  let x, y;
  do {
    x = floor(random(GRID_COLS));
    y = floor(random(GRID_ROWS));
  } while (grid[y][x].type === TERRAIN.OBSTACLE);
  return { x, y };
}

export class Terrain {
  constructor(type, cost) {
    this.type = type;
    this.cost = cost;
  }
}

function spawnfood(grid) {
  let cell;
  do {
    cell = getRandomFreeCell(grid);
  } while (grid[cell.y][cell.x].type === TERRAIN.OBSTACLE || (cell.x === agent.x && cell.y === agent.y));
  return new Food(cell.x, cell.y);
}