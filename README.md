<div align="center">

# Casino Simulation Platform

### Transparent browser-based casino simulation for learning probability, house edge, and game engine behavior.

[![CI/CD Pipeline](https://github.com/Paidguy/casino/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/Paidguy/casino/actions/workflows/main.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.md)
[![Stars](https://img.shields.io/github/stars/Paidguy/casino?style=social)](https://github.com/Paidguy/casino/stargazers)
[![Forks](https://img.shields.io/github/forks/Paidguy/casino?style=social)](https://github.com/Paidguy/casino/network/members)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## What This Project Is

- **Frontend-only** React + TypeScript casino simulation
- **Educational and development-focused**, not a real-money platform
- **Code-visible game logic** for inspecting outcomes, multipliers, and state updates

---

## Why It Exists

- **Make casino mechanics transparent** instead of hidden behind closed systems
- **Help developers and students** study RNG behavior, house edge, and variance
- **Provide a safe sandbox** for experimentation using virtual balance and local state

---

## Key Features

- 🎮 **13 playable games**: Crash, Dice, Roulette, Slots, Mines, Plinko, Blackjack, Coinflip, Teen Patti, Matka, Wheel, Baccarat, Keno
- ⚙️ **Unified simulation engine** for bet settlement, balance updates, and history
- 📊 **Statistics and transaction views** for analyzing outcomes and session behavior
- 🔎 **Transparency tools** including seed and nonce visibility on the Fairness page
- 💾 **Local persistence** for session, transactions, and game stats
- 🚀 **GitHub Pages CI/CD** via GitHub Actions workflow

---

## Demo / Preview

- Live deployment: https://paidguy.github.io/casino/
- Recommended preview path after launch: `Lobby -> Dice/Crash -> Statistics -> Fairness`
- This repository currently does not include checked-in screenshots or GIF assets.

---

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Recharts
- Tailwind CSS utilities (configured in `index.html`) plus project CSS

---

## Installation & Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build production bundle

```bash
npm run build
```

### 4. Preview production build locally

```bash
npm run preview
```

---

## Usage

### 1. Run locally

```bash
npm install
npm run dev
```

### 2. Play and inspect

1. Start the app with `npm run dev`.
2. Open Lobby and launch a game (for example, Dice).
3. Place several bets.
4. Open Statistics to review wagered amount, payouts, and per-game metrics.

### 3. Validate fairness/transparency flow

1. Open Fairness.
2. Update the client seed.
3. Play rounds in any game.
4. Confirm nonce progression and recorded outcomes.

Note: this repository is client-side. Fairness/transparency UI is for visibility and state tracing, while outcome generation runs in the browser engine.

---

## Project Structure

```text
services/      Simulation engine and audio manager
pages/         Game pages and system pages
components/    Shared UI components
App.tsx        Route definitions
types.ts       Shared models and house edges
docs/          Architecture, API, config, and usage docs
```

---

## Documentation

- `docs/architecture.md` - architecture and runtime flow
- `docs/api.md` - API and interface scope
- `docs/configuration.md` - build/runtime configuration
- `docs/examples.md` - practical use cases

---

## Contributing

Contributions are welcome and encouraged.

### Recommended workflow

1. Fork and create a branch.
2. Keep changes focused and reviewable.
3. Validate with:

```bash
npm run build
```

4. Open a pull request with:
- what changed
- why it changed
- how it was validated
- screenshots for UI changes

### Contribution standards

- Keep game logic transparent and auditable
- Update docs when behavior changes
- Prefer small, single-purpose pull requests
- Do not add real-money or payment functionality

---

## Credits & Attribution

- Original project direction and in-app attribution: **@paidguy**
- Branding references in source include **SattaKing.IND** and related labels
- Contributors: https://github.com/Paidguy/casino/graphs/contributors

---

## Acknowledgements

- React, Vite, TypeScript, React Router, Recharts communities
- Open-source maintainers whose tooling powers this project

---

## License

Licensed under GNU General Public License v3.0.

See `LICENSE.md` for full text.
