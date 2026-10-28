<div align="center">

# Casino

### An open-source casino for learning how the games really work

*Play every game with virtual credits, inspect the math behind it, and risk no real money.*

<p align="center">
  <a href="#about"><img src="https://img.shields.io/badge/Purpose-Educational_Simulator-F59E0B?style=for-the-badge" alt="Educational Simulator" /></a>
  <a href="#provably-fair-engine"><img src="https://img.shields.io/badge/RNG-HMAC--SHA256-10B981?style=for-the-badge" alt="HMAC-SHA256" /></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-100%25_Client--Side-38BDF8?style=for-the-badge" alt="100% Client-Side" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=000000" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Web_Audio_API-Synthesized_SFX-EC4899?style=flat-square" alt="Web Audio API" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-FBBF24?style=flat-square" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#why-this-exists">Why This Exists</a> •
  <a href="#games-and-math">Games</a> •
  <a href="#provably-fair-engine">Provably Fair Engine</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

</div>

---

## About

**Casino** is an open-source, fully client-side casino simulator built for education. It lets you play popular casino and classic Indian games with virtual credits while showing, step by step, how each game's odds, payouts, and randomness actually work.

Real gambling products are designed around a built-in house edge that is rarely explained to players. This project makes that edge visible. It includes 14 games, live session charts, formulas for each game, and a cryptographic seed verifier, all running locally in your browser with virtual `₹` credits that have no monetary value.

> [!IMPORTANT]
> **No real money is involved.**
> This project does not accept deposits, connect to payment gateways, or run any backend servers. Every player starts with a free virtual wallet of ₹25,000 that can be refilled, reset, or customized at any time.

---

## Why This Exists

| Audience | What you get |
| :--- | :--- |
| **Curious players** | Try games like Crash, Mines, Plinko, Roulette, Blackjack, Teen Patti, and Andar Bahar with full animations and sound, without any financial risk. |
| **Students of math and probability** | See how **Return to Player (RTP)**, **house edge**, **combinatorial multipliers**, and **expected value (EV)** play out in real time using the live session chart and the House Controls page. |
| **Developers and security learners** | Read a clean, dependency-free TypeScript implementation of SHA-256, HMAC-SHA256, float extraction from hash bytes, Fisher-Yates shuffles, and `BroadcastChannel` multi-tab state sync. |
| **Anyone interested in financial literacy** | Test strategies such as Martingale, Kelly sizing, flat betting, and auto-cashout targets over hundreds of simulated rounds, and see for yourself how the house edge behaves in the long run. |

---

## Games and Math

