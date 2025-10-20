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

  dfs() {

    let stack = [];
    stack.push(this.start);
    this.visited[this.start.y][this.start.x] = true;

    let parent = this.createGrid(null);
    let visitedOrder = [];

    while (stack.length > 0) {
      const current = stack.pop();
      visitedOrder.push(current);

      if (this.isDestination(current)) break;

      for (const dir of this.directions) {
        const x = current.x + dir.x;
        const y = current.y + dir.y;

        if (
          this.isValidPosition(x, y) &&
          !this.wasVisited({ x, y })
        ) {
          this.visited[y][x] = true;
          parent[y][x] = current;
          stack.push({ x, y });
        }
      }
    }

    const path = this._reconstructPath(parent);

    return { visitedOrder, path };

  }

  // Heurística: distância de Manhattan
  // Calcula a estimativa de distância do ponto atual até o objetivo (comida)
  // Usa a soma das diferenças absolutas em x e y (distância em grade sem diagonais)
  heuristic(pos) {
    return Math.abs(pos.x - this.food.x) + Math.abs(pos.y - this.food.y);
  }

  aStar() {
    // Fila de prioridade para armazenar os nós a serem explorados
    // Os nós são ordenados pelo valor f (custo total estimado)
    let priorityQueue = [];

    // gScore: custo real acumulado do início até cada nó
    const gScore = this.createGrid(Infinity);

    // fScore: custo total estimado (gScore + heurística)
    // f(n) = g(n) + h(n), onde g(n) é o custo real e h(n) é a heurística
    const fScore = this.createGrid(Infinity);

    // Inicializar o nó de início com custo 0
    gScore[this.start.y][this.start.x] = 0;
    fScore[this.start.y][this.start.x] = this.heuristic(this.start);

    // Adicionar o nó inicial à fila de prioridade
    priorityQueue.push({
      pos: this.start,
      f: fScore[this.start.y][this.start.x]
    });

    // Grid para rastrear o nó pai de cada posição (para reconstruir o caminho)
    let parent = this.createGrid(null);

    // Array para armazenar a ordem em que os nós foram visitados (para visualização)
    let visitedOrder = [];

    // Loop principal: continua enquanto houver nós para explorar
    while (priorityQueue.length > 0) {
      // Ordenar a fila por f (custo total estimado) - menor f tem prioridade
      priorityQueue.sort((a, b) => a.f - b.f);

      // Remover e processar o nó com menor f (mais promissor)
      const { pos: current } = priorityQueue.shift();

      // Se o nó já foi visitado, pular para o próximo
      if (this.wasVisited(current)) {
        continue;
      }

      // Marcar o nó atual como visitado
      this.visited[current.y][current.x] = true;
      visitedOrder.push(current);

      // Se chegamos ao destino (comida), parar a busca
      if (this.isDestination(current)) break;

      // Explorar todos os vizinhos do nó atual (cima, baixo, esquerda, direita)
      for (const dir of this.directions) {
        const x = current.x + dir.x;
        const y = current.y + dir.y;

        // Verificar se a posição do vizinho é válida (dentro dos limites e não é parede)
        if (this.isValidPosition(x, y)) {
          // Obter o tipo de terreno e seu custo associado
          const terrainType = this.grid[y][x].type;
          const moveCost = TERRAIN_COST[terrainType] || 1;

          // Calcular o custo tentativo para chegar a este vizinho
          // custo atual + custo de movimento para o vizinho
          const tentativeGScore = gScore[current.y][current.x] + moveCost;

          // Se encontramos um caminho melhor (mais barato) para este nó
          if (tentativeGScore < gScore[y][x]) {
            // Atualizar o gScore com o novo custo menor
            gScore[y][x] = tentativeGScore;

            // Atualizar o fScore (custo real + estimativa heurística)
            fScore[y][x] = tentativeGScore + this.heuristic({ x, y });

            // Registrar o nó atual como pai deste vizinho (para reconstruir o caminho)
            parent[y][x] = current;

            // Adicionar o vizinho à fila de prioridade se ainda não foi visitado
            if (!this.wasVisited({ x, y })) {
              priorityQueue.push({
                pos: { x, y },
                f: fScore[y][x]
              });
            }
          }
        }
      }
    }

    // Reconstruir o caminho do início ao destino usando o grid de pais
    const path = this._reconstructPath(parent);

    // Retornar a ordem de visitação e o caminho encontrado
    return { visitedOrder, path };
  }

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