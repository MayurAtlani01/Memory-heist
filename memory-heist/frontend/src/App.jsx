import React, { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen.jsx';
import { LevelSelectScreen } from './components/LevelSelectScreen.jsx';
import { GameScreen } from './components/GameScreen.jsx';
import { HowToPlayModal } from './components/HowToPlayModal.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import { getCurrentUser, onAuthStateChange, signOut } from './services/auth.js';
import {
  getOrCreatePlayerId,
  checkHealth,
  fetchLevels,
  fetchLevel,
  fetchProgress
} from './services/api.js';

export function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'auth' | 'level-select' | 'game'
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isPractice, setIsPractice] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [serverOnline, setServerOnline] = useState(null);
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [activeLevelData, setActiveLevelData] = useState(null);
  const [progress, setProgress] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const playerId = currentUser?.id || getOrCreatePlayerId();

  // Load user session on mount
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setCurrentUser(u);
    });

    const { data: authListener } = onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Load backend status and level metadata
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Health check
      const health = await checkHealth();
      setServerOnline(health.status === 'UP');

      // 2. Fetch levels
      const levelSummaries = await fetchLevels(playerId);
      setLevels(levelSummaries);

      // 3. Fetch player progress
      const p = await fetchProgress(playerId);
      setProgress(p);
    } catch (err) {
      console.warn('Initial data load error:', err);
      setError('Operating in local offline cache mode.');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Navigate to Level
  const handleSelectLevel = async (levelId) => {
    try {
      setLoading(true);
      const levelData = await fetchLevel(levelId);
      setSelectedLevelId(levelId);
      setActiveLevelData(levelData);
      setScreen('game');
    } catch (err) {
      alert('Could not load level blueprint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Advance to next level
  const handleNextLevel = async () => {
    if (!activeLevelData) return;
    const currentNumber = activeLevelData.levelNumber;
    const nextSummary = levels.find((l) => l.levelNumber === currentNumber + 1);
    if (nextSummary) {
      await handleSelectLevel(nextSummary.id);
    } else {
      setScreen('level-select');
      loadInitialData();
    }
  };

  const handleExitGameToSelect = () => {
    setScreen('level-select');
    loadInitialData();
  };

  const currentLevelIndex = levels.findIndex((l) => l.id === selectedLevelId);
  const hasNextLevel = currentLevelIndex >= 0 && currentLevelIndex < levels.length - 1;

  return (
    <div className="app-container">
      {/* Universal Pixel Header (Hidden on Home Landing Page per design) */}
      {screen !== 'home' && (
        <header className="header">
          <div className="header-brand" onClick={() => setScreen('home')} style={{ cursor: 'pointer' }}>
            <div className="mh-logo">MH</div>
            <div className="brand-text-col">
              <span className="brand-title">MEMORY HEIST</span>
              <span className="brand-version">v1.0</span>
            </div>
          </div>

          <div className="header-status">
            {currentUser && (
              <span className="operative-badge" style={{ color: '#25C7FF', fontFamily: 'monospace', fontSize: '11px', marginRight: '6px' }}>
                AGENT: {currentUser.user_metadata?.username || currentUser.email?.split('@')[0]}
              </span>
            )}

            <span className="status-indicator">
              <span className={`status-dot ${serverOnline ? 'dot-online' : 'dot-offline'}`} />
              <span className="status-text">{serverOnline ? 'SERVER ONLINE' : 'LOCAL CACHE'}</span>
            </span>

            {currentUser ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  await signOut();
                  setCurrentUser(null);
                  loadInitialData();
                }}
                id="sign-out-btn"
              >
                LOGOUT
              </button>
            ) : screen !== 'auth' ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setScreen('auth')}
                id="header-login-btn"
              >
                LOGIN
              </button>
            ) : null}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setScreen('home');
                loadInitialData();
              }}
              id="main-menu-btn"
            >
              MAIN MENU
            </button>
          </div>
        </header>
      )}

      {/* Main Screen Content Router */}
      <main className="main-content">
        {screen === 'home' && (
          <HomeScreen
            onStartGame={() => setScreen('level-select')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenAuth={() => setScreen('auth')}
            currentUser={currentUser}
            progress={progress}
          />
        )}

        {screen === 'auth' && (
          <AuthScreen
            onAuthSuccess={(u) => {
              setCurrentUser(u);
              setScreen('home');
              loadInitialData();
            }}
            onContinueAsGuest={() => {
              setScreen('home');
              loadInitialData();
            }}
          />
        )}

        {screen === 'level-select' && (
          <LevelSelectScreen
            levels={levels}
            loading={loading}
            error={error}
            onSelectLevel={handleSelectLevel}
            onBack={() => setScreen('home')}
            isPractice={isPractice}
            onTogglePractice={() => setIsPractice(!isPractice)}
          />
        )}

        {screen === 'game' && activeLevelData && (
          <GameScreen
            rawLevel={activeLevelData}
            isPractice={isPractice}
            playerId={playerId}
            onExitToSelect={handleExitGameToSelect}
            onNextLevel={handleNextLevel}
            hasNextLevel={hasNextLevel}
          />
        )}
      </main>

      {/* Operations Manual Modal */}
      {isHowToPlayOpen && (
        <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
      )}
    </div>
  );
}

export default App;
