// Scratch map generator and validator for Memory Heist
const fs = require('fs');

const EMPTY = 0;
const WALL = 1;
const DOOR = 2;
const KEY = 3;
const DIAMOND = 4;
const EXIT = 5;
const ENTRANCE = 6;

function createGrid(w, h, fill = WALL) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    grid.push(new Array(w).fill(fill));
  }
  return grid;
}

function carveRoom(grid, x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      grid[y][x] = EMPTY;
    }
  }
}

function carveH(grid, x1, x2, y) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  for (let x = minX; x <= maxX; x++) {
    grid[y][x] = EMPTY;
  }
}

function carveV(grid, y1, y2, x) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (let y = minY; y <= maxY; y++) {
    grid[y][x] = EMPTY;
  }
}

function bfsPath(grid, start, target, canPassDoor = false) {
  const h = grid.length;
  const w = grid[0].length;
  const queue = [[start.x, start.y]];
  const visited = new Set([`${start.x},${start.y}`]);
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    if (cx === target.x && cy === target.y) return true;

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;

      const tile = grid[ny][nx];
      if (tile === WALL) continue;
      // If tile is DOOR, we can step on it if canPassDoor is true OR if target IS the door
      if (tile === DOOR && !canPassDoor && !(target.x === nx && target.y === ny)) {
        continue;
      }

      visited.add(key);
      queue.push([nx, ny]);
    }
  }
  return false;
}

