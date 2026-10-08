export const TILES = {
  EMPTY: 0,
  WALL: 1,
  DOOR: 2,
  KEY: 3,
  DIAMOND: 4,
  EXIT: 5,
  ENTRANCE: 6,
  TERMINAL: 7
};

export const PHASES = {
  BRIEFING: 'BRIEFING',
  MEMORIZE: 'MEMORIZE',
  HEIST: 'HEIST',
  RESULT: 'RESULT'
};

export const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

export const DIR_OFFSETS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

export const GAME_CONFIG = {
  LOCAL_VISIBILITY_RADIUS: 1,      // 1-tile Chebyshev / local radius
  FLASH_RADIUS: 3,                 // 3-tile radius during memory flash
  FLASH_DURATION_MS: 1500,         // Flash lasts 1.5 seconds
  MAX_FLASHES: 3,                  // 3 flashes per attempt
  PLAYER_MOVE_COOLDOWN_MS: 150,    // Short grid movement cooldown
  EMP_DURATION_MS: 15000,          // EMP blinds guards for 15s
  SMOKE_DURATION_MS: 4500,         // Smoke cloak lasts 4.5s
  MAX_SMOKE_CHARGES: 2             // 2 tactical smoke cloaks in Level 5
};
