import React from 'react';

export const GameArtwork: React.FC<{ gameId: string; className?: string }> = ({
  gameId,
  className = 'w-full h-full',
}) => {
  switch (gameId) {
    case 'crash':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="crashBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b071e" />
              <stop offset="55%" stopColor="#160b24" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
            <linearGradient id="crashArea" x1="160" y1="30" x2="160" y2="165" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="jetGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#crashBg)" />
          {/* Radar Grid */}
          <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">
            <line x1="0" y1="40" x2="320" y2="40" />
            <line x1="0" y1="80" x2="320" y2="80" />
            <line x1="0" y1="120" x2="320" y2="120" />
            <line x1="0" y1="155" x2="320" y2="155" />
            <line x1="65" y1="0" x2="65" y2="180" />
            <line x1="135" y1="0" x2="135" y2="180" />
            <line x1="205" y1="0" x2="205" y2="180" />
            <line x1="275" y1="0" x2="275" y2="180" />
          </g>
          {/* Glow Orbs */}
          <circle cx="245" cy="48" r="52" fill="#f43f5e" fillOpacity="0.22" />
          <circle cx="245" cy="48" r="26" fill="#fbbf24" fillOpacity="0.25" />
          {/* Exponential Trajectory Area & Curve */}
          <path d="M 24 155 Q 145 148 242 48 L 242 155 Z" fill="url(#crashArea)" />
          <path
            d="M 24 155 Q 145 148 242 48"
            stroke="url(#jetGold)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Supersonic Aviator Jet */}
          <g transform="translate(242, 48) rotate(-36)">
            <ellipse cx="-22" cy="0" rx="14" ry="4" fill="#fbbf24" fillOpacity="0.85" />
            <ellipse cx="-16" cy="0" rx="8" ry="2.5" fill="#ffffff" />
            <path
              d="M 18 0 L -10 -9 L -5 -2 L -14 -5 L -12 0 L -14 5 L -5 2 L -10 9 Z"
              fill="#f43f5e"
              stroke="#fef08a"
              strokeWidth="1.2"
            />
          </g>
          {/* Floating Multiplier Readout */}
          <text
            x="32"
            y="66"
            fill="#ffffff"
            fontFamily="Outfit, sans-serif"
            fontWeight="800"
            fontSize="28"
            opacity="0.92"
          >
            24.85×
          </text>
          <text
            x="34"
            y="84"
            fill="#fbbf24"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            fontSize="10"
          >
            SUPERSONIC CRASH
          </text>
        </svg>
      );

    case 'mines':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="minesBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b2106" />
              <stop offset="55%" stopColor="#171426" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
            <linearGradient id="bullion" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#minesBg)" />
          <circle cx="220" cy="85" r="68" fill="#f59e0b" fillOpacity="0.16" />
          {/* 3x3 Vault Tile Preview Grid on Right */}
          <g transform="translate(145, 22)">
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const isGold = (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 2 && c === 1);
                const isBomb = r === 1 && c === 1;
                return (
                  <g key={`${r}-${c}`} transform={`translate(${c * 46}, ${r * 46})`}>
                    <rect
                      width="40"
                      height="40"
                      rx="9"
                      fill={isGold ? '#422006' : isBomb ? '#3f0c1f' : '#131c31'}
                      stroke={isGold ? '#fbbf24' : isBomb ? '#f43f5e' : '#24324f'}
                      strokeWidth="1.8"
                    />
                    {isGold && (
                      <g transform="translate(8, 10)">
                        <polygon points="4,16 8,4 18,4 22,16" fill="url(#bullion)" />
                        <polygon points="8,4 18,4 16,9 6,9" fill="#fef08a" />
                      </g>
                    )}
                    {isBomb && (
                      <g transform="translate(20, 22)">
                        <circle cx="0" cy="0" r="9" fill="#f43f5e" />
                        <circle cx="-3" cy="-3" r="2.5" fill="#fda4af" />
                        <path d="M 5 -7 Q 10 -12 13 -9" stroke="#fbbf24" strokeWidth="2" />
                      </g>
                    )}
                  </g>
                );
              })
            )}
          </g>
          {/* Left Gleaming Gold Bullion Stack */}
          <g transform="translate(26, 46)">
            <rect x="0" y="38" width="76" height="28" rx="6" fill="url(#bullion)" stroke="#fef08a" strokeWidth="1.2" />
            <rect x="10" y="14" width="76" height="28" rx="6" fill="url(#bullion)" stroke="#fef08a" strokeWidth="1.2" />
            <text x="24" y="32" fill="#451a03" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="11">
              24K GOLD
            </text>
            <text x="14" y="56" fill="#451a03" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="11">
              999.9 FINE
            </text>
          </g>
        </svg>
      );

    case 'plinko':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="plinkoBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#052e2b" />
              <stop offset="55%" stopColor="#0d1829" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#plinkoBg)" />
          <circle cx="205" cy="80" r="65" fill="#10b981" fillOpacity="0.16" />
          {/* Pyramid Pegs */}
          {[0, 1, 2, 3, 4].map((row) => {
            const count = row + 3;
            const startX = 205 - ((count - 1) * 22) / 2;
            const y = 26 + row * 22;
            return Array.from({ length: count }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={startX + col * 22}
                cy={y}
                r="3.2"
                fill="#e2e8f0"
                fillOpacity="0.85"
              />
            ));
          })}
          {/* Falling Golden Balls */}
          <circle cx="194" cy="40" r="6.5" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="216" cy="84" r="7" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="172" cy="104" r="6.5" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.5" />
          {/* Bottom Multiplier Buckets */}
          <g transform="translate(115, 136)">
            {[
              { label: '1000×', color: '#e11d48' },
              { label: '130×', color: '#f59e0b' },
              { label: '26×', color: '#10b981' },
              { label: '130×', color: '#f59e0b' },
              { label: '1000×', color: '#e11d48' },
            ].map((b, i) => (
              <g key={i} transform={`translate(${i * 37}, 0)`}>
                <rect width="34" height="22" rx="5" fill={b.color} />
                <text
                  x="17"
                  y="14"
                  textAnchor="middle"
                  fill="#070b14"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="800"
                  fontSize="8.5"
                >
                  {b.label}
                </text>
              </g>
            ))}
          </g>
          <text x="26" y="74" fill="#10b981" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="26">
            1,000×
          </text>
          <text x="28" y="92" fill="#94a3b8" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10">
            16-ROW PYRAMID
          </text>
        </svg>
      );

    case 'roulette':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="roulBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3f0d1d" />
              <stop offset="55%" stopColor="#141829" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#roulBg)" />
          {/* Roulette Wheel */}
          <g transform="translate(222, 92)">
            <circle cx="0" cy="0" r="66" fill="#070b14" stroke="#f59e0b" strokeWidth="4" />
            <circle cx="0" cy="0" r="54" fill="#131c31" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="10 6" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = Math.cos(angle) * 42;
              const y = Math.sin(angle) * 42;
              const color = i === 0 ? '#10b981' : i % 2 === 1 ? '#e11d48' : '#1e293b';
              return <circle key={i} cx={x} cy={y} r="7.5" fill={color} stroke="#fbbf24" strokeWidth="0.8" />;
            })}
            <circle cx="0" cy="0" r="24" fill="#0d1322" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="8" fill="#fbbf24" />
            {/* Ivory Ball */}
            <circle cx="-26" cy="-32" r="4.5" fill="#ffffff" />
          </g>
          {/* Left 36x Badge */}
          <text x="26" y="72" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="28">
            36:1
          </text>
          <text x="28" y="90" fill="#fda4af" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10">
            EUROPEAN SINGLE ZERO
          </text>
        </svg>
      );

    case 'matka':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="matkaBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="55%" stopColor="#1b1429" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
            <linearGradient id="potGrad" x1="160" y1="50" x2="260" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#431407" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#matkaBg)" />
          <circle cx="220" cy="95" r="64" fill="#f59e0b" fillOpacity="0.18" />
          {/* 3 Open Patti Cards Behind Pot */}
          <g transform="translate(155, 22) rotate(-14)">
            <rect width="36" height="52" rx="5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="8" y="20" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="13">
              1♥
            </text>
          </g>
          <g transform="translate(198, 16)">
            <rect width="36" height="52" rx="5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="8" y="20" fill="#070b14" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="13">
              4♠
            </text>
          </g>
          <g transform="translate(240, 24) rotate(14)">
            <rect width="36" height="52" rx="5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="8" y="20" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="13">
              8♦
            </text>
          </g>
          {/* Traditional Royal Matka Pot */}
          <g transform="translate(215, 112)">
            <ellipse cx="0" cy="0" rx="48" ry="38" fill="url(#potGrad)" stroke="#fbbf24" strokeWidth="2.2" />
            <path d="M -38 -12 Q 0 4 38 -12" stroke="#fef08a" strokeWidth="2" strokeDasharray="5 3" />
            <ellipse cx="0" cy="-34" rx="28" ry="8" fill="#7c2d12" stroke="#fbbf24" strokeWidth="2" />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fill="#fef08a"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="800"
              fontSize="16"
            >
              148-37
            </text>
          </g>
          <text x="24" y="68" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24">
            95× PAYOUT
          </text>
          <text x="24" y="86" fill="#fed7aa" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10">
            KALYAN · WORLI · MILAN
          </text>
        </svg>
      );

    case 'teenpatti':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="tpBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="55%" stopColor="#111827" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" fill="url(#tpBg)" />
          <circle cx="220" cy="90" r="62" fill="#ec4899" fillOpacity="0.16" />
          {/* 3 Fanned Trail of Aces Cards */}
          <g transform="translate(162, 42) rotate(-16)">
            <rect width="54" height="78" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            <text x="8" y="22" fill="#070b14" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              A♠
            </text>
            <text x="27" y="54" textAnchor="middle" fill="#070b14" fontSize="26">
              ♠
            </text>
          </g>
          <g transform="translate(196, 32)">
            <rect width="54" height="78" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            <text x="8" y="22" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              A♥
            </text>
            <text x="27" y="54" textAnchor="middle" fill="#e11d48" fontSize="26">
              ♥
            </text>
          </g>
          <g transform="translate(230, 44) rotate(16)">
            <rect width="54" height="78" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            <text x="8" y="22" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              A♦
            </text>
            <text x="27" y="54" textAnchor="middle" fill="#e11d48" fontSize="26">
              ♦
            </text>
          </g>
          <text x="24" y="68" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="22">
            AAA TRAIL
          </text>
          <text x="24" y="86" fill="#fbbf24" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10">
            SEEN · BLIND · 5× BONUS
          </text>
        </svg>
      );

    case 'andarbahar':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#052e24" />
          <circle cx="215" cy="90" r="65" fill="#10b981" fillOpacity="0.18" />
          {/* Andar Card */}
          <g transform="translate(138, 48)">
            <rect width="46" height="66" rx="7" fill="#0d1322" stroke="#10b981" strokeWidth="1.8" />
            <text x="23" y="38" textAnchor="middle" fill="#10b981" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="10">
              ANDAR
            </text>
          </g>
          {/* Center Joker Card */}
          <g transform="translate(192, 34)">
            <rect width="52" height="76" rx="8" fill="#ffffff" stroke="#fbbf24" strokeWidth="3" />
            <text x="9" y="22" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              K♥
            </text>
            <text x="26" y="52" textAnchor="middle" fill="#e11d48" fontSize="24">
              ♥
            </text>
          </g>
          {/* Bahar Card */}
          <g transform="translate(252, 48)">
            <rect width="46" height="66" rx="7" fill="#0d1322" stroke="#fbbf24" strokeWidth="1.8" />
            <text x="23" y="38" textAnchor="middle" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="10">
              BAHAR
            </text>
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="22">
            CARD MATCH
          </text>
        </svg>
      );

    case 'blackjack':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#09192e" />
          <circle cx="225" cy="88" r="60" fill="#38bdf8" fillOpacity="0.15" />
          <g transform="translate(180, 36) rotate(-10)">
            <rect width="54" height="78" rx="8" fill="#ffffff" stroke="#fbbf24" strokeWidth="2" />
            <text x="9" y="22" fill="#070b14" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              A♠
            </text>
            <text x="27" y="54" textAnchor="middle" fill="#070b14" fontSize="26">
              ♠
            </text>
          </g>
          <g transform="translate(222, 42) rotate(10)">
            <rect width="54" height="78" rx="8" fill="#ffffff" stroke="#fbbf24" strokeWidth="2" />
            <text x="9" y="22" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              K♦
            </text>
            <text x="27" y="54" textAnchor="middle" fill="#e11d48" fontSize="26">
              ♦
            </text>
          </g>
          <text x="24" y="68" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="26">
            ROYAL 21
          </text>
          <text x="24" y="86" fill="#38bdf8" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10">
            PAYS 3 TO 2 NATURAL
          </text>
        </svg>
      );

    case 'baccarat':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#072227" />
          <circle cx="220" cy="85" r="58" fill="#14b8a6" fillOpacity="0.16" />
          <g transform="translate(160, 40)">
            <rect width="52" height="74" rx="8" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
            <text x="10" y="24" fill="#070b14" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              9♠
            </text>
            <text x="26" y="54" textAnchor="middle" fill="#070b14" fontSize="24">
              ♠
            </text>
          </g>
          <g transform="translate(224, 40)">
            <rect width="52" height="74" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="10" y="24" fill="#e11d48" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="15">
              8♥
            </text>
            <text x="26" y="54" textAnchor="middle" fill="#e11d48" fontSize="24">
              ♥
            </text>
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="22">
            NATURAL 9
          </text>
        </svg>
      );

    case 'slots':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#1e0b36" />
          <circle cx="220" cy="85" r="62" fill="#a855f7" fillOpacity="0.22" />
          <g transform="translate(152, 36)">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 48}, 0)`}>
                <rect width="42" height="76" rx="8" fill="#070b14" stroke="#fbbf24" strokeWidth="2" />
                <text x="21" y="46" textAnchor="middle" fontSize="22">
                  {i === 1 ? '💎' : '7️⃣'}
                </text>
              </g>
            ))}
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24">
            777 WILD
          </text>
        </svg>
      );

    case 'wheel':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#1e1508" />
          <g transform="translate(225, 88)">
            <circle cx="0" cy="0" r="56" fill="#131c31" stroke="#fbbf24" strokeWidth="4" />
            <path d="M 0 0 L 56 0 A 56 56 0 0 1 28 48 Z" fill="#f43f5e" />
            <path d="M 0 0 L -56 0 A 56 56 0 0 1 -28 -48 Z" fill="#10b981" />
            <path d="M 0 0 L 0 -56 A 56 56 0 0 1 48 -28 Z" fill="#f59e0b" />
            <circle cx="0" cy="0" r="22" fill="#070b14" stroke="#fbbf24" strokeWidth="2.5" />
            <text x="0" y="4" textAnchor="middle" fill="#fbbf24" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="10">
              30×
            </text>
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="22">
            30× WHEEL
          </text>
        </svg>
      );

    case 'keno':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#141236" />
          <g transform="translate(158, 34)">
            {[7, 19, 27, 37].map((num, idx) => (
              <g key={num} transform={`translate(${(idx % 2) * 58}, ${Math.floor(idx / 2) * 48})`}>
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill={idx % 2 === 0 ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x="22"
                  y="27"
                  textAnchor="middle"
                  fill="#070b14"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="800"
                  fontSize="14"
                >
                  {num}
                </text>
              </g>
            ))}
          </g>
          <text x="24" y="70" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24">
            KENO 40
          </text>
        </svg>
      );

    case 'dice':
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#072230" />
          <g transform="translate(160, 56)">
            <rect x="0" y="24" width="130" height="14" rx="7" fill="#070b14" stroke="#24324f" strokeWidth="2" />
            <rect x="0" y="24" width="65" height="14" rx="7" fill="#f43f5e" />
            <rect x="65" y="24" width="65" height="14" rx="7" fill="#10b981" />
            <rect x="53" y="14" width="24" height="34" rx="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24">
            99.0% RTP
          </text>
        </svg>
      );

    case 'coinflip':
    default:
      return (
        <svg viewBox="0 0 320 180" fill="none" className={className} preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="180" fill="#271905" />
          <g transform="translate(222, 86)">
            <circle cx="0" cy="0" r="46" fill="#f59e0b" stroke="#fef08a" strokeWidth="3.5" />
            <circle cx="0" cy="0" r="36" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 3" />
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fill="#451a03"
              fontFamily="Outfit, sans-serif"
              fontWeight="800"
              fontSize="28"
            >
              ₹
            </text>
          </g>
          <text x="24" y="70" fill="#fbbf24" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="24">
            2× STREAK
          </text>
        </svg>
      );
  }
};
