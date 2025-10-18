export class Search {
  constructor(start, grid, food) {
    this.start = start;
    this.grid = grid;
    this.food = food;
    this.visited = this.createGrid(false);
    this.distance = this.createGrid(-1);

    this.directions = [
      { x: 0, y: -1 }, // cima
      { x: 1, y: 0 }, // direita
      { x: 0, y: 1 }, // baixo
      { x: -1, y: 0 }, // esquerda
      { x: -1, y: -1 }, // cima-esquerda
      { x: 1, y: -1 }, // cima-direita
      { x: 1, y: 1 }, // baixo-direita
      { x: -1, y: 1 }, // baixo-esquerda
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

  bfs() {
    let queue = [];
    queue.push(this.start);
    this.visited[this.start.y][this.start.x] = true;
    this.distance[this.start.y][this.start.x] = 0;

    let parent = this.createGrid(null);
    let visitedOrder = [];
    let path = [];

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

    // reconstruct path
    let current = this.food;
    const maxSteps = this.grid.length * this.grid[0].length + 5;
    let steps = 0;
    const seen = new Set();
    while (current && steps < maxSteps) {
      const key = `${current.x},${current.y}`;
      if (seen.has(key)) break; // cycle detected

      path.push(current);
      seen.add(key);
      const p = parent[current.y] && parent[current.y][current.x];

      if (!p) break;
      current = p;
      steps++;
    }
    path.reverse();

    return { visitedOrder, path };
  }

  dfs() {}

  aStar() {}

  greedyBestFirst() {}

  uniformCostSearch() {}
}
