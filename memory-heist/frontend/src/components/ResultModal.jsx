import React from 'react';
import { PixelIcon } from './PixelIcon.jsx';

export function ResultModal({
  result,
  level,
  isPractice,
  onRetry,
  onLevelSelect,
  onNextLevel,
  hasNextLevel
}) {
  if (!result) return null;

  const isSuccess = Boolean(result.success);
  const breakdown = result.scoreBreakdown || {
    baseScore: isSuccess ? 1000 : 0,
    timeBonus: 0,
    flashBonus: 0,
    totalScore: result.score || 0
  };

  const getReasonTitle = () => {
    if (isSuccess) return 'HEIST SUCCESSFUL';
    switch (result.reason) {
      case 'GUARD_COLLISION':
      case 'LINE_OF_SIGHT':
      case 'CAUGHT_BY_GUARD':
        return 'DETECTED BY SECURITY PATROL';
      case 'TIME_EXPIRED':
        return 'MISSION TIME EXPIRED';
      case 'ABORTED':
        return 'OPERATION ABORTED';
      default:
        return 'OPERATION COMPROMISED';
    }
  };

  const getReasonDescription = () => {
    if (isSuccess) {
      return `Target diamond retrieved and extracted safely from ${level.name}.`;
    }
    switch (result.reason) {
      case 'GUARD_COLLISION':
        return 'Direct collision with patrolling security guard.';
      case 'LINE_OF_SIGHT':
      case 'CAUGHT_BY_GUARD':
        return 'Spotted in the security guard flashlight beam.';
      case 'TIME_EXPIRED':
        return 'Building security lockdown engaged before escape.';
      default:
        return 'Mission ended before completion.';
    }
  };

  return (
    <div className="pixel-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div className={`pixel-modal-content ${isSuccess ? 'result-success-border' : 'result-danger-border'}`}>
        <div className="result-header-col">
          <div className={`debrief-pill ${isSuccess ? 'pill-success' : 'pill-danger'}`}>
            MISSION DEBRIEF
          </div>

          <h2 id="result-title" className={`result-title ${isSuccess ? 'title-success' : 'title-danger'}`}>
            {getReasonTitle()}
          </h2>

          <p className="result-description">
            {getReasonDescription()}
          </p>

          {isPractice && (
            <div className="practice-attempt-notice">
              PRACTICE RUN — SCORES EXCLUDED FROM LEADERBOARDS
            </div>
          )}
        </div>

        {/* Score Breakdown Table */}
        <div className="pixel-score-table-wrap">
          <div className="score-table-header">
            TACTICAL PERFORMANCE BREAKDOWN
          </div>

          <table className="score-breakdown-table">
            <tbody>
              <tr>
                <td className="score-metric-name">Base Completion Bonus</td>
                <td className={`score-metric-val ${isSuccess ? 'val-white' : 'val-muted'}`}>
                  +{breakdown.baseScore.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="score-metric-name">
                  Time Remaining Bonus ({Math.max(0, (level.timeLimitSeconds || 60) - (result.timeTakenSeconds || 0))}s)
                </td>
                <td className={`score-metric-val ${isSuccess ? 'val-cyan' : 'val-muted'}`}>
                  +{breakdown.timeBonus.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="score-metric-name">
                  Unused Memory Flashes ({Math.max(0, 3 - (result.flashesUsed || 0))} / 3)
                </td>
                <td className={`score-metric-val ${isSuccess ? 'val-cyan' : 'val-muted'}`}>
                  +{breakdown.flashBonus.toLocaleString()}
                </td>
              </tr>
              <tr className="score-total-row">
                <td className="total-label">FINAL SCORE</td>
                <td className="total-val">{breakdown.totalScore.toLocaleString()} PTS</td>
              </tr>
            </tbody>
          </table>
        </div>

        {result.savedRemotely === false && (
          <div className="offline-notice">
            Saved to local offline cache.
          </div>
        )}

        <div className="result-actions-row">
          <button className="btn btn-secondary" onClick={onRetry} id="retry-btn">
            <PixelIcon name="restart" size={14} /> RETRY VAULT
          </button>
          <button className="btn btn-secondary" onClick={onLevelSelect} id="select-level-btn">
            <PixelIcon name="vaults" size={14} /> LEVEL SELECT
          </button>
          {isSuccess && hasNextLevel && (
            <button className="btn btn-primary" onClick={onNextLevel} id="next-level-btn">
              NEXT VAULT ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
