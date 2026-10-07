import React from 'react';
import vaultSelectBg from '../assets/vault_select_bg.jpg';
import { VaultIllustration } from './VaultIllustration.jsx';
import { PixelIcon } from './PixelIcon.jsx';

export function LevelSelectScreen({
  levels,
  loading,
  error,
  onSelectLevel,
  onBack,
  isPractice,
  onTogglePractice
}) {
  const getDiffClass = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'EASY': return 'diff-easy';
      case 'MEDIUM': return 'diff-medium';
      case 'HARD': return 'diff-hard';
      case 'EXPERT': return 'diff-expert';
      case 'MASTER': return 'diff-master';
      default: return 'diff-easy';
    }
  };

  return (
    <div
      className="level-select-wrap"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 11, 24, 0.35), rgba(5, 11, 24, 0.6)), url(${vaultSelectBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Bar with Return Button & Protocol Toggle */}
      <div className="level-select-topbar">
        <button className="btn btn-secondary btn-sm" onClick={onBack} id="back-to-home-btn">
          ← RETURN TO HOME
        </button>

        {/* Hanging Wooden Sign Title with Torches */}
        <div className="vault-title-sign">
          <div className="sign-chain left-chain" />
          <div className="sign-chain right-chain" />
          <div className="sign-torch left-torch">
            <PixelIcon name="torch" size={24} />
          </div>
          <h2 className="vault-main-heading">
            TARGET INFILTRATION VAULTS
          </h2>
          <div className="sign-torch right-torch">
            <PixelIcon name="torch" size={24} />
          </div>
        </div>

        <div className="protocol-selector-mini">
          <span className="protocol-mini-label">Protocol:</span>
          <button
            className={`btn btn-sm ${isPractice ? 'btn-amber' : 'btn-secondary'}`}
            onClick={onTogglePractice}
            id="level-select-practice-toggle"
          >
            {isPractice ? 'PRACTICE (VISIBLE)' : 'NORMAL MODE (HIDDEN)'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <span className="pixel-pulse">Retrieving classified blueprints...</span>
        </div>
      )}

      {error && !loading && (
        <div className="pixel-panel error-panel">
          <p style={{ color: 'var(--red)', marginBottom: '0.5rem', fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
            {error}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Using cached offline blueprints.</p>
        </div>
      )}

      {!loading && (
        <div className="level-grid">
          {levels.map((lvl) => {
            const isCompleted = lvl.completed;
            const bestScore = lvl.bestScore;

            return (
              <div
                key={lvl.id}
                className={`vault-card ${isCompleted ? 'completed-card' : ''}`}
                onClick={() => onSelectLevel(lvl.id)}
                id={`level-card-${lvl.levelNumber}`}
              >
                {/* Card Top: Vault # and Difficulty Badge */}
                <div className="vault-badge-row">
                  <span className="vault-number">VAULT {lvl.levelNumber.toString().padStart(2, '0')}</span>
                  <span className={`level-diff ${getDiffClass(lvl.difficulty)}`}>
                    {lvl.difficulty}
                  </span>
                </div>

                {/* Pixel Art Illustration of the Vault */}
                <div className="vault-art-wrap">
                  <VaultIllustration levelNumber={lvl.levelNumber} />
                </div>

                {/* Vault Name & Description */}
                <h3 className="vault-card-title">{lvl.name}</h3>
                <p className="vault-card-desc">{lvl.description}</p>

                <div className="card-divider" />

                {/* Specs Row: Grid, Memorize, Guards */}
                <div className="vault-specs">
                  <div className="vault-spec-item">
                    <span className="spec-label">GRID</span>
                    <strong className="spec-val">{lvl.width}×{lvl.height}</strong>
                  </div>
                  <div className="vault-spec-item">
                    <span className="spec-label">MEMORIZE</span>
                    <strong className="spec-val">{lvl.memorizeTimeSeconds}s</strong>
                  </div>
                  <div className="vault-spec-item">
                    <span className="spec-label">GUARDS</span>
                    <strong className="spec-val">{lvl.guardCount}</strong>
                  </div>
                </div>

                {/* Card Footer: Best score or untested + Infiltrate Button */}
                <div className="vault-card-footer">
                  <div className="score-status-col">
                    {bestScore ? (
                      <span className="best-score-badge">★ BEST: {bestScore.toLocaleString()}</span>
                    ) : isCompleted ? (
                      <span className="cleared-badge">✓ CLEARED</span>
                    ) : (
                      <span className="untested-badge">UNTESTED</span>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm infiltrate-btn">
                    INFILTRATE ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
