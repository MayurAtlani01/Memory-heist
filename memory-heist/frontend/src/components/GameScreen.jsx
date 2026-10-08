import React, { useEffect, useRef, useState, useCallback } from 'react';
import briefingBg from '../assets/briefing_bg.jpg';
import gameplayBg from '../assets/gameplay_bg.jpg';
import { PHASES, GAME_CONFIG } from '../game/constants.js';
import { parseLevel } from '../game/mapParser.js';
import { attemptPlayerMove } from '../game/movement.js';
import { stepGuard, checkDetection } from '../game/guardPatrol.js';
import { renderCanvas } from '../game/canvasRenderer.js';
import { ResultModal } from './ResultModal.jsx';
import { PixelIcon } from './PixelIcon.jsx';
import { createAttempt, completeAttempt } from '../services/api.js';

export function GameScreen({
  rawLevel,
  isPractice,
  playerId,
  onExitToSelect,
  onNextLevel,
  hasNextLevel
}) {
  const canvasRef = useRef(null);

  // Core Game State Ref (for deterministic 60fps game loop)
  const stateRef = useRef(null);

  // UI state for React HUD
  const [phase, setPhase] = useState(PHASES.BRIEFING);
  const [memorizeCountdown, setMemorizeCountdown] = useState(rawLevel.memorizeTimeSeconds || 10);
  const [heistTimeLeft, setHeistTimeLeft] = useState(rawLevel.timeLimitSeconds || 60);
  const [flashesRemaining, setFlashesRemaining] = useState(GAME_CONFIG.MAX_FLASHES);
  const [inventory, setInventory] = useState({ hasKey: false, hasDiamond: false });
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Timers and Animation Frame refs
  const animationFrameIdRef = useRef(null);
  const lastPlayerMoveTimeRef = useRef(0);
  const activeKeysRef = useRef(new Set());
  const toastTimeoutRef = useRef(null);
  const touchStartPosRef = useRef(null);

  // Helper to show transient in-game messages
  const showToast = useCallback((msg, duration = 2500) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  // Initialize or reset game state
  const resetGame = useCallback(async () => {
    const parsed = parseLevel(rawLevel);

    stateRef.current = {
      level: parsed,
      grid: parsed.grid,
      player: { x: parsed.entrance.x, y: parsed.entrance.y, facing: 'DOWN' },
      guards: parsed.guards,
      inventory: { hasKey: false, hasDiamond: false },
      phase: PHASES.BRIEFING,
      isPractice,
      memorizeRemainingMs: (parsed.memorizeTimeSeconds || 10) * 1000,
      heistRemainingMs: (parsed.timeLimitSeconds || 60) * 1000,
      flashesLeft: GAME_CONFIG.MAX_FLASHES,
      flashState: { active: false, center: null, expireTime: 0 },
      detectionResult: null,
      isPaused: false
    };

    setPhase(PHASES.BRIEFING);
    setMemorizeCountdown(parsed.memorizeTimeSeconds || 10);
    setHeistTimeLeft(parsed.timeLimitSeconds || 60);
    setFlashesRemaining(GAME_CONFIG.MAX_FLASHES);
    setInventory({ hasKey: false, hasDiamond: false });
    setIsPaused(false);
    setIsFlashing(false);
    setAttemptResult(null);

    // Register attempt with backend
    try {
      const mode = isPractice ? 'PRACTICE' : 'NORMAL';
      const att = await createAttempt(parsed.id || `level-${parsed.levelNumber}`, mode, playerId);
      setActiveAttemptId(att.id);
    } catch (e) {
      console.warn('Could not register attempt on server:', e);
    }
  }, [rawLevel, isPractice, playerId]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Finish Attempt Handler
  const handleAttemptEnd = useCallback(async (success, reason) => {
    const s = stateRef.current;
    if (!s || s.phase === PHASES.RESULT) return;

    s.phase = PHASES.RESULT;
    setPhase(PHASES.RESULT);

    const timeLimit = s.level.timeLimitSeconds || 60;
    const timeTaken = Math.max(1, Math.round(timeLimit - (s.heistRemainingMs / 1000)));
    const flashesUsed = GAME_CONFIG.MAX_FLASHES - s.flashesLeft;

    const payload = {
      levelId: s.level.id || `level-${s.level.levelNumber}`,
      playerId,
      mode: isPractice ? 'PRACTICE' : 'NORMAL',
      success,
      timeTakenSeconds: timeTaken,
      timeLimitSeconds: timeLimit,
      flashesUsed,
      reason
    };

    try {
      const result = await completeAttempt(activeAttemptId || 'local_att_' + Date.now(), payload);
      setAttemptResult(result);
    } catch (err) {
      console.error('Error completing attempt:', err);
    }
  }, [activeAttemptId, isPractice, playerId]);

  // Start Memorization Phase
  const startMemorizePhase = useCallback(() => {
    if (!stateRef.current) return;
    stateRef.current.phase = PHASES.MEMORIZE;
    setPhase(PHASES.MEMORIZE);
  }, []);

  // Trigger Memory Flash
  const triggerMemoryFlash = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== PHASES.HEIST || s.isPaused) return;

    if (s.flashState && s.flashState.active) {
      showToast('Memory flash already active!');
      return;
    }

    if (s.flashesLeft <= 0) {
      showToast('No memory flashes remaining!');
      return;
    }

    // Consume flash charge
    s.flashesLeft -= 1;
    s.flashState = {
      active: true,
      center: { x: s.player.x, y: s.player.y },
      expireTime: performance.now() + GAME_CONFIG.FLASH_DURATION_MS
    };

    setFlashesRemaining(s.flashesLeft);
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, GAME_CONFIG.FLASH_DURATION_MS);
  }, [showToast]);

  // Pause toggle
  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase === PHASES.BRIEFING || s.phase === PHASES.RESULT) return;

    const nextPause = !s.isPaused;
    s.isPaused = nextPause;
    setIsPaused(nextPause);
  }, []);

  // Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stateRef.current && stateRef.current.phase === PHASES.HEIST && !stateRef.current.isPaused) {
        stateRef.current.isPaused = true;
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Input Handling: Desktop Keyboard (WASD / Arrows, Space, Esc)
  const executePlayerMove = useCallback((direction) => {
    const s = stateRef.current;
    if (!s || s.phase !== PHASES.HEIST || s.isPaused) return;

    const now = performance.now();
    if (now - lastPlayerMoveTimeRef.current < GAME_CONFIG.PLAYER_MOVE_COOLDOWN_MS) {
      return;
    }
    lastPlayerMoveTimeRef.current = now;

    s.player.facing = direction;

    const moveResult = attemptPlayerMove(s, direction);

    if (moveResult.moved) {
      s.player.x = moveResult.newX;
      s.player.y = moveResult.newY;

      if (moveResult.keyCollected) {
        s.inventory.hasKey = true;
        if (s.level.door) {
          s.grid[s.level.door.y][s.level.door.x] = 0; // EMPTY
        }
        setInventory({ ...s.inventory });
        showToast(moveResult.message);
      }

      if (moveResult.diamondCollected) {
        s.inventory.hasDiamond = true;
        if (s.level.diamond) {
          s.grid[s.level.diamond.y][s.level.diamond.x] = 0; // EMPTY
        }
        setInventory({ ...s.inventory });
        showToast(moveResult.message);
      }

      if (moveResult.exitReached) {
        if (moveResult.canExit) {
          handleAttemptEnd(true, 'DIAMOND_SECURED');
          return;
        } else {
          showToast(moveResult.message, 3000);
        }
      }

      const detection = checkDetection(s.guards, s.player, s.grid, s.inventory.hasKey, s.level.width, s.level.height);
      if (detection.detected) {
        s.detectionResult = detection;
        handleAttemptEnd(false, detection.reason);
        return;
      }
    } else if (moveResult.message) {
      showToast(moveResult.message);
    }
  }, [handleAttemptEnd, showToast]);

  // Touch Swipe Gesture Handling on Canvas
  const handleCanvasTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, []);

  const handleCanvasTouchEnd = useCallback((e) => {
    if (!touchStartPosRef.current || !e.changedTouches || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartPosRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartPosRef.current.y;
    touchStartPosRef.current = null;

    const minSwipeDist = 24;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipeDist) {
        executePlayerMove(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > minSwipeDist) {
        executePlayerMove(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  }, [executePlayerMove]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        togglePause();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        triggerMemoryFlash();
        return;
      }

      activeKeysRef.current.add(e.key.toLowerCase());

      if (['arrowup', 'w'].includes(e.key.toLowerCase())) executePlayerMove('UP');
      else if (['arrowdown', 's'].includes(e.key.toLowerCase())) executePlayerMove('DOWN');
      else if (['arrowleft', 'a'].includes(e.key.toLowerCase())) executePlayerMove('LEFT');
      else if (['arrowright', 'd'].includes(e.key.toLowerCase())) executePlayerMove('RIGHT');
    };

    const handleKeyUp = (e) => {
      activeKeysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePause, triggerMemoryFlash, executePlayerMove]);

  // Main 60fps Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      const s = stateRef.current;
      if (s) {
        if (s.phase === PHASES.HEIST && !s.isPaused) {
          const keys = activeKeysRef.current;
          if (keys.has('arrowup') || keys.has('w')) executePlayerMove('UP');
          else if (keys.has('arrowdown') || keys.has('s')) executePlayerMove('DOWN');
          else if (keys.has('arrowleft') || keys.has('a')) executePlayerMove('LEFT');
          else if (keys.has('arrowright') || keys.has('d')) executePlayerMove('RIGHT');
        }

        // 1. Memorize Phase Countdown
        if (s.phase === PHASES.MEMORIZE && !s.isPaused) {
          s.memorizeRemainingMs -= dt;
          const secs = Math.max(0, Math.ceil(s.memorizeRemainingMs / 1000));
          setMemorizeCountdown(secs);

          if (s.memorizeRemainingMs <= 0) {
            s.phase = PHASES.HEIST;
            setPhase(PHASES.HEIST);
            showToast('Blueprint concealed! Rely on your memory.', 3000);
          }
        }

        // 2. Heist Phase Logic
        if (s.phase === PHASES.HEIST && !s.isPaused) {
          s.heistRemainingMs -= dt;
          const secs = Math.max(0, Math.ceil(s.heistRemainingMs / 1000));
          setHeistTimeLeft(secs);

          if (s.heistRemainingMs <= 0) {
            handleAttemptEnd(false, 'TIME_EXPIRED');
          }

          if (s.flashState && s.flashState.active) {
            if (currentTime >= s.flashState.expireTime) {
              s.flashState.active = false;
              s.flashState.center = null;
            }
          }

          for (let i = 0; i < s.guards.length; i++) {
            const guard = s.guards[i];
            if (!guard.lastMoveTime) guard.lastMoveTime = currentTime;

            if (currentTime - guard.lastMoveTime >= guard.moveIntervalMs) {
              s.guards[i] = stepGuard(guard);
              s.guards[i].lastMoveTime = currentTime;

              const detection = checkDetection(s.guards, s.player, s.grid, s.inventory.hasKey, s.level.width, s.level.height);
              if (detection.detected) {
                s.detectionResult = detection;
                handleAttemptEnd(false, detection.reason);
                break;
              }
            }
          }
        }

        // Canvas Rendering
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          renderCanvas(ctx, s);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [executePlayerMove, handleAttemptEnd, showToast]);

  // Adjust Canvas Resolution dynamically for crisp display
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const containerWidth = Math.min(window.innerWidth - 32, 600);
      const size = Math.max(320, Math.min(containerWidth, 560));
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Briefing Phase: Dedicated Briefing Chamber (Image 2 top-right)
  if (phase === PHASES.BRIEFING) {
    return (
      <div
        className="briefing-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 11, 24, 0.3), rgba(5, 11, 24, 0.55)), url(${briefingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Top return bar */}
        <div className="briefing-topbar">
          <button className="btn btn-secondary btn-sm" onClick={onExitToSelect} id="briefing-return-btn">
            ← RETURN TO HOME
          </button>
        </div>

        {/* Central Mission Slate */}
        <div className="briefing-chamber-wrap">
          <div className="briefing-slate">
            <div className="operational-pill">
              OPERATIONAL PARAMETERS
            </div>

            <h2 className="briefing-vault-title">
              {rawLevel.name}
            </h2>

            <p className="briefing-desc">
              {rawLevel.description}
            </p>

            {/* 3 Stat Boxes */}
            <div className="briefing-stats-row">
              <div className="briefing-stat-box">
                <span className="stat-label">STUDY</span>
                <span className="stat-val stat-val-gold">{rawLevel.memorizeTimeSeconds}s</span>
              </div>
              <div className="briefing-stat-box">
                <span className="stat-label">TIME LIMIT</span>
                <span className="stat-val stat-val-cyan">{rawLevel.timeLimitSeconds}s</span>
              </div>
              <div className="briefing-stat-box">
                <span className="stat-label">SECURITY</span>
                <span className="stat-val stat-val-red">{rawLevel.guards?.length || 0} Patrols</span>
              </div>
            </div>

            {/* Big Gold Memorization Button */}
            <button
              className="btn btn-primary btn-memorize-cta"
              onClick={startMemorizePhase}
              id="start-memorize-btn"
            >
              ▶ BEGIN MEMORIZATION ({rawLevel.memorizeTimeSeconds}S)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Gameplay Screen (Image 2 top-left)
  return (
    <div
      className="gameplay-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 11, 24, 0.4), rgba(5, 11, 24, 0.7)), url(${gameplayBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Game Bar / HUD */}
      <div className="pixel-game-hud">
        {/* Left: Vault Number and Name */}
        <div className="hud-vault-info">
          <span className="hud-vault-num">VAULT {rawLevel.levelNumber}</span>
          <span className="hud-vault-name">{rawLevel.name}</span>
        </div>

        {/* Phase Pill / Timer */}
        <div className="hud-phase-group">
          {phase === PHASES.MEMORIZE && (
            <div className="hud-memorize-badge">
              MEMORIZE: {memorizeCountdown}s
            </div>
          )}

          {phase === PHASES.HEIST && (
            <div className={`hud-timer-badge ${heistTimeLeft <= 10 ? 'timer-urgent' : ''}`} id="game-timer">
              ⏱ {Math.floor(heistTimeLeft / 60).toString().padStart(2, '0')}:{(heistTimeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Items & Flash Slots */}
        <div className="hud-items-tray">
          <div className={`hud-item-slot ${inventory.hasKey ? 'slot-acquired' : ''}`} title="Brass Vault Key">
            <span className="item-slot-label">KEY</span>
            <PixelIcon name="key" size={16} />
            {inventory.hasKey && <span className="item-checkmark">✓</span>}
          </div>

          <div className={`hud-item-slot ${inventory.hasDiamond ? 'slot-acquired' : ''}`} title="Target Diamond">
            <span className="item-slot-label">GEM</span>
            <PixelIcon name="gem" size={16} />
            {inventory.hasDiamond && <span className="item-checkmark">✓</span>}
          </div>

          {/* Flash System (3 square indicators) */}
          {!isPractice && (
            <div className="hud-flash-system" title="Memory Flashes (Press SPACE)">
              <span className="flash-label">FLASH</span>
              <div className="flash-boxes-row">
                {[...Array(GAME_CONFIG.MAX_FLASHES)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`flash-square-indicator ${
                      idx < flashesRemaining ? 'flash-ready' : 'flash-spent'
                    } ${isFlashing && idx === flashesRemaining ? 'flash-firing' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="hud-actions-group">
          {phase === PHASES.HEIST && (
            <button className="btn btn-secondary btn-sm" onClick={togglePause} id="pause-btn">
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={resetGame} id="restart-btn">
            <PixelIcon name="restart" size={12} /> RESTART
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onExitToSelect} id="exit-btn">
            <PixelIcon name="vaults" size={12} /> VAULTS
          </button>
        </div>
      </div>

      {/* Main Dungeon Canvas Viewport */}
      <div className="dungeon-board-wrapper">
        <div
          className="canvas-viewport"
          id="canvas-container"
          onTouchStart={handleCanvasTouchStart}
          onTouchEnd={handleCanvasTouchEnd}
        >
          <canvas ref={canvasRef} id="game-canvas" width={560} height={560} />

          {/* Memory Flash Active Screen Flicker Overlay */}
          {isFlashing && (
            <div className="memory-flash-overlay" />
          )}

          {/* Pause Overlay */}
          {isPaused && (
            <div className="pixel-overlay pause-overlay" id="pause-screen">
              <h2 className="pause-title">OPERATION PAUSED</h2>
              <p className="pause-note">
                Blueprint schematics hidden to preserve tactical integrity. Resume when ready.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button className="btn btn-primary" onClick={togglePause}>
                  RESUME HEIST
                </button>
                <button className="btn btn-danger" onClick={resetGame}>
                  RESTART VAULT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-Game Notification Toast */}
      {toastMessage && (
        <div className="toast-banner">
          {toastMessage}
        </div>
      )}

      {/* Mobile Controls (D-Pad & Flash) */}
      <div className="mobile-controls">
        <div className="dpad-container">
          <button
            className="dpad-btn dpad-up"
            onTouchStart={(e) => { e.preventDefault(); executePlayerMove('UP'); }}
            onClick={() => executePlayerMove('UP')}
            aria-label="Move Up"
          >
            ▲
          </button>
          <button
            className="dpad-btn dpad-left"
            onTouchStart={(e) => { e.preventDefault(); executePlayerMove('LEFT'); }}
            onClick={() => executePlayerMove('LEFT')}
            aria-label="Move Left"
          >
            ◀
          </button>
          <button
            className="dpad-btn dpad-down"
            onTouchStart={(e) => { e.preventDefault(); executePlayerMove('DOWN'); }}
            onClick={() => executePlayerMove('DOWN')}
            aria-label="Move Down"
          >
            ▼
          </button>
          <button
            className="dpad-btn dpad-right"
            onTouchStart={(e) => { e.preventDefault(); executePlayerMove('RIGHT'); }}
            onClick={() => executePlayerMove('RIGHT')}
            aria-label="Move Right"
          >
            ▶
          </button>
        </div>

        {!isPractice && (
          <button
            className="mobile-flash-btn"
            onTouchStart={(e) => { e.preventDefault(); triggerMemoryFlash(); }}
            onClick={triggerMemoryFlash}
            disabled={flashesRemaining <= 0 || phase !== PHASES.HEIST}
            aria-label="Trigger Memory Flash"
          >
            <span>FLASH</span>
            <small>({flashesRemaining} / {GAME_CONFIG.MAX_FLASHES})</small>
          </button>
        )}
      </div>

      {/* Desktop Controls Legend Bar (Bottom of Image 2 top-left) */}
      <div className="controls-legend-bar">
        <span>Move: <span className="keycap">W</span> <span className="keycap">A</span> <span className="keycap">S</span> <span className="keycap">D</span> / Arrows</span>
        {!isPractice && (
          <span>Reveal: <span className="keycap">Space</span> ({flashesRemaining} left)</span>
        )}
        <span>Pause: <span className="keycap">Esc</span></span>
      </div>

      {/* Result Debrief Modal */}
      {phase === PHASES.RESULT && (
        <ResultModal
          result={attemptResult}
          level={rawLevel}
          isPractice={isPractice}
          onRetry={resetGame}
          onLevelSelect={onExitToSelect}
          onNextLevel={onNextLevel}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
}
