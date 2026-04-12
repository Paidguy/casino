# Practical Examples and Use Cases

## Use Case 1: Demonstrate House Edge in a Classroom

Goal: show why repeated play trends negative even with short-term wins.

Steps:

1. Open the app and play the same game repeatedly (for example Dice or Roulette).
2. Keep bet size fixed.
3. After enough rounds, open Statistics page.
4. Compare total wagered vs total payout.

Expected learning outcome:

- Variance creates streaks.
- Long-run return aligns with game edge behavior.

## Use Case 2: Inspect Fairness-Oriented Session Data

Goal: explain what seed/nonce-style transparency looks like in a client simulation.

Steps:

1. Open Fairness page.
2. Set a custom client seed.
3. Place a few bets.
4. Observe nonce progression and recorded bet details.

Expected learning outcome:

- Outcome metadata is traceable per bet.
- Session state records enough context for post-hoc inspection.

## Use Case 3: Compare Volatility Across Games

Goal: compare high-variance and lower-variance experiences.

Suggested sequence:

1. Play Crash for 20 rounds at fixed stake.
2. Play Roulette for 20 rounds at same stake.
3. Play Slots for 20 rounds at same stake.
4. Review balance trajectory and game stats.

Expected learning outcome:

- Different payout profiles create different variance patterns.
- Similar edge does not imply similar user experience round-to-round.

## Use Case 4: Add a New Game Module

Goal: onboard contributors quickly with the existing architecture.

Implementation checklist:

1. Add game enum and edge constant in `types.ts`.
2. Implement reusable logic in `services/engine.ts` if needed.
3. Create new page in `pages/YourGame.tsx`.
4. Register route in `App.tsx`.
5. Add navigation entry in `components/Layout.tsx`.
6. Test gameplay, stats updates, and history records.

Validation checklist:

- Bet cannot exceed balance.
- Loss and win paths both recorded correctly.
- `totalWagered`, `totalPayout`, and per-game stats update as expected.
- UI remains responsive on mobile and desktop sizes.

## Use Case 5: Analyze Session Persistence

Goal: understand how client storage affects user state.

Steps:

1. Place bets and create transaction history.
2. Refresh the browser.
3. Confirm balance/history/state persists.
4. Trigger reset flow and verify clean session rebuild.

Expected learning outcome:

- App is stateful across reloads via local storage.
- Reset paths should be tested whenever storage schema changes.
