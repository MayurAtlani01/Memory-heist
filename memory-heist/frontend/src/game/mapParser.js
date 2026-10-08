import { TILES } from './constants.js';

/**
 * Deep clones and parses level data for a game session.
 * Ensures the runtime state has its own mutable grid.
 */
export function parseLevel(rawLevel) {
  if (!rawLevel) {
    throw new Error('Level data is missing or invalid');
  }

  const width = rawLevel.width;
  const height = rawLevel.height;

  // Clone 2D grid
  const grid = rawLevel.grid.map((row) => [...row]);

  // Clone positions
  const entrance = { ...rawLevel.entrance };
  const key = rawLevel.key ? { ...rawLevel.key } : null;
  let door = rawLevel.door ? { ...rawLevel.door } : null;
  const diamond = rawLevel.diamond ? { ...rawLevel.diamond } : null;
  const exit = rawLevel.exit ? { ...rawLevel.exit } : null;

  // Auto-detect door from grid if not specified
  if (!door) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === TILES.DOOR) {
          door = { x, y };
          break;
        }
      }
      if (door) break;
    }
  }

  // Clone guards with runtime state
  const guards = (rawLevel.guards || []).map((g) => ({
    id: g.id,
    patrolPath: g.patrolPath.map((p) => ({ ...p })),
    moveIntervalMs: g.moveIntervalMs || 700,
    initialFacing: g.initialFacing || 'DOWN',
    visionRange: g.visionRange || 3,
    // Runtime properties
    currentWaypointIndex: 0,
    x: g.patrolPath[0].x,
    y: g.patrolPath[0].y,
    facing: g.initialFacing || 'DOWN',
    lastMoveTime: 0
  }));

  return {
    id: rawLevel.id,
    levelNumber: rawLevel.levelNumber,
    name: rawLevel.name,
    description: rawLevel.description,
    difficulty: rawLevel.difficulty,
    width,
    height,
    memorizeTimeSeconds: rawLevel.memorizeTimeSeconds || 10,
    timeLimitSeconds: rawLevel.timeLimitSeconds || 60,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

export function isInsideGrid(x, y, width, height) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function getTile(grid, x, y) {
  if (!grid || y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
    return TILES.WALL;
  }
  return grid[y][x];
}

export function isWalkable(grid, x, y, hasKey = false) {
  const tile = getTile(grid, x, y);
  if (tile === TILES.WALL) return false;
  if (tile === TILES.DOOR && !hasKey) return false;
  return true;
}
