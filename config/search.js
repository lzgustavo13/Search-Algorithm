import { TERRAIN_COST } from "./settings.js";
export class Search {
  constructor(start, grid, food) {
    this.start = start;
    this.grid = grid;
    this.food = food;
    this.visited = this.createGrid(false);
    this.distance = this.createGrid(-1);

    this.directions = [
      { x: -1, y: 1 }, // baixo-esquerda
      { x: 1, y: 1 }, // baixo-direita
      { x: -1, y: -1 }, // cima-esquerda
      { x: 1, y: -1 }, // cima-direita
      { x: -1, y: 0 }, // esquerda
      { x: 0, y: 1 }, // baixo
      { x: 1, y: 0 }, // direita
      { x: 0, y: -1 }, // cima
    ];
  }

  isValidPosition(x, y) {
    return (
      x >= 0 &&
      x < this.grid[0].length &&
      y >= 0 &&
      y < this.grid.length &&
      !this.grid[y][x].isObstacle
    );
  }

  wasVisited(pos) {
    return this.visited[pos.y][pos.x];
  }

  hasBiggerDistance(pos, newDist) {
    return (
      this.distance[pos.y][pos.x] === -1 ||
      this.distance[pos.y][pos.x] > newDist
    );
  }

  createGrid(value) {
    let newGrid = [];
    for (let y = 0; y < this.grid.length; y++) {
      let row = [];
      for (let x = 0; x < this.grid[y].length; x++) {
        row.push(value);
      }
      newGrid.push(row);
    }
    return newGrid;
  }

  isDestination(pos) {
    return pos.x === this.food.x && pos.y === this.food.y;
  }

 // Reconstruct path from parent map to food
  _reconstructPath(parent) {
    let path = [];
    let current = this.food;
    const maxSteps = this.grid.length * this.grid[0].length + 5;
    let steps = 0;
    const seen = new Set();

    while (current && steps < maxSteps) {
      const key = `${current.x},${current.y}`;
      if (seen.has(key)) break; // ciclo detectado

      path.push(current);
      seen.add(key);
      const p = parent[current.y] && parent[current.y][current.x];

      if (!p) break; // chegou ao início (ou a um nó sem pai)
      current = p;
      steps++;
    }
    path.reverse();
    return path;
  }

  bfs() {
    let queue = [];
    queue.push(this.start);
    this.visited[this.start.y][this.start.x] = true;
    this.distance[this.start.y][this.start.x] = 0;

    let parent = this.createGrid(null);
    let visitedOrder = [];

    while (queue.length > 0) {
      const current = queue.shift();
      visitedOrder.push(current);

      if (this.isDestination(current)) break;

      for (const dir of this.directions) {
        const x = current.x + dir.x;
        const y = current.y + dir.y;

        if (
          this.isValidPosition(x, y) &&
          (!this.wasVisited({ x, y }) ||
            this.hasBiggerDistance(
              { x, y },
              this.distance[current.y][current.x] + 1
            ))
        ) {
          this.visited[y][x] = true;
          this.distance[y][x] = this.distance[current.y][current.x] + 1;

          parent[y][x] = current;
          queue.push({ x, y });
        }
      }
    }

    const path = this._reconstructPath(parent);

    return { visitedOrder, path };
  }

  dfs() {}

  aStar() {}

  greedyBestFirst() {}

  uniformCostSearch() {
    let priorityQueue = [];
    priorityQueue.push({ pos: this.start, cost: 0 });
    this.distance[this.start.y][this.start.x] = 0;

    let parent = this.createGrid(null);
    let visitedOrder = [];

    while (priorityQueue.length > 0) {
      // sort by cost
      priorityQueue.sort((a, b) => a.cost - b.cost);
      const { pos: current, cost: currentCost } = priorityQueue.shift();

      if (this.wasVisited(current)) {
        continue;
      }

      this.visited[current.y][current.x] = true; // visitado
      visitedOrder.push(current);

      if (this.isDestination(current)) break;

      for (const dir of this.directions) {
        const x = current.x + dir.x;
        const y = current.y + dir.y;

        if (this.isValidPosition(x, y)) {
          const terrainType = this.grid[y][x].type;
          const moveCost = TERRAIN_COST[terrainType] || 1;
          const newCost = currentCost + moveCost;

          if (this.hasBiggerDistance({ x, y }, newCost)) {
            this.distance[y][x] = newCost;
            parent[y][x] = current;
            priorityQueue.push({ pos: { x, y }, cost: newCost }); // adicionar à fila de prioridade com o novo custo
          }
        }
      }
    }
    const path = this._reconstructPath(parent);

    return { visitedOrder, path };
  }
}