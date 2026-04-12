# Casino Simulation Platform (Educational)

[![CI/CD Pipeline](https://github.com/Paidguy/casino/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/Paidguy/casino/actions/workflows/main.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.md)
[![Stars](https://img.shields.io/github/stars/Paidguy/casino?style=social)](https://github.com/Paidguy/casino/stargazers)

A browser-based casino simulation built with React and TypeScript that demonstrates RNG-driven outcomes, payout calculations, and house-edge behavior in practice.

The project exists to make casino game mathematics inspectable from source code. Instead of opaque game logic, it exposes engine behavior, state transitions, and session data so developers, students, and researchers can study expected value and variance in a virtual-money environment.

---

## Who This Is For

- Developers building game simulations or RNG-heavy web apps
- Students learning probability, expected value, and house edge behavior
- Educators and researchers who need a practical demo of casino math
- Contributors who want to improve transparency tooling and analytics UX

---

## Key Features

- 13 playable game modules (Crash, Dice, Roulette, Slots, Mines, Plinko, Blackjack, Coinflip, Teen Patti, Matka, Wheel, Baccarat, Keno)
- Central simulation engine for balance updates, bet resolution, and per-game stats
- Transparent house-edge constants in a typed configuration (`HOUSE_EDGES`)
- Session persistence via `localStorage` with wager history and transaction logs
- Fairness page with client seed controls and nonce visibility
- Statistics dashboard with RTP-style metrics, profit/loss summaries, and charts
- GitHub Pages-ready Vite setup and CI workflow

---

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Recharts
- Tailwind (CDN config in `index.html`) plus project CSS utilities

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install and Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

### Build and Preview

```bash
npm run build
npm run preview
```

---

## Usage Examples

### 1. Run a game flow locally

1. Start the app with `npm run dev`
2. Open the lobby and select a game (for example, Dice)
3. Place a few bets and inspect:
- live balance changes
- bet history entries
- per-game stats in Statistics

### 2. Verify fairness-related state

1. Open the Fairness page
2. Change the client seed
3. Place bets in any game
4. Confirm nonce increments and history entries update consistently

Note: the fairness view is a transparency feature in the current client-side simulation. Outcome generation is implemented with JavaScript randomness in the engine, not a server-verified cryptographic API.

### 3. Explore engine-level behavior

- Core engine: `services/engine.ts`
- Game types and house edges: `types.ts`
- Route wiring for all games: `App.tsx`

---

## Project Structure

```text
services/      Core simulation engine and audio manager
pages/         Game and system screens
components/    Shared UI elements and dashboards
App.tsx        Route map for all pages
types.ts       Shared types and house-edge constants
```

---

## Documentation

Detailed documentation lives in `docs/`:

- `docs/architecture.md` - system design and data flow
- `docs/api.md` - API surface and integration notes
- `docs/configuration.md` - environment and project configuration
- `docs/examples.md` - practical use cases and extension patterns

---

## Contributing

Contributions are welcome, especially around clarity, correctness, and developer onboarding.

### Workflow

1. Fork the repository
2. Create a feature branch
3. Make focused changes with clear commit messages
4. Run local checks:

```bash
npm run build
```

5. Open a pull request with:
- problem statement
- implementation summary
- screenshots (if UI changed)
- validation steps

### Contribution Guidelines

- Keep game logic deterministic and auditable
- Prefer small PRs with a single purpose
- Update docs when behavior or configuration changes
- Do not introduce real-money/payment functionality

---

## Credits & Attribution

- Original project direction, branding, and in-app attribution: **@paidguy**
- Project branding references in codebase include `SattaKing.IND` and related UI labels
- Community contributors: https://github.com/Paidguy/casino/graphs/contributors

---

## Acknowledgements

- React, Vite, TypeScript, React Router, and Recharts maintainers
- Open-source ecosystem used by this project

## License

This project is licensed under the GNU General Public License v3.0.

See `LICENSE.md` for full terms.
