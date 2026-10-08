import { TILES, PHASES, GAME_CONFIG } from './constants.js';
import { getGuardVisionTiles } from './guardPatrol.js';

const PALETTE = {
  BG_CANVAS: '#050B18',
  GRID_LINES: '#101B33',
  GRID_DOTS: '#192845',
  
  // Stone Wall Colors
  WALL_BASE: '#263650',
  WALL_SHADOW: '#17243A',
  WALL_HIGHLIGHT: '#354663',
  WALL_BORDER: '#0A1326',
  WALL_CRACK: '#101A2B',

  // Floor Colors
  FLOOR_VISIBLE: '#091225',
  FLOOR_SEAM: '#0E1A33',
  FLOOR_PAVER_ACCENT: '#13213D',
  FLOOR_HIDDEN: '#050B18',

  // Vault Door
  DOOR_WOOD: '#5A321F',
  DOOR_IRON: '#36527A',
  DOOR_LOCKED_ACCENT: '#FF4B4B',
  DOOR_UNLOCKED: '#19D99B',

  // Treasure
  KEY_GOLD: '#FFB51B',
  KEY_HIGHLIGHT: '#FFD34D',
  KEY_SHADOW: '#C87808',

  DIAMOND_CYAN: '#45D9FF',
  DIAMOND_LIGHT: '#A8F2FF',
  DIAMOND_DARK: '#0879A8',
  DIAMOND_DEEP: '#0D2940',

  ENTRANCE: '#16B8F2',
  EXIT: '#19D99B',

  // Player & Guard
  PLAYER_HOOD: '#101B33',
  PLAYER_CLOAK: '#17243A',
  PLAYER_CYAN: '#25C7FF',
  PLAYER_BACKPACK: '#8B4F24',

  GUARD_UNIFORM: '#17243A',
  GUARD_CAP: '#FF4B4B',
  GUARD_ACCENT: '#FF8A18',
  GUARD_VISION: 'rgba(255, 75, 75, 0.25)',
  GUARD_VISION_BORDER: 'rgba(255, 75, 75, 0.55)',

  PATROL_ROUTE: 'rgba(255, 181, 27, 0.4)',
  FLASH_WAVE: 'rgba(37, 199, 255, 0.7)'
};

/**
 * Draws the entire board state onto the canvas using authentic 2D pixel-art graphics.
 */
