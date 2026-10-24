# Maharaja Exchange & Satta King — High-Voltage Indian Bookie & Casino Portal

This plan overhauls the entire platform from a generic dark template into an authentic, high-energy Indian Satta Bazar and Casino Bookie Exchange with rich gold and electric neon accents, Indian Rupee (`₹`) denominations, an interactive UPI/Paytm/IMPS Cashier, live market tickers, and 14 fully playable games.

### User Review & Critical Decisions

> [!IMPORTANT]
> Please review the confirmed design and feature decisions below before we execute the full visual and functional overhaul.

- **Confirmed Visual Identity**: **High-Voltage Satta & Bookie Portal** featuring deep obsidian/midnight surfaces, burnished 24K gold (`#F59E0B` / `#FBBF24`), electric crimson/neon accents (`#EF4444` / `#10B981`), tactile casino tables, and high-contrast tabular odds boards.
- **Confirmed Hero Game Lineup**: **Aviator Crash, Mines, Plinko, and Roulette** featured front-and-center in the primary showcase, alongside **Kalyan/Worli Matka Bazar (Ank, Jodi, Panna)**, **Teen Patti (Blind/Chaal)**, **Andar Bahar**, **Blackjack**, **Baccarat**, **Slots**, **Wheel**, **Keno**, **Dice**, and **Coinflip**.
- **Confirmed Platform Experience**: **Instant UPI, Paytm, PhonePe, Google Pay, and IMPS Deposit/Withdrawal Cashier Modal** with UTR receipt simulation, paired with a live Satta Bazar result ticker, active punter feed, and celebratory win overlays.

---

### 1. Overview & Core Concept

- **What It Does**: Delivers a complete, energetic Indian online casino and Satta bookie platform where players manage an INR (`₹`) wallet via realistic UPI/IMPS flows, track live Satta Matka bazar draws, and play 14 provably fair casino and desi games with real-time odds, sound effects, and instant settlement.
- **Target Audience / Persona**: Players seeking the unmistakable atmosphere, visual richness, Hinglish bookie terminology (*Bhav, Peti, Khokha, Jodi, Panna, Chaal, Cashout*), and rapid action of top Indian gaming portals.
- **Key Value**: Replaces sterile minimalism with genuine casino excitement—combining rock-solid deterministic game mathematics and SHA-256 provable fairness with a vibrant, living Indian bookie and casino environment.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Lobby & Live Bookie Pulse**: Users land on a rich 1440px widescreen bookie portal displaying a live Satta Bazar result ribbon (Kalyan, Milan Night, Rajdhani, Main Bazar), a promotional Jackpot Hero showcase, quick-bet chips (`₹100`, `₹500`, `₹1,000`, `₹5,000`, `₹10,000`), and categorized game grids.
  2. **Instant UPI / Paytm / IMPS Cashier Flow**: Clicking the Wallet / Deposit button opens an interactive Indian Cashier modal supporting **UPI QR & VPA**, **Paytm**, **PhonePe**, **GPay**, and **IMPS Bank Transfer**, with preset INR bonus tiers, simulated instant UTR verification, and instant balance crediting or withdrawal logging.
  3. **Featured Originals (Aviator Crash, Mines, Plinko, Roulette)**: High-impact visual arenas with custom canvas/SVG rendering, live multiplier ladders, quick-stake Indian chip selectors, hot/cold history ribbons, and celebratory win banners.
  4. **Desi Classics (Kalyan Matka, Teen Patti, Andar Bahar)**: Authentic Indian rules including Single Ank (`9.5x`), Jodi (`95x`), Single/Double/Triple Panna (`150x–600x`) with historical Jodi charts, plus Teen Patti Blind/Chaal pot betting and Andar Bahar joker-match dealing.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-Voltage Indian Satta & Bookie Exchange—energetic, luxurious, and tactile, blending midnight velvet surfaces with gleaming gold trim and crisp bookie odds boards.
  - *Color Palette & Mood (60-30-10 Discipline)*:
    - **60% Dominant Canvas**: Deep Midnight Obsidian (`#070B14`) and Royal Night (`#0D1322`) providing high contrast for cards, wheels, and neon multipliers.
    - **30% Structural Surfaces**: Rich Onyx Panels (`#131C31`), Emerald Felt (`#064E3B`) for card/roulette tables, and subtle gold-tinted hairline borders (`rgba(245, 158, 11, 0.22)`).
    - **10% High-Intent Accents**: Burnished Maharani Gold (`#F59E0B` to `#FDE047` gradient) for primary CTAs and jackpots, Electric Aviator Crimson (`#F43F5E`), and Punter Win Emerald (`#10B981`).
  - *Typography & Hierarchy (2+1 Rule)*:
    - **Display & Headings**: `Outfit` (bold, high-impact geometric display for game titles, banners, and bazar headers) with `text-wrap: balance`.
    - **Body & Controls**: `Plus Jakarta Sans` for crisp, legible navigation, rules, and cashier forms.
    - **Data, Multipliers & INR Balances**: `JetBrains Mono` with `tabular-nums` for all `₹` balances, odds (`Bhav`), crash counters, and SHA-256 seeds.
  - *Component Styling & Layout*: Full 1440px desktop viewport utilization with a clean 3-zone top bar, collapsible category navigation, interactive game stage split (`Controls Sidebar` + `Main Arena Stage`), and bottom live punter bet ledger.

