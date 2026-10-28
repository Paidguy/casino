# Contributing to Casino

Thank you for your interest in contributing to **Casino**! The project is a **100% client-side, risk-free educational casino and probability simulator** where people can explore casino and Indian games—or study the underlying cryptography and mathematics—without ever risking real money.

---

## 🌟 Core Principles for Contributors

1. **Zero Real Money (Strictly Virtual Credits Only)**
   - Never introduce real payment gateways, cryptocurrency wallets, or real-money wagering APIs.
   - All balances (`₹` INR), deposits, withdrawals, and UTR receipts must remain 100% local simulations stored in `localStorage`.

2. **100% Client-Side & Self-Contained**
   - The entire application must build and run as a static Single-Page Application (`npm run build`) so anyone can host it on GitHub Pages, Vercel, or run it offline without a backend server.

3. **Authentic Cryptographic Math (No Fake RNG)**
   - Every game outcome must derive from `gameEngine.getNextFloats(count)` or `gameEngine.placeBet(...)` in `services/engine.ts`, which uses **RFC 2104 HMAC-SHA256** (`HMAC_SHA256(serverSeed, clientSeed:nonce:cursor)`).
   - Multi-step games (where a player makes decisions after placing a bet, such as Crash, Mines, Blackjack, or Streak Coinflip) must lock the stake upfront with `gameEngine.deductStake(amount)` and settle at the end of the round with `gameEngine.settleDeductedBet(...)`.

4. **Educational Transparency**
   - When adding or updating a game, register its RTP, House Edge, Max Win, and mathematical formula inside `components/GameStudioBar.tsx` and `types.ts` so players can inspect the exact math while playing.

---

## 🛠️ Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Run TypeScript verification & production build before opening a PR
npm run build
```

---

## 📋 Pull Request Checklist

- [ ] Code compiles cleanly with `npm run build` (`tsc && vite build`) with zero TypeScript errors.
- [ ] Game outcomes use the deterministic `HMAC-SHA256` float generator in `services/engine.ts`.
- [ ] UI is responsive across both mobile (`360px+`) and desktop (`1440px+`) viewports.
- [ ] All wording uses clear, universally understood standard English.