export function renderCanvas(ctx, state, options = {}) {
  const { width, height } = ctx.canvas;
  const {
    level,
    grid,
    player,
    guards,
    inventory,
    phase,
    isPractice,
    flashState,
    detectionResult,
    empActive,
    smokeState,
    thermalRadarActive
  } = state;

  ctx.clearRect(0, 0, width, height);

  if (!level) return;

  const mapW = level.width;
  const mapH = level.height;

  // Calculate dynamic tile size to fit canvas cleanly with padding
  const padding = 16;
  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const tileSize = Math.floor(Math.min(availW / mapW, availH / mapH));
  
  const offsetX = Math.floor((width - tileSize * mapW) / 2);
  const offsetY = Math.floor((height - tileSize * mapH) / 2);

  // 1. Draw Canvas Outer Background
  ctx.fillStyle = PALETTE.BG_CANVAS;
  ctx.fillRect(0, 0, width, height);

  // 2. Compute tile visibility mask
  const isAllVisible = isPractice || phase === PHASES.MEMORIZE;

  // 3. Draw Tiles
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      const px = offsetX + x * tileSize;
      const py = offsetY + y * tileSize;
      const tile = grid[y][x];

      const visible = isAllVisible || isCellVisible(x, y, player, flashState);

      if (!visible) {
        // Concealed tile: Deep darkness with subtle blueprint grid dot
        ctx.fillStyle = PALETTE.FLOOR_HIDDEN;
        ctx.fillRect(px, py, tileSize, tileSize);

        ctx.strokeStyle = PALETTE.GRID_LINES;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, tileSize, tileSize);

        ctx.fillStyle = PALETTE.GRID_DOTS;
        ctx.fillRect(px + Math.floor(tileSize / 2) - 1, py + Math.floor(tileSize / 2) - 1, 2, 2);
        continue;
      }

      // Visible Floor Tile (Dungeon Stone Pavers)
      drawFloorTile(ctx, px, py, tileSize, x, y);

      // Render Tile Specific Pixel Artwork
      if (tile === TILES.WALL) {
        drawWallTile(ctx, px, py, tileSize, x, y);
      } else if (tile === TILES.DOOR) {
        drawDoorTile(ctx, px, py, tileSize, inventory.hasKey);
      } else if (tile === TILES.KEY) {
        drawKeyTile(ctx, px, py, tileSize);
      } else if (tile === TILES.DIAMOND) {
        drawDiamondTile(ctx, px, py, tileSize);
      } else if (tile === TILES.TERMINAL) {
        drawTerminalTile(ctx, px, py, tileSize);
      } else if (tile === TILES.ENTRANCE) {
        drawEntranceTile(ctx, px, py, tileSize);
      } else if (tile === TILES.EXIT) {
        drawExitTile(ctx, px, py, tileSize);
      }
    }
  }

  // 4. During MEMORIZE phase, draw guard patrol routes for tactical study
  if (phase === PHASES.MEMORIZE || isPractice) {
    drawPatrolRoutes(ctx, guards, offsetX, offsetY, tileSize);
  }

  // 5. Draw Guard Vision Cones / Rectangular Beams (blinded if EMP is active)
  if (!empActive) {
    for (const guard of guards) {
      const visionTiles = getGuardVisionTiles(guard, grid, inventory.hasKey, mapW, mapH, empActive);
      for (const vt of visionTiles) {
        if (isAllVisible || isCellVisible(vt.x, vt.y, player, flashState)) {
          const vpx = offsetX + vt.x * tileSize;
          const vpy = offsetY + vt.y * tileSize;
          ctx.fillStyle = PALETTE.GUARD_VISION;
          ctx.fillRect(vpx + 1, vpy + 1, tileSize - 2, tileSize - 2);

          ctx.strokeStyle = PALETTE.GUARD_VISION_BORDER;
          ctx.lineWidth = 1;
          ctx.strokeRect(vpx + 1, vpy + 1, tileSize - 2, tileSize - 2);
        }
      }
    }
  }

  // 6. Draw Guards (visible or thermal radar blips)
  for (const guard of guards) {
    const isGuardVisible = isAllVisible || isCellVisible(guard.x, guard.y, player, flashState);
    const gpx = offsetX + guard.x * tileSize;
    const gpy = offsetY + guard.y * tileSize;

    if (isGuardVisible) {
      const isAlert = detectionResult && detectionResult.detected && detectionResult.guardId === guard.id;
      drawGuard(ctx, gpx, gpy, tileSize, guard.facing, isAlert);
    } else if (thermalRadarActive) {
      // Thermal infrared scanner ping blip through the dark!
      drawThermalBlip(ctx, gpx, gpy, tileSize);
    }
  }

  // 7. Tactical Smoke Screen
  if (smokeState && smokeState.active && smokeState.center) {
    drawSmokeCloud(ctx, offsetX, offsetY, tileSize, smokeState);
  }

  // 8. Draw Player (always visible)
  const ppx = offsetX + player.x * tileSize;
  const ppy = offsetY + player.y * tileSize;
  drawPlayer(ctx, ppx, ppy, tileSize, player.facing, detectionResult?.detected);

  // 9. Draw Memory Flash Wave / Pulse
  if (flashState && flashState.active && flashState.center) {
    drawFlashWave(ctx, offsetX, offsetY, tileSize, flashState);
  }

  // 10. EMP Electric Disruption Visual Overlay
  if (empActive) {
    drawEmpOverlay(ctx, width, height);
  }

  // 11. Draw Detection Banner if spotted
  if (detectionResult && detectionResult.detected) {
    drawDetectionFeedback(ctx, width, height, detectionResult);
  }
}

/**
 * Checks if a tile is currently visible.
 */
