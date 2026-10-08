import React from 'react';

/**
 * PixelIcon renders crisp, authentic 16x16 / 24x24 pixel-art SVG icons
 * using crispEdges rendering to avoid modern vector anti-aliasing.
 */
export function PixelIcon({ name, size = 16, className = '', color }) {
  const pixelStyle = {
    imageRendering: 'pixelated',
    shapeRendering: 'crispEdges',
    display: 'inline-block',
    verticalAlign: 'middle',
    width: size,
    height: size,
    flexShrink: 0
  };

  switch (name) {
    case 'key':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Key head */}
          <rect x="2" y="5" width="6" height="6" fill={color || '#FFB51B'} />
          <rect x="4" y="7" width="2" height="2" fill="#091225" />
          {/* Key shaft */}
          <rect x="7" y="7" width="7" height="2" fill={color || '#FFB51B'} />
          {/* Key teeth */}
          <rect x="11" y="9" width="1" height="2" fill={color || '#FFB51B'} />
          <rect x="13" y="9" width="1" height="3" fill={color || '#FFB51B'} />
          {/* Highlight */}
          <rect x="3" y="5" width="4" height="1" fill="#FFD34D" />
          <rect x="8" y="7" width="5" height="1" fill="#FFD34D" />
        </svg>
      );

    case 'gem':
    case 'diamond':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Facets & shape */}
          <polygon points="5,2 11,2 14,6 8,14 2,6" fill={color || '#45D9FF'} />
          {/* Highlight facet */}
          <polygon points="5,2 11,2 12,6 8,6 4,6" fill="#A8F2FF" />
          {/* Center facet */}
          <polygon points="8,6 12,6 8,14" fill="#16B8F2" />
          <polygon points="8,6 4,6 8,14" fill="#25C7FF" />
          {/* Dark facets */}
          <polygon points="2,6 4,6 8,14" fill="#0879A8" />
          <polygon points="14,6 12,6 8,14" fill="#0D2940" />
          {/* Glint sparkle */}
          <rect x="6" y="3" width="2" height="1" fill="#FFFFFF" />
        </svg>
      );

    case 'torch':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Wall bracket */}
          <rect x="6" y="9" width="4" height="2" fill="#354663" />
          {/* Wooden handle */}
          <rect x="7" y="8" width="2" height="7" fill="#8B4F24" />
          <rect x="6" y="7" width="4" height="2" fill="#5A321F" />
          {/* Flame outer */}
          <rect x="6" y="2" width="4" height="5" fill="#FF4B4B" />
          <rect x="5" y="3" width="6" height="3" fill="#FF8A18" />
          {/* Flame inner */}
          <rect x="7" y="3" width="2" height="3" fill="#FFD34D" />
          <rect x="7" y="1" width="2" height="2" fill="#FFB51B" />
          <rect x="7" y="4" width="2" height="2" fill="#FFFFFF" />
        </svg>
      );

    case 'flash':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <polygon points="9,1 4,8 8,8 7,15 13,7 9,7" fill={color || '#25C7FF'} />
          <polygon points="8,3 5,8 8,8 7,13 11,7 9,7" fill="#A8F2FF" />
        </svg>
      );

    case 'guard':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Red patrol cap */}
          <rect x="5" y="2" width="6" height="2" fill="#FF4B4B" />
          <rect x="4" y="3" width="8" height="2" fill="#FF4B4B" />
          {/* Face */}
          <rect x="5" y="5" width="6" height="3" fill="#E8B084" />
          <rect x="8" y="6" width="2" height="1" fill="#08101F" />
          {/* Navy uniform body */}
          <rect x="4" y="8" width="8" height="5" fill="#17243A" />
          <rect x="3" y="9" width="10" height="3" fill="#263650" />
          {/* Belt & badge */}
          <rect x="5" y="12" width="6" height="1" fill="#091225" />
          <rect x="7" y="12" width="2" height="1" fill="#FFB51B" />
          {/* Legs */}
          <rect x="5" y="13" width="2" height="3" fill="#091225" />
          <rect x="9" y="13" width="2" height="3" fill="#091225" />
        </svg>
      );

    case 'thief':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Navy hooded cloak */}
          <rect x="5" y="2" width="6" height="3" fill="#101B33" />
          <rect x="4" y="3" width="8" height="4" fill="#17243A" />
          {/* Cyan mask/visor */}
          <rect x="6" y="5" width="4" height="2" fill="#16B8F2" />
          <rect x="8" y="5" width="1" height="1" fill="#A8F2FF" />
          {/* Cloak body */}
          <rect x="4" y="7" width="8" height="6" fill="#101B33" />
          {/* Backpack */}
          <rect x="3" y="8" width="2" height="4" fill="#8B4F24" />
          {/* Boots */}
          <rect x="5" y="13" width="2" height="3" fill="#050B18" />
          <rect x="9" y="13" width="2" height="3" fill="#050B18" />
        </svg>
      );

    case 'book':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Book spine */}
          <rect x="1" y="3" width="2" height="10" fill="#0879A8" />
          {/* Left pages */}
          <rect x="3" y="3" width="5" height="10" fill="#25C7FF" />
          <rect x="4" y="4" width="3" height="8" fill="#F5F7FF" />
          {/* Right pages */}
          <rect x="8" y="3" width="5" height="10" fill="#16B8F2" />
          <rect x="9" y="4" width="3" height="8" fill="#F5F7FF" />
          {/* Bookmark */}
          <rect x="7" y="5" width="2" height="5" fill="#FFB51B" />
        </svg>
      );

    case 'chest':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Wood body */}
          <rect x="2" y="5" width="12" height="9" fill="#8B4F24" />
          {/* Lid arch */}
          <rect x="3" y="4" width="10" height="2" fill="#5A321F" />
          {/* Metal trim */}
          <rect x="2" y="5" width="12" height="2" fill="#B86A2B" />
          <rect x="4" y="5" width="2" height="9" fill="#FFB51B" />
          <rect x="10" y="5" width="2" height="9" fill="#FFB51B" />
          {/* Gold lock latch */}
          <rect x="7" y="7" width="2" height="3" fill="#FFD34D" />
          <rect x="7" y="10" width="2" height="1" fill="#050B18" />
        </svg>
      );

    case 'restart':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="4" y="3" width="8" height="2" fill={color || '#F5F7FF'} />
          <rect x="2" y="5" width="2" height="6" fill={color || '#F5F7FF'} />
          <rect x="4" y="11" width="8" height="2" fill={color || '#F5F7FF'} />
          <rect x="12" y="8" width="2" height="3" fill={color || '#F5F7FF'} />
          {/* Arrowhead */}
          <polygon points="12,3 15,6 9,6" fill={color || '#FFB51B'} />
        </svg>
      );

    case 'vaults':
    case 'map':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Castle fortress / map folds */}
          <rect x="2" y="3" width="3" height="10" fill="#263650" />
          <rect x="5" y="4" width="3" height="10" fill="#17243A" />
          <rect x="8" y="3" width="3" height="10" fill="#263650" />
          <rect x="11" y="4" width="3" height="10" fill="#17243A" />
          {/* Wall battlements */}
          <rect x="2" y="1" width="2" height="2" fill="#354663" />
          <rect x="7" y="1" width="2" height="2" fill="#354663" />
          <rect x="12" y="1" width="2" height="2" fill="#354663" />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <polygon points="8,1 10,6 15,6 11,9 13,15 8,11 3,15 5,9 1,6 6,6" fill={color || '#FFB51B'} />
          <polygon points="8,3 9,7 13,7 10,9 11,13 8,10" fill="#FFD34D" />
        </svg>
      );

    case 'clock':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="3" y="3" width="10" height="10" fill="#101B33" stroke="#25C7FF" strokeWidth="1" />
          <rect x="7" y="5" width="2" height="4" fill="#FFD34D" />
          <rect x="7" y="7" width="4" height="2" fill="#FFD34D" />
        </svg>
      );

    case 'skull':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="4" y="2" width="8" height="7" fill={color || '#FF4B4B'} />
          <rect x="5" y="5" width="2" height="2" fill="#050B18" />
          <rect x="9" y="5" width="2" height="2" fill="#050B18" />
          <rect x="5" y="9" width="6" height="4" fill={color || '#FF4B4B'} />
          <rect x="6" y="10" width="1" height="3" fill="#050B18" />
          <rect x="8" y="10" width="1" height="3" fill="#050B18" />
        </svg>
      );

    case 'mail':
    case 'envelope':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="2" y="4" width="12" height="9" fill="#17243A" stroke={color || '#6BA3C7'} strokeWidth="1" />
          <rect x="3" y="5" width="10" height="1" fill={color || '#A8F2FF'} />
          <rect x="4" y="6" width="2" height="1" fill={color || '#6BA3C7'} />
          <rect x="10" y="6" width="2" height="1" fill={color || '#6BA3C7'} />
          <rect x="6" y="7" width="4" height="1" fill={color || '#6BA3C7'} />
          <rect x="7" y="8" width="2" height="1" fill={color || '#6BA3C7'} />
        </svg>
      );

    case 'lock':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Shackle */}
          <rect x="5" y="2" width="6" height="5" fill="none" stroke={color || '#A8F2FF'} strokeWidth="1.5" />
          {/* Lock body */}
          <rect x="3" y="6" width="10" height="8" fill={color || '#FFB51B'} />
          <rect x="3" y="6" width="10" height="2" fill="#FFD34D" />
          {/* Keyhole */}
          <rect x="7" y="9" width="2" height="2" fill="#091225" />
          <rect x="7.5" y="10" width="1" height="2" fill="#091225" />
        </svg>
      );

    case 'eye':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="2" y="7" width="12" height="2" fill={color || '#6BA3C7'} />
          <rect x="4" y="5" width="8" height="2" fill={color || '#6BA3C7'} />
          <rect x="4" y="9" width="8" height="2" fill={color || '#6BA3C7'} />
          <rect x="6" y="6" width="4" height="4" fill="#08101F" />
          <rect x="7" y="7" width="2" height="2" fill="#25C7FF" />
          <rect x="8" y="7" width="1" height="1" fill="#FFFFFF" />
        </svg>
      );

    case 'eye-off':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="2" y="7" width="12" height="2" fill={color || '#455A75'} />
          <rect x="4" y="5" width="8" height="2" fill={color || '#455A75'} />
          <rect x="4" y="9" width="8" height="2" fill={color || '#455A75'} />
          {/* Diagonal Slash */}
          <rect x="2" y="13" width="2" height="2" fill="#FF4B4B" />
          <rect x="5" y="10" width="2" height="2" fill="#FF4B4B" />
          <rect x="7" y="8" width="2" height="2" fill="#FF4B4B" />
          <rect x="9" y="6" width="2" height="2" fill="#FF4B4B" />
          <rect x="12" y="3" width="2" height="2" fill="#FF4B4B" />
        </svg>
      );

    case 'user':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Head */}
          <rect x="6" y="2" width="4" height="4" fill={color || '#25C7FF'} />
          {/* Neck */}
          <rect x="7" y="6" width="2" height="1" fill={color || '#25C7FF'} />
          {/* Shoulders / Torso */}
          <rect x="3" y="8" width="10" height="5" fill={color || '#16B8F2'} />
          <rect x="4" y="7" width="8" height="2" fill={color || '#25C7FF'} />
          <rect x="2" y="10" width="12" height="3" fill="#101B33" />
        </svg>
      );

    case 'user-plus':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Head */}
          <rect x="4" y="2" width="4" height="4" fill={color || '#25C7FF'} />
          {/* Torso */}
          <rect x="2" y="8" width="8" height="5" fill={color || '#16B8F2'} />
          <rect x="3" y="7" width="6" height="2" fill={color || '#25C7FF'} />
          {/* Plus */}
          <rect x="12" y="6" width="2" height="6" fill="#FFB51B" />
          <rect x="10" y="8" width="6" height="2" fill="#FFB51B" />
        </svg>
      );

    case 'globe':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          <rect x="4" y="2" width="8" height="12" fill={color || '#17243A'} stroke="#25C7FF" strokeWidth="1" />
          <rect x="2" y="4" width="12" height="8" fill={color || '#17243A'} stroke="#25C7FF" strokeWidth="1" />
          <rect x="7" y="2" width="2" height="12" fill="#45D9FF" />
          <rect x="2" y="7" width="12" height="2" fill="#45D9FF" />
        </svg>
      );

    case 'scroll':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Parchment scroll body */}
          <rect x="3" y="4" width="10" height="8" fill={color || '#E8D5B5'} />
          {/* Left and right roll edges */}
          <rect x="2" y="3" width="2" height="10" fill="#C2A882" />
          <rect x="12" y="3" width="2" height="10" fill="#C2A882" />
          {/* Text lines */}
          <rect x="5" y="6" width="6" height="1" fill="#7A5835" />
          <rect x="5" y="8" width="4" height="1" fill="#7A5835" />
          <rect x="5" y="10" width="5" height="1" fill="#7A5835" />
        </svg>
      );

    case 'login-arrow':
      return (
        <svg viewBox="0 0 16 16" style={pixelStyle} className={className}>
          {/* Door */}
          <rect x="1" y="2" width="2" height="12" fill="#6BA3C7" />
          <rect x="3" y="2" width="6" height="2" fill="#6BA3C7" />
          <rect x="3" y="12" width="6" height="2" fill="#6BA3C7" />
          {/* Arrow */}
          <rect x="5" y="7" width="7" height="2" fill={color || '#FFB51B'} />
          <polygon points="12,5 15,8 12,11" fill={color || '#FFB51B'} />
        </svg>
      );

    default:
      return null;
  }
}
