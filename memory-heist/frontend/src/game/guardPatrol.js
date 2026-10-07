import { TILES, DIR_OFFSETS } from './constants.js';
import { getTile, isInsideGrid } from './mapParser.js';

/**
 * Calculates facing direction from (x1, y1) to (x2, y2).
 */
export function getFacingDirection(x1, y1, x2, y2, currentFacing = 'DOWN') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx > 0) return 'RIGHT';
  if (dx < 0) return 'LEFT';
  if (dy > 0) return 'DOWN';
  if (dy < 0) return 'UP';
  return currentFacing;
}

/**
 * Advances a guard one step along its predefined patrol route.
 */
export function stepGuard(guard) {
  if (!guard.patrolPath || guard.patrolPath.length <= 1) {
    return guard;
  }

  const nextIndex = (guard.currentWaypointIndex + 1) % guard.patrolPath.length;
  const nextTarget = guard.patrolPath[nextIndex];

  const facing = getFacingDirection(guard.x, guard.y, nextTarget.x, nextTarget.y, guard.facing);

  return {
    ...guard,
    x: nextTarget.x,
    y: nextTarget.y,
    facing,
    currentWaypointIndex: nextIndex
  };
}

/**
 * Computes straight-line tiles visible by the guard.
 * Sight is blocked by walls and locked doors.
 */
export function getGuardVisionTiles(guard, grid, doorUnlocked = false, width, height) {
  const visionTiles = [];
  const offset = DIR_OFFSETS[guard.facing];
  if (!offset) return visionTiles;

  const maxRange = guard.visionRange || 3;

  for (let dist = 1; dist <= maxRange; dist++) {
    const vx = guard.x + offset.x * dist;
    const vy = guard.y + offset.y * dist;

    if (!isInsideGrid(vx, vy, width, height)) {
      break;
    }

    const tile = getTile(grid, vx, vy);

    // Wall blocks sight
    if (tile === TILES.WALL) {
      break;
    }

    // Locked door blocks sight
    if (tile === TILES.DOOR && !doorUnlocked) {
      break;
    }

    visionTiles.push({ x: vx, y: vy });
  }

  return visionTiles;
}

/**
 * Checks if the player has been spotted by any guard or stepped onto a guard.
 * Returns detection info if caught.
 */
export function checkDetection(guards, playerPos, grid, doorUnlocked = false, width, height) {
  for (const guard of guards) {
    // 1. Occupying the same tile as a guard
    if (guard.x === playerPos.x && guard.y === playerPos.y) {
      return {
        detected: true,
        guardId: guard.id,
        guardPos: { x: guard.x, y: guard.y },
        playerPos: { ...playerPos },
        reason: 'GUARD_COLLISION'
      };
    }

    // 2. In guard's visible line of sight
    const visionTiles = getGuardVisionTiles(guard, grid, doorUnlocked, width, height);
    for (const vTile of visionTiles) {
      if (vTile.x === playerPos.x && vTile.y === playerPos.y) {
        return {
          detected: true,
          guardId: guard.id,
          guardPos: { x: guard.x, y: guard.y },
          playerPos: { ...playerPos },
          detectionTile: vTile,
          reason: 'LINE_OF_SIGHT'
        };
      }
    }
  }

  return { detected: false };
}
