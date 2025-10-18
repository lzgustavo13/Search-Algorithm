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

  this.map = new Map(GRID_ROWS, GRID_COLS);
  const agentPos = this.map.placeCharacter();
  this.agent = new Character(agentPos.x, agentPos.y);

  do {
    const foodPos = this.map.placeCharacter();
    this.food = new Character(foodPos.x, foodPos.y);
  } while (this.food.x === this.agent.x && this.food.y === this.agent.y);

  const startButton = document.getElementById("start-search-btn");
  startButton.addEventListener("click", startSearch.bind(this));
};

function startSearch() {
  const selectedAlgorithm = document.getElementById("algorithm-select").value;

  this.isAnimating = false;
  this.path = [];
  this.visitedOrder = [];
  this.currentPathIndex = 0;
  this.animationStep = ANIM.NONE;

  this.search = new Search(this.agent, this.map.grid, this.food);

  if (selectedAlgorithm === "bfs") {
    const { visitedOrder, path } = this.search.bfs();
    console.log("Visited Order:", visitedOrder);
    console.log("Path:", path);

    this.path = path;
    this.visitedOrder = visitedOrder;

    this.animationStep = ANIM.VISIT; // start with search animation
    this.animationIndex = 0; // index into visitedOrder
    this.animationFrameCounter = 0; // frame counter to control speed
    this.framesPerStep = DEFAULT_FRAMES_PER_STEP; // speed of the animation
  }
  if (selectedAlgorithm === "dfs") {
  }
  if (selectedAlgorithm === "aStar") {
  }
  if (selectedAlgorithm === "greedyBestFirst") {
  }
  if (selectedAlgorithm === "uniformCostSearch") {
  }
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
      let newPos;
      let newPath = [];
      let newVisited = [];
      let attempts = 0;

      // spawn a new food
      do {
        newPos = this.map.placeCharacter();
        this.food = new Character(newPos.x, newPos.y);
        this.search = new Search(this.agent, this.map.grid, this.food);

        const res = this.search.bfs();
        newVisited = res.visitedOrder || [];
        newPath = res.path || [];
        attempts++;
      } while (
        (newPath.length === 0 ||
          (this.food.x === this.agent.x && this.food.y === this.agent.y)) &&
        attempts < 10
      );

      // prepare animation to reveal newVisited then newPath
      this.visitedOrder = newVisited;
      this.path = newPath;
      this.animationStep = ANIM.VISIT;
      this.animationIndex = 0;
      this.animationFrameCounter = 0;
      this.framesPerStep = this.framesPerStep || DEFAULT_FRAMES_PER_STEP;

      // reset movement counters
      this.moveFrameCounter = 0;
      this.moveFramesForCurrentCell = 1;

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
