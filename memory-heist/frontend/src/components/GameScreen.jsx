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
import { createAttempt, completeAttempt, calculateLocalScore } from '../services/api.js';

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

  // Level 5 Master Gadget States: EMP, Thermal Radar, Smoke Cloak, Terminal
  const [empActive, setEmpActive] = useState(false);
  const [empTimeLeft, setEmpTimeLeft] = useState(0);
  const [thermalRadarActive, setThermalRadarActive] = useState(false);
  const [smokeCharges, setSmokeCharges] = useState(rawLevel.levelNumber === 5 ? GAME_CONFIG.MAX_SMOKE_CHARGES : 0);
  const [isSmokeActive, setIsSmokeActive] = useState(false);
  const [terminalHacked, setTerminalHacked] = useState(false);

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
      empActive: false,
      empExpireTime: 0,
      thermalRadarActive: false,
      smokeCharges: parsed.levelNumber === 5 ? GAME_CONFIG.MAX_SMOKE_CHARGES : 0,
      smokeState: { active: false, center: null, expireTime: 0 },
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
    setEmpActive(false);
    setEmpTimeLeft(0);
    setThermalRadarActive(false);
    setSmokeCharges(parsed.levelNumber === 5 ? GAME_CONFIG.MAX_SMOKE_CHARGES : 0);
    setIsSmokeActive(false);
    setTerminalHacked(false);

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

    // 1. Calculate instant local result so ResultModal appears immediately (0 delay)
    const localScore = calculateLocalScore(success, timeTaken, timeLimit, flashesUsed);
    const instantResult = {
      id: activeAttemptId || 'local_att_' + Date.now(),
      success,
      timeTakenSeconds: timeTaken,
      timeLimitSeconds: timeLimit,
      flashesUsed,
      reason,
      score: localScore.totalScore,
      scoreBreakdown: localScore,
      savedRemotely: false
    };
    setAttemptResult(instantResult);

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

    // 2. Persist to Supabase / Backend asynchronously without blocking the UI
    try {
      const result = await completeAttempt(activeAttemptId || instantResult.id, payload);
      if (result) {
        setAttemptResult(result);
      }
    } catch (err) {
      console.error('Remote attempt completion error (preserved local score):', err);
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

  // Deploy Tactical Smoke Cloak (Level 5 Special Equipment)
  const deploySmoke = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== PHASES.HEIST || s.isPaused) return;

    if (s.smokeState && s.smokeState.active) {
      showToast('Tactical smoke cloak already active!');
      return;
    }

    if (s.smokeCharges <= 0) {
      showToast('No smoke cloaks remaining!');
      return;
    }

    s.smokeCharges -= 1;
    s.smokeState = {
      active: true,
      center: { x: s.player.x, y: s.player.y },
      expireTime: performance.now() + GAME_CONFIG.SMOKE_DURATION_MS
    };

    setSmokeCharges(s.smokeCharges);
    setIsSmokeActive(true);
    showToast('💨 TACTICAL SMOKE DEPLOYED: Undetectable by patrols for 4.5s!', 2500);
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
        // Turn all door tiles into open tiles so vault entrance is clearly unlocked
        for (let r = 0; r < s.grid.length; r++) {
          for (let c = 0; c < s.grid[r].length; c++) {
            if (s.grid[r][c] === 2) {
              s.grid[r][c] = 0; // EMPTY
            }
          }
        }
        setInventory({ ...s.inventory });
        showToast('Brass Key secured! Vault doors unlocked.', 3000);
      }

      if (moveResult.doorUnlocked) {
        s.grid[moveResult.newY][moveResult.newX] = 0;
      }

      if (moveResult.diamondCollected) {
        s.inventory.hasDiamond = true;
        s.grid[moveResult.newY][moveResult.newX] = 0;

        // In Level 1: Open the emergency extraction path at (7, 4) so player can run straight down to EXIT!
        if (s.level.levelNumber === 1 && s.grid[4] && s.grid[4][7] === 1) {
          s.grid[4][7] = 0;
        }

        setInventory({ ...s.inventory });
        showToast('💎 Diamond stolen! Extraction route open — head to EXIT!', 4000);
      }

      if (moveResult.terminalHacked) {
        s.empActive = true;
        s.empExpireTime = now + GAME_CONFIG.EMP_DURATION_MS;
        s.thermalRadarActive = true;
        s.flashesLeft = Math.min(GAME_CONFIG.MAX_FLASHES + 2, s.flashesLeft + 2);
        s.grid[moveResult.newY][moveResult.newX] = 0; // EMPTY
        setTerminalHacked(true);
        setEmpActive(true);
        setEmpTimeLeft(Math.ceil(GAME_CONFIG.EMP_DURATION_MS / 1000));
        setThermalRadarActive(true);
        setFlashesRemaining(s.flashesLeft);
        showToast('⚡ SECURITY TERMINAL OVERRIDDEN! EMP active (15s): Guards blinded & Thermal Radar online!', 4500);
      }

      if (moveResult.exitReached) {
        if (moveResult.canExit) {
          handleAttemptEnd(true, 'DIAMOND_SECURED');
          return;
        } else {
          showToast('⚠️ EXTRACTION DENIED: Secure Key & Diamond first!', 4000);
        }
      }

      const detection = checkDetection(s.guards, s.player, s.grid, s.inventory.hasKey, s.level.width, s.level.height, s.empActive, s.smokeState?.active);
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

      if (['e', 'c', 'x'].includes(e.key.toLowerCase())) {
        deploySmoke();
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
  }, [togglePause, triggerMemoryFlash, deploySmoke, executePlayerMove]);

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

          // Active EMP grid disruption countdown
          if (s.empActive) {
            if (currentTime >= s.empExpireTime) {
              s.empActive = false;
              setEmpActive(false);
              setEmpTimeLeft(0);
              showToast('⚡ EMP Expired: Guard flashlight grid online!', 2500);
            } else {
              setEmpTimeLeft(Math.max(0, Math.ceil((s.empExpireTime - currentTime) / 1000)));
            }
          }

          // Tactical smoke screen duration check
          if (s.smokeState && s.smokeState.active) {
            if (currentTime >= s.smokeState.expireTime) {
              s.smokeState.active = false;
              setIsSmokeActive(false);
            }
          }

          for (let i = 0; i < s.guards.length; i++) {
            const guard = s.guards[i];
            if (!guard.lastMoveTime) guard.lastMoveTime = currentTime;

            if (currentTime - guard.lastMoveTime >= guard.moveIntervalMs) {
              s.guards[i] = stepGuard(guard);
              s.guards[i].lastMoveTime = currentTime;

              const detection = checkDetection(s.guards, s.player, s.grid, s.inventory.hasKey, s.level.width, s.level.height, s.empActive, s.smokeState?.active);
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

            {/* Level 5 Master Intel Dossier */}
            {rawLevel.levelNumber === 5 && (
              <div className="briefing-intel-dossier">
                <div className="intel-header">⚡ VAULT 5 TACTICAL PROTOCOL</div>
                <div className="intel-bullet">
                  <span className="intel-icon">💻</span>
                  <span><strong>Security Override Terminal:</strong> Infiltrate the terminal on the left corridor to trigger a 15s EMP blackout, reveal guards on Thermal Radar, and restore +2 Flashes!</span>
                </div>
                <div className="intel-bullet">
                  <span className="intel-icon">💨</span>
                  <span><strong>Tactical Smoke Cloak (Key [E] / Button):</strong> Deploy 2 smoke screens (4.5s each) to move undetected through patrol sightlines.</span>
                </div>
              </div>
            )}

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

        {/* Items, Gadgets & Flash Slots */}
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

          {rawLevel.levelNumber === 5 && (
            <div className={`hud-item-slot ${terminalHacked ? 'slot-acquired' : ''}`} title="Security Terminal (EMP Blackout & Radar)">
              <span className="item-slot-label">EMP</span>
              <span style={{ fontSize: '14px', lineHeight: 1 }}>💻</span>
              {terminalHacked && <span className="item-checkmark">✓</span>}
            </div>
          )}

          {/* Flash System (indicators) */}
          {!isPractice && (
            <div className="hud-flash-system" title="Memory Flashes (Press SPACE)">
              <span className="flash-label">FLASH</span>
              <div className="flash-boxes-row">
                {[...Array(Math.max(GAME_CONFIG.MAX_FLASHES, flashesRemaining))].map((_, idx) => (
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

          {/* Tactical Smoke Button (Vault 5 Gadget) */}
          {(smokeCharges > 0 || isSmokeActive || rawLevel.levelNumber === 5) && !isPractice && (
            <button
              className={`hud-smoke-trigger ${isSmokeActive ? 'smoke-active' : ''}`}
              onClick={deploySmoke}
              disabled={smokeCharges <= 0 || isSmokeActive || phase !== PHASES.HEIST}
              title="Deploy Tactical Smoke Cloak (Press E)"
            >
              <span className="smoke-icon">💨</span>
              <span className="smoke-text">
                {isSmokeActive ? 'ACTIVE' : `SMOKE (${smokeCharges})`}
              </span>
            </button>
          )}

          {/* Active Status Effects */}
          {empActive && (
            <div className="hud-status-chip emp-chip" title="Guards blinded!">
              ⚡ EMP {empTimeLeft}s
            </div>
          )}
          {thermalRadarActive && (
            <div className="hud-status-chip radar-chip" title="Infrared radar tracking guards">
              📡 RADAR
            </div>
          )}
        </div>

        {/* Dynamic Objective Step Badge */}
        <div className="hud-objective-badge">
          {rawLevel.levelNumber === 5 && !terminalHacked ? (
            <span className="obj-step obj-step-terminal">1. HACK TERMINAL 💻</span>
          ) : !inventory.hasKey ? (
            <span className="obj-step obj-step-key">{rawLevel.levelNumber === 5 ? '2. FIND KEY' : '1. FIND KEY'}</span>
          ) : !inventory.hasDiamond ? (
            <span className="obj-step obj-step-gem">{rawLevel.levelNumber === 5 ? '3. GET DIAMOND' : '2. GET DIAMOND'}</span>
          ) : (
            <span className="obj-step obj-step-exit">{rawLevel.levelNumber === 5 ? '4. REACH EXIT!' : '3. REACH EXIT!'}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="hud-actions-group">
          {phase === PHASES.HEIST && (
            <button className="btn btn-secondary btn-sm" onClick={togglePause} id="pause-btn">
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={resetGame} id="restart-btn" title="Restart Level">
            <PixelIcon name="restart" size={12} /> RESTART
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onExitToSelect} id="exit-btn" title="Exit to Vault Selection">
            <PixelIcon name="vaults" size={12} /> EXIT
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
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={togglePause}>
                  RESUME HEIST
                </button>
                <button className="btn btn-danger" onClick={resetGame}>
                  RESTART VAULT
                </button>
                <button className="btn btn-secondary" onClick={onExitToSelect} id="pause-exit-btn">
                  <PixelIcon name="vaults" size={14} /> EXIT TO VAULTS
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

        <div className="mobile-actions-group">
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

          {(smokeCharges > 0 || rawLevel.levelNumber === 5) && !isPractice && (
            <button
              className={`mobile-smoke-btn ${isSmokeActive ? 'smoke-active' : ''}`}
              onTouchStart={(e) => { e.preventDefault(); deploySmoke(); }}
              onClick={deploySmoke}
              disabled={smokeCharges <= 0 || isSmokeActive || phase !== PHASES.HEIST}
              aria-label="Deploy Tactical Smoke"
            >
              <span>💨 SMOKE</span>
              <small>({isSmokeActive ? 'ACTIVE' : `${smokeCharges} LEFT`})</small>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Controls Legend Bar */}
      <div className="controls-legend-bar">
        <span>Move: <span className="keycap">W</span> <span className="keycap">A</span> <span className="keycap">S</span> <span className="keycap">D</span> / Arrows</span>
        {!isPractice && (
          <span>Reveal: <span className="keycap">Space</span> ({flashesRemaining} left)</span>
        )}
        {(smokeCharges > 0 || rawLevel.levelNumber === 5) && !isPractice && (
          <span>Smoke: <span className="keycap">E</span> ({smokeCharges} left)</span>
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
