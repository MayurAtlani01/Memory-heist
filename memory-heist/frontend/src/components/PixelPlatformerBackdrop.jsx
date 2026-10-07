import React from 'react';

/**
 * PixelPlatformerBackdrop renders the master pixel-art platformer environment
 * seen in the reference image: night sky, dungeon ruins, torches, wooden ladders,
 * crates, spike pit, rope bridge, and glowing vault chamber with the diamond.
 */
export function PixelPlatformerBackdrop() {
  return (
    <div className="platformer-backdrop" aria-hidden="true">
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="platformer-svg"
        style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
      >
        <defs>
          {/* Subtle night gradient */}
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050B18" />
            <stop offset="60%" stopColor="#0A152B" />
            <stop offset="100%" stopColor="#061021" />
          </linearGradient>

          {/* Vault Interior Glow */}
          <radialGradient id="vaultGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFD34D" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FFB51B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050B18" stopOpacity="0" />
          </radialGradient>

          {/* Torch Glow */}
          <radialGradient id="torchGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FF8A18" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF4B4B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Deep Night Sky */}
        <rect x="0" y="0" width="1200" height="600" fill="url(#nightSky)" />

        {/* 2. Pixel Stars & Sparkles */}
        <g fill="#A8F2FF" opacity="0.75">
          <rect x="80" y="70" width="3" height="3" />
          <rect x="240" y="45" width="2" height="2" />
          <rect x="360" y="110" width="4" height="4" />
          <rect x="520" y="60" width="2" height="2" />
          <rect x="740" y="120" width="4" height="4" />
          <rect x="910" y="50" width="3" height="3" />
          <rect x="1080" y="90" width="2" height="2" />
          <rect x="1140" y="160" width="3" height="3" />

          {/* 4-point pixel stars */}
          <polygon points="415,100 417,95 419,100 424,102 419,104 417,109 415,104 410,102" fill="#FFFFFF" />
          <polygon points="775,140 777,136 779,140 783,142 779,144 777,148 775,144 771,142" fill="#FFFFFF" />
        </g>

        {/* 3. Pixel Clouds */}
        <g fill="#162744" opacity="0.35">
          {/* Left Cloud */}
          <rect x="40" y="80" width="90" height="24" />
          <rect x="60" y="68" width="50" height="12" />
          <rect x="25" y="90" width="120" height="14" />
          {/* Middle Cloud */}
          <rect x="680" y="90" width="110" height="28" />
          <rect x="710" y="76" width="60" height="14" />
          {/* Right Cloud */}
          <rect x="1020" y="60" width="130" height="30" />
          <rect x="1050" y="48" width="70" height="12" />
        </g>

        {/* 4. Distant City Skyline Silhouettes */}
        <g fill="#0A1326">
          <rect x="180" y="240" width="36" height="200" />
          <rect x="230" y="220" width="48" height="220" />
          <rect x="290" y="260" width="40" height="180" />
          <rect x="680" y="220" width="42" height="220" />
          <rect x="730" y="250" width="38" height="190" />
          <rect x="880" y="210" width="50" height="230" />
          {/* Castle Tower Silhouette */}
          <rect x="1100" y="160" width="60" height="280" />
          <rect x="1090" y="150" width="80" height="12" />
          <rect x="1092" y="140" width="16" height="10" />
          <rect x="1122" y="140" width="16" height="10" />
          <rect x="1152" y="140" width="16" height="10" />
        </g>

        {/* 5. Left Platform Complex */}
        {/* Upper High Platform */}
        <rect x="0" y="140" width="75" height="180" fill="#17243A" stroke="#263650" strokeWidth="2" />
        {/* Grass Top */}
        <rect x="0" y="136" width="80" height="8" fill="#287A4B" />
        <rect x="0" y="144" width="80" height="4" fill="#1C5A37" />
        {/* Hanging Vines */}
        <rect x="12" y="148" width="4" height="18" fill="#287A4B" />
        <rect x="36" y="148" width="4" height="26" fill="#287A4B" />
        <rect x="58" y="148" width="3" height="14" fill="#287A4B" />

        {/* Middle Platform */}
        <rect x="0" y="280" width="170" height="320" fill="#17243A" stroke="#263650" strokeWidth="2" />
        <rect x="0" y="274" width="176" height="10" fill="#287A4B" />
        <rect x="0" y="284" width="176" height="4" fill="#1C5A37" />
        {/* Bricks texture on left stone */}
        <rect x="20" y="300" width="40" height="18" fill="#263650" stroke="#354663" strokeWidth="1" />
        <rect x="70" y="300" width="46" height="18" fill="#263650" stroke="#354663" strokeWidth="1" />
        <rect x="40" y="324" width="50" height="18" fill="#263650" stroke="#354663" strokeWidth="1" />
        <rect x="100" y="324" width="40" height="18" fill="#263650" stroke="#354663" strokeWidth="1" />

        {/* Wooden Ladder on Left Platform */}
        <g fill="#8B4F24">
          <rect x="42" y="144" width="4" height="130" />
          <rect x="66" y="144" width="4" height="130" />
          {[...Array(9)].map((_, i) => (
            <rect key={i} x="42" y={155 + i * 13} width="28" height="4" fill="#B86A2B" stroke="#5A321F" strokeWidth="1" />
          ))}
        </g>

        {/* Street Lantern on Left Post */}
        <g>
          <rect x="130" y="180" width="6" height="94" fill="#354663" />
          <rect x="130" y="180" width="38" height="6" fill="#354663" />
          <rect x="156" y="186" width="4" height="12" fill="#354663" />
          {/* Lantern Cage */}
          <rect x="150" y="198" width="16" height="24" fill="#0E1A2E" stroke="#354663" strokeWidth="2" />
          <rect x="154" y="202" width="8" height="16" fill="#FFB51B" />
          <circle cx="158" cy="210" r="14" fill="url(#torchGlow)" />
        </g>

        {/* Lower Left Ledge & Arrow Sign */}
        <rect x="0" y="420" width="290" height="180" fill="#17243A" stroke="#263650" strokeWidth="2" />
        <rect x="0" y="414" width="294" height="10" fill="#287A4B" />
        <rect x="0" y="424" width="294" height="4" fill="#1C5A37" />
        {/* Vines */}
        <rect x="220" y="428" width="4" height="34" fill="#287A4B" />
        <rect x="236" y="428" width="5" height="20" fill="#287A4B" />

        {/* Wooden Direction Sign: [ → ] */}
        <rect x="226" y="360" width="6" height="54" fill="#8B4F24" />
        <rect x="210" y="340" width="38" height="24" fill="#8B4F24" stroke="#5A321F" strokeWidth="2" />
        <polygon points="236,352 224,345 224,359" fill="#FFD34D" />

        {/* 6. Central Spike Pit */}
        <rect x="200" y="520" width="480" height="80" fill="#070D18" />
        {/* Spikes */}
        {[...Array(14)].map((_, i) => (
          <polygon
            key={i}
            points={`${205 + i * 24},530 ${217 + i * 24},490 ${229 + i * 24},530`}
            fill="#354663"
            stroke="#17243A"
            strokeWidth="2"
          />
        ))}

        {/* Wooden Suspension Bridge over Spikes */}
        <rect x="290" y="480" width="280" height="10" fill="#8B4F24" stroke="#5A321F" strokeWidth="2" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1={300 + i * 22} y1="480" x2={300 + i * 22} y2="490" stroke="#5A321F" strokeWidth="2" />
        ))}
        {/* Bridge ropes */}
        <line x1="290" y1="465" x2="430" y2="475" stroke="#B86A2B" strokeWidth="2" />
        <line x1="430" y1="475" x2="570" y2="465" stroke="#B86A2B" strokeWidth="2" />

        {/* 7. Central-Right Stepping Platforms */}
        <rect x="570" y="460" width="160" height="140" fill="#17243A" stroke="#263650" strokeWidth="2" />
        <rect x="568" y="454" width="164" height="10" fill="#287A4B" />
        <rect x="568" y="464" width="164" height="4" fill="#1C5A37" />

        {/* More Spikes right side */}
        {[...Array(6)].map((_, i) => (
          <polygon
            key={i}
            points={`${735 + i * 24},530 ${747 + i * 24},490 ${759 + i * 24},530`}
            fill="#354663"
            stroke="#17243A"
            strokeWidth="2"
          />
        ))}

        {/* Wooden Crates Stacked */}
        <rect x="750" y="400" width="34" height="34" fill="#8B4F24" stroke="#5A321F" strokeWidth="2" />
        <line x1="750" y1="400" x2="784" y2="434" stroke="#5A321F" strokeWidth="2" />
        <rect x="750" y="434" width="34" height="34" fill="#8B4F24" stroke="#5A321F" strokeWidth="2" />
        <line x1="750" y1="434" x2="784" y2="468" stroke="#5A321F" strokeWidth="2" />
        <rect x="784" y="434" width="34" height="34" fill="#8B4F24" stroke="#5A321F" strokeWidth="2" />
        <line x1="784" y1="434" x2="818" y2="468" stroke="#5A321F" strokeWidth="2" />

        {/* Ladder to right platform */}
        <g fill="#8B4F24">
          <rect x="808" y="320" width="4" height="150" />
          <rect x="832" y="320" width="4" height="150" />
          {[...Array(10)].map((_, i) => (
            <rect key={i} x="808" y={332 + i * 14} width="28" height="4" fill="#B86A2B" stroke="#5A321F" strokeWidth="1" />
          ))}
        </g>

        {/* Wall Torch Stand (Burning Brazier) */}
        <rect x="856" y="380" width="6" height="40" fill="#354663" />
        <rect x="850" y="374" width="18" height="8" fill="#17243A" stroke="#354663" strokeWidth="1" />
        <circle cx="859" cy="365" r="24" fill="url(#torchGlow)" className="torch-flame-glow" />
        <polygon points="854,374 859,355 864,374" fill="#FF4B4B" className="torch-flame-outer" />
        <polygon points="856,374 859,360 862,374" fill="#FFD34D" className="torch-flame-inner" />

        {/* Gold Coin on Ground */}
        <circle cx="734" cy="450" r="8" fill="#FFB51B" stroke="#C87808" strokeWidth="2" />
        <circle cx="734" cy="450" r="5" fill="#FFD34D" />

        {/* 8. Right Platform & Fortress Vault Archway */}
        {/* Right Stone Fortress */}
        <rect x="840" y="320" width="360" height="280" fill="#17243A" stroke="#263650" strokeWidth="2" />
        <rect x="838" y="314" width="362" height="10" fill="#287A4B" />
        <rect x="838" y="324" width="362" height="4" fill="#1C5A37" />

        {/* Castle Wall Upper Tower */}
        <rect x="890" y="60" width="310" height="260" fill="#1B283E" stroke="#263650" strokeWidth="2" />
        {/* Battlements */}
        <rect x="890" y="44" width="30" height="18" fill="#263650" />
        <rect x="940" y="44" width="30" height="18" fill="#263650" />
        <rect x="990" y="44" width="30" height="18" fill="#263650" />
        <rect x="1040" y="44" width="30" height="18" fill="#263650" />
        <rect x="1090" y="44" width="30" height="18" fill="#263650" />
        <rect x="1140" y="44" width="30" height="18" fill="#263650" />

        {/* Red Castle Banner Left */}
        <rect x="830" y="100" width="34" height="88" fill="#7D2530" />
        <polygon points="830,188 847,204 864,188" fill="#7D2530" />
        <polygon points="847,130 854,142 847,154 840,142" fill="#FFB51B" />

        {/* Red Castle Banner Right */}
        <rect x="970" y="100" width="34" height="88" fill="#7D2530" />
        <polygon points="970,188 987,204 1004,188" fill="#7D2530" />
        <polygon points="987,130 994,142 987,154 980,142" fill="#FFB51B" />

        {/* Castle Wall Torches */}
        <rect x="828" y="210" width="6" height="20" fill="#8B4F24" />
        <circle cx="831" cy="202" r="16" fill="url(#torchGlow)" className="torch-flame-glow" />
        <polygon points="827,210 831,192 835,210" fill="#FF8A18" />
        <polygon points="829,210 831,198 833,210" fill="#FFD34D" />

        <rect x="986" y="210" width="6" height="20" fill="#8B4F24" />
        <circle cx="989" cy="202" r="16" fill="url(#torchGlow)" className="torch-flame-glow" />
        <polygon points="985,210 989,192 993,210" fill="#FF8A18" />
        <polygon points="987,210 989,198 991,210" fill="#FFD34D" />

        {/* Grand Glowing Vault Archway */}
        <rect x="868" y="138" width="94" height="178" rx="47" ry="47" fill="#0A1326" stroke="#354663" strokeWidth="6" />
        <rect x="874" y="144" width="82" height="172" rx="41" ry="41" fill="url(#vaultGlow)" />

        {/* Giant Glowing Cyan Diamond inside Vault Arch */}
        <g className="floating-gem" transform="translate(900, 200)">
          {/* Outer glow */}
          <circle cx="15" cy="15" r="30" fill="#45D9FF" opacity="0.3" />
          {/* Facets */}
          <polygon points="5,5 25,5 33,16 15,35 -3,16" fill="#45D9FF" />
          <polygon points="5,5 25,5 28,16 15,16 2,16" fill="#A8F2FF" />
          <polygon points="15,16 28,16 15,35" fill="#16B8F2" />
          <polygon points="15,16 2,16 15,35" fill="#25C7FF" />
          <polygon points="-3,16 2,16 15,35" fill="#0879A8" />
          <polygon points="33,16 28,16 15,35" fill="#0D2940" />
          <rect x="12" y="7" width="6" height="3" fill="#FFFFFF" />
        </g>

        {/* Gold Coin on castle ledge */}
        <circle cx="945" cy="336" r="8" fill="#FFB51B" stroke="#C87808" strokeWidth="2" />
        <circle cx="945" cy="336" r="5" fill="#FFD34D" />
      </svg>
    </div>
  );
}
