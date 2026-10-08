import { DEFAULT_MAPS } from '../data/defaultMaps.js';
import { supabase, isSupabaseConfigured } from './supabase.js';

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
 * Health check — checks Supabase if configured, or Spring Boot backend fallback
 */
export async function checkHealth() {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('levels').select('id').limit(1);
      if (!error) {
        return { status: 'UP', service: 'Supabase Cloud Database' };
      }
    } catch (err) {
      console.warn('Supabase connection check warning:', err.message);
    }
  }

  // Fallback: Check Spring Boot local backend
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
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
  // 1. Check Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: dbLevels, error } = await supabase
        .from('levels')
        .select('id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, guards')
        .order('level_number', { ascending: true });

      if (!error && dbLevels && dbLevels.length > 0) {
        let userAttempts = [];
        if (playerId) {
          const { data: atts } = await supabase
            .from('attempts')
            .select('level_id, score, success')
            .eq('player_id', playerId)
            .eq('success', true);
          userAttempts = atts || [];
        }

        return dbLevels.map((m) => {
          const lvlAtts = userAttempts.filter((a) => a.level_id === m.id);
          const bestScore = lvlAtts.length > 0 ? Math.max(...lvlAtts.map((a) => a.score || 0)) : null;
          return {
            id: m.id,
            levelNumber: m.level_number,
            name: m.name,
            description: m.description,
            difficulty: m.difficulty,
            width: m.width,
            height: m.height,
            memorizeTimeSeconds: m.memorize_time_seconds,
            timeLimitSeconds: m.time_limit_seconds,
            guardCount: m.guards ? m.guards.length : 0,
            completed: lvlAtts.length > 0,
            bestScore
          };
        });
      }
    } catch (err) {
      console.warn('Supabase fetchLevels failed, falling back:', err.message);
    }
  }

  // 2. Fallback: Spring Boot backend
  try {
    const url = playerId ? `${API_BASE_URL}/levels?playerId=${encodeURIComponent(playerId)}` : `${API_BASE_URL}/levels`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch levels from backend');
    return await res.json();
  } catch (err) {
    // 3. Fallback: Local handcrafted maps
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
  // 1. Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('id', levelId)
        .single();

      if (!error && data) {
        // Auto-detect door position from grid if not stored explicitly
        let doorPos = data.door || data.door_pos || null;
        if (!doorPos && Array.isArray(data.grid)) {
          for (let y = 0; y < data.grid.length; y++) {
            for (let x = 0; x < data.grid[y].length; x++) {
              if (data.grid[y][x] === 2) {
                doorPos = { x, y };
                break;
              }
            }
            if (doorPos) break;
          }
        }

        return {
          id: data.id,
          levelNumber: data.level_number,
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          width: data.width,
          height: data.height,
          memorizeTimeSeconds: data.memorize_time_seconds,
          timeLimitSeconds: data.time_limit_seconds,
          baseScore: data.base_score || 1000,
          grid: data.grid,
          entrance: data.entrance,
          exit: data.exit,
          key: data.key_pos,
          diamond: data.diamond_pos,
          door: doorPos,
          guards: data.guards || []
        };
      }
    } catch (err) {
      console.warn(`Supabase level fetch failed for ${levelId}, using fallback:`, err.message);
    }
  }

  // 2. Spring Boot backend
  try {
    const res = await fetch(`${API_BASE_URL}/levels/${encodeURIComponent(levelId)}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch level details');
    return await res.json();
  } catch (err) {
    // 3. Local fallback
    const found = DEFAULT_MAPS.find((m) => m.id === levelId || `level-${m.levelNumber}` === levelId);
    if (found) return found;
    throw new Error('Level not found');
  }
}

/**
 * Create a new attempt record
 */
export async function createAttempt(levelId, mode, playerId) {
  // 1. Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || null;

      const { data, error } = await supabase
        .from('attempts')
        .insert({
          level_id: levelId,
          mode: mode || 'NORMAL',
          player_id: playerId,
          user_id: userId,
          status: 'IN_PROGRESS'
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          levelId,
          mode,
          playerId,
          status: 'IN_PROGRESS'
        };
      }
    } catch (err) {
      console.warn('Could not register attempt on Supabase:', err.message);
    }
  }

  // 2. Spring Boot
  try {
    const res = await fetch(`${API_BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, mode, playerId }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Failed to register attempt');
    return await res.json();
  } catch (err) {
    // 3. Local offline attempt ID
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
  const scoreBreakdown = calculateLocalScore(resultData.success, resultData.timeTakenSeconds, resultData.timeLimitSeconds, resultData.flashesUsed);

  // 1. Supabase
  if (isSupabaseConfigured() && attemptId && !attemptId.startsWith('local_att_')) {
    try {
      const { error } = await supabase
        .from('attempts')
        .update({
          status: resultData.success ? 'COMPLETED' : 'FAILED',
          success: resultData.success,
          time_taken_seconds: resultData.timeTakenSeconds,
          flashes_used: resultData.flashesUsed,
          reason: resultData.reason,
          score: scoreBreakdown.totalScore,
          score_breakdown: scoreBreakdown,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (!error) {
        saveLocalProgress(resultData.levelId, resultData.mode, scoreBreakdown.totalScore, resultData.success);
        return {
          id: attemptId,
          success: resultData.success,
          timeTakenSeconds: resultData.timeTakenSeconds,
          flashesUsed: resultData.flashesUsed,
          reason: resultData.reason,
          score: scoreBreakdown.totalScore,
          scoreBreakdown,
          savedRemotely: true
        };
      }
    } catch (err) {
      console.warn('Failed to save attempt to Supabase, falling back:', err.message);
    }
  }

  // 2. Spring Boot
  if (!attemptId.startsWith('local_att_')) {
    try {
      const res = await fetch(`${API_BASE_URL}/attempts/${encodeURIComponent(attemptId)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalProgress(resultData.levelId, resultData.mode, data.score, resultData.success);
        return { ...data, savedRemotely: true };
      }
    } catch (err) {
      console.warn('Failed to save attempt to server, caching locally:', err.message);
    }
  }

  // 3. Fallback: local score calculation & local cache
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
  // 1. Supabase
  if (isSupabaseConfigured() && playerId) {
    try {
      const { data: attempts, error } = await supabase
        .from('attempts')
        .select('level_id, score, success, mode')
        .eq('player_id', playerId);

      if (!error && attempts) {
        const successful = attempts.filter((a) => a.success);
        const completedLevelIds = [...new Set(successful.map((a) => a.level_id))];
        const bestScores = {};
        for (const a of successful) {
          if (!bestScores[a.level_id] || a.score > bestScores[a.level_id]) {
            bestScores[a.level_id] = a.score;
          }
        }
        const totalScore = Object.values(bestScores).reduce((sum, s) => sum + s, 0);

        return {
          playerId,
          completedLevelIds,
          totalScore,
          totalAttempts: attempts.length,
          successfulHeists: successful.length,
          bestScores
        };
      }
    } catch (err) {
      console.warn('Supabase fetchProgress failed, falling back:', err.message);
    }
  }

  // 2. Spring Boot
  try {
    const res = await fetch(`${API_BASE_URL}/progress?playerId=${encodeURIComponent(playerId)}`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Failed to fetch player progress');
    return await res.json();
  } catch (err) {
    // 3. Local storage progress
    return getLocalProgress();
  }
}

/**
 * Local score formula fallback (matches backend ScoreCalculator exactly)
 */
export function calculateLocalScore(success, timeTakenSeconds, timeLimitSeconds, flashesUsed) {
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

// Local storage progress helpers
export function getLocalProgress() {
  try {
    const data = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading local progress:', err);
  }
  return {
    playerId: getOrCreatePlayerId(),
    completedLevelIds: [],
    totalScore: 0,
    totalAttempts: 0,
    successfulHeists: 0,
    bestScores: {}
  };
}

export function saveLocalProgress(levelId, mode, score, success) {
  const p = getLocalProgress();
  p.totalAttempts = (p.totalAttempts || 0) + 1;
  if (success) {
    p.successfulHeists = (p.successfulHeists || 0) + 1;
    if (!p.completedLevelIds.includes(levelId)) {
      p.completedLevelIds.push(levelId);
    }
    const currentBest = p.bestScores[levelId] || 0;
    if (score > currentBest) {
      p.bestScores[levelId] = score;
    }
    p.totalScore = Object.values(p.bestScores).reduce((acc, curr) => acc + curr, 0);
  }
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(p));
  } catch (err) {
    console.error('Failed writing local progress:', err);
  }
  return p;
}

function queuePendingAttempt(attempt) {
  try {
    const queue = JSON.parse(localStorage.getItem(PENDING_ATTEMPTS_KEY) || '[]');
    queue.push(attempt);
    localStorage.setItem(PENDING_ATTEMPTS_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed queueing pending attempt:', err);
  }
}
