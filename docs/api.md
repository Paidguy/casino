# API Documentation

## Summary

This repository does not expose a backend HTTP API, GraphQL API, or RPC endpoint.

It is a frontend-only React/Vite application where simulation logic runs in-browser and user state is stored locally.

## Internal Programmatic Interface

The primary internal interface is the simulation engine in `services/engine.ts`, which is used directly by pages/components.

Representative methods:

- `getSession()`
- `subscribe(listener)`
- `placeBet(game, amount, multiplierOrResolver, outcomeStr?)`
- `setClientSeed(seed)`
- `resetBalance()`
- game helpers such as `getCrashPoint`, `calculateDiceResult`, `calculateRouletteResult`, `calculateSlotsResult`, `generateMinesGrid`, and `calculatePlinkoResult`

## Data Persistence Interface

The app uses browser storage keys, including:

- `satking_pro_v2` for session data
- `sound_enabled_v1` for audio preference
- `stake_welcome_v1` for welcome overlay visibility

## External Integrations

Current implementation has no integration with:

- payment providers
- wallet providers
- authentication services
- external game-result services

## Scope Clarification

The app includes a fairness/transparency view and seed/nonce display in UI, but this is not a hosted verification API. Outcome generation and session updates are handled on the client in the current codebase.
# API Documentation

## Summary

This project does not expose a backend HTTP API, GraphQL API, or RPC interface.

It is a frontend-only React/Vite application where game logic runs in the browser and state is persisted in `localStorage`.

## Internal Programmatic Surface

The closest thing to an API is the in-app simulation engine (`services/engine.ts`), consumed directly by React pages/components.

Key engine methods include:

- `getSession()`
- `subscribe(listener)`
- `placeBet(game, amount, multiplierOrResolver, outcomeStr?)`
- `setClientSeed(seed)`
- `resetBalance()`
- game-specific helpers such as `getCrashPoint`, `calculateDiceResult`, `calculateRouletteResult`, `calculateSlotsResult`, `generateMinesGrid`, and `calculatePlinkoResult`

## External Integrations

- No payment provider integration
- No wallet integration
- No external game-result API dependency
- No authentication API

## If You Need a Backend API Later

Recommended next steps:

1. Define a versioned REST contract (for example `/api/v1`).
2. Move RNG and bet settlement server-side.
3. Store provably-fair seeds and nonce history in persistent storage.
4. Keep the current TypeScript models (`types.ts`) as shared contracts where possible.
