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
