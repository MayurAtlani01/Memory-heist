import { describe, it, expect } from 'vitest';
import { stepGuard, getGuardVisionTiles, checkDetection, getFacingDirection } from '../game/guardPatrol.js';
import { TILES } from '../game/constants.js';

describe('Guard Patrol and Detection Mechanics', () => {
  const createMockGrid = () => {
    // 8x8 empty grid surrounded by walls
    const grid = [];
    for (let y = 0; y < 8; y++) {
      grid.push(new Array(8).fill(TILES.EMPTY));
    }
    return grid;
  };

  it('calculates guard facing direction based on movement vector', () => {
    expect(getFacingDirection(2, 2, 3, 2)).toBe('RIGHT');
    expect(getFacingDirection(3, 2, 2, 2)).toBe('LEFT');
    expect(getFacingDirection(2, 2, 2, 3)).toBe('DOWN');
    expect(getFacingDirection(2, 3, 2, 2)).toBe('UP');
  });

  it('steps guard sequentially through patrol route', () => {
    const guard = {
      id: 'g1',
      patrolPath: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }],
      currentWaypointIndex: 0,
      x: 2,
      y: 2,
      facing: 'DOWN',
      visionRange: 3
    };

    const step1 = stepGuard(guard);
    expect(step1.x).toBe(3);
    expect(step1.y).toBe(2);
    expect(step1.facing).toBe('RIGHT');
    expect(step1.currentWaypointIndex).toBe(1);

    const step2 = stepGuard(step1);
    expect(step2.x).toBe(4);
    expect(step2.y).toBe(2);
    expect(step2.facing).toBe('RIGHT');
    expect(step2.currentWaypointIndex).toBe(2);

    // Loop back to start
    const step3 = stepGuard(step2);
    expect(step3.x).toBe(2);
    expect(step3.y).toBe(2);
    expect(step3.facing).toBe('LEFT');
    expect(step3.currentWaypointIndex).toBe(0);
  });

  it('detects player standing directly in guard line of sight', () => {
    const grid = createMockGrid();
    const guard = {
      id: 'g1',
      x: 2,
      y: 2,
      facing: 'RIGHT',
      visionRange: 3
    };

    // Player at (4, 2) is 2 tiles ahead in guard's facing direction
    const result = checkDetection([guard], { x: 4, y: 2 }, grid, false, 8, 8);
    expect(result.detected).toBe(true);
    expect(result.reason).toBe('LINE_OF_SIGHT');
    expect(result.guardId).toBe('g1');
  });

  it('does NOT detect player standing outside guard field of view', () => {
    const grid = createMockGrid();
    const guard = {
      id: 'g1',
      x: 2,
      y: 2,
      facing: 'RIGHT',
      visionRange: 3
    };

    // Player behind guard at (1, 2)
    const behindResult = checkDetection([guard], { x: 1, y: 2 }, grid, false, 8, 8);
    expect(behindResult.detected).toBe(false);

    // Player perpendicular to guard at (2, 4)
    const sideResult = checkDetection([guard], { x: 2, y: 4 }, grid, false, 8, 8);
    expect(sideResult.detected).toBe(false);
  });

  it('blocks guard vision when interrupted by a wall', () => {
    const grid = createMockGrid();
    const guard = {
      id: 'g1',
      x: 2,
      y: 2,
      facing: 'RIGHT',
      visionRange: 4
    };

    // Place a wall between guard (2, 2) and player (5, 2)
    grid[2][3] = TILES.WALL;

    const visionTiles = getGuardVisionTiles(guard, grid, false, 8, 8);
    expect(visionTiles.length).toBe(0); // Raycast stops before wall

    const result = checkDetection([guard], { x: 5, y: 2 }, grid, false, 8, 8);
    expect(result.detected).toBe(false);
  });

  it('blocks guard vision when interrupted by a locked door, but opens when unlocked', () => {
    const grid = createMockGrid();
    const guard = {
      id: 'g1',
      x: 2,
      y: 2,
      facing: 'DOWN',
      visionRange: 3
    };

    // Locked door at (2, 3), player at (2, 4)
    grid[3][2] = TILES.DOOR;

    // Door locked: vision blocked
    const lockedResult = checkDetection([guard], { x: 2, y: 4 }, grid, false, 8, 8);
    expect(lockedResult.detected).toBe(false);

    // Door unlocked: guard can see through
    const unlockedResult = checkDetection([guard], { x: 2, y: 4 }, grid, true, 8, 8);
    expect(unlockedResult.detected).toBe(true);
  });

  it('detects player on exact tile collision', () => {
    const grid = createMockGrid();
    const guard = {
      id: 'g1',
      x: 3,
      y: 3,
      facing: 'UP',
      visionRange: 3
    };

    const collisionResult = checkDetection([guard], { x: 3, y: 3 }, grid, false, 8, 8);
    expect(collisionResult.detected).toBe(true);
    expect(collisionResult.reason).toBe('GUARD_COLLISION');
  });
});
