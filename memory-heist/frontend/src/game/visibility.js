import { PHASES, GAME_CONFIG } from './constants.js';

/**
 * Checks if a specific tile is currently visible to the player.
 * 
 * Visibility rules:
 * - MEMORIZE phase: entire board is visible.
 * - Practice mode: entire board is visible.
 * - HEIST phase:
 *   - Player's 1-tile local radius (|dx| <= 1 and |dy| <= 1).
 *   - Any active Memory Flash within a 3-tile radius from the flash center.
 *   - Everything else is strictly hidden (re-obscured even if previously visited).
 */
export function isTileVisible(x, y, playerPos, phase, isPractice = false, flashState = null) {
  if (isPractice || phase === PHASES.MEMORIZE) {
    return true;
  }

  if (phase !== PHASES.HEIST) {
    return false;
  }

  // 1-tile local radius around the player
  const dxPlayer = Math.abs(x - playerPos.x);
  const dyPlayer = Math.abs(y - playerPos.y);
  if (dxPlayer <= GAME_CONFIG.LOCAL_VISIBILITY_RADIUS && dyPlayer <= GAME_CONFIG.LOCAL_VISIBILITY_RADIUS) {
    return true;
  }

  // Active memory flash check (3-tile circular radius)
  if (flashState && flashState.active && flashState.center) {
    const dxFlash = x - flashState.center.x;
    const dyFlash = y - flashState.center.y;
    const distSq = dxFlash * dxFlash + dyFlash * dyFlash;
    const maxDist = GAME_CONFIG.FLASH_RADIUS;
    if (distSq <= maxDist * maxDist + 0.25) {
      return true;
    }
  }

  return false;
}

/**
 * Computes a 2D visibility mask for the entire grid.
 * Used by the canvas renderer to determine what to draw.
 */
export function computeVisibilityMask(width, height, playerPos, phase, isPractice = false, flashState = null) {
  const mask = [];
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    for (let x = 0; x < width; x++) {
      row[x] = isTileVisible(x, y, playerPos, phase, isPractice, flashState);
    }
    mask.push(row);
  }
  return mask;
}
