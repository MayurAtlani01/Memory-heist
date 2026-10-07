import { describe, it, expect } from 'vitest';
import { isTileVisible, computeVisibilityMask } from '../game/visibility.js';
import { PHASES } from '../game/constants.js';

describe('Memory and Visibility Mechanics', () => {
  const playerPos = { x: 5, y: 5 };

  it('reveals entire board during MEMORIZE phase', () => {
    expect(isTileVisible(0, 0, playerPos, PHASES.MEMORIZE, false)).toBe(true);
    expect(isTileVisible(9, 9, playerPos, PHASES.MEMORIZE, false)).toBe(true);
    expect(isTileVisible(5, 5, playerPos, PHASES.MEMORIZE, false)).toBe(true);
  });

  it('reveals entire board during Practice Mode regardless of phase', () => {
    expect(isTileVisible(0, 0, playerPos, PHASES.HEIST, true)).toBe(true);
    expect(isTileVisible(8, 8, playerPos, PHASES.HEIST, true)).toBe(true);
  });

  it('limits visibility to 1-tile radius during HEIST phase', () => {
    // Current tile (5, 5) is visible
    expect(isTileVisible(5, 5, playerPos, PHASES.HEIST, false)).toBe(true);
    // Adjacent tiles (4, 5), (6, 6), (5, 4) are visible
    expect(isTileVisible(4, 5, playerPos, PHASES.HEIST, false)).toBe(true);
    expect(isTileVisible(6, 6, playerPos, PHASES.HEIST, false)).toBe(true);
    expect(isTileVisible(5, 4, playerPos, PHASES.HEIST, false)).toBe(true);

    // Tiles 2 or more steps away are hidden
    expect(isTileVisible(5, 3, playerPos, PHASES.HEIST, false)).toBe(false);
    expect(isTileVisible(7, 5, playerPos, PHASES.HEIST, false)).toBe(false);
    expect(isTileVisible(1, 1, playerPos, PHASES.HEIST, false)).toBe(false);
  });

  it('re-hides tiles when player moves away (no permanent path reveal)', () => {
    const posA = { x: 5, y: 5 };
    const posB = { x: 2, y: 2 };

    // Tile (5, 5) was visible at posA
    expect(isTileVisible(5, 5, posA, PHASES.HEIST, false)).toBe(true);

    // After moving to posB, (5, 5) is hidden again
    expect(isTileVisible(5, 5, posB, PHASES.HEIST, false)).toBe(false);
  });

  it('reveals tiles up to 3-tile radius during an active Memory Flash', () => {
    const flashState = {
      active: true,
      center: { x: 5, y: 5 }
    };

    // Tile 2 units away is visible under flash
    expect(isTileVisible(5, 7, playerPos, PHASES.HEIST, false, flashState)).toBe(true);
    expect(isTileVisible(3, 5, playerPos, PHASES.HEIST, false, flashState)).toBe(true);

    // Tile 3 units away in straight line is visible
    expect(isTileVisible(5, 8, playerPos, PHASES.HEIST, false, flashState)).toBe(true);

    // Tile 5 units away remains hidden even during flash
    expect(isTileVisible(5, 10, playerPos, PHASES.HEIST, false, flashState)).toBe(false);
    expect(isTileVisible(0, 0, playerPos, PHASES.HEIST, false, flashState)).toBe(false);
  });

  it('computes complete 2D visibility mask', () => {
    const mask = computeVisibilityMask(10, 10, playerPos, PHASES.HEIST, false, null);
    expect(mask.length).toBe(10);
    expect(mask[0].length).toBe(10);
    // (5, 5) is visible
    expect(mask[5][5]).toBe(true);
    // (0, 0) is hidden
    expect(mask[0][0]).toBe(false);
  });
});