function isCellVisible(x, y, player, flashState) {
  // 1-tile local radius
  if (Math.abs(x - player.x) <= GAME_CONFIG.LOCAL_VISIBILITY_RADIUS && Math.abs(y - player.y) <= GAME_CONFIG.LOCAL_VISIBILITY_RADIUS) {
    return true;
  }
  // 3-tile flash radius
  if (flashState && flashState.active && flashState.center) {
    const dx = x - flashState.center.x;
    const dy = y - flashState.center.y;
    if (dx * dx + dy * dy <= GAME_CONFIG.FLASH_RADIUS * GAME_CONFIG.FLASH_RADIUS + 0.25) {
      return true;
    }
  }
  return false;
}

/**
 * Draws an authentic 2D pixel dungeon floor tile with stone pavers texture
 */
function drawFloorTile(ctx, px, py, size, tx, ty) {
  // Base dark navy floor
  ctx.fillStyle = PALETTE.FLOOR_VISIBLE;
  ctx.fillRect(px, py, size, size);

  // Paver seams
  ctx.strokeStyle = PALETTE.FLOOR_SEAM;
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, size, size);

  // Subtle decorative paver variations based on tile coords
  const seed = (tx * 7 + ty * 13) % 4;
  ctx.fillStyle = PALETTE.FLOOR_PAVER_ACCENT;
  if (seed === 0) {
    ctx.fillRect(px + 4, py + 4, 3, 3);
  } else if (seed === 1) {
    ctx.fillRect(px + size - 7, py + 5, 4, 2);
  } else if (seed === 2) {
    ctx.fillRect(px + 6, py + size - 8, 3, 3);
  }
}

/**
 * Draws a pixel-art stone wall brick tile with cracks, highlights, and 3D bevel
 */
function drawWallTile(ctx, px, py, size, tx, ty) {
  // Base stone body
  ctx.fillStyle = PALETTE.WALL_BASE;
  ctx.fillRect(px, py, size, size);

  // Thick dark outer shadow border
  ctx.fillStyle = PALETTE.WALL_BORDER;
  ctx.fillRect(px, py + size - 3, size, 3); // bottom shadow
  ctx.fillRect(px + size - 3, py, 3, size); // right shadow

  // Top and left highlight edges
  ctx.fillStyle = PALETTE.WALL_HIGHLIGHT;
  ctx.fillRect(px, py, size - 2, 2); // top highlight
  ctx.fillRect(px, py, 2, size - 2); // left highlight

  // Internal brick mortar split line (horizontal)
  const midY = py + Math.floor(size / 2);
  ctx.fillStyle = PALETTE.WALL_SHADOW;
  ctx.fillRect(px + 2, midY, size - 4, 2);
  ctx.fillStyle = PALETTE.WALL_HIGHLIGHT;
  ctx.fillRect(px + 2, midY + 2, size - 4, 1);

  // Alternating vertical brick splits
  const split1X = px + Math.floor(size * 0.45);
  ctx.fillStyle = PALETTE.WALL_SHADOW;
  ctx.fillRect(split1X, py + 2, 2, midY - py - 2);

  const split2X = px + Math.floor(size * 0.75);
  ctx.fillRect(split2X, midY + 2, 2, py + size - midY - 5);

  // Pixel crack notch on occasional walls
  if ((tx + ty) % 3 === 0) {
    ctx.fillStyle = PALETTE.WALL_CRACK;
    ctx.fillRect(px + 6, py + 6, 2, 3);
    ctx.fillRect(px + 8, py + 8, 3, 2);
  }
}

/**
 * Draws a heavy pixel-art reinforced vault door tile
 */
