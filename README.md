# Casino

**Casino** is an open-source, client-side casino simulator and probability
learning project. It lets people play familiar casino and Indian card games
with virtual credits, while showing the rules, probabilities, payout tables,
randomness, and house edge behind each game.

The project is designed for education and risk-free experimentation. It does
not accept deposits, process withdrawals, connect to payment providers, or
allow real-money wagering. Every balance and result exists only in the
browser.

## What this project is for

Casino is useful for:

- Learning how common casino games work by playing them with virtual credits.
- Exploring probability, expected value, return to player (RTP), and house
  edge.
- Studying deterministic random-number generation and provably-fair-style
  verification.
- Testing betting strategies without financial risk.
- Reading a complete React and TypeScript implementation of the game logic and
  interface.

The goal is not to encourage gambling. The simulations make it easier to see
why short-term outcomes vary and why a mathematical house edge generally
dominates over many rounds.

> **Important:** Credits in Casino have no monetary value. This application
> cannot be used to deposit, withdraw, or win real money.

## Included games

The application currently includes 14 virtual-credit games:

| Category | Games |
| --- | --- |
| Instant games | Aviator Crash, Gold Mines, Plinko, Dice, Coinflip |
| Indian classics | Kalyan Matka, Teen Patti, Andar Bahar |
| Table and number games | European Roulette, Blackjack, Baccarat, Slots, Fortune Wheel, Keno |

Each game includes its own rules and payout model. The game studio panels
explain the relevant probabilities, multipliers, RTP, and house edge while a
round is being played.

## How the simulations work

### Virtual wallet

The application starts with a virtual balance. Bets deduct virtual credits and
winning payouts return virtual credits. Session data is stored locally in the
browser, so there is no account, backend wallet, or financial transaction.

### Randomness and verification

Game outcomes are generated in `services/engine.ts` rather than by animation
alone. The educational fairness flow uses:

1. A secret server seed and its SHA-256 commitment.
2. A player-controlled client seed.
3. A round nonce and byte cursor.
4. HMAC-SHA256 to produce deterministic digest bytes.
5. Uniform floating-point values derived from four-byte chunks of each digest.

In simplified form:

```text
digest = HMAC-SHA256(serverSeed, clientSeed + nonce + cursor)
random = four digest bytes converted to a value in [0, 1)
```

The `/fairness` page can reveal a completed seed and cross-check a result with
the browser's Web Crypto API. This is an educational implementation for
understanding commitments and deterministic game outcomes; it is not a
real-money gambling service.

### Game mathematics

Each game maps random values to outcomes using its rules. For example:

- Roulette maps a draw to one number from 0 through 36.
- Blackjack deals and evaluates cards using a shuffled shoe.
- Mines uses a shuffled grid and a changing payout multiplier.
- Dice converts a probability setting into a win threshold.
- Slots and Keno use symbol or number selections with payout tables.

The displayed RTP is the long-run expected return implied by the configured
rules, not a promise about any individual session.

## Architecture

Casino is a static React single-page application:

```text
Browser
├── React UI and game pages
├── TypeScript simulation engine
├── Local virtual wallet and session history
├── localStorage persistence
└── BroadcastChannel multi-tab synchronization
```

There is no required database, API key, payment integration, or backend
server. The main source directories are:

```text
components/   Shared layout, game information, feeds, and visualizations
pages/        Individual game pages and educational views
services/     Randomness, wallet state, audio, and game support logic
types.ts      Shared game and application types
```

## Getting started

### Requirements

- Node.js 18 or newer
- npm, or Bun

### Run locally

```bash
git clone https://github.com/Paidguy/casino.git
cd casino
npm install
npm run dev
```

Open the local URL printed by Vite.

### Verify and build

```bash
npm run typecheck
npm run build
npm run preview
```

The production output is static and can be hosted on GitHub Pages, Vercel,
Netlify, or another static host.

## Contributing

Contributions are welcome, especially improvements to:

- Game rules and probability explanations.
- RTP and expected-value calculations.
- Fairness verification and tests.
- Accessibility, responsive layout, and educational presentation.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull
request. New games must remain virtual-credit simulations and should expose
their rules and mathematical assumptions clearly.

## License and disclaimer

Casino is distributed under the [MIT License](./LICENSE).

This software is provided for educational and entertainment purposes only. It
does not provide financial services, real-money gambling, or a way to win or
recover money. Use it to study game mechanics and probability, not to make
financial decisions.
