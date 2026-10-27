# Security & Educational Integrity Policy

## 🛡️ Scope of This Project

**Maharaja Exchange & Royal Casino** is an open-source, **100% client-side educational simulation**.

- **No Real Money**: The application never processes, accepts, or transmits real currency.
- **No Backend Servers or Databases**: All session state, virtual `₹` INR balances, and cryptographic seeds reside exclusively in the user's own browser (`localStorage`).
- **No Tracking or Telemetry**: The platform makes zero external API calls to analytics or tracking servers.

---

## 🔐 Reporting a Bug or Cryptographic Issue

If you discover:
1. A flaw in the **FIPS 180-4 SHA-256** or **RFC 2104 HMAC-SHA256** implementation in `services/engine.ts`,
2. A mathematical discrepancy in any game's Return-to-Player (RTP) or payout multiplier calculation, or
3. A client-side XSS or dependency vulnerability,

please open a GitHub Issue with reproduction steps or a Pull Request fixing the calculation.
