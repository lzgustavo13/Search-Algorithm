import { TILE_SIZE, GRID_ROWS, GRID_COLS, TERRAIN } from './config/settings.js';
import { drawGrid, drawAgent, drawFood, drawSearchVisualization } from './config/drawing.js';
import { bfs } from './config/search.js';

let grid; 
let agent;
let food;

let path = [];
let visitedOrder = [];
let currentPathIndex = 0;
let isAnimating = false;
let animationStep = 0; 

window.setup = function() {
  createCanvas(GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);
  frameRate(20);

  grid = generateRandomMap(); 
  agent = placeCharacter(grid);
   do {
    food = placeCharacter(grid);
  } while (food.x === agent.x && food.y === agent.y); 

  const startButton = document.getElementById('start-search-btn');
  startButton.addEventListener('click', startSearch);
}

function startSearch() {
  const selectedAlgorithm = document.getElementById('algorithm-select').value;

  isAnimating = false;
  path = [];
  visitedOrder = [];
  currentPathIndex = 0;
  animationStep = 0;

  if (selectedAlgorithm === 'bfs') {
  }
  if (selectedAlgorithm === 'dfs') {
  }
  if (selectedAlgorithm === 'aStar') {
  }
  if (selectedAlgorithm === 'greedyBestFirst') {
  }
  if (selectedAlgorithm === 'uniformCostSearch') {
  }
}

window.draw = function() {
  background(220); 
  drawGrid(grid);
  drawFood(food);
  drawAgent(agent);
}

function generateRandomMap() {
  let newGrid = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    let row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      let terrainType = getRandomTerrain();
      row.push({
        x: x,
        y: y,
        type: terrainType,
        isObstacle: terrainType === TERRAIN.obstaculo
      });
    }
    newGrid.push(row);
  }
  return newGrid;
}

function getRandomTerrain() {
    const rand = Math.random();
    if (rand < 0.15) return TERRAIN.obstaculo;
    if (rand < 0.35) return TERRAIN.agua;
    if (rand < 0.60) return TERRAIN.atoleiro;
    return TERRAIN.areia; 
}

function placeCharacter(grid) {
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_COLS);
        y = Math.floor(Math.random() * GRID_ROWS);
    } while (grid[y][x].isObstacle);
    return { x, y };
}

// falta animar quando tiver o path e o visitedOrder
// falta implementar logica de seleção dos algoritmos de busca

window.generateRandomMap = generateRandomMap;
window.placeCharacter = placeCharacter;