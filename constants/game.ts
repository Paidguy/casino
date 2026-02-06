/**
 * Game-related constants
 */

// Daily allowance for new players
export const DAILY_ALLOWANCE = 100000;

// Storage key for persisting session data
export const STORAGE_KEY = 'satking_pro_v2';

// Maximum history items to keep
export const MAX_HISTORY_SIZE = 50;

// Maximum transaction items to keep
export const MAX_TRANSACTIONS_SIZE = 100;

// Deposit amounts for quick selection
export const DEPOSIT_AMOUNTS = [10000, 50000, 100000, 500000];

// Bot leaderboard entries
export const BOT_LEADERBOARD = [
  { username: 'Rahul_Satta_King', wagered: 850000, maxMultiplier: 45.0 },
  { username: 'Mumbai_Khaiwal', wagered: 2200000, maxMultiplier: 120.0 },
  { username: 'Delhi_Tiger_786', wagered: 1400000, maxMultiplier: 9.0 },
  { username: 'Gully_Sniper_Boss', wagered: 95000, maxMultiplier: 22.0 },
  { username: 'Kalyan_Expert_Punter', wagered: 3500000, maxMultiplier: 100.0 },
];

// Auto-save debounce time (milliseconds)
export const SAVE_DEBOUNCE_MS = 2000;

// Rakeback percentage
export const RAKEBACK_RATE = 0.005;
