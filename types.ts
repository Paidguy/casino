export enum GameType {
  CRASH = 'CRASH',
  PLINKO = 'PLINKO',
  MINES = 'MINES',
  DICE = 'DICE',
  BLACKJACK = 'BLACKJACK',
  ROULETTE = 'ROULETTE',
  KENO = 'KENO',
  WHEEL = 'WHEEL',
  SLOTS = 'SLOTS',
  COINFLIP = 'COINFLIP',
  BACCARAT = 'BACCARAT',
  TEENPATTI = 'TEENPATTI',
  ANDARBAHAR = 'ANDARBAHAR',
  MATKA = 'MATKA',
}

export interface BetResult {
  id: string;
  gameType: GameType;
  betAmount: number;
  payoutMultiplier: number;
  payoutAmount: number;
  timestamp: number;
  outcome: string;
  balanceAfter: number;
  nonce: number;
  clientSeed: string;
  serverSeedHash: string;
  serverSeedRevealed?: string;
  resultInput: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'VAULT_DEPOSIT' | 'VAULT_WITHDRAW' | 'BAILOUT' | 'RAKEBACK' | 'BONUS';
  amount: number;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING';
  method: string;
  utr?: string;
}

export interface AdminSettings {
  isRigged: boolean;
  forcedRTP: number;
  houseEdgeOverrides: Record<GameType, number>;
  globalProfit: number;
  instantBet: boolean;
}

export interface LeaderboardEntry {
  username: string;
  wagered: number;
  profit: number;
  maxMultiplier: number;
  vipTier: string;
  city?: string;
  isPlayer?: boolean;
}

export interface GameStats {
  bets: number;
  wagered: number;
  wins: number;
  payout: number;
}

export interface SeedHistoryItem {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  totalBets: number;
  rotatedAt: number;
}

export interface BazarMarketResult {
  id: string;
  name: string;
  openTime: string;
  closeTime: string;
  openPanna: string;
  jodi: string;
  closePanna: string;
  status: 'LIVE' | 'DECLARED';
}

export interface UserSession {
  id: string;
  username: string;
  balance: number;
  vaultBalance: number;
  rakebackBalance: number;
  isAdmin: boolean;
  startBalance: number;
  startTime: number;
  totalBets: number;
  totalWagered: number;
  totalWins: number;
  totalLosses: number;
  totalPayout: number;
  maxMultiplier: number;
  history: BetResult[];
  transactions: Transaction[];
  gameStats: Record<string, GameStats>;
  clientSeed: string;
  serverSeed: string;
  serverSeedHash: string;
  seedHistory: SeedHistoryItem[];
  nonce: number;
  settings: AdminSettings;
}

export const HOUSE_EDGES: Record<GameType, number> = {
  [GameType.CRASH]: 0.01,
  [GameType.DICE]: 0.01,
  [GameType.PLINKO]: 0.01,
  [GameType.MINES]: 0.01,
  [GameType.BLACKJACK]: 0.005,
  [GameType.BACCARAT]: 0.0106,
  [GameType.COINFLIP]: 0.02,
  [GameType.WHEEL]: 0.01,
  [GameType.KENO]: 0.01,
  [GameType.ROULETTE]: 0.027,
  [GameType.TEENPATTI]: 0.025,
  [GameType.ANDARBAHAR]: 0.02,
  [GameType.SLOTS]: 0.03,
  [GameType.MATKA]: 0.05,
};
