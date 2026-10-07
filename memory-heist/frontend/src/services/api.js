import { DEFAULT_MAPS } from '../data/defaultMaps.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const PLAYER_ID_KEY = 'memory_heist_player_id';
const LOCAL_PROGRESS_KEY = 'memory_heist_local_progress';
const PENDING_ATTEMPTS_KEY = 'memory_heist_pending_attempts';

/**
 * Retrieves or initializes an anonymous player UUID from localStorage.
 */
export function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = 'player_' + crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'OFFLINE', error: err.message };
  }
}

/**
 * Fetch level summaries
 */
export async function fetchLevels(playerId) {
  try {
    const url = playerId ? `${API_BASE_URL}/levels?playerId=${encodeURIComponent(playerId)}` : `${API_BASE_URL}/levels`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch levels from backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local handcrafted levels:', err.message);
    // Fallback: derive summaries from DEFAULT_MAPS
    const localProgress = getLocalProgress();
    return DEFAULT_MAPS.map((m) => ({
      id: m.id || `level-${m.levelNumber}`,
      levelNumber: m.levelNumber,
      name: m.name,
      description: m.description,
      difficulty: m.difficulty,
      width: m.width,
      height: m.height,
      memorizeTimeSeconds: m.memorizeTimeSeconds,
      timeLimitSeconds: m.timeLimitSeconds,
      guardCount: m.guards ? m.guards.length : 0,
      completed: localProgress.completedLevelIds.includes(m.id || `level-${m.levelNumber}`),
      bestScore: localProgress.bestScores[m.id || `level-${m.levelNumber}`] || null
    }));
  }
}

/**
 * Fetch full level configuration
 */
export async function fetchLevel(levelId) {
  try {
    const res = await fetch(`${API_BASE_URL}/levels/${encodeURIComponent(levelId)}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch level details');
    return await res.json();
  } catch (err) {
    console.warn(`Backend level fetch failed for ${levelId}, using local map:`, err.message);
    const found = DEFAULT_MAPS.find((m) => m.id === levelId || `level-${m.levelNumber}` === levelId);
    if (found) return found;
    throw new Error('Level not found');
  }
}

/**
 * Create a new attempt record
 */
export async function createAttempt(levelId, mode, playerId) {
  try {
    const res = await fetch(`${API_BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, mode, playerId }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to register attempt');
    return await res.json();
  } catch (err) {
    console.warn('Could not register attempt on backend:', err.message);
    // Generate local offline attempt ID
    return {
      id: 'local_att_' + Date.now(),
      levelId,
      mode,
      playerId,
      status: 'IN_PROGRESS',
      isLocal: true
    };
  }
}

/**
 * Complete an attempt and obtain official score
 */
export async function completeAttempt(attemptId, resultData) {
  // Try sending to backend if attempt is not purely local
  if (!attemptId.startsWith('local_att_')) {
    try {
      const res = await fetch(`${API_BASE_URL}/attempts/${encodeURIComponent(attemptId)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        // Also update local cache
        saveLocalProgress(resultData.levelId, resultData.mode, data.score, resultData.success);
        return { ...data, savedRemotely: true };
      }
    } catch (err) {
      console.warn('Failed to save attempt to server, caching locally:', err.message);
    }
  }

  // Fallback: calculate local score and save locally
  const scoreBreakdown = calculateLocalScore(resultData.success, resultData.timeTakenSeconds, resultData.timeLimitSeconds, resultData.flashesUsed);
  saveLocalProgress(resultData.levelId, resultData.mode, scoreBreakdown.totalScore, resultData.success);
  queuePendingAttempt({ attemptId, ...resultData });

  return {
    id: attemptId,
    success: resultData.success,
    timeTakenSeconds: resultData.timeTakenSeconds,
    flashesUsed: resultData.flashesUsed,
    reason: resultData.reason,
    score: scoreBreakdown.totalScore,
    scoreBreakdown,
    savedRemotely: false
  };
}

/**
 * Fetch player progress and statistics
 */
export async function fetchProgress(playerId) {
  try {
    const res = await fetch(`${API_BASE_URL}/progress?playerId=${encodeURIComponent(playerId)}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch player progress');
    return await res.json();
  } catch (err) {
    return getLocalProgress();
  }
}

/**
 * Local score formula fallback (matches backend ScoreCalculator exactly)
 */
function calculateLocalScore(success, timeTakenSeconds, timeLimitSeconds, flashesUsed) {
  if (!success) {
    return { baseScore: 0, timeBonus: 0, flashBonus: 0, totalScore: 0 };
  }
  const baseScore = 1000;
  const remainingSeconds = Math.max(0, (timeLimitSeconds || 60) - timeTakenSeconds);
  const timeBonus = remainingSeconds * 25;
  const unusedFlashes = Math.max(0, 3 - Math.min(3, Math.max(0, flashesUsed)));
  const flashBonus = unusedFlashes * 200;
  return {
    baseScore,
    timeBonus,
    flashBonus,
    totalScore: baseScore + timeBonus + flashBonus
  };
}

function getLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    playerId: getOrCreatePlayerId(),
    completedLevelIds: [],
    bestScores: {},
    totalScore: 0,
    totalAttempts: 0,
    successfulHeists: 0
  };
}

function saveLocalProgress(levelId, mode, score, success) {
  const p = getLocalProgress();
  p.totalAttempts = (p.totalAttempts || 0) + 1;
  if (success) {
    p.successfulHeists = (p.successfulHeists || 0) + 1;
    if (mode === 'NORMAL' && levelId) {
      if (!p.completedLevelIds.includes(levelId)) {
        p.completedLevelIds.push(levelId);
      }
      const prevBest = p.bestScores[levelId] || 0;
      if (score > prevBest) {
        p.bestScores[levelId] = score;
      }
      p.totalScore = Object.values(p.bestScores).reduce((a, b) => a + b, 0);
    }
  }
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(p));
}

function queuePendingAttempt(item) {
  try {
    const raw = localStorage.getItem(PENDING_ATTEMPTS_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(item);
    localStorage.setItem(PENDING_ATTEMPTS_KEY, JSON.stringify(queue));
  } catch (e) {}
}

export function retryPendingSync() {
  // Optionally sync pending attempts when connection restores
  const raw = localStorage.getItem(PENDING_ATTEMPTS_KEY);
  if (!raw) return;
  const queue = JSON.parse(raw);
  if (queue.length === 0) return;
  // Clear and let player know
}