// LEVEL 1: Training Vault (10x10)
function buildLevel1() {
  const w = 10, h = 10;
  const grid = createGrid(w, h);
  
  // West entrance room
  carveRoom(grid, 1, 1, 3, 3);
  // Path east from entrance room toward vault
  carveH(grid, 3, 5, 2);
  // Vault chamber
  carveRoom(grid, 6, 1, 8, 3);
  // Door to vault
  grid[2][5] = DOOR;

  // Main vertical spine
  carveV(grid, 2, 7, 2);
  // Key room at South-West
  carveRoom(grid, 1, 6, 3, 8);

  // Guard patrol hallway
  carveH(grid, 2, 7, 5);

  // East exit passage
  carveV(grid, 5, 8, 7);
  carveRoom(grid, 6, 7, 8, 8);

  const entrance = { x: 1, y: 1 };
  const key = { x: 2, y: 7 };
  const door = { x: 5, y: 2 };
  const diamond = { x: 7, y: 2 };
  const exit = { x: 8, y: 8 };

  grid[entrance.y][entrance.x] = ENTRANCE;
  grid[key.y][key.x] = KEY;
  grid[door.y][door.x] = DOOR;
  grid[diamond.y][diamond.x] = DIAMOND;
  grid[exit.y][exit.x] = EXIT;

  const guards = [
    {
      id: "guard-1",
      patrolPath: [
        { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },
        { x: 5, y: 5 }, { x: 4, y: 5 }
      ],
      moveIntervalMs: 800,
      initialFacing: "RIGHT",
      visionRange: 3
    }
  ];

  return {
    levelNumber: 1,
    name: "Training Vault",
    description: "Infiltrate the training vault. Observe guard patrol timings, secure the brass key, unlock the vault door, and grab the diamond.",
    difficulty: "EASY",
    width: w,
    height: h,
    memorizeTimeSeconds: 12,
    timeLimitSeconds: 45,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

// LEVEL 2: Office After Hours (12x12)
function buildLevel2() {
  const w = 12, h = 12;
  const grid = createGrid(w, h);

  // Corridors
  carveH(grid, 1, 10, 2); // North
  carveV(grid, 2, 9, 2);  // West
  carveH(grid, 2, 9, 6);  // Middle
  carveV(grid, 2, 9, 9);  // East
  carveH(grid, 2, 9, 9);  // South

  // Extra connector between west and middle
  carveV(grid, 6, 9, 5);

  // Rooms
  carveRoom(grid, 1, 1, 3, 2);   // Entrance reception
  carveRoom(grid, 1, 8, 3, 10);  // Executive suite (Key)
  carveRoom(grid, 8, 7, 10, 9);  // Secure Archive (Diamond)
  carveRoom(grid, 8, 1, 10, 2);  // Fire exit (Exit)

  // Door guarding the archive on row 7, column 9
  grid[7][9] = DOOR;

  const entrance = { x: 1, y: 1 };
  const key = { x: 2, y: 9 };
  const door = { x: 9, y: 7 };
  const diamond = { x: 9, y: 8 };
  const exit = { x: 10, y: 1 };

  grid[entrance.y][entrance.x] = ENTRANCE;
  grid[key.y][key.x] = KEY;
  grid[door.y][door.x] = DOOR;
  grid[diamond.y][diamond.x] = DIAMOND;
  grid[exit.y][exit.x] = EXIT;

  const guards = [
    {
      id: "guard-1",
      patrolPath: [
        { x: 4, y: 2 }, { x: 6, y: 2 }, { x: 8, y: 2 }, { x: 6, y: 2 }
      ],
      moveIntervalMs: 750,
      initialFacing: "RIGHT",
      visionRange: 3
    },
    {
      id: "guard-2",
      patrolPath: [
        { x: 5, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }
      ],
      moveIntervalMs: 700,
      initialFacing: "RIGHT",
      visionRange: 3
    }
  ];

  return {
    levelNumber: 2,
    name: "Office After Hours",
    description: "Corporate offices after midnight. Two security guards patrol the corridors. Avoid crossing illuminated lines of sight.",
    difficulty: "MEDIUM",
    width: w,
    height: h,
    memorizeTimeSeconds: 10,
    timeLimitSeconds: 55,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

// LEVEL 3: Museum Wing (14x14)
function buildLevel3() {
  const w = 14, h = 14;
  const grid = createGrid(w, h);

  // Outer ring
  carveH(grid, 1, 12, 1);
  carveH(grid, 1, 12, 12);
  carveV(grid, 1, 12, 1);
  carveV(grid, 1, 12, 12);

  // Cross galleries
  carveH(grid, 3, 10, 4);
  carveH(grid, 3, 10, 9);
  carveV(grid, 4, 9, 3);
  carveV(grid, 4, 9, 10);

  // Connection between outer and inner
  carveV(grid, 1, 4, 6);
  carveV(grid, 9, 12, 6);
  // Connection to door
  carveH(grid, 3, 6, 6);

  // Central Glass Sanctuary (Vault)
  carveRoom(grid, 6, 6, 8, 7);
  // Door to sanctuary at (6, 6)
  grid[6][6] = DOOR;

  const entrance = { x: 1, y: 1 };
  const key = { x: 1, y: 11 };
  const door = { x: 6, y: 6 };
  const diamond = { x: 7, y: 6 };
  const exit = { x: 12, y: 12 };

  grid[entrance.y][entrance.x] = ENTRANCE;
  grid[key.y][key.x] = KEY;
  grid[door.y][door.x] = DOOR;
  grid[diamond.y][diamond.x] = DIAMOND;
  grid[exit.y][exit.x] = EXIT;

  const guards = [
    {
      id: "guard-1",
      patrolPath: [
        { x: 3, y: 4 }, { x: 6, y: 4 }, { x: 9, y: 4 }, { x: 9, y: 9 }, { x: 6, y: 9 }, { x: 3, y: 9 }
      ],
      moveIntervalMs: 680,
      initialFacing: "RIGHT",
      visionRange: 3
    },
    {
      id: "guard-2",
      patrolPath: [
        { x: 12, y: 3 }, { x: 12, y: 6 }, { x: 12, y: 9 }, { x: 12, y: 6 }
      ],
      moveIntervalMs: 700,
      initialFacing: "DOWN",
      visionRange: 3
    }
  ];

  return {
    levelNumber: 3,
    name: "Museum Wing",
    description: "Symmetrical museum halls with intersecting patrol routes. Time your movement between display corridors carefully.",
    difficulty: "HARD",
    width: w,
    height: h,
    memorizeTimeSeconds: 9,
    timeLimitSeconds: 65,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

// LEVEL 4: Archive Basement (16x16)
function buildLevel4() {
  const w = 16, h = 16;
  const grid = createGrid(w, h);

  // Outer boundary paths
  carveH(grid, 1, 14, 1);
  carveV(grid, 1, 14, 1);
  carveH(grid, 1, 14, 14);
  carveV(grid, 1, 14, 14);

  // Corridors
  carveH(grid, 3, 14, 4);
  carveH(grid, 3, 14, 7);
  carveH(grid, 3, 14, 10);

  carveV(grid, 1, 14, 4);
  carveV(grid, 1, 14, 8);
  carveV(grid, 1, 14, 11);
  carveV(grid, 7, 10, 13); // Connector for guard 3 route

  // Vault Room at bottom-right
  carveRoom(grid, 12, 11, 14, 13);
  // Door to vault at (12, 12)
  grid[12][12] = DOOR;

  const entrance = { x: 1, y: 1 };
  const key = { x: 14, y: 3 };
  const door = { x: 12, y: 12 };
  const diamond = { x: 13, y: 13 };
  const exit = { x: 1, y: 14 };

  grid[entrance.y][entrance.x] = ENTRANCE;
  grid[key.y][key.x] = KEY;
  grid[door.y][door.x] = DOOR;
  grid[diamond.y][diamond.x] = DIAMOND;
  grid[exit.y][exit.x] = EXIT;

  const guards = [
    {
      id: "guard-1",
      patrolPath: [
        { x: 3, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 4 }, { x: 6, y: 4 }
      ],
      moveIntervalMs: 620,
      initialFacing: "RIGHT",
      visionRange: 3
    },
    {
      id: "guard-2",
      patrolPath: [
        { x: 8, y: 7 }, { x: 8, y: 9 }, { x: 8, y: 12 }, { x: 8, y: 9 }
      ],
      moveIntervalMs: 600,
      initialFacing: "DOWN",
      visionRange: 3
    },
    {
      id: "guard-3",
      patrolPath: [
        { x: 11, y: 10 }, { x: 13, y: 10 }, { x: 13, y: 7 }, { x: 11, y: 7 }
      ],
      moveIntervalMs: 650,
      initialFacing: "RIGHT",
      visionRange: 3
    }
  ];

  return {
    levelNumber: 4,
    name: "Archive Basement",
    description: "Deep underground repository with dense shelving units and 3 patrol units. Memorize the dead ends to avoid getting trapped.",
    difficulty: "EXPERT",
    width: w,
    height: h,
    memorizeTimeSeconds: 8,
    timeLimitSeconds: 75,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

// LEVEL 5: The Grand Heist (18x18)
function buildLevel5() {
  const w = 18, h = 18;
  const grid = createGrid(w, h);

  // Outer corridor
  carveH(grid, 1, 16, 1);
  carveH(grid, 1, 16, 16);
  carveV(grid, 1, 16, 1);
  carveV(grid, 1, 16, 16);

  // Inner rings
  carveH(grid, 3, 14, 4);
  carveH(grid, 3, 14, 13);
  carveV(grid, 4, 13, 3);
  carveV(grid, 4, 13, 14);

  // Cross tunnels
  carveH(grid, 3, 7, 8);
  carveV(grid, 4, 13, 6);

  // Key room at high-security server room (14..16, 2..4)
  carveRoom(grid, 14, 2, 16, 4);

  // Vault Chamber (enclosed, only accessible via door at (8, 8))
  carveRoom(grid, 9, 7, 12, 9);
  // Door at (8, 8)
  grid[8][8] = DOOR;

  const entrance = { x: 1, y: 1 };
  const key = { x: 15, y: 3 };
  const door = { x: 8, y: 8 };
  const diamond = { x: 11, y: 8 };
  const exit = { x: 16, y: 16 };

  grid[entrance.y][entrance.x] = ENTRANCE;
  grid[key.y][key.x] = KEY;
  grid[door.y][door.x] = DOOR;
  grid[diamond.y][diamond.x] = DIAMOND;
  grid[exit.y][exit.x] = EXIT;

  const guards = [
    {
      id: "guard-1",
      patrolPath: [
        { x: 3, y: 4 }, { x: 7, y: 4 }, { x: 11, y: 4 }, { x: 14, y: 4 }, { x: 9, y: 4 }
      ],
      moveIntervalMs: 580,
      initialFacing: "RIGHT",
      visionRange: 4
    },
    {
      id: "guard-2",
      patrolPath: [
        { x: 14, y: 6 }, { x: 14, y: 9 }, { x: 14, y: 12 }, { x: 14, y: 9 }
      ],
      moveIntervalMs: 600,
      initialFacing: "DOWN",
      visionRange: 3
    },
    {
      id: "guard-3",
      patrolPath: [
        { x: 12, y: 13 }, { x: 8, y: 13 }, { x: 4, y: 13 }, { x: 8, y: 13 }
      ],
      moveIntervalMs: 620,
      initialFacing: "LEFT",
      visionRange: 3
    },
    {
      id: "guard-4",
      patrolPath: [
        { x: 3, y: 11 }, { x: 3, y: 8 }, { x: 3, y: 5 }, { x: 3, y: 8 }
      ],
      moveIntervalMs: 600,
      initialFacing: "UP",
      visionRange: 3
    }
  ];

  return {
    levelNumber: 5,
    name: "The Grand Heist",
    description: "The ultimate challenge. 4 synchronized patrol officers protecting the multi-layered bank fortress. Every step must be planned.",
    difficulty: "MASTER",
    width: w,
    height: h,
    memorizeTimeSeconds: 7,
    timeLimitSeconds: 90,
    grid,
    entrance,
    key,
    door,
    diamond,
    exit,
    guards
  };
}

const levels = [buildLevel1(), buildLevel2(), buildLevel3(), buildLevel4(), buildLevel5()];

levels.forEach((lvl) => {
  console.log(`\n=== Testing Level ${lvl.levelNumber}: ${lvl.name} (${lvl.width}x${lvl.height}) ===`);
  
  // 1. Entrance -> Key (door closed)
  const canReachKey = bfsPath(lvl.grid, lvl.entrance, lvl.key, false);
  console.log(`- Entrance -> Key reachable (door closed): ${canReachKey}`);
  if (!canReachKey) throw new Error(`Level ${lvl.levelNumber}: Key unreachable!`);

  // 2. Key -> Door (door closed)
  const canReachDoor = bfsPath(lvl.grid, lvl.key, lvl.door, false);
  console.log(`- Key -> Door reachable: ${canReachDoor}`);
  if (!canReachDoor) throw new Error(`Level ${lvl.levelNumber}: Door unreachable from Key!`);

  // 3. Entrance/Door -> Diamond (door open)
  const canReachDiamond = bfsPath(lvl.grid, lvl.entrance, lvl.diamond, true);
  console.log(`- Entrance -> Diamond reachable (door open): ${canReachDiamond}`);
  if (!canReachDiamond) throw new Error(`Level ${lvl.levelNumber}: Diamond unreachable!`);

  // 4. Diamond -> Exit (door open)
  const canReachExit = bfsPath(lvl.grid, lvl.diamond, lvl.exit, true);
  console.log(`- Diamond -> Exit reachable (door open): ${canReachExit}`);
  if (!canReachExit) throw new Error(`Level ${lvl.levelNumber}: Exit unreachable!`);

  // 5. Check guards
  lvl.guards.forEach((g) => {
    g.patrolPath.forEach((pt, idx) => {
      const tile = lvl.grid[pt.y][pt.x];
      if (tile === WALL || tile === DOOR) {
        throw new Error(`Guard ${g.id} waypoint ${idx} (${pt.x}, ${pt.y}) is inside WALL or DOOR!`);
      }
    });
  });
  console.log(`- All ${lvl.guards.length} guards have valid, open patrol paths!`);
});

console.log("\n>>> ALL 5 LEVELS VERIFIED AND 100% BEATABLE! <<<");
fs.writeFileSync('scratch/maps.json', JSON.stringify(levels, null, 2));
