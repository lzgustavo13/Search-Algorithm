import {
  COLORS,
  ANIM,
  DEFAULT_FRAMES_PER_STEP,
  TILE_SIZE,
  GRID_ROWS,
  GRID_COLS,
} from "./config/settings.js";
import { Character } from "./config/character.js";
import { Map } from "./config/map.js";
import { Search } from "./config/search.js";

window.setup = function () {
  createCanvas(GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);
  frameRate(30);

  this.path = []; // caminho encontrado
  this.visitedOrder = []; // ordem das células visitadas
  this.animationStep = ANIM.NONE; // passo atual da animação
  this.isAnimating = false; // estado da animação
  this.foodCount = 0; // contador de comidas coletadas

  this.map = new Map(GRID_ROWS, GRID_COLS);
  const agentPos = this.map.placeCharacter();
  this.agent = new Character(agentPos.x, agentPos.y);

  do {
    const foodPos = this.map.placeCharacter();
    this.food = new Character(foodPos.x, foodPos.y);
  } while (this.food.x === this.agent.x && this.food.y === this.agent.y);

  const startButton = document.getElementById("start-search-btn");
  startButton.addEventListener("click", startSearch.bind(this));

  updateFoodCounter.call(this);
};

function startSearch() {
  const selectedAlgorithm = document.getElementById("algorithm-select").value;

  // Resetar contador se o algoritmo foi trocado
  if (this.selectedAlgorithm && this.selectedAlgorithm !== selectedAlgorithm) {
    this.foodCount = 0;
    updateFoodCounter.call(this);
  }

  this.selectedAlgorithm = selectedAlgorithm;
  this.isAnimating = false;
  this.search = new Search(this.agent, this.map.grid, this.food);

  const { visitedOrder, path } = runSelectedSearch.call(this);

  console.log("Visited Order:", visitedOrder);
  console.log("Path:", path);

  resetAnimationState.call(this, visitedOrder, path);
}

window.draw = function () {
  background(220);
  this.map.draw(TILE_SIZE);
  this.food.draw(COLORS.FOOD, TILE_SIZE);

  // ------------- SEARCH ANIMATION -------------
  if (this.animationStep === ANIM.VISIT) {
    this.animationFrameCounter++;
    if (this.animationFrameCounter >= this.framesPerStep) {
      this.animationFrameCounter = 0;
      if (this.animationIndex < this.visitedOrder.length) {
        this.animationIndex++;
      }
    }

    const toShow = this.visitedOrder.slice(0, this.animationIndex);
    this.map.drawSearchVisualization(toShow, TILE_SIZE, COLORS.SEARCH);
    this.map.drawVisitedFrontier(toShow, TILE_SIZE, COLORS.FRONTIER);

    if (this.animationIndex >= this.visitedOrder.length) {
      this.animationStep = ANIM.PATH;
      this.animationIndex = 0;
    }

    // -------------- PATH ANIMATION ---------------
  } else if (this.animationStep === ANIM.PATH) {
    this.animationFrameCounter++;
    if (this.animationFrameCounter >= this.framesPerStep) {
      this.animationFrameCounter = 0;
      if (this.animationIndex < this.path.length) {
        this.animationIndex++;
      }
    }

    const toShow = this.path.slice(0, this.animationIndex);
    this.map.drawPath(toShow, TILE_SIZE, COLORS.PATH);

    if (this.animationIndex >= this.path.length) {
      this.animationStep = ANIM.MOVE;
      this.animationIndex = 0;

      this.moveFrameCounter = 0;
      this.moveFramesFactor = this.moveFramesFactor || 4;
      if (this.path.length > 0) {
        const first = this.path[0];
        this.agent.x = first.x;
        this.agent.y = first.y;
        const terrain = this.map.grid[first.y][first.x].type;
        this.moveFramesForCurrentCell = this.map.computeMoveFrames(
          terrain,
          this.moveFramesFactor
        );
      }
    }

    // ------------ AGENT MOVEMENT ANIMATION -------------
  } else if (this.animationStep === ANIM.MOVE) {
    if (!this.path || this.path.length === 0) return;

    this.map.drawPath(this.path, TILE_SIZE, COLORS.PATH);

    // check if agent reached the food
    if (this.animationIndex >= this.path.length - 1) {
      // Incrementar contador de comida
      this.foodCount++;
      updateFoodCounter.call(this);

      let newPos;
      let newPath = [];
      let newVisited = [];
      let attempts = 0;

      // spawn a new food
      do {
        newPos = this.map.placeCharacter();
        this.food = new Character(newPos.x, newPos.y);
        this.search = new Search(this.agent, this.map.grid, this.food);

        const res = runSelectedSearch.call(this);
        newVisited = res.visitedOrder || [];
        newPath = res.path || [];

        attempts++;
      } while (
        (newPath.length === 0 ||
          (this.food.x === this.agent.x && this.food.y === this.agent.y)) &&
        attempts < 10
      );

      resetAnimationState.call(this, newVisited, newPath);
      return;
    }

    this.moveFrameCounter++;
    if (this.moveFrameCounter >= this.moveFramesForCurrentCell) {
      this.animationIndex++;
      const targetCell = this.path[this.animationIndex];
      this.agent.x = targetCell.x;
      this.agent.y = targetCell.y;

      this.moveFrameCounter = 0;
      const terrain = this.map.grid[targetCell.y][targetCell.x].type;
      this.moveFramesForCurrentCell = this.map.computeMoveFrames(
        terrain,
        this.moveFramesFactor
      );
    }
  }

  this.agent.draw(COLORS.AGENT, TILE_SIZE);
};

function runSelectedSearch() {
  const algorithm = this.selectedAlgorithm;

  if (algorithm === "bfs") return this.search.bfs();
  if (algorithm === "dfs") return this.search.dfs();
  if (algorithm === "ucs") return this.search.uniformCostSearch();
  if (algorithm === "greedy") return this.search.greedyBestFirst();
  if (algorithm === "a_star") return this.search.aStar();

  console.error("Algoritmo desconhecido:", algorithm);
  return { visitedOrder: [], path: [] };
}

function resetAnimationState(visitedOrder, path) {
  this.path = path || [];
  this.visitedOrder = visitedOrder || [];

  this.animationStep = ANIM.VISIT; // start with visit animation
  this.animationIndex = 0; // index for animation progress
  this.animationFrameCounter = 0; // frame counter for animation speed
  this.framesPerStep = this.framesPerStep || DEFAULT_FRAMES_PER_STEP; // frames per step
  this.moveFrameCounter = 0; // frame counter for movement
  this.moveFramesForCurrentCell = 1; // frames needed for current cell movement
}

function updateFoodCounter() {
  const counterElement = document.getElementById("food-counter");
  if (counterElement) {
    counterElement.textContent = this.foodCount || 0;
  }
}