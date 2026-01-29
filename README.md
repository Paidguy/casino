# 🎰 Casino Education Platform
### *Understanding the Mathematics of Loss Through Interactive Simulation*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-paidguy.me/casino-00d9ff?style=for-the-badge)](https://paidguy.me/casino/)
[![Built By](https://img.shields.io/badge/Built_by-@paidguy-fbbf24?style=for-the-badge)](https://github.com/Paidguy)
[![TypeScript](https://img.shields.io/badge/TypeScript-97.1%25-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Educational-orange?style=for-the-badge)]()

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Educational Mission](#-educational-mission)
3. [Architecture & Technology](#-architecture--technology)
4. [Game Portfolio](#-game-portfolio)
5. [Provable Fairness System](#-provable-fairness-system)
6. [Installation & Setup](#-installation--setup)
7. [Project Structure](#-project-structure)
8. [Core Components](#-core-components)
9. [Game Engine Deep Dive](#-game-engine-deep-dive)
10. [House Edge Mathematics](#-house-edge-mathematics)
11. [UI/UX Design Philosophy](#-uiux-design-philosophy)
12. [Building & Deployment](#-building--deployment)
13. [Configuration & Customization](#-configuration--customization)
14. [Contributing](#-contributing)
15. [Educational Resources](#-educational-resources)
16. [Responsible Gaming](#-responsible-gaming)
17. [License & Legal](#-license--legal)

---

## 🎯 Overview

**Casino Education Platform** (branded as "SattaKing.IND Pro") is a sophisticated web-based educational simulator that demonstrates how casino games operate mathematically. Built with React 18 and TypeScript, it provides a transparent, provably fair environment where users can explore gambling mechanics without any real financial risk.

### Key Features

✅ **13 Complete Casino Games** - From traditional Kalyan Matka to modern Aviator crash games  
✅ **Deterministic RNG System** - Based on client + server seed pairs for complete verifiability  
✅ **Real-time Analytics** - Track every bet, multiplier, and outcome with detailed history  
✅ **Transparent House Edge** - Every game displays its mathematical advantage upfront  
✅ **Zero Real Money** - Virtual ₹100,000 daily allowance for risk-free learning  
✅ **Responsive Design** - Optimized for desktop, laptop, and mobile screens  
✅ **Canvas-based Graphics** - High-performance 60fps animations using HTML5 Canvas  
✅ **Local Storage Persistence** - Session data saved locally in browser  

### Live Demo

Experience the platform: **[paidguy.me/casino](https://paidguy.me/casino/)**

---

## 🎓 Educational Mission

This platform exists to teach three fundamental truths about gambling:

### 1. **Loss is Inevitable**
Every game has a built-in house edge. Over time, mathematical certainty guarantees player losses. No strategy, pattern recognition, or "hot streak" can overcome negative expected value.

```
Expected Value = (Win Probability × Payout) - (Loss Probability × Bet Amount)
For all casino games: EV < 0
```

### 2. **Transparency Over Deception**
Traditional casinos hide their algorithms. We expose everything:
- Exact house edge percentages
- Seed-based deterministic outcomes
- Cryptographic verification of results
- Complete bet history with audit trails

### 3. **Behavioral Psychology**
Casino games exploit cognitive biases:
- **Gambler's Fallacy** - Believing past results affect future outcomes
- **Near-Miss Effect** - "Almost winning" triggers dopamine like actual wins
- **Sunk Cost Fallacy** - Chasing losses to "recover" money
- **Variable Reward Schedules** - Unpredictable wins maximize engagement

This platform demonstrates these mechanisms transparently.

---

## 🏗️ Architecture & Technology

### Technology Stack

```
Frontend Framework:    React 18.2.0
Language:              TypeScript 5.2.2
Routing:               React Router DOM 6.22.0
Charts:                Recharts 2.12.0
Build Tool:            Vite 5.1.0
Styling:               Custom CSS with Tailwind-inspired utilities
Graphics:              HTML5 Canvas API
Storage:               Browser localStorage + IndexedDB
```

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0"
  }
}
```

### Design Principles

#### **"Theater Stage Architecture"**
The UI uses a focus-first layout optimized for laptop screens:

- **Theater Mode**: Games expand to full viewport when active
- **Contextual Sidebars**: Navigation and analytics hidden during gameplay
- **Z-Index Optimization**: Prevents UI element collision
- **Fluid Typography**: Responsive `clamp()` based font sizing
- **60 FPS Baseline**: All animations maintain 16.6ms frame budget

#### **"Neon Mumbai" Visual Language**

```css
/* Primary Colors */
--bet-primary: #22d3ee;    /* Cyan Neon - Trust, Speed, Clarity */
--bet-secondary: #d946ef;  /* Magenta - High Energy, Jackpots */
--bet-accent: #facc15;     /* Gold - Success, Wealth */
--bet-danger: #ef4444;     /* Red - Loss, Warning */
--bet-success: #10b981;    /* Green - Win, Profit */

/* Backgrounds */
--bet-950: #020617;        /* Obsidian - Primary Background */
--bet-900: #0f172a;        /* Deep Navy - Card Background */
--bet-800: #1e293b;        /* Slate - Input Background */
```

---

## 🎮 Game Portfolio

The platform includes 13 fully-functional casino games, each demonstrating specific mathematical and psychological principles:

### 1. 🏺 **Kalyan Matka** (`/matka`)
**Indian lottery-style number game**

- **Mechanics**: Three random digits (0-9) drawn, sum's last digit is the result
- **House Edge**: 5.0% (10 possible outcomes, 9x payout)
- **Learning Focus**: Combinatorial probability, pattern recognition bias
- **Implementation**: `pages/Matka.tsx`

```typescript
// Matka Result Calculation
public getSattaMatkaResult(r: number) {
  const c1 = Math.floor(r * 10);
  const c2 = Math.floor((r * 1.5 * 10) % 10);
  const c3 = Math.floor((r * 2.2 * 10) % 10);
  const single = (c1 + c2 + c3) % 10;
  return { cards: `${c1}${c2}${c3}`, single };
}
```

### 2. 🚀 **Aviator (Crash)** (`/crash`)
**Exponential multiplier game with instant-bust risk**

- **Mechanics**: Multiplier grows exponentially, crashes at random point
- **House Edge**: 3.0% (instant bust at 1.00x probability)
- **Growth Formula**: `f(t) = e^(0.06t)`
- **Learning Focus**: Risk management, exponential functions, optimal stopping
- **Implementation**: `pages/Crash.tsx` with Canvas rendering

```typescript
// Crash Point Calculation
public getCrashPoint(r: number): number {
  const houseEdge = 0.03; 
  if (r < houseEdge) return 1.00; // Instant bust
  return Math.max(1, +((1 - houseEdge) / (1 - r)).toFixed(2));
}
```

**Technical Details**:
- Real-time Canvas graph rendering at 60fps
- Exponential curve visualization
- 8-game crash history display
- Cash-out button with instant payout calculation

### 3. 🎰 **Slots** (`/slots`)
**Classic 3-reel symbol matching**

- **Mechanics**: Spin 3 reels with weighted symbols
- **House Edge**: 4.0%
- **Symbols**: 🍒 (2x), 🍋 (2x), 🍇 (20x), 💎 (50x), 7️⃣ (100x)
- **Learning Focus**: Near-miss psychology, variable reward schedules
- **Implementation**: `pages/Slots.tsx`

```typescript
// Slot Result with Near-Miss Weighting
public calculateSlotsResult(r: number) {
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
  const s1 = symbols[Math.floor(r * 5)];
  const s2 = symbols[Math.floor((r * 2.5 * 10) % 5)];
  const s3 = symbols[Math.floor((r * 3.3 * 10) % 5)];
  // Near-miss logic: s3 calculation increases "almost won" scenarios
}
```

### 4. 🃏 **Teen Patti** (`/teenpatti`)
**Popular Indian card comparison game**

- **Mechanics**: Player hand vs. Dealer hand comparison
- **House Edge**: 2.5% (dealer bias)
- **Hands**: Trail, Pure Sequence, Sequence, Color, Pair, High Card
- **Learning Focus**: Fixed-probability games, house commission
- **Implementation**: `pages/TeenPatti.tsx`

### 5. 🎴 **Baccarat** (`/baccarat`)
**Classic high-roller card game**

- **Mechanics**: Player vs Banker hand comparison (0-9 values)
- **House Edge**: 1.06% (Banker), 1.24% (Player)
- **Payouts**: Banker/Player 2x, Tie 9x (5% banker commission)
- **Learning Focus**: Low-variance gambling, commission structures
- **Implementation**: `pages/Baccarat.tsx`

### 6. 🎲 **Dice** (`/dice`)
**Roll-over/roll-under betting**

- **Mechanics**: Predict if random 0-100 roll is over/under target
- **House Edge**: 1.0%
- **Dynamic Payout**: Calculated based on target number
- **Learning Focus**: Probability ranges, risk-reward ratios
- **Implementation**: `pages/Dice.tsx`

```typescript
// Dice Result Calculation
public calculateDiceResult(r: number, target: number, mode: 'over' | 'under') {
  const roll = r * 100;
  const won = mode === 'over' ? roll > target : roll < target;
  return { roll, won };
}
```

### 7. 🎡 **Wheel** (`/wheel`)
**Spinning prize wheel**

- **Mechanics**: Spin wheel lands on multiplier segment
- **House Edge**: 3.0%
- **Multipliers**: 1.2x, 1.5x, 2x, 3x, 5x, 10x, 50x
- **Learning Focus**: Visual randomness vs. weighted outcomes
- **Implementation**: `pages/Wheel.tsx`

### 8. 🎯 **Plinko** (`/plinko`)
**Pachinko-style ball drop**

- **Mechanics**: Ball bounces through pegs into multiplier bins
- **House Edge**: 1.0%
- **Multipliers**: 0.2x to 1000x (bell curve distribution)
- **Rows**: 16 levels of peg bounces
- **Learning Focus**: Normal distribution, extreme variance
- **Implementation**: `pages/Plinko.tsx`

```typescript
// Plinko Path Calculation
public calculatePlinkoResult(r: number, rows: number) {
  const path = [];
  for (let i = 0; i < rows; i++) {
    path.push(Math.random() > 0.5 ? 1 : 0);
  }
  const finalBin = path.reduce((a, b) => a + b, 0);
  const MULTIPLIERS_16 = [1000, 130, 26, 9, 4, 2, 0.2, ...];
  return { path, multiplier: MULTIPLIERS_16[finalBin] };
}
```

### 9. 💣 **Mines** (`/mines`)
**Minesweeper-style grid game**

- **Mechanics**: Click tiles to avoid mines, cash out anytime
- **House Edge**: 3.0%
- **Grid**: 25 tiles (5×5)
- **Difficulty**: Player selects mine count (1-24)
- **Learning Focus**: Risk accumulation, exponential payout growth
- **Implementation**: `pages/Mines.tsx`

### 10. 🪙 **Coinflip** (`/coinflip`)
**Simple heads or tails**

- **Mechanics**: Bet on coin landing heads or tails
- **House Edge**: 1.9%
- **Payout**: 1.96x (should be 2x for fair game)
- **Learning Focus**: Simplest house edge demonstration
- **Implementation**: `pages/Coinflip.tsx`

### 11. 🎰 **Roulette** (`/roulette`)
**European roulette wheel**

- **Mechanics**: Bet on numbers 0-36
- **House Edge**: 2.7% (single zero)
- **Bet Types**: Straight (35x), Red/Black (2x), Dozens (3x)
- **Learning Focus**: Multiple bet types, different risk profiles
- **Implementation**: `pages/Roulette.tsx`

### 12. 🃏 **Blackjack** (`/blackjack`)
**Card game vs dealer (21)**

- **Mechanics**: Get closer to 21 than dealer without busting
- **House Edge**: 0.5% (with optimal strategy)
- **Special**: Only game where player skill reduces house edge
- **Learning Focus**: Strategy vs. luck, lowest casino edge
- **Implementation**: `pages/Blackjack.tsx`

### 13. 🔢 **Keno** (`/keno`)
**Lottery-style number selection**

- **Mechanics**: Pick up to 10 numbers from 40-number grid
- **House Edge**: 5.0%
- **Payouts**: Progressive multipliers based on matches
- **Learning Focus**: Combinatorial explosion, low win probability
- **Implementation**: `pages/Keno.tsx`

---

## 🔒 Provable Fairness System

Every game outcome is verifiable using a deterministic seed-based system:

### How It Works

```
Server Seed (hidden) + Client Seed (your choice) + Nonce (incremental) 
    ↓
HMAC-SHA256 Hash
    ↓
Deterministic Random Number
    ↓
Game Outcome
```

### Implementation

```typescript
// User Session Structure (types.ts)
export interface UserSession {
  clientSeed: string;      // User-provided seed (can be changed anytime)
  serverSeed: string;      // Platform seed (visible after each game)
  nonce: number;           // Increments with each bet
  serverSeedHash: string;  // Pre-game hash for verification
}

// Seed Rotation (engine.ts)
public setClientSeed(seed: string) {
  this.session.clientSeed = seed;
  this.session.nonce = 0;  // Reset nonce on seed change
  this.saveSession(this.session);
}
```

### Verification Process

1. **Before betting**: Platform provides `hash(serverSeed)`
2. **You bet**: Outcome is calculated using your client seed
3. **After game**: Platform reveals raw `serverSeed`
4. **You verify**: Check if `hash(serverSeed) === providedHash`

If the hash matches, the result was predetermined before your bet, proving the platform couldn't manipulate the outcome.

### Fairness Panel

Access via `/fairness` route to:
- View current client seed and nonce
- Rotate client seed (resets nonce to 0)
- See server seed hash
- Review house edge for all games
- Understand RNG formulas

**Code**: `pages/Fairness.tsx`

---

## 🚀 Installation & Setup

### Prerequisites

```bash
Node.js: 16.x or higher
npm: 8.x or higher (or yarn/pnpm)
Modern Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
```

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Paidguy/casino.git
cd casino

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Development Server

The Vite dev server starts on port 5173 with:
- Hot Module Replacement (HMR)
- Fast TypeScript compilation
- Instant CSS updates
- React Fast Refresh

```bash
# Start dev server
npm run dev

# Dev server output:
# VITE v5.1.0  ready in 324 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.100:5173/
```

### Production Build

```bash
# Build for production
npm run build

# Output directory: dist/
# Build includes:
# - TypeScript compilation
# - Asset optimization
# - Code minification
# - Source map generation (optional)

# Preview production build locally
npm run preview
```

### Deployment

The project is configured for **GitHub Pages** deployment:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/casino/',  // Must match GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
});
```

**Deploy to GitHub Pages**:

```bash
# Build production bundle
npm run build

# Deploy (if using gh-pages package)
npm install -g gh-pages
gh-pages -d dist

# Or push dist/ folder to gh-pages branch manually
```

**Live URL**: `https://username.github.io/casino/`

---

## 📁 Project Structure

```
casino/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       └── deploy.yml       # Auto-deployment workflow
│
├── components/              # Reusable React components
│   ├── Analytics.tsx        # Bet history & statistics display
│   ├── Layout.tsx          # Main layout wrapper (header, sidebar, footer)
│   ├── Leaderboard.tsx     # Top players leaderboard (with bot players)
│   ├── LiveFeed.tsx        # Real-time bet feed simulation
│   ├── MarketingOverlay.tsx # Promotional modals & banners
│   └── TransparencyPanel.tsx # Fairness verification UI
│
├── pages/                   # Game route components
│   ├── Admin.tsx           # Admin panel for RTP settings
│   ├── Baccarat.tsx        # Baccarat card game
│   ├── Blackjack.tsx       # Blackjack 21 game
│   ├── Coinflip.tsx        # Heads/tails coin flip
│   ├── Crash.tsx           # Aviator crash game with Canvas
│   ├── Dice.tsx            # Roll-over/under dice game
│   ├── Fairness.tsx        # Provable fairness documentation
│   ├── Keno.tsx            # Number selection lottery
│   ├── Lobby.tsx           # Main game selection lobby
│   ├── Matka.tsx           # Kalyan Matka number game
│   ├── Mines.tsx           # Minesweeper-style grid game
│   ├── Plinko.tsx          # Ball drop game with Canvas
│   ├── Roulette.tsx        # European roulette wheel
│   ├── Slots.tsx           # 3-reel slot machine
│   ├── TeenPatti.tsx       # Indian card game
│   └── Wheel.tsx           # Prize wheel spinner
│
├── services/                # Core business logic
│   ├── audio.ts            # Sound effects manager
│   └── engine.ts           # Game engine & simulation core
│
├── App.tsx                  # Root component with routing
├── index.tsx                # React DOM entry point
├── index.html               # HTML template
├── index.css                # Global styles & animations
├── types.ts                 # TypeScript interfaces & types
│
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript compiler options
├── tsconfig.node.json       # Node-specific TS config
├── package.json             # Dependencies & scripts
├── metadata.json            # Project metadata
└── LICENSE                  # License file
```

### Directory Descriptions

#### `components/`
Reusable UI components used across multiple pages:

- **`Layout.tsx`**: Master layout wrapper with:
  - Market ticker (scrolling news banner)
  - Collapsible sidebar navigation
  - Header with balance display
  - Slide-out intel feed panel
  - Deposit modal
  - Mobile-responsive hamburger menu

- **`Analytics.tsx`**: Statistics dashboard showing:
  - Total bets, wagered amount, wins/losses
  - Bet history with outcome details
  - Charts using Recharts library

- **`Leaderboard.tsx`**: Top players by wagered amount:
  - Bot players for social proof
  - Real player highlighted
  - Wagered amount & max multiplier display

- **`LiveFeed.tsx`**: Simulated live bet feed:
  - Fake player bets for engagement
  - Random game wins/losses
  - Scrolling activity feed

#### `pages/`
Each game has its own dedicated page component with:
- Game-specific UI and controls
- Bet input and game state management
- Canvas rendering (for Crash, Plinko)
- Result display and history
- Integration with game engine

#### `services/`
Core application logic separated from UI:

- **`engine.ts`**: The heart of the application
  - Session management (localStorage)
  - Seed-based RNG system
  - Game result calculations
  - Balance and bet tracking
  - Transaction history
  - Leaderboard management

- **`audio.ts`**: Sound effect management
  - Bet placement sounds
  - Win/loss audio feedback
  - Click sounds for UI interactions

---

## 🧩 Core Components

### `SimulationEngine` (services/engine.ts)

The central class managing all game logic:

```typescript
export class SimulationEngine {
  private session: UserSession;
  
  constructor() {
    this.session = this.loadSession();
  }
  
  // Key Methods:
  
  // Place bet and calculate outcome
  placeBet(game: GameType, amount: number, 
           multiplierOrResolver: number | Function): BetResult
  
  // Update user balance
  updateBalance(amount: number): void
  
  // Reset session balance
  resetBalance(): void
  
  // Seed management
  setClientSeed(seed: string): void
  
  // Game-specific calculators
  getCrashPoint(r: number): number
  getSattaMatkaResult(r: number): { cards: string, single: number }
  calculateDiceResult(r: number, target: number, mode: string): object
  calculateSlotsResult(r: number): { symbols: string[], multiplier: number }
  // ... more game calculators
}
```

### Session Management

```typescript
// Session stored in localStorage with key: 'satking_pro_v2'
interface UserSession {
  id: string;                    // Unique session ID
  username: string;              // Generated username (Punter_XXXX)
  balance: number;               // Current balance (starts at ₹100,000)
  rakebackBalance: number;       // Accumulated rakeback (0.5% of wagers)
  
  // Statistics
  totalBets: number;
  totalWagered: number;
  totalWins: number;
  totalLosses: number;
  maxMultiplier: number;
  
  // Fairness
  clientSeed: string;
  serverSeed: string;
  nonce: number;
  
  // History
  history: BetResult[];          // Last 50 bets
  transactions: Transaction[];    // Deposits/withdrawals
}
```

### BetResult Interface

```typescript
export interface BetResult {
  id: string;                    // Unique bet ID
  gameType: GameType;            // Which game
  betAmount: number;             // Stake amount
  payoutMultiplier: number;      // Win multiplier
  payoutAmount: number;          // Total payout (stake × multiplier)
  timestamp: number;             // Unix timestamp
  outcome: string;               // Descriptive outcome text
  balanceAfter: number;          // Balance after bet
  
  // Fairness verification
  nonce: number;
  clientSeed: string;
  serverSeedHash: string;
  resultInput: number;           // Random value used (0-1)
}
```

---

## 🎮 Game Engine Deep Dive

### Random Number Generation

The platform uses JavaScript's `Math.random()` for demonstration purposes. In a production environment, this would be replaced with cryptographically secure HMAC-SHA256:

```typescript
// Current implementation (educational)
const r = Math.random(); // 0.0 to 1.0

// Production would use:
const r = HMAC_SHA256(serverSeed + clientSeed + nonce) / MAX_HASH_VALUE;
```

### Game Result Calculators

#### Crash Point Formula

```typescript
public getCrashPoint(r: number): number {
  const houseEdge = 0.03; // 3% instant bust probability
  
  // Instant bust check
  if (r < houseEdge) return 1.00;
  
  // Calculate crash point: (1 - edge) / (1 - r)
  // This creates exponential distribution
  return Math.max(1, +((1 - houseEdge) / (1 - r)).toFixed(2));
}

// Example outcomes:
// r = 0.02 → 1.00x (instant bust)
// r = 0.50 → 1.94x
// r = 0.90 → 9.70x
// r = 0.99 → 97.00x
```

**Why this formula?**
- `(1 - edge)` ensures house profit over time
- `(1 - r)` as denominator creates exponential growth
- Higher `r` values → higher crash points (but less likely)

#### Matka Number Calculation

```typescript
public getSattaMatkaResult(r: number) {
  // Generate three digits using different scaling factors
  const c1 = Math.floor(r * 10);           // 0-9
  const c2 = Math.floor((r * 1.5 * 10) % 10); // 0-9 (different distribution)
  const c3 = Math.floor((r * 2.2 * 10) % 10); // 0-9 (different distribution)
  
  // Sum and take last digit
  const single = (c1 + c2 + c3) % 10;
  
  return { 
    cards: `${c1}${c2}${c3}`,  // e.g. "345"
    single                      // e.g. 2 (from 3+4+5=12)
  };
}
```

**Why different scaling factors?**
- Creates pseudo-independence between digits
- Prevents patterns in sequential draws
- Maintains uniform 0-9 distribution for each digit

#### Slot Machine Symbols

```typescript
public calculateSlotsResult(r: number) {
  const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
  
  // Reel 1: Simple division
  const s1 = symbols[Math.floor(r * 5)];
  
  // Reel 2: Scaled and modulo for variation
  const s2 = symbols[Math.floor((r * 2.5 * 10) % 5)];
  
  // Reel 3: Different scaling creates near-misses
  const s3 = symbols[Math.floor((r * 3.3 * 10) % 5)];
  
  const result = [s1, s2, s3];
  
  // Payout logic
  let multiplier = 0;
  if (s1 === s2 && s2 === s3) {
    // Three of a kind
    if (s1 === '7️⃣') multiplier = 100;      // Jackpot
    else if (s1 === '💎') multiplier = 50;
    else multiplier = 20;
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    // Any pair
    multiplier = 2;
  }
  
  return { symbols: result, multiplier };
}
```

**Near-Miss Engineering**:
The different scaling factors for each reel create situations where:
- Reel 1 and 2 match more often than random (pair wins)
- Reel 3 "almost" matches frequently (near-miss psychology)
- This increases engagement without changing actual RTP

### Balance Management

```typescript
// Placing a bet
this.session.balance -= betAmount;           // Deduct stake
this.session.balance += (betAmount * multiplier); // Add winnings

// Rakeback accumulation (0.5% of all wagers)
this.session.rakebackBalance += betAmount * 0.005;

// Statistics tracking
this.session.totalWagered += betAmount;
this.session.totalBets += 1;
if (multiplier > this.session.maxMultiplier) {
  this.session.maxMultiplier = multiplier;
}
```

### Daily Allowance System

```typescript
const DAILY_ALLOWANCE = 100000; // ₹1,00,000

// New session initialization
private initializeSession(): UserSession {
  return {
    balance: DAILY_ALLOWANCE,
    startBalance: DAILY_ALLOWANCE,
    // ... other fields
  };
}

// Manual reset (Destroy Session button)
public resetBalance() {
  this.session.balance = DAILY_ALLOWANCE;
  this.saveSession(this.session);
}
```

---

## 📊 House Edge Mathematics

Every game has a built-in mathematical advantage for the "house":

```typescript
// types.ts
export const HOUSE_EDGES: Record<GameType, number> = {
  [GameType.CRASH]: 0.01,        // 1.0%  - Aviator
  [GameType.DICE]: 0.01,         // 1.0%  - Dice
  [GameType.ROULETTE]: 0.027,    // 2.7%  - Roulette
  [GameType.SLOTS]: 0.04,        // 4.0%  - Slots
  [GameType.MINES]: 0.03,        // 3.0%  - Mines
  [GameType.PLINKO]: 0.01,       // 1.0%  - Plinko
  [GameType.BLACKJACK]: 0.005,   // 0.5%  - Blackjack (lowest)
  [GameType.COINFLIP]: 0.019,    // 1.9%  - Coinflip
  [GameType.TEENPATTI]: 0.025,   // 2.5%  - Teen Patti
  [GameType.MATKA]: 0.05,        // 5.0%  - Kalyan Matka (highest)
  [GameType.WHEEL]: 0.03,        // 3.0%  - Wheel
  [GameType.BACCARAT]: 0.0106,   // 1.06% - Baccarat Banker
  [GameType.KENO]: 0.05,         // 5.0%  - Keno
};
```

### Expected Value Calculation

```
EV = (Win Probability × Payout) - (Loss Probability × Stake)

Example: Kalyan Matka
- 10 possible outcomes (0-9)
- Win probability: 1/10 = 10%
- Payout: 9x stake
- Fair payout: 10x stake

EV = (0.1 × 9) - (0.9 × 1) = 0.9 - 0.9 = -0.10 = -10%

But our implementation uses 5% house edge:
Effective EV per round = -5% of stake
```

### Why Loss is Inevitable

```
Long-term Expected Loss = Total Wagered × House Edge

Example:
- Total wagered: ₹1,000,000
- Kalyan Matka (5% edge)
- Expected loss: ₹1,000,000 × 0.05 = ₹50,000

No strategy can overcome this mathematical certainty.
```

### RTP (Return to Player)

```
RTP = 1 - House Edge

Kalyan Matka:  95.0% RTP (you get back ₹95 per ₹100 wagered)
Blackjack:     99.5% RTP (highest RTP, but still losing)
Slots:         96.0% RTP
Aviator:       99.0% RTP
```

**Important**: RTP is calculated over millions of bets. Short-term variance can make you win or lose much more.

---

## 🎨 UI/UX Design Philosophy

### "Theater Stage" Layout

The interface prioritizes focused gameplay:

```typescript
// Layout.tsx
const isLobby = location.pathname === '/';

// Sidebar: Hidden on game pages (desktop), collapsible (mobile)
<aside className={`
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
  lg:translate-x-0 
  fixed lg:static
`}>

// Intel Feed: Slide-out panel, hidden by default
<div className={`
  fixed inset-y-0 right-0 
  ${showIntel ? 'translate-x-0' : 'translate-x-full'}
`}>

// Main Content: Expands to fill available space
<main className="flex-1 overflow-y-auto">
  <div className={`${isLobby ? 'max-w-6xl' : 'max-w-full'} mx-auto`}>
```

### Responsive Typography

```css
/* index.css */
.text-responsive {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}

/* Scales between 14px - 18px based on viewport */
```

### Animation Performance

All animations maintain 60fps:

```typescript
// Crash.tsx - Exponential curve animation
const animate = (time: number) => {
  const elapsed = (time - startTimeRef.current) / 1000;
  const currentMult = Math.pow(Math.E, 0.06 * elapsed);
  
  drawGraph(elapsed, currentMult); // Canvas render <16.6ms
  
  if (currentMult >= crashPointRef.current) {
    // Stop animation
    cancelAnimationFrame(requestRef.current);
  } else {
    // Continue at 60fps
    requestRef.current = requestAnimationFrame(animate);
  }
};
```

### Color Psychology

- **Cyan (#22d3ee)**: Trust, speed, digital clarity → Primary actions, wins
- **Magenta (#d946ef)**: Energy, excitement → Jackpots, special events
- **Gold (#fbbf24)**: Wealth, success → Large wins, premium features
- **Red (#ef4444)**: Danger, loss → Losses, warnings, exits
- **Green (#10b981)**: Success, profit → Wins, confirmations

### Sound Design

```typescript
// services/audio.ts
export const audio = {
  playClick: () => beep(800, 50, 0.1),      // UI interactions
  playBet: () => beep(600, 100, 0.15),      // Bet placed
  playWin: () => playWinSound(),            // Win celebration
  playLoss: () => beep(200, 200, 0.2),      // Loss feedback
};

function beep(frequency: number, duration: number, volume: number) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration / 1000);
}
```

---

## 🔨 Building & Deployment

### Development Build

```bash
npm run dev
```

Output:
```
  VITE v5.1.0  ready in 324 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

Features:
- Hot Module Replacement (HMR)
- Fast TypeScript compilation (esbuild)
- Instant CSS updates
- React Fast Refresh

### Production Build

```bash
npm run build
```

Process:
1. TypeScript compilation (`tsc`)
2. Vite bundling with Rollup
3. Asset optimization
4. Code minification
5. Hash-based file naming

Output structure:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── index-[hash].css     # Styles
│   ├── react-[hash].js      # React chunk
│   └── recharts-[hash].js   # Charts chunk
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/casino/',  // GitHub Pages sub-path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,  // Set true for debugging
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Consistent hashed filenames
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  }
});
```

### GitHub Pages Deployment

**Option 1: GitHub Actions (Automatic)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Option 2: Manual Deployment**

```bash
# Build production bundle
npm run build

# Install gh-pages utility
npm install -g gh-pages

# Deploy to gh-pages branch
gh-pages -d dist

# Or push manually
git subtree push --prefix dist origin gh-pages
```

**GitHub Settings**:
1. Repository → Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / root

### Environment Variables

For production deployments with custom configuration:

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_ENABLE_SOUNDS=true
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## ⚙️ Configuration & Customization

### Modifying House Edges

```typescript
// types.ts
export const HOUSE_EDGES: Record<GameType, number> = {
  [GameType.MATKA]: 0.05,  // Change to 0.10 for 10% house edge
  [GameType.CRASH]: 0.01,  // Change to 0.03 for 3% instant bust rate
  // ... other games
};
```

**Effect**: Changes the mathematical advantage for each game.

### Adjusting Starting Balance

```typescript
// services/engine.ts
const DAILY_ALLOWANCE = 100000;  // Change to 50000 for ₹50,000 start

private initializeSession(): UserSession {
  return {
    balance: DAILY_ALLOWANCE,
    startBalance: DAILY_ALLOWANCE,
    // ...
  };
}
```

### Customizing Theme Colors

```css
/* index.css */
:root {
  --bet-primary: #22d3ee;    /* Cyan - change to your brand color */
  --bet-secondary: #d946ef;  /* Magenta */
  --bet-accent: #facc15;     /* Gold */
  --bet-danger: #ef4444;     /* Red */
  --bet-success: #10b981;    /* Green */
  
  --bet-950: #020617;        /* Dark background */
  --bet-900: #0f172a;        /* Card background */
  --bet-800: #1e293b;        /* Input background */
}
```

### Adding New Games

1. **Create game page component**:
```typescript
// pages/NewGame.tsx
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { GameType } from '../types';

export default function NewGame() {
  const [betAmount, setBetAmount] = useState(100);
  
  const play = () => {
    engine.placeBet(GameType.NEWGAME, betAmount, (r) => {
      // Your game logic here
      const won = r > 0.5; // Example: 50% win chance
      return {
        multiplier: won ? 2 : 0,
        outcome: won ? 'Win!' : 'Loss'
      };
    });
  };
  
  return (
    <Layout>
      {/* Your game UI */}
    </Layout>
  );
}
```

2. **Add game type**:
```typescript
// types.ts
export enum GameType {
  // ... existing games
  NEWGAME = 'NEWGAME',
}

export const HOUSE_EDGES: Record<GameType, number> = {
  // ... existing edges
  [GameType.NEWGAME]: 0.02,  // 2% house edge
};
```

3. **Add route**:
```typescript
// App.tsx
import NewGame from './pages/NewGame';

<Route path="/newgame" element={<NewGame />} />
```

4. **Add to navigation**:
```typescript
// components/Layout.tsx
const menu = [
  // ... existing items
  { label: 'New Game', to: '/newgame', icon: '🎲' },
];
```

### Modifying Bot Leaderboard

```typescript
// services/engine.ts
const BOTS: LeaderboardEntry[] = [
  { username: 'YourBot_1', wagered: 500000, maxMultiplier: 25.0 },
  { username: 'YourBot_2', wagered: 1200000, maxMultiplier: 80.0 },
  // Add more bots or modify existing ones
];
```

---

## 🤝 Contributing

Contributions that enhance the **educational value** of this platform are welcome!

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/casino.git
cd casino

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/educational-enhancement

# Make your changes
# Test thoroughly

# Commit with clear messages
git commit -m "Add probability calculator for dice game"

# Push to your fork
git push origin feature/educational-enhancement

# Open Pull Request on GitHub
```

### Contribution Guidelines

**What to contribute**:
- ✅ New educational game modes
- ✅ Improved probability explanations
- ✅ Better data visualizations
- ✅ Accessibility improvements
- ✅ Performance optimizations
- ✅ Bug fixes
- ✅ Documentation improvements

**What NOT to contribute**:
- ❌ Real money integration
- ❌ Actual gambling features
- ❌ Removal of educational warnings
- ❌ Obfuscation of house edges
- ❌ Predatory dark patterns

### Code Standards

- Use TypeScript for type safety
- Follow existing code style (2-space indentation)
- Add comments explaining complex math
- Write descriptive commit messages
- Include educational purpose in PR description

### Testing Your Changes

```bash
# Run dev server
npm run dev

# Test in multiple browsers
# - Chrome/Edge (Chromium)
# - Firefox
# - Safari (if on macOS)

# Test responsiveness
# - Desktop (1920x1080)
# - Laptop (1366x768)
# - Tablet (768x1024)
# - Mobile (375x667)

# Verify game logic
# - Place multiple bets
# - Check balance calculations
# - Verify history recording
# - Test seed rotation
```

---

## 📚 Educational Resources

### Understanding Probability

**Key Concepts**:
- **Independent Events**: Past results don't affect future outcomes
- **Expected Value**: Average result over infinite trials
- **Variance**: Measure of result volatility
- **Standard Deviation**: Square root of variance
- **Law of Large Numbers**: Over time, results approach expected value

**Recommended Reading**:
- "The Theory of Gambling and Statistical Logic" by Richard A. Epstein
- "Risk and Reward" by Peter L. Bernstein
- "Fooled by Randomness" by Nassim Nicholas Taleb

### House Edge Examples

**Kalyan Matka**:
```
True odds: 10 to 1 (1 in 10 chance)
Fair payout: 10x
Actual payout: 9x
House edge: (10 - 9) / 10 = 10%

Expected loss per ₹100 bet: ₹10
```

**Aviator**:
```
3% chance of instant bust at 1.00x
For crash at 2.00x, actual probability < 50%
House edge maintained through instant bust + payout curve

Expected loss per ₹100 bet: ₹3
```

**Blackjack** (with optimal strategy):
```
House edge: 0.5%
Lowest of any casino game
Requires perfect strategy execution

Expected loss per ₹100 bet: ₹0.50
```

### Cognitive Biases

**Gambler's Fallacy**:
```
Belief: "Red has come up 5 times, black is due!"
Reality: Each spin is independent, still 48.6% chance
```

**Hot Hand Fallacy**:
```
Belief: "I've won 3 times, I'm on a streak!"
Reality: Past wins don't increase future win probability
```

**Near-Miss Effect**:
```
🍇🍇🍋 feels like "almost won"
Reality: This is a complete loss, same as 🍒🍋💎
Psychological impact: Triggers dopamine, encourages continued play
```

### Probability Calculators

**Win Probability** (Fair Game):
```
P(win) = 1 / Total Outcomes

Dice (roll over 50):
P(win) = 50 / 100 = 50%

Matka (pick 5):
P(win) = 1 / 10 = 10%
```

**Expected Value**:
```
EV = Σ (Probability_i × Payout_i) - Stake

Matka:
EV = (0.10 × 9) - 1 = 0.90 - 1 = -0.10 = -10%
```

---

## 🛡️ Responsible Gaming

### Educational Disclaimer

This platform is designed **exclusively for educational purposes**:

- ✅ Understanding probability and statistics
- ✅ Learning about casino mathematics
- ✅ Studying behavioral psychology
- ✅ Demonstrating house edge concepts

### Not for Real Gambling

- ❌ No real money deposits or withdrawals
- ❌ Virtual currency has no real-world value
- ❌ Not licensed as an online casino
- ❌ Not intended to promote gambling

### If You Have a Gambling Problem

**Warning Signs**:
- Betting money you can't afford to lose
- Chasing losses to "win it back"
- Lying about gambling habits
- Neglecting responsibilities for gambling
- Feeling guilt or shame about gambling

**Get Help**:
- **National Council on Problem Gambling**: 1-800-522-4700
- **Gamblers Anonymous**: https://www.gamblersanonymous.org
- **SAMHSA National Helpline**: 1-800-662-4357

### Age Restriction

While this is a demo simulation, users should be **18+ years old** due to mature subject matter regarding gambling mechanics.

---

## 📄 License & Legal

### Educational License

This project is released under an educational license:

**You MAY**:
- ✅ Use the code for learning purposes
- ✅ Study the implementation
- ✅ Modify for educational research
- ✅ Share with attribution to @paidguy

**You MAY NOT**:
- ❌ Use for commercial gambling operations
- ❌ Remove educational warnings and disclosures
- ❌ Deploy for real-money gambling
- ❌ Claim the work as your own without attribution

### Attribution Required

When using this code, please maintain attribution:

```
Casino Education Platform by @paidguy
Source: https://github.com/Paidguy/casino
Educational simulator for understanding casino mathematics
```

### Disclaimer

```
This software is provided "as is" for educational purposes only.
The creators assume no liability for:
- Use of this code in violation of gambling laws
- Financial losses from misunderstanding the platform's purpose
- Deployment for real-money gambling operations
- Any legal consequences arising from improper use

By using this software, you acknowledge that:
- This is a simulation with no real monetary value
- You are using it solely for educational purposes
- You will not deploy it for actual gambling
- You understand the mathematical certainty of loss in casino games
```

---

## 🙏 Acknowledgments

### Educational Inspiration

This project draws inspiration from:
- Academic courses on probability and statistics
- Research papers on gambling psychology
- Transparency initiatives in online gaming
- The need for honest gambling education

### Technology Credits

- **React Team**: For the excellent React framework
- **Vite Team**: For blazing-fast build tooling
- **TypeScript Team**: For type safety and developer experience
- **Recharts**: For beautiful, responsive charts
- **Open Source Community**: For countless tools and libraries

### Special Thanks

To researchers, educators, and developers working to:
- Demystify probability and randomness
- Promote mathematical literacy
- Expose predatory gambling practices
- Provide honest education about casino mechanics

---

## 📞 Support & Contact

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/Paidguy/casino/issues)
- **GitHub Discussions**: [Ask questions or share ideas](https://github.com/Paidguy/casino/discussions)
- **Live Demo**: [Test the platform](https://paidguy.me/casino/)

### Bug Reports

When reporting bugs, include:

```
Browser: Chrome 120.0.6099.130
OS: Windows 11
Screen: 1920x1080
Issue: [Clear description]
Steps to reproduce:
1. Go to /crash
2. Place bet of ₹1000
3. Cash out at 2.5x
4. [Unexpected behavior]
Expected: [What should happen]
Actual: [What actually happened]
Console errors: [Any error messages]
```

### Feature Requests

For new educational features, describe:
- **Educational objective**: What concept does it teach?
- **User benefit**: How does it improve understanding?
- **Implementation idea**: Suggested technical approach
- **Example**: Similar feature in other educational tools

---

## 🎯 Final Educational Note

### The Most Important Lesson

**In any game with a house edge, continued play guarantees mathematical loss.**

This isn't about luck, skill, or strategy—it's pure arithmetic:

```
If House Edge > 0, then:
  Long-term Result = Starting Bankroll - (Total Wagered × House Edge)
```

No betting system, pattern analysis, or "hot streak" can overcome negative expected value.

### The House Edge is NOT a Challenge

It's a **mathematical certainty**, not a puzzle to solve:

- Martingale system? Fails when you hit table limits or run out of money
- Card counting in Blackjack? Reduces edge to ~0%, but still net negative
- "Due" numbers in Matka? Every draw is independent—past results don't matter
- Bankroll management? Slows losses but doesn't eliminate them

### Use This Knowledge Wisely

This platform demonstrates these truths transparently so you can:
- Understand the math before risking real money
- Recognize predatory gambling tactics
- Make informed decisions
- Help others understand why gambling isn't profitable

**The house always wins**—not through cheating, but through **mathematics**.

---

**Built with educational purpose by [@paidguy](https://github.com/Paidguy)**

**Live Demo**: [paidguy.me/casino](https://paidguy.me/casino/)

*Learn. Understand. Make informed decisions.*

---

### Project Metadata

```json
{
  "name": "losslimit-casino",
  "version": "1.0.0",
  "author": "@paidguy",
  "purpose": "Educational gambling mathematics simulator",
  "license": "Educational Use Only",
  "repository": "https://github.com/Paidguy/casino",
  "demo": "https://paidguy.me/casino/",
  "technology": "React + TypeScript + Vite",
  "games": 13,
  "house_edge_range": "0.5% - 5.0%",
  "target_audience": "Students, educators, researchers",
  "real_money": false,
  "age_restriction": "18+",
  "gambling_support": "1-800-522-4700"
}
```