function drawDoorTile(ctx, px, py, size, hasKey) {
  const pad = Math.floor(size * 0.1);
  const dw = size - pad * 2;
  const dh = size - pad * 2;

  // Door wooden frame
  ctx.fillStyle = hasKey ? '#0D3325' : PALETTE.DOOR_WOOD;
  ctx.fillRect(px + pad, py + pad, dw, dh);

  // Iron border
  ctx.strokeStyle = hasKey ? PALETTE.DOOR_UNLOCKED : PALETTE.DOOR_IRON;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + pad, py + pad, dw, dh);

  // Iron horizontal reinforcement straps
  ctx.fillStyle = hasKey ? '#19D99B' : '#36527A';
  ctx.fillRect(px + pad, py + Math.floor(size * 0.3), dw, 3);
  ctx.fillRect(px + pad, py + Math.floor(size * 0.7), dw, 3);

  // Golden brass padlock / lock wheel in center
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const lockR = Math.max(4, Math.floor(size * 0.16));

  ctx.fillStyle = hasKey ? '#19D99B' : '#FFB51B';
  ctx.fillRect(cx - lockR, cy - lockR, lockR * 2, lockR * 2);

  // Keyhole slot
  ctx.fillStyle = '#08101F';
  ctx.fillRect(cx - 1, cy - 2, 2, 4);

  // Unlocked status text or padlock shackle
  if (hasKey) {
    ctx.fillStyle = '#A8F2FF';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
  }
}

/**
 * Draws an authentic pixel golden key with sparkle glow
 */
function drawKeyTile(ctx, px, py, size) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const u = Math.max(2, Math.floor(size / 16));

  // Golden aura glow
  ctx.fillStyle = 'rgba(255, 181, 27, 0.25)';
  ctx.fillRect(cx - 7 * u, cy - 7 * u, 14 * u, 14 * u);

  // Key ring head
  ctx.fillStyle = PALETTE.KEY_GOLD;
  ctx.fillRect(cx - 5 * u, cy - 3 * u, 5 * u, 6 * u);
  ctx.fillStyle = PALETTE.FLOOR_VISIBLE;
  ctx.fillRect(cx - 4 * u, cy - 1 * u, 3 * u, 2 * u);

  // Key shaft
  ctx.fillStyle = PALETTE.KEY_GOLD;
  ctx.fillRect(cx, cy - 1 * u, 6 * u, 2 * u);

  // Teeth
  ctx.fillRect(cx + 3 * u, cy + 1 * u, 1 * u, 2 * u);
  ctx.fillRect(cx + 5 * u, cy + 1 * u, 1 * u, 3 * u);

  // Bright yellow highlight
  ctx.fillStyle = PALETTE.KEY_HIGHLIGHT;
  ctx.fillRect(cx - 4 * u, cy - 3 * u, 4 * u, 1 * u);
  ctx.fillRect(cx, cy - 1 * u, 5 * u, 1 * u);
}

/**
 * Draws a faceted, glowing pixel-art cyan diamond
 */
function drawDiamondTile(ctx, px, py, size) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const u = Math.max(2, Math.floor(size / 16));

  // Cyan aura glow
  ctx.fillStyle = 'rgba(69, 217, 255, 0.25)';
  ctx.fillRect(cx - 7 * u, cy - 7 * u, 14 * u, 14 * u);

  // Top crown facet
  ctx.fillStyle = PALETTE.DIAMOND_LIGHT;
  ctx.fillRect(cx - 3 * u, cy - 5 * u, 6 * u, 2 * u);

  // Upper side facets
  ctx.fillStyle = PALETTE.DIAMOND_CYAN;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * u, cy - 2 * u);
  ctx.lineTo(cx + 6 * u, cy - 2 * u);
  ctx.lineTo(cx, cy + 6 * u);
  ctx.closePath();
  ctx.fill();

  // Top highlight facet
  ctx.fillStyle = PALETTE.DIAMOND_LIGHT;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * u, cy - 5 * u);
  ctx.lineTo(cx + 3 * u, cy - 5 * u);
  ctx.lineTo(cx, cy - 2 * u);
  ctx.closePath();
  ctx.fill();

  // Darker shade right facet
  ctx.fillStyle = PALETTE.DIAMOND_DARK;
  ctx.beginPath();
  ctx.moveTo(cx + 6 * u, cy - 2 * u);
  ctx.lineTo(cx, cy - 2 * u);
  ctx.lineTo(cx, cy + 6 * u);
  ctx.closePath();
  ctx.fill();

  // Sparkling glint dot
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - 2 * u, cy - 4 * u, 2 * u, 2 * u);
}