- **Interactive Feedback & Motion**:
  - Compositor-only animations (`transform`, `opacity`) settling within `150ms–200ms` for chip selection, card dealing, wheel spinning, and mine reveals.
  - Synthesized Web Audio API casino soundscape (dhol/chime win fanfare, card snap, roulette ball tick, rising Aviator turbine pitch, and cashout coin cascade) with an accessible mute toggle.
  - Non-hue-only state signaling pairing every win/loss/multiplier state with explicit icons, `₹` profit deltas, and clear text labels.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Authentic INR (`₹`) & UPI/Paytm/IMPS Cashier vs. Generic Crypto Wallet**
  - *Chosen Approach*: Full Indian Rupee (`₹`) formatting (`en-IN` locale with Lakh/Crore notation where appropriate) and a multi-step UPI/Paytm/IMPS deposit & withdrawal simulator generating verifiable transaction records.
  - *Why*: Nothing kills the Indian gambling vibe faster than generic crypto/USD counters. An interactive UPI/IMPS cashier immediately grounds the platform in an authentic Indian bookie experience.
  - *Alternatives Considered*: Simple "+1000 Reset" button (rejected as cheap and immersion-breaking).

- **Decision 2: Adding Andar Bahar & Enriching Featured Games (Aviator, Mines, Plinko, Roulette, Matka, Teen Patti)**
  - *Chosen Approach*: Upgrade the visual stages of Aviator Crash (live trajectory curve, dual-style bet controls, history pills, simulated fellow punters cashing out), Mines (gold/bomb vault grid with live next-tile multiplier strip), Plinko (multi-row peg pyramid with glowing multiplier buckets), and Roulette (European felt board + animated wheel), while adding a dedicated **Andar Bahar** table alongside **Teen Patti** and **Kalyan Matka**.
  - *Why*: Directly fulfills the user's request for a rich, complete platform anchored by their favorite casino and desi games.

- **Decision 3: Deterministic Provably Fair Engine with Multi-Step Stake Safety**
  - *Chosen Approach*: Preserve and extend the synchronous SHA-256 deterministic PRNG engine (`deductStake` + `settleDeductedBet`) across all 14 games and the new UPI cashier.
  - *Why*: Guarantees zero double-deduction balance bugs, instant round settlement, and verifiable fairness for every single bet.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     Application Shell & Top Bar (INR ₹)                    │
│   [Brand Wordmark] ── [Lobby · Live Bazar · Fairness · Stats] ── [UPI Cashier] │
└───────────────────┬────────────────────────────────────┬───────────────────┘
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────────┐
│     Interactive UPI / IMPS Modal     │   │   Live Bazar & Punter Feed      │
│  • UPI QR / VPA, Paytm, PhonePe, IMPS│   │  • Kalyan / Worli / Rajdhani    │
│  • Instant ₹ Credit & Payout Ledger  │   │  • Real-Time High-Roller Feed   │
└───────────────────┬──────────────────┘   └─────────────────┬───────────────┘
                    │                                        │
                    └───────────────────┬────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│              Deterministic Casino & Bookie Engine (LocalStorage)           │
│  • SHA-256 Provably Fair PRNG (Server Seed, Client Seed, Nonce)            │
│  • Atomic Balance Management (deductStake / settleDeductedBet / UPI Tx)    │
│  • Web Audio Synthesizer (Card Flip, Coin Cascade, Aviator Riser, Win)     │
└─────────┬─────────────────────────────┬──────────────────────────┬─────────┘
          │                             │                          │
          ▼                             ▼                          ▼
┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────────┐
│   Featured Originals  │   │  Indian Bookie Classics│   │  Table & Arcade   │
│  • Aviator Crash      │   │  • Kalyan Matka Bazar  │   │  • Blackjack      │
│  • Mines Vault        │   │  • Teen Patti Royal    │   │  • Baccarat       │
│  • Plinko Pyramid     │   │  • Andar Bahar Live    │   │  • Slots / Wheel  │
│  • European Roulette  │   │                        │   │  • Keno / Dice /  │
│                       │   │                        │   │    Coinflip       │
└───────────────────────┘   └────────────────────────┘   └───────────────────┘
```

- **Data Model & State**:
  - `Wallet & Transactions`: Stores `balance` in `₹`, active `VIP Tier` (Silver, Gold, Maharaja), and a persistent ledger of game bets plus UPI/Paytm/IMPS deposits and withdrawals with generated 12-digit UTR numbers.
  - `Provably Fair State`: Stores `clientSeed`, `serverSeed`, `serverSeedHash`, and `nonce`, advancing deterministically on every game round.
  - `Live Satta Bazar State`: Tracks scheduled and live draw results (`Open Panna - Jodi - Close Panna`) for major Indian bazars (Kalyan, Milan Day/Night, Rajdhani Night, Main Bazar).

- **Interactive Component & State Mapping**:
  - **UPI / Paytm / IMPS Cashier Modal**: Selecting a payment method (`UPI`, `Paytm`, `PhonePe`, `IMPS`), choosing or typing an INR amount (`₹500` – `₹1,00,000`), and submitting validates input, generates a realistic 12-digit UTR reference, updates `engine.balance`, logs a `DEPOSIT` or `WITHDRAW` transaction, and triggers an audio confirmation chime.
  - **Aviator Crash**: Manages `IDLE -> FLYING -> CRASHED` loop via `requestAnimationFrame`, plotting the flight curve on an HTML5 canvas, updating live multiplier readout, allowing manual or auto-cashout before crash, and displaying simulated punter cashouts alongside the player's bet.
  - **Mines, Plinko, Roulette & Casino Suite**: Each game implements a strict `IDLE -> PLAYING -> ROUND_SUMMARY` state machine with quick INR chip buttons (`₹100`, `₹500`, `₹1K`, `2x`, `MAX`), instant payout calculation, and zero dead controls.
  - **Andar Bahar & Teen Patti**: Interactive card dealing where players place stakes on Andar/Bahar or play Blind/Chaal/Show against the dealer with clear visual card animations and automatic settlement.
