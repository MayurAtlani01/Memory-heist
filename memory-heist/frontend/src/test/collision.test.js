import { describe, it, expect } from 'vitest';
import { attemptPlayerMove } from '../game/movement.js';
import { parseLevel } from '../game/mapParser.js';
import { DEFAULT_MAPS } from '../data/defaultMaps.js';
import { TILES } from '../game/constants.js';

describe('Player Movement and Collision Logic', () => {
  const level1 = parseLevel(DEFAULT_MAPS[0]);

  const createInitialState = () => ({
    level: level1,
    grid: level1.grid.map((r) => [...r]),
    player: { x: level1.entrance.x, y: level1.entrance.y },
    inventory: { hasKey: false, hasDiamond: false }
  });

  it('blocks movement into walls without altering coordinates', () => {
    const state = createInitialState();
    // Entrance is at (1, 1). To the left is (0, 1) which is a WALL.
    const result = attemptPlayerMove(state, 'LEFT');
    expect(result.moved).toBe(false);
    expect(result.reason).toBe('WALL_COLLISION');
    expect(result.x).toBe(1);
    expect(result.y).toBe(1);
  });

  it('allows movement into open walkable floor tiles', () => {
    const state = createInitialState();
    // In Level 1, (1, 2) is open floor
    const result = attemptPlayerMove(state, 'DOWN');
    expect(result.moved).toBe(true);
    expect(result.newX).toBe(1);
    expect(result.newY).toBe(2);
  });

  it('blocks entry into locked vault door when key is not collected', () => {
    const state = createInitialState();
    // Position player right next to door at (4, 2), door is at (5, 2)
    state.player = { x: 4, y: 2 };
    state.inventory.hasKey = false;

    const result = attemptPlayerMove(state, 'RIGHT');
    expect(result.moved).toBe(false);
    expect(result.reason).toBe('LOCKED_DOOR');
    expect(result.message).toContain('brass key');
  });

  it('allows entry through vault door when key is collected', () => {
    const state = createInitialState();
    state.player = { x: 4, y: 2 };
    state.inventory.hasKey = true;

    const result = attemptPlayerMove(state, 'RIGHT');
    expect(result.moved).toBe(true);
    expect(result.newX).toBe(5);
    expect(result.newY).toBe(2);
    expect(result.doorUnlocked).toBe(true);
  });

  it('detects key pickup when stepping on key tile', () => {
    const state = createInitialState();
    state.player = { x: 2, y: 6 }; // Key is at (2, 7)

    const result = attemptPlayerMove(state, 'DOWN');
    expect(result.moved).toBe(true);
    expect(result.keyCollected).toBe(true);
    expect(result.message).toContain('Key secured');
  });

  it('detects diamond pickup when stepping on diamond tile', () => {
    const state = createInitialState();
    state.player = { x: 6, y: 2 }; // Diamond is at (7, 2)

    const result = attemptPlayerMove(state, 'RIGHT');
    expect(result.moved).toBe(true);
    expect(result.diamondCollected).toBe(true);
    expect(result.message).toContain('Diamond stolen');
  });

  it('disallows escaping through exit without the diamond', () => {
    const state = createInitialState();
    state.player = { x: 8, y: 7 }; // Exit is at (8, 8)
    state.inventory.hasDiamond = false;

    const result = attemptPlayerMove(state, 'DOWN');
    expect(result.moved).toBe(true);
    expect(result.exitReached).toBe(true);
    expect(result.canExit).toBe(false);
    expect(result.message).toContain('cannot escape without the diamond');
  });

  it('allows escaping and wins when diamond is collected', () => {
    const state = createInitialState();
    state.player = { x: 8, y: 7 }; // Exit is at (8, 8)
    state.inventory.hasDiamond = true;

    const result = attemptPlayerMove(state, 'DOWN');
    expect(result.moved).toBe(true);
    expect(result.exitReached).toBe(true);
    expect(result.canExit).toBe(true);
  });
});
