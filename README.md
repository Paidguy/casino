# Casino Simulation Platform (Educational)

A browser-based casino simulation built with React and TypeScript that demonstrates how RNG-driven games, payout formulas, and house edge mechanics work in practice.

This project exists to make casino math inspectable. Instead of hiding probabilities behind a closed backend, it exposes game logic, session state, and bet outcomes directly in the code so developers, students, and researchers can study expected value, variance, and fairness workflows in a safe virtual-money environment.

## Who This Is For

- Developers building game simulations or RNG-heavy web apps
- Students learning probability, expected value, and house edge behavior
- Educators and researchers who need a practical demo of casino math
- Contributors who want to improve transparency tooling and analytics UX

## Key Features

- 13 playable game modules (Crash, Dice, Roulette, Slots, Mines, Plinko, Blackjack, Coinflip, Teen Patti, Matka, Wheel, Baccarat, Keno)
- Central simulation engine for balance updates, bet resolution, and per-game stats
- Transparent house-edge constants in a typed configuration (`HOUSE_EDGES`)
- Session persistence via `localStorage` with wager history and transaction logs
- Fairness page with client seed controls and nonce visibility
- Statistics dashboard with RTP-style metrics, profit/loss summaries, and charts
- GitHub Pages-ready Vite setup and CI workflow

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Recharts
- Tailwind (CDN config in `index.html`) plus project CSS utilities

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

### 3. Explore engine-level behavior

- Core engine: `services/engine.ts`
- Game types and house edges: `types.ts`
- Route wiring for all games: `App.tsx`

## Project Structure

```text
services/      Core simulation engine and audio manager
pages/         Game and system screens
components/    Shared UI elements and dashboards
App.tsx        Route map for all pages
types.ts       Shared types and house-edge constants
```

## Documentation

Detailed documentation lives in `docs/`:

- `docs/architecture.md` - system design and data flow
- `docs/api.md` - API surface and integration notes
- `docs/configuration.md` - environment and project configuration
- `docs/examples.md` - practical use cases and extension patterns

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

## License

This project is licensed under the GNU General Public License v3.0.

See `LICENSE.md` for full terms.
