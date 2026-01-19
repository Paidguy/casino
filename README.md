# LossLimit Casino Simulator 🎰

**Live Demo:** [paidguy.me/casino](https://paidguy.me/casino)

## ⚠️ DISCLAIMER
**THIS IS A SIMULATION.**
- **NO REAL MONEY** is involved.
- **NO CRYPTO** transactions occur.
- **NO PAYMENTS** are processed.

This project is a behavioral economics experiment and educational tool designed to demonstrate the mathematics of gambling losses and the psychological dark patterns used by online casinos.

---

## 🎯 Purpose
The goal of LossLimit is to provide a visually identical experience to modern high-stakes crypto casinos (like Stake or Roobet) but with transparent mathematics that prove **the house always wins**.

By simulating the dopamine loops, "near-miss" mechanics, and aggressive marketing of real casinos—without the financial risk—users can experience the volatility and inevitable decline of their balance in a safe environment.

## 🎲 Features

### Core Mechanics
- **Virtual Credits:** Daily reset to $10,000 fake balance.
- **Provably Fair Logic:** Implementation of standard HMAC-SHA256 outcome generation (simulated).
- **Real Math:** Exact industry-standard House Edges (e.g., Crash 1% instant bust, Roulette 2.7% edge).

### Games Included
1.  **Plinko:** 1000x High Risk mode (16 rows).
2.  **Crash:** Exponential curve with 1% instant crash chance.
3.  **Blackjack:** 3:2 payouts, Double Down, Dealer stands on 17.
4.  **Mines:** Compounding multipliers.
5.  **Slots:** High variance volatility with near-miss visuals.
6.  **Roulette:** European standard.
7.  **Dice:** Adjustable win chance.
8.  **Coinflip:** 1.96x payouts.

### Psychological & Dark Patterns
- **Audio Synthesis:** Custom Web Audio API sound effects engineered to trigger dopamine (rising pitch on wins, silence on losses).
- **Fake Activity Feed:** Simulates high-rollers and community chat.
- **Aggressive Marketing:** Fake "System Glitch" bonuses, sticky "Rakeback" banners, and VIP progress bars.
- **Transparency Mode:** A hidden panel explaining the exact math behind why the player is losing.

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Dark Mode optimization)
- **Charts:** Recharts (Real-time balance graphing)
- **Audio:** Native Web Audio API (No external assets)
- **State:** LocalStorage persistence for sessions

## 🚀 Deployment (GitHub Actions)

This project includes a fully automated workflow for GitHub Pages.

1.  Push this code to a GitHub repository named `casino`.
2.  Go to **Settings > Pages** in your repository.
3.  Under **Build and deployment**, switch Source to **GitHub Actions**.
4.  The action defined in `.github/workflows/deploy.yml` will automatically build and deploy the site.

**Custom Domain Note:** 
To serve this at `paidguy.me/casino`, ensure your main user repository (`paidguy/paidguy.github.io`) has the CNAME `paidguy.me` configured, and this repository is named `casino`.

## ⚖️ License
MIT License. Educational use encouraged.
