# MaharajaExch · Indian Casino Originals, Live Satta Matka & Provably Fair Exchange

![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1-646cff?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Provably Fair](https://img.shields.io/badge/RNG-SHA--256_Deterministic-10b981?style=for-the-badge)

**MaharajaExch** is an open-source, client-side Indian Casino, Satta Matka Bazar, and Gambling Mathematics Simulator built with **React 18**, **TypeScript**, and **HTML5 Canvas**. It combines the high-energy atmosphere of an Indian Bookie & VIP Casino Exchange (`₹` INR formatting, UPI/Paytm/IMPS cashier simulation, Tijori Safe vault, andVIP Chhoot rebates) with 100% transparent, cryptographically verifiable game mathematics.

> **Disclaimer:** This repository is a **100% virtual simulation** for software engineering, game-math research, and behavioral-economics education. No real money, actual payments, or financial wagers are accepted or processed.

---

## ✨ Key Highlights

- **14 Playable Casino & Desi Games:**
  - **Featured High-Roller Originals:** Aviator Crash (`10,000×` max), Mines Gold Tijori (`5×5` 24-bomb grid), Plinko `1000×` (8/12/16-row Galton pyramid), and Maharaja European Roulette (`36×` single-zero felt board).
  - **Desi & Satta Bazar Classics:** Kalyan Matka Bazar (Single Ank `9.5×`, Jodi `95×`, Single/Double/Triple Panna up to `600×`), Teen Patti Royal (`Blind 2.1×` / `Seen Chaal 1.95×` / `Trail 5×`), Andar Bahar Live (`Hukum` Joker matching), and Sikka Toss Streak (`Coinflip` multiplier chain).
  - **VIP Table & Jackpot Suite:** VIP Blackjack 21 (4-deck shoe, Hit/Stand/Double Down), Punto Banco Baccarat (official 3rd-card squeeze rules), Kohinoor Reels (`5×3` multi-payline slot machine), Navratna Wheel (10/20/30 segments), Satta Keno 40, and Chausar Roll Dice.
- **Instant INR Cashier Simulation (`UPI / Paytm / IMPS`):**
  - Simulate instant Indian payment rails (`UPI QR`, `Paytm Wallet`, `IMPS 24×7`) with auto-generated 12-digit UTR numbers (`UTR #4129XXXXXXXX`) and an auditable Passbook Ledger (`/transactions`).
  - Includes a **Tijori Safe Vault** to lock profits away from active sessions and **Maharaja Club VIP Chhoot** (instant rakeback rebates across Bronze, Silver, Gold, Platinum, and Kohinoor Diamond tiers).
- **Provably Fair SHA-256 Verification (`/fairness`):**
  - Every round outcome is derived deterministically from `SHA-256(serverSeed : clientSeed : nonce : cursor)`.
  - Players can rotate their Client Seed at any time to reveal the unhashed Server Seed and verify historical bets in the built-in interactive calculator.
- **Bookie Math Lab & Telemetry (`/statistics` & `/admin`):**
  - Real-time realized vs. theoretical RTP tracking, bankroll equity curves, and an interactive Bookie Risk & Math Lab to inspect how house edge (`0.5%` to `15%`) shapes player expected value (`EV`).

---

## 🎮 Complete 14-Game Portfolio & Mathematics

| Game | Route | Default RTP | House Edge | Core Mathematical Model |
| :--- | :--- | :---: | :---: | :--- |
| **Aviator Crash** | `/crash` | `99.0%` | `1.0%` | Inverse uniform distribution `M = (1 - edge) / (1 - r)` with real-time 60fps Canvas flight & instant manual/auto cashout |
| **Mines Gold Tijori** | `/mines` | `99.0%` | `1.0%` | Hypergeometric combinatorics `(1 - edge) / P(k safe picks)` across a 25-tile vault |
| **Plinko 1000x** | `/plinko` | `99.0%` | `1.0%` | Binomial `B(N, 0.5)` path simulation across 8, 12, or 16 peg rows with Low/Medium/High risk buckets |
| **Maharaja Roulette** | `/roulette` | `97.3%` | `2.7%` | European single-zero (`0–36`) wheel with Straight (`36×`), Dozen (`3×`), and Even-Money (`2×`) chip stacking |
| **Kalyan Matka Bazar** | `/matka` | `95.0%` | `5.0%` | 3-card Open/Close Panna draw (`000–999`), Single Ank (`9.5×`), Jodi (`95×`), and Panna (`150× / 300× / 600×`) |
| **Teen Patti Royal** | `/teenpatti` | `97.5%` | `2.5%` | 3-card Indian poker hand evaluator (Trail, Pakki Rung, Sequence, Color, Joot, High Card) |
| **Andar Bahar Live** | `/andarbahar` | `98.0%` | `2.0%` | Alternating Andar (`1.95×`) & Bahar (`2.00×`) card dealing against a central Hukum Joker card |
| **VIP Blackjack 21** | `/blackjack` | `99.5%` | `0.5%` | 4-deck shoe, `3:2` Natural Blackjack (`2.50×`), Dealer stands on all `17`, Hit / Stand / Double Down |
| **Punto Baccarat** | `/baccarat` | `98.94%` | `1.06%` | Official Punto Banco third-card tableau (`Player 2.00×`, `Banker 1.95×`, `Tie 9.00×`, Tie push refund) |
| **Kohinoor Reels** | `/slots` | `97.0%` | `3.0%` | `5×3` video slot matrix with 5 paylines and `💎` Kohinoor Wild substitution |
| **Navratna Wheel** | `/wheel` | `99.0%` | `1.0%` | Configurable 10, 20, or 30 segment prize wheel across Low, Medium, and High volatility profiles |
| **Satta Keno 40** | `/keno` | `99.0%` | `1.0%` | 10-ball hypergeometric draw from a 40-number board (`1–10` player picks) |
| **Chausar Roll Dice** | `/dice` | `99.0%` | `1.0%` | Continuous `0.00–100.00` Roll Over / Roll Under slider with linked `Multiplier = 99 / WinChance` |
| **Sikka Toss Streak** | `/coinflip` | `98.0%` | `2.0%` | Compounding streak multiplier `0.98 × 2^streak` with independent per-flip nonce offsets |

---

## 🗂️ Repository Structure

```text
├── .github/workflows/
│   └── main.yml               # GitHub Pages CI/CD pipeline
├── components/
│   ├── Layout.tsx             # 3-zone header, sidebar drawer, mobile bottom nav & INR Cashier modal
│   ├── Leaderboard.tsx        # Live Indian Exchange bets ticker & High-Roller Khata leaderboard
│   └── LiveFeed.tsx           # Real-time simulated punter bet stream & chat drawer
├── pages/
│   ├── Lobby.tsx              # Main exchange lobby, VIP Khata card, Satta Bazar strip & 14-game grid
│   ├── Crash.tsx              # Aviator Crash game (HTML5 Canvas 60fps flight & instant cashout)
│   ├── Mines.tsx              # 5×5 Mines Tijori vault game with manual & auto-pattern modes
│   ├── Plinko.tsx             # HTML5 Canvas Plinko pyramid with multi-ball cascade
│   ├── Roulette.tsx           # Interactive European Roulette felt table & chip stacker
│   ├── Matka.tsx              # Official Kalyan/Worli/Milan Satta Matka Parchi betting board
│   ├── TeenPatti.tsx          # Teen Patti Royal (Blind & Seen Chaal modes)
│   ├── AndarBahar.tsx         # Andar Bahar Live Hukum card matching table
│   ├── Blackjack.tsx          # 4-deck VIP Blackjack 21
│   ├── Baccarat.tsx           # Punto Banco Baccarat squeeze table
│   ├── Slots.tsx              # 5×3 Kohinoor Gold Reels slot machine
│   ├── Wheel.tsx              # Navratna multiplier wheel
│   ├── Keno.tsx               # 40-ball Satta Keno lottery board
│   ├── Dice.tsx               # 0–100 precision probability slider dice
│   ├── Coinflip.tsx           # Gold Mohur Heads/Tails streak multiplier game
│   ├── Fairness.tsx           # SHA-256 seed rotator & interactive outcome verifier
│   ├── Statistics.tsx         # Realized vs. theoretical RTP & bankroll telemetry charts
│   ├── Transactions.tsx       # INR Passbook ledger with 12-digit UTR audit trail
│   └── Admin.tsx              # Bookie Risk & House Edge Math Lab
├── services/
│   ├── engine.ts              # Deterministic SHA-256 RNG engine, INR formatter & session persistence
│   └── audio.ts               # Web Audio API zero-dependency synthesizer for casino sound effects
├── App.tsx                    # HashRouter routes & self-healing ErrorBoundary
├── types.ts                   # TypeScript domain models, enums & theoretical house edges
├── index.css                  # Responsive layout rules, custom scrollbars & gold/emerald surfaces
└── vite.config.ts             # Vite build configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** `18.x` or `20.x+`
- **npm** `9.x+`

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/Paidguy/casino.git
cd casino

# 2. Install dependencies
npm install

# 3. Start the development server (runs on http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Compile TypeScript & bundle production assets into ./dist
npm run build

# Preview the production build locally
npm run preview
```

---

## 🔒 Provably Fair Verification Architecture

Every bet in **MaharajaExch** is reproducible using a 3-tuple of `(Server Seed, Client Seed, Nonce)`:

1. **Before the Bet:** The platform commits to the current `serverSeed` by displaying its SHA-256 hash (`serverSeedHash = SHA256(serverSeed)`).
2. **During the Bet:** The deterministic float `r ∈ [0, 1)` is computed from `SHA256("${serverSeed}:${clientSeed}:${nonce}:${cursor}")`, taking the first 8 hex characters (`32-bit unsigned integer`) divided by `2^32`.
3. **Verification (`/fairness`):** Rotating your Client Seed reveals the previous unhashed `serverSeed` and allows you to recompute the exact outcome for any historical nonce across all 14 games.

---

## 📄 License

Released for **educational and open-source research purposes**. See repository license terms for details.