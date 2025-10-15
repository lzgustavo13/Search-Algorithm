export const TILE_SIZE = 30; // Tamanho de cada célula do grid
export const GRID_ROWS = 20; // Número de linhas no grid
export const GRID_COLS = 30;

// Tipos de terreno
export const TERRAIN = {
  areia: "areia",        // custo 1
  atoleiro: "atoleiro",  // custo 5
  agua: "agua",      // custo 10
  obstaculo: "obstaculo"
};
export const TERRAIN_COST = {
  [TERRAIN.areia]: 1,
  [TERRAIN.atoleiro]: 5,
  [TERRAIN.agua]: 10,
  [TERRAIN.obstaculo]: Infinity
};

export const COLORS = {
  [TERRAIN.areia]: '#DCDCCF',
  [TERRAIN.atoleiro]: '#AD6853',
  [TERRAIN.agua]: '#299BD5',
  [TERRAIN.obstaculo]: '#424242',
  AGENT: '#FF00FF', // rosa
  FOOD: '#800080', // roxo
};