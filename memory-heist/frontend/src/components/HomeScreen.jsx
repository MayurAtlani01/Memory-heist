import React from 'react';
import landingBg from '../assets/landing_bg.jpg';
import { PixelIcon } from './PixelIcon.jsx';

export function HomeScreen({ onStartGame, onOpenHowToPlay, isPractice, onTogglePractice, progress }) {
  const completedCount = progress?.completedLevelIds?.length || 0;
  const totalScore = progress?.totalScore || 0;
  const totalAttempts = progress?.totalAttempts || 0;
  const successRate = totalAttempts > 0 ? Math.round(((progress?.successfulHeists || 0) / totalAttempts) * 100) : 0;

  return (
    <div
      className="home-screen-wrap"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 11, 24, 0.2), rgba(5, 11, 24, 0.45)), url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Foreground Interactive Content Stack */}
      <div className="home-content">
        {/* Pure CSS 3D Pixel Title — Blends Seamlessly into Background */}
        <div className="pixel-brand-title">
          <div className="title-line-memory">MEMORY</div>
          <div className="title-line-heist-row">
            <span className="title-line-heist">HEIST</span>
            <div className="title-diamond">
              <PixelIcon name="gem" size={34} />
            </div>
          </div>
        </div>

        {/* Pure CSS Wooden Plank Signboard — No Image Crop Borders */}
        <div className="wood-banner">
          <span className="stud stud-tl" />
          <span className="stud stud-tr" />
          <span className="stud stud-bl" />
          <span className="stud stud-br" />
          <span className="wood-banner-text">STEAL THE TREASURE BEFORE THE MAP DISAPPEARS.</span>
        </div>

        {/* Mission Protocol Panel */}
        <div className="protocol-panel">
          <div className="protocol-tabs">
            <button
              className={`protocol-tab ${!isPractice ? 'active-cyan' : 'inactive'}`}
              onClick={() => isPractice && onTogglePractice()}
              id="normal-protocol-btn"
            >
              MISSION PROTOCOL
            </button>
            <button
              className={`protocol-tab ${isPractice ? 'active-amber' : 'inactive'}`}
              onClick={() => !isPractice && onTogglePractice()}
              id="practice-mode-toggle"
            >
              {isPractice ? 'PRACTICE PROTOCOL' : 'NORMAL HEIST PROTOCOL'}
            </button>
          </div>

          <p className="protocol-desc">
            {isPractice
              ? 'Practice Mode: Full blueprint remains visible throughout gameplay. Study guard routes and timing freely. Scores will not count toward official personal bests.'
              : 'Standard Heist: Blueprint conceals after memorization countdown. Only 1-tile visibility is maintained with 3 temporary flash charges.'}
          </p>
        </div>

        {/* Large Game Buttons */}
        <div className="home-actions">
          <button className="btn btn-primary btn-cta" onClick={onStartGame} id="start-game-btn">
            ▶ SELECT MISSION LEVEL
          </button>
          <button className="btn btn-secondary btn-cta" onClick={onOpenHowToPlay} id="how-to-play-btn">
            <PixelIcon name="book" size={18} /> OPERATIONS MANUAL
          </button>
        </div>

        {/* Operative Dossier Stats */}
        <div className="dossier-container">
          <div className="dossier-title">
            <span>OPERATIVE DOSSIER</span>
          </div>
          <div className="dossier-grid">
            <div className="dossier-stat">
              <div className="dossier-label">VAULTS CLEARED</div>
              <div className="dossier-value cyan-val">
                {completedCount} / 5
              </div>
            </div>
            <div className="dossier-stat">
              <div className="dossier-label">LIFETIME SCORE</div>
              <div className="dossier-value gold-val">
                {totalScore.toLocaleString()}
              </div>
            </div>
            <div className="dossier-stat">
              <div className="dossier-label">INFILTRATIONS</div>
              <div className="dossier-value">
                {totalAttempts}
              </div>
            </div>
            <div className="dossier-stat">
              <div className="dossier-label">SUCCESS RATE</div>
              <div className="dossier-value green-val">
                {successRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
