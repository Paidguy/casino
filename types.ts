
export enum GameType {
  CRASH = 'CRASH',
  DICE = 'DICE',
  ROULETTE = 'ROULETTE',
  SLOTS = 'SLOTS',
  MINES = 'MINES',
  PLINKO = 'PLINKO',
  BLACKJACK = 'BLACKJACK',
  COINFLIP = 'COINFLIP',
  TEENPATTI = 'TEENPATTI',
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
  resultInput: number; 
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BAILOUT' | 'RAKEBACK';
  amount: number;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING';
  method: string;
}

export interface AdminSettings {
  isRigged: boolean;
  forcedRTP: number; 
  houseEdgeOverrides: Record<GameType, number>;
  globalProfit: number;
}

export interface UserSession {
  id: string;
  username: string;
  balance: number;
  rakebackBalance: number;
  isAdmin: boolean;
  startBalance: number;
  startTime: number;
  totalBets: number;
  totalWagered: number;
  totalWins: number;
  totalLosses: number; 
  history: BetResult[];
  transactions: Transaction[];
  clientSeed: string;
  serverSeed: string;
  nonce: number;
  settings: AdminSettings;
}

export const HOUSE_EDGES: Record<GameType, number> = {
  [GameType.CRASH]: 0.01,
  [GameType.DICE]: 0.01,
  [GameType.ROULETTE]: 0.027,
  [GameType.SLOTS]: 0.04,
  [GameType.MINES]: 0.03,
  [GameType.PLINKO]: 0.01,
  [GameType.BLACKJACK]: 0.005,
  [GameType.COINFLIP]: 0.019,
  [GameType.TEENPATTI]: 0.025,
};
