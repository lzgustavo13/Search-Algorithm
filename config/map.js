import { TERRAIN, TERRAIN_COST, COLORS } from "./settings.js";

export class Map {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.generateRandomMap();
  }

  generateRandomMap() {
    let noiseScale = 20.0;
    let iterations = 1;
    const newGrid = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        let noiseVal = noise(x / noiseScale, y / noiseScale, iterations);
        let chanceObstacle = random();
        let terrainType;

        if (noiseVal < 0.35) {
          terrainType = TERRAIN.agua;
        } else if (noiseVal < 0.45) {
          terrainType = TERRAIN.atoleiro;
        } else {
          terrainType = TERRAIN.areia;
        }

        if (chanceObstacle < 0.1) {
          terrainType = TERRAIN.obstaculo;
        }

        row.push({
          x: x,
          y: y,
          type: terrainType,
          isObstacle: terrainType === TERRAIN.obstaculo,
          wasVisited: false,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }

  draw(tileSize) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const terrainType = this.grid[y][x].type;
        fill(COLORS[terrainType]);
        stroke(200);
        rect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  placeCharacter() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.cols);
      y = Math.floor(Math.random() * this.rows);
    } while (this.grid[y][x].isObstacle);
    return { x, y };
  }

  computeMoveFrames(type, factor) {
    const base = TERRAIN_COST[type] || 1;
    return Math.max(1, Math.round(base * factor));
  }

  drawPath(path, tileSize, color) {
    for (const cell of path) {
      fill(color);
      rect(cell.x * tileSize, cell.y * tileSize, tileSize, tileSize);
    }
  }

  drawSearchVisualization(visitedOrder, tileSize, color) {
    for (const cell of visitedOrder) {
      fill(color);
      rect(cell.x * tileSize, cell.y * tileSize, tileSize, tileSize);
    }
  }

  drawVisitedFrontier(visitedOrder, tileSize, color) {
    if (!visitedOrder || visitedOrder.length === 0) return;
    const visitedSet = new Set();
    for (const c of visitedOrder) visitedSet.add(`${c.x},${c.y}`);

    const frontierSet = new Set();
    const deltas = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ];
    for (const cell of visitedOrder) {
      for (const d of deltas) {
        const nx = cell.x + d[0];
        const ny = cell.y + d[1];
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
        const key = `${nx},${ny}`;
        if (!visitedSet.has(key) && !this.grid[ny][nx].isObstacle) {
          frontierSet.add(key);
        }
      }
    }

    // draw frontier cells
    for (const k of frontierSet) {
      const [sx, sy] = k.split(",").map(Number);
      fill(color);
      noStroke();
      rect(sx * tileSize, sy * tileSize, tileSize, tileSize);
    }
  }

  clearMap() {}
}