/**
 * Draws the entrance trapdoor / ladder tile
 */
function drawEntranceTile(ctx, px, py, size) {
  ctx.fillStyle = 'rgba(22, 184, 242, 0.15)';
  ctx.fillRect(px + 2, py + 2, size - 4, size - 4);

  ctx.strokeStyle = PALETTE.ENTRANCE;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 3, py + 3, size - 6, size - 6);

  // "IN" label
  ctx.fillStyle = PALETTE.ENTRANCE;
  ctx.font = `bold ${Math.max(9, Math.floor(size * 0.28))}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IN', px + Math.floor(size / 2), py + Math.floor(size / 2));
}

/**
 * Draws the emerald exit door / extraction portal
 */
function drawExitTile(ctx, px, py, size) {
  ctx.fillStyle = 'rgba(25, 217, 155, 0.15)';
  ctx.fillRect(px + 2, py + 2, size - 4, size - 4);

  ctx.strokeStyle = PALETTE.EXIT;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 3, py + 3, size - 6, size - 6);

  // "EXIT" label in Press Start 2P
  ctx.fillStyle = PALETTE.EXIT;
  ctx.font = `bold ${Math.max(8, Math.floor(size * 0.22))}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', px + Math.floor(size / 2), py + Math.floor(size / 2));
}

/**
 * Draws the original pixel-art thief character
 */
function drawPlayer(ctx, px, py, size, facing = 'DOWN', isAlert = false) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const u = Math.max(2, Math.floor(size / 16));

  // Cyan selection drop shadow / glow
  ctx.fillStyle = 'rgba(37, 199, 255, 0.35)';
  ctx.fillRect(cx - 6 * u, cy - 6 * u, 12 * u, 12 * u);

  // Cloak body
  ctx.fillStyle = PALETTE.PLAYER_HOOD;
  ctx.fillRect(cx - 4 * u, cy - 5 * u, 8 * u, 10 * u);

  // Dark hood
  ctx.fillStyle = PALETTE.PLAYER_CLOAK;
  ctx.fillRect(cx - 3 * u, cy - 6 * u, 6 * u, 4 * u);

  // Cyan visor / scarf
  ctx.fillStyle = PALETTE.PLAYER_CYAN;
  ctx.fillRect(cx - 3 * u, cy - 3 * u, 6 * u, 2 * u);

  // Brown backpack
  ctx.fillStyle = PALETTE.PLAYER_BACKPACK;
  if (facing === 'LEFT') {
    ctx.fillRect(cx + 3 * u, cy - 2 * u, 2 * u, 5 * u);
  } else if (facing === 'RIGHT') {
    ctx.fillRect(cx - 5 * u, cy - 2 * u, 2 * u, 5 * u);
  } else {
    ctx.fillRect(cx - 3 * u, cy + 2 * u, 6 * u, 3 * u);
  }

  // Directional Pointer Arrow (Triangle on top of thief)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  const dSize = 3 * u;
  if (facing === 'UP') {
    ctx.moveTo(cx, cy - 7 * u);
    ctx.lineTo(cx - dSize, cy - 4 * u);
    ctx.lineTo(cx + dSize, cy - 4 * u);
  } else if (facing === 'DOWN') {
    ctx.moveTo(cx, cy + 7 * u);
    ctx.lineTo(cx - dSize, cy + 4 * u);
    ctx.lineTo(cx + dSize, cy + 4 * u);
  } else if (facing === 'LEFT') {
    ctx.moveTo(cx - 7 * u, cy);
    ctx.lineTo(cx - 4 * u, cy - dSize);
    ctx.lineTo(cx - 4 * u, cy + dSize);
  } else {
    // RIGHT
    ctx.moveTo(cx + 7 * u, cy);
    ctx.lineTo(cx + 4 * u, cy - dSize);
    ctx.lineTo(cx + 4 * u, cy + dSize);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws the original pixel-art guard character
 */
function drawGuard(ctx, px, py, size, facing = 'DOWN', isAlert = false) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const u = Math.max(2, Math.floor(size / 16));

  // Uniform body
  ctx.fillStyle = PALETTE.GUARD_UNIFORM;
  ctx.fillRect(cx - 4 * u, cy - 4 * u, 8 * u, 9 * u);

  // Red patrol cap
  ctx.fillStyle = PALETTE.GUARD_CAP;
  ctx.fillRect(cx - 4 * u, cy - 6 * u, 8 * u, 3 * u);
  ctx.fillRect(cx - 5 * u, cy - 4 * u, 10 * u, 1 * u); // cap brim

  // Face
  ctx.fillStyle = '#E8B084';
  ctx.fillRect(cx - 3 * u, cy - 3 * u, 6 * u, 3 * u);

  // Belt & golden buckle
  ctx.fillStyle = '#091225';
  ctx.fillRect(cx - 4 * u, cy + 2 * u, 8 * u, 1 * u);
  ctx.fillStyle = PALETTE.KEY_GOLD;
  ctx.fillRect(cx - 1 * u, cy + 2 * u, 2 * u, 1 * u);

  // Flashlight in hand
  ctx.fillStyle = PALETTE.KEY_GOLD;
  if (facing === 'RIGHT') {
    ctx.fillRect(cx + 4 * u, cy - 1 * u, 3 * u, 2 * u);
  } else if (facing === 'LEFT') {
    ctx.fillRect(cx - 7 * u, cy - 1 * u, 3 * u, 2 * u);
  } else if (facing === 'UP') {
    ctx.fillRect(cx + 2 * u, cy - 6 * u, 2 * u, 3 * u);
  } else {
    ctx.fillRect(cx + 2 * u, cy + 4 * u, 2 * u, 3 * u);
  }

  // Alert exclamation bubble if spotted
  if (isAlert) {
    ctx.fillStyle = '#FF4B4B';
    ctx.fillRect(cx - 3 * u, cy - 10 * u, 6 * u, 6 * u);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(size * 0.4)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', cx, cy - 7 * u);
  }
}

