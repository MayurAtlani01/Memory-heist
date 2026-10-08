import React from 'react';
import landingBg from '../assets/landing_bg.jpg';
import landingLogo from '../assets/landing_logo_transparent.png';
import woodBanner from '../assets/wood_banner_clean.png';
import { PixelIcon } from './PixelIcon.jsx';

export function HomeScreen({ onStartGame, onOpenHowToPlay, onOpenAuth, currentUser, progress }) {
  const completedCount = progress?.completedLevelIds?.length || 0;
  const totalScore = progress?.totalScore || 0;
  const totalAttempts = progress?.totalAttempts || 0;
  const successRate = totalAttempts > 0 ? Math.round(((progress?.successfulHeists || 0) / totalAttempts) * 100) : 0;

  const agentName = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0];

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
        {/* Authentic Pixel Art Title Logo PNG */}
        <div className="landing-logo-wrap">
          <img
            src={landingLogo}
            alt="Memory Heist"
            className="landing-logo-pixel"
          />
        </div>

        {/* Authentic Pixel Wooden Signboard PNG */}
        <div className="wood-banner-pixel-wrap">
          <img
            src={woodBanner}
            alt="STEAL THE TREASURE BEFORE THE MAP DISAPPEARS."
            className="wood-banner-pixel"
          />
        </div>

        {/* Large Game Buttons */}
        <div className="home-actions">
          <button className="btn btn-primary btn-cta" onClick={onStartGame} id="start-game-btn">
            ▶ SELECT MISSION LEVEL
          </button>
          <button className="btn btn-secondary btn-cta" onClick={onOpenHowToPlay} id="how-to-play-btn">
            <PixelIcon name="book" size={18} /> OPERATIONS MANUAL
          </button>
          <button className="btn btn-secondary btn-cta" onClick={onOpenAuth} id="auth-screen-btn">
            <PixelIcon name="user" size={18} color="#25C7FF" /> {currentUser ? `AGENT: ${agentName}` : 'OPERATIVE AUTH'}
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
