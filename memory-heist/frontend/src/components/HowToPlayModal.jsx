import React from 'react';
import { PixelIcon } from './PixelIcon.jsx';

export function HowToPlayModal({ onClose }) {
  return (
    <div className="pixel-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="pixel-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pixel-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PixelIcon name="book" size={20} />
            <h2 id="modal-title" className="pixel-modal-title">
              TACTICAL OPERATIONS MANUAL
            </h2>
          </div>
          <button className="pixel-modal-close" onClick={onClose} aria-label="Close manual">✕</button>
        </div>

        <div className="pixel-modal-body">
          <div className="manual-section">
            <h3 className="manual-heading">
              1. The 4 Mission Phases
            </h3>
            <ul className="manual-list">
              <li><strong>Briefing:</strong> Review target parameters, study time, and security patrol density.</li>
              <li><strong>Memorize:</strong> The full building layout is revealed during countdown. Study the path, key location, locked vault door, and guard routes.</li>
              <li><strong>Heist:</strong> Darkness falls! The layout disappears into darkness. Navigate purely from memory.</li>
              <li><strong>Result:</strong> Mission outcome debrief, performance statistics, and score bonuses.</li>
            </ul>
          </div>

          <div className="manual-section">
            <h3 className="manual-heading">
              2. Visibility & Memory Flashes
            </h3>
            <p className="manual-text">
              During the heist, only your <strong>immediate 1-tile surroundings</strong> remain visible. When you move away from a tile, it returns to darkness.
            </p>
            <p className="manual-text">
              You possess <strong>3 Memory Flashes</strong> per attempt. Pressing <span className="keycap">Space</span> illuminates nearby rooms within a 3-tile radius for 1.5 seconds.
            </p>
          </div>

          <div className="manual-section">
            <h3 className="manual-heading">
              3. Security Patrols & Detection
            </h3>
            <p className="manual-text">
              Guards follow fixed, deterministic patrol routes and project directional flashlight beams in a straight line.
            </p>
            <ul className="manual-list">
              <li>Stone walls and closed vault doors block guard vision.</li>
              <li>Stepping into a guard's sight line or touching their tile triggers an alarm and fails the attempt immediately.</li>
            </ul>
          </div>

          <div className="manual-section">
            <h3 className="manual-heading">
              4. Infiltration Objective
            </h3>
            <ol className="manual-list">
              <li>Locate and pick up the <strong style={{ color: 'var(--gold)' }}>Brass Key</strong>.</li>
              <li>The key automatically unlocks the reinforced <strong style={{ color: 'var(--green)' }}>Vault Door</strong>.</li>
              <li>Infiltrate the inner chamber and steal the <strong style={{ color: 'var(--diamond)' }}>Diamond</strong>.</li>
              <li>Navigate to the <strong style={{ color: 'var(--green)' }}>EXIT</strong> carrying the diamond to extract!</li>
            </ol>
          </div>

          <div className="manual-controls-note">
            <span>Controls: <span className="keycap">W</span> <span className="keycap">A</span> <span className="keycap">S</span> <span className="keycap">D</span> / Arrows | Flash: <span className="keycap">Space</span> | Pause: <span className="keycap">Esc</span></span>
          </div>
        </div>

        <div className="pixel-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
