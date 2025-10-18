export const TILE_SIZE = 30; // Tamanho de cada célula do grid
export const GRID_ROWS = 20; // Número de linhas no grid
export const GRID_COLS = 25; // Número de colunas no grid

export const ANIM = {
  NONE: 0,
  VISIT: 1,
  PATH: 2,
  MOVE: 3,
};

export const DEFAULT_FRAMES_PER_STEP = 2;

// Tipos de terreno
export const TERRAIN = {
  areia: "areia", // custo 1
  atoleiro: "atoleiro", // custo 5
  agua: "agua", // custo 10
  obstaculo: "obstaculo",
};
export const TERRAIN_COST = {
  [TERRAIN.areia]: 1,
  [TERRAIN.atoleiro]: 5,
  [TERRAIN.agua]: 10,
  [TERRAIN.obstaculo]: Infinity,
};

export const COLORS = {
  [TERRAIN.areia]: "#DcDCCF",
  [TERRAIN.atoleiro]: "#c36549ff",
  [TERRAIN.agua]: "#299BD5",
  [TERRAIN.obstaculo]: "#424242",
  AGENT: "#FF1D8D", // rosa
  FOOD: "#FFDE21", // amarelo
  SEARCH: "#35f835a8", // verde
  PATH: "#f28eca93", // rosa claro
  FRONTIER: "#015214a2", // verde escuro
};
