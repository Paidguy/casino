# Architecture Overview

## Purpose

This document explains how the simulation is structured so contributors can reason about game behavior, state changes, and extension points quickly.

## High-Level Design

The app is a client-side SPA with three practical layers:

- UI layer (`pages/`, `components/`): renders game screens, dashboards, and controls
- Simulation layer (`services/engine.ts`): resolves bets, updates balances, stores history, and exposes helper methods used by pages
- Persistence layer (`localStorage`): stores session state between reloads

## Runtime Flow

1. A page gathers user input (bet amount, mode, game options).
2. The page calls `engine.placeBet(...)` with a game type and resolver.
3. The engine validates amount and balance.
4. The resolver computes outcome data (multiplier and message) from random input.
5. The engine updates:
- balance
- aggregate stats
- per-game stats
- transactions/history
6. Updated session state is persisted and broadcast to subscribers.

## Core Modules

### `services/engine.ts`

Main responsibilities:

- Session lifecycle (`loadSession`, `initializeSession`, `saveSession`)
- Bet settlement (`placeBet`)
- Global statistics and history tracking
- Game helper methods (for example Crash point, Dice roll, Slots result, Plinko path)
- Admin toggles and overrides

### `types.ts`

Defines shared contracts:

- `GameType`
- `UserSession`
- `BetResult`
- `Transaction`
- `GameStats`
- `HOUSE_EDGES`

### `App.tsx`

Defines route map and wraps the app in an error boundary.

## Game Surface

Implemented game pages:

- `Crash`, `Dice`, `Roulette`, `Slots`, `Mines`, `Plinko`
- `Blackjack`, `Coinflip`, `TeenPatti`, `Matka`, `Wheel`, `Baccarat`, `Keno`

System/utility pages:

- `Lobby`, `Fairness`, `Statistics`, `Transactions`, `Admin`

## State and Persistence

- Session key: `satking_pro_v2`
- Sound preference key: `sound_enabled_v1`
- Intro modal key: `stake_welcome_v1`
- Session updates are debounced before writing to storage
- Engine subscribers are notified on each session save

## Error Handling

- Top-level render errors are caught by `ErrorBoundary` in `App.tsx`
- A hard reset path clears local/session storage and rebuilds default state
- Guard checks prevent invalid wager amounts and insufficient-funds bet placement

## Build and Delivery

- Vite builds the SPA
- Base path is configured for GitHub Pages (`/casino/`)
- GitHub Actions workflow builds and deploys `dist/` as Pages artifact

## Extension Points

To add a new game safely:

1. Add enum + edge constant in `types.ts`
2. Add calculation helper(s) in `services/engine.ts` when logic is shared
3. Add a page under `pages/`
4. Register route in `App.tsx`
5. Add entry points in UI navigation (`components/Layout.tsx`, optionally `pages/Lobby.tsx`)
6. Confirm stats and history behavior via `engine.placeBet`
