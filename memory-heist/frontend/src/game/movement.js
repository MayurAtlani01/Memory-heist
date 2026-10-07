import { TILES, DIR_OFFSETS } from './constants.js';
import { getTile, isInsideGrid } from './mapParser.js';

/**
 * Validates and calculates a player movement step.
 * 
 * @param {Object} state - current game state
 * @param {string} direction - 'UP', 'DOWN', 'LEFT', 'RIGHT'
 * @returns {Object} result of the move attempt
 */
export function attemptPlayerMove(state, direction) {
  const offset = DIR_OFFSETS[direction];
  if (!offset) {
    return { moved: false, reason: 'INVALID_DIRECTION' };
  }

  const newX = state.player.x + offset.x;
  const newY = state.player.y + offset.y;

  // Boundary check
  if (!isInsideGrid(newX, newY, state.level.width, state.level.height)) {
    return { moved: false, reason: 'OUT_OF_BOUNDS', x: state.player.x, y: state.player.y };
  }

  const targetTile = getTile(state.grid, newX, newY);

  // Wall collision
  if (targetTile === TILES.WALL) {
    return { moved: false, reason: 'WALL_COLLISION', x: state.player.x, y: state.player.y };
  }

  // Locked Door collision
  if (targetTile === TILES.DOOR && !state.inventory.hasKey) {
    return {
      moved: false,
      reason: 'LOCKED_DOOR',
      message: 'The vault door is locked. Find the brass key first!',
      x: state.player.x,
      y: state.player.y
    };
  }

  // Position is valid, compute inventory / objective updates
  const updates = {
    moved: true,
    newX,
    newY,
    keyCollected: false,
    doorUnlocked: false,
    diamondCollected: false,
    exitReached: false,
    canExit: false,
    message: null
  };

  // If stepping on Door with key
  if (targetTile === TILES.DOOR && state.inventory.hasKey) {
    updates.doorUnlocked = true;
  }

  // If stepping on Key
  if (targetTile === TILES.KEY) {
    updates.keyCollected = true;
    updates.message = 'Key secured! Vault door unlocked.';
  }

  // If stepping on Diamond
  if (targetTile === TILES.DIAMOND) {
    updates.diamondCollected = true;
    updates.message = 'Diamond stolen! Head to the exit immediately.';
  }

  // If stepping on Exit
  if (targetTile === TILES.EXIT) {
    updates.exitReached = true;
    if (state.inventory.hasDiamond || updates.diamondCollected) {
      updates.canExit = true;
    } else {
      updates.canExit = false;
      updates.message = 'You cannot escape without the diamond!';
    }
  }

  return updates;
}