Every outcome is derived from the cryptographic random stream described [below](#provably-fair-engine), not from placeholder results or scripted animations. Each game page also includes a **Game Studio Bar** with a live profit chart, the game's formulas, and a one-click fairness check.

### Instant and Original Games

| Game | Route | RTP (Edge) | Max Win | Mechanics |
| :--- | :--- | :---: | :---: | :--- |
| **Aviator Crash** | `/crash` | 99.0% (1.0%) | 10,000× | 60fps canvas multiplier curve, manual and auto cashout (1.01×–1000×), and automated bet sizing after wins or losses. |
| **Gold Mines** | `/mines` | 99.0% (1.0%) | 24.75×+ | 5×5 grid with 1–24 mines, a 25-float Fisher-Yates permutation, a combinatorial payout ladder, and an interactive auto-pattern mode. |
| **Plinko 1000x** | `/plinko` | 99.0% (1.0%) | 1,000× | Multi-ball physics across 8–16 pin rows, with Low, Medium, and High volatility payout buckets. |
| **Classic Dice** | `/dice` | 99.0% (1.0%) | 49.50× | Win chance from 2% to 98%, Roll Over / Roll Under toggle, and a dual-zone probability slider. |
| **Royal Coinflip** | `/coinflip` | 99.0% (1.0%) | 31.68× | Compounding streak payouts (1.98× → 3.96× → 7.92× → 15.84× → 31.68×) with a cashout option after any flip. |

### Indian Classics

| Game | Route | RTP (Edge) | Max Win | Mechanics |
| :--- | :--- | :---: | :---: | :--- |
| **Kalyan Matka** | `/matka` | 95.0% (5.0%) | 600× | Five simulated markets (Kalyan, Worli Mumbai, Milan Night, Rajdhani Night, Main Mumbai) and a multi-ticket bet slip covering Single Digit (9.5×), Double Digit (95×), 3-Card Combo (150×–600×), and Even/Odd (1.95×). |
| **Teen Patti** | `/teenpatti` | 97.5% (2.5%) | 40× | 52-card cryptographic shuffle with standard hand rankings (Trail, Pure Sequence, Sequence, Color, Pair, High Card) and a Pair Plus side bet paying up to 40×. |
| **Andar Bahar** | `/andarbahar` | 97.5% (2.5%) | 8.0× | Alternating deal matched against a Joker rank (1.95× Andar / 1.90× Bahar), plus side bets on the total number of cards dealt (1–5, 6–15, 16–25, 26+). |

### Table and Wheel Games

| Game | Route | RTP (Edge) | Max Win | Mechanics |
| :--- | :--- | :---: | :---: | :--- |
| **European Roulette** | `/roulette` | 97.3% (2.7%) | 36× | Single-zero (0–36) SVG wheel, full inside and outside betting grid, and French call bets (Voisins du Zéro, Tiers du Cylindre, Orphelins, Jeu Zéro). |
| **VIP Blackjack 21** | `/blackjack` | 99.5% (0.5%) | 2.5× | 52-card Fisher-Yates shoe with Hit, Stand, Double Down, Split, and Insurance (2:1). A natural 21 pays 3:2. |
| **Punto Baccarat** | `/baccarat` | 98.9% (1.1%) | 12× | Standard Tableau third-card rules for Player (2×), Banker (1.95×), and Tie (9×), plus Pair side bets (12×) and a Bead Road history. |
| **Diamond Slots** | `/slots` | 96.5% (3.5%) | 250× | 5×3 video slot with 10 paylines, Wild substitutions, and Scatters that award 5 free spins at a 3× multiplier. |
| **Fortune Wheel** | `/wheel` | 97.0% (3.0%) | 50× | Configurable Low / Medium / High risk and 10 / 20 / 30 segments. |
| **Royal Keno** | `/keno` | 98.0% (2.0%) | 100× | 40-number board where you pick up to 10 spots against a 10-ball draw, with a hit-table of multipliers. |

---

## Provably Fair Engine

Instead of relying on `Math.random()`, Casino uses a commit-and-reveal scheme based on HMAC-SHA256, the same general approach used by provably fair gaming platforms. Everything runs inside your browser, so you can follow every step.

### 1. Commitment

Before any bet is placed, the engine generates a secret `serverSeed` and shows you its SHA-256 hash:

$$\text{Commitment} = \text{SHA256}(\text{serverSeed})$$

Because the hash is published first, the seed cannot be changed afterwards without the mismatch being obvious.

### 2. Deterministic Byte Stream

Each round combines the `serverSeed`, your own `clientSeed`, the round `nonce`, and a byte `cursor` (`0, 1, 2, ...`):

$$\text{Digest} = \text{HMAC\_SHA256}(\text{serverSeed},\; \text{clientSeed} : \text{nonce} : \text{cursor})$$

### 3. Converting Bytes to Floats

Each 32-byte digest yields up to 8 uniform floats $r \in [0, 1)$, reading 4 bytes ($b_0, b_1, b_2, b_3$) at a time:

$$r = \frac{b_0}{256^1} + \frac{b_1}{256^2} + \frac{b_2}{256^3} + \frac{b_3}{256^4}$$

Each game then maps these floats to its outcomes, for example card positions in a shuffle, a crash multiplier, or a roulette pocket.

### 4. Independent Verification

At any time you can rotate your seed pair to reveal the original `serverSeed`. Open the `/fairness` page and use **Cross-Verify with Browser WebCrypto API** to recompute the result with your browser's native `window.crypto.subtle` and confirm that it matches.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER RUNTIME (NO BACKEND)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐        ┌────────────────────────────────────┐  │
│  │  14 Interactive Games   │◄──────►│   Universal GameStudioBar.tsx      │  │
│  │  (Canvas / SVG / Felt)  │        │  • Inline Provably Fair Verifier   │  │
│  └───────────┬─────────────┘        │  • Live SVG Profit Chart           │  │
│              │                      │  • Game Math & Probability Specs   │  │
│              ▼                      └────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   Cryptographic SimulationEngine                      │  │
│  │  • Pure TypeScript SHA-256 and HMAC-SHA256                            │  │
│  │  • Atomic stake locking: deductStake() ──► settleDeductedBet()        │  │
│  │  • Virtual INR wallet, vault, and rakeback calculator                 │  │
│  └───────────┬───────────────────────────────────────────┬───────────────┘  │
│              │                                           │                  │
│              ▼                                           ▼                  │
│  ┌─────────────────────────┐                 ┌───────────────────────────┐  │
│  │ localStorage Persistence│                 │ BroadcastChannel Sync     │  │
│  │ (Offline-Ready State)   │                 │ (Real-Time Multi-Tab Sync)│  │
│  └─────────────────────────┘                 └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Repository Structure

```text
├── components/
│   ├── GameStudioBar.tsx     # Shared studio bar: fairness modal, live profit chart, math specs
│   ├── Layout.tsx            # Responsive shell, sidebar navigation, virtual cashier and vault modals
│   ├── Leaderboard.tsx       # All bets, my bets, and high-roller tables
│   └── LiveFeed.tsx          # Simulated player chat and live round ticker
├── pages/
│   ├── Lobby.tsx             # Game showcase, search, and live win feed
│   ├── Crash.tsx             # Aviator Crash (canvas + auto-betting)
│   ├── Mines.tsx             # 5x5 Gold Mines + auto-pattern builder
│   ├── Plinko.tsx            # Multi-ball Galton board physics
│   ├── Roulette.tsx          # European Roulette + French call bets
│   ├── Blackjack.tsx         # 52-card shoe Blackjack + Insurance
│   ├── Baccarat.tsx          # Punto Banco + Pair side bets + Bead Road
│   ├── Slots.tsx             # 5x3 10-payline slots + Wilds and Free Spins
│   ├── Matka.tsx             # Five-market Matka + multi-ticket bet slip
│   ├── TeenPatti.tsx         # 3-card Indian poker + Pair Plus bet
│   ├── AndarBahar.tsx        # Alternating Joker match + card count side bets
│   ├── Coinflip.tsx          # Compounding streak Coinflip
│   ├── Wheel.tsx             # Configurable risk and segments Fortune Wheel
│   ├── Dice.tsx              # Dual-zone probability Dice
│   ├── Keno.tsx              # 40-number Keno board
│   ├── Fairness.tsx          # HMAC-SHA256 audit and WebCrypto cross-verifier
│   ├── Statistics.tsx        # Session analytics, win-rate breakdown, and reset
│   ├── Transactions.tsx      # Virtual UPI / Paytm / IMPS passbook with sample receipts
│   └── Admin.tsx             # Educational House Controls, Turbo toggle, and RTP matrix
└── services/
    ├── engine.ts             # SHA-256, HMAC-SHA256, float RNG, and atomic wallet state machine
    ├── audio.ts              # Dependency-free Web Audio API sound synthesizer
    └── sound.ts              # Game sound trigger bindings
```

---

## Getting Started

Because everything runs in the browser, there are no databases, API keys, or backend servers to set up.

### Prerequisites

- **Node.js** `>= 18.0.0` (or **Bun** `>= 1.0`)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/casino.git
cd casino

# 2. Install dependencies
npm install

# 3. Start the Vite development server (http://localhost:3000)
npm run dev
```

### Build for Static Hosting

Works with GitHub Pages, Vercel, Netlify, and similar hosts.

```bash
# Type-check and bundle static assets into /dist
npm run build

# Preview the production build locally
npm run preview
```

---

## Contributing

Contributions are welcome from developers, mathematicians, and designers. You could add a new game, build a visualization of expected value distributions, improve the explanations, or polish the animations. Please read the [Contributing Guide](./CONTRIBUTING.md) and the [Security & Educational Policy](./SECURITY.md) first.

---

## License and Disclaimer

Distributed under the [MIT License](./LICENSE).

> **Disclaimer:** This software is for educational and entertainment purposes only. It uses virtual credits stored locally in your browser (`localStorage`) that have no monetary value. Real deposits, withdrawals, and wagers are not possible. Real-money gambling carries serious financial risk and is restricted or illegal in many places, so please follow the laws where you live.