/**
 * Draws guard patrol route lines for study during memorization phase
 */
function drawPatrolRoutes(ctx, guards, offsetX, offsetY, tileSize) {
  ctx.save();
  ctx.strokeStyle = PALETTE.PATROL_ROUTE;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);

  for (const guard of guards) {
    if (!guard.patrolPath || guard.patrolPath.length < 2) continue;

    ctx.beginPath();
    guard.patrolPath.forEach((pt, i) => {
      const x = offsetX + pt.x * tileSize + Math.floor(tileSize / 2);
      const y = offsetY + pt.y * tileSize + Math.floor(tileSize / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const first = guard.patrolPath[0];
    const fx = offsetX + first.x * tileSize + Math.floor(tileSize / 2);
    const fy = offsetY + first.y * tileSize + Math.floor(tileSize / 2);
    ctx.lineTo(fx, fy);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the memory flash reveal wave
 */
function drawFlashWave(ctx, offsetX, offsetY, tileSize, flashState) {
  const cx = offsetX + flashState.center.x * tileSize + Math.floor(tileSize / 2);
  const cy = offsetY + flashState.center.y * tileSize + Math.floor(tileSize / 2);
  const r = (GAME_CONFIG.FLASH_RADIUS + 0.4) * tileSize;

  ctx.save();
  ctx.strokeStyle = PALETTE.FLASH_WAVE;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner illuminated radial aura
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(37, 199, 255, 0.25)');
  grad.addColorStop(1, 'rgba(37, 199, 255, 0.02)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

/**
 * Draws detection alert feedback overlay
 */
function drawDetectionFeedback(ctx, width, height, detection) {
  ctx.save();
  const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.7);
  grad.addColorStop(0, 'rgba(255, 75, 75, 0)');
  grad.addColorStop(1, 'rgba(255, 75, 75, 0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Draws a high-tech pixel-art cyber security terminal / EMP console
 */
function drawTerminalTile(ctx, px, py, size) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const u = Math.max(2, Math.floor(size / 16));

  // Cyan pulsing aura glow
  ctx.fillStyle = 'rgba(37, 199, 255, 0.35)';
  ctx.fillRect(cx - 7 * u, cy - 7 * u, 14 * u, 14 * u);

  // Terminal server chassis (dark steel)
  ctx.fillStyle = '#101B33';
  ctx.fillRect(cx - 5 * u, cy - 6 * u, 10 * u, 12 * u);
  ctx.strokeStyle = '#25C7FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 5 * u, cy - 6 * u, 10 * u, 12 * u);

  // Glowing cyan monitor screen
  ctx.fillStyle = '#0879A8';
  ctx.fillRect(cx - 4 * u, cy - 5 * u, 8 * u, 5 * u);
  ctx.fillStyle = '#A8F2FF';
  ctx.fillRect(cx - 3 * u, cy - 4 * u, 6 * u, 3 * u);

  // Blinking command line dot
  ctx.fillStyle = '#19D99B';
  ctx.fillRect(cx - 2 * u, cy - 3 * u, 2 * u, 1 * u);

  // Lower server rack vents / LED diodes
  ctx.fillStyle = '#FF4B4B';
  ctx.fillRect(cx - 3 * u, cy + 2 * u, 2 * u, 1 * u);
  ctx.fillStyle = '#FFB51B';
  ctx.fillRect(cx, cy + 2 * u, 2 * u, 1 * u);
  ctx.fillStyle = '#25C7FF';
  ctx.fillRect(cx + 3 * u, cy + 2 * u, 1 * u, 1 * u);

  // Bottom keyboard tray / cables
  ctx.fillStyle = '#17243A';
  ctx.fillRect(cx - 4 * u, cy + 4 * u, 8 * u, 1 * u);
}

/**
 * Draws glowing infrared thermal blip for guards tracked by radar in the dark
 */
function drawThermalBlip(ctx, px, py, size) {
  const cx = px + Math.floor(size / 2);
  const cy = py + Math.floor(size / 2);
  const r = Math.max(4, Math.floor(size * 0.26));

  // Pulsing infrared thermal ring
  ctx.fillStyle = 'rgba(255, 75, 75, 0.35)';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.fill();

  // Bright core thermal blip
  ctx.fillStyle = '#FF4B4B';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Center yellow heat signature
  ctx.fillStyle = '#FFD34D';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, r * 0.45), 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws tactical smoke cloud that shields player from guard detection
 */
function drawSmokeCloud(ctx, offsetX, offsetY, tileSize, smokeState) {
  if (!smokeState || !smokeState.active || !smokeState.center) return;
  const cx = offsetX + smokeState.center.x * tileSize + Math.floor(tileSize / 2);
  const cy = offsetY + smokeState.center.y * tileSize + Math.floor(tileSize / 2);
  const rad = tileSize * 1.85;

  ctx.save();
  // Radial smoke fog
  const grad = ctx.createRadialGradient(cx, cy, tileSize * 0.2, cx, cy, rad);
  grad.addColorStop(0, 'rgba(180, 205, 235, 0.8)');
  grad.addColorStop(0.5, 'rgba(120, 150, 185, 0.55)');
  grad.addColorStop(1, 'rgba(40, 60, 90, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.fill();

  // Dense smoke puffs
  const puffs = [
    { dx: -tileSize * 0.5, dy: -tileSize * 0.4, r: tileSize * 0.7 },
    { dx: tileSize * 0.4, dy: -tileSize * 0.5, r: tileSize * 0.75 },
    { dx: -tileSize * 0.4, dy: tileSize * 0.5, r: tileSize * 0.7 },
    { dx: tileSize * 0.5, dy: tileSize * 0.4, r: tileSize * 0.65 }
  ];
  ctx.fillStyle = 'rgba(150, 175, 205, 0.4)';
  for (const p of puffs) {
    ctx.beginPath();
    ctx.arc(cx + p.dx, cy + p.dy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws EMP electrical grid disruption border on canvas
 */
function drawEmpOverlay(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(37, 199, 255, 0.45)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(2, 2, width - 4, height - 4);
  ctx.restore();
}
