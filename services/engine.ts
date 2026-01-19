
import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry } from '../types';

const DAILY_ALLOWANCE = 10000;
const STORAGE_KEY = 'stake_ind_v7_final';

const BOTS: LeaderboardEntry[] = [
  { username: 'Lakhpati_Raj', wagered: 1540000, maxMultiplier: 1250.0 },
  { username: 'Matka_King_007', wagered: 920000, maxMultiplier: 450.5 },
  { username: 'MumbaiHighRoller', wagered: 2450000, maxMultiplier: 84.0 },
  { username: 'Satoshi_Bhai', wagered: 640000, maxMultiplier: 5000.0 },
  { username: 'PaisaDouble', wagered: 120000, maxMultiplier: 12.5 },
  { username: 'DelhiWhale', wagered: 3200000, maxMultiplier: 2.1 },
  { username: 'JackpotJi', wagered: 95000, maxMultiplier: 99.0 },
  { username: 'DesiGambler', wagered: 450000, maxMultiplier: 54.4 },
  { username: 'NoLossZone', wagered: 5000, maxMultiplier: 1.5 },
  { username: 'PunterPro', wagered: 12000, maxMultiplier: 1000.0 },
];

class LCG {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0; 
    }
    this.seed = Math.abs(hash) || 1;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

export class SimulationEngine {
  private session: UserSession;

  constructor() {
    this.session = this.loadSession();
  }

  private loadSession(): UserSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return this.initializeSession();
  }

  private initializeSession(): UserSession {
    const session: UserSession = {
      id: Math.random().toString(36).substring(7),
      username: 'Punter_' + Math.floor(Math.random() * 10000),
      balance: DAILY_ALLOWANCE,
      rakebackBalance: 0,
      isAdmin: false,
      startBalance: DAILY_ALLOWANCE,
      startTime: Date.now(),
      totalBets: 0,
      totalWagered: 0,
      totalWins: 0,
      totalLosses: 0,
      maxMultiplier: 0,
      history: [],
      transactions: [],
      clientSeed: Math.random().toString(36).substring(2),
      serverSeed: Math.random().toString(36).substring(2),
      nonce: 0,
      settings: {
        isRigged: false,
        forcedRTP: 0.95,
        houseEdgeOverrides: { ...HOUSE_EDGES },
        globalProfit: 0
      }
    };
    this.saveSession(session);
    return session;
  }

  private saveSession(session: UserSession) {
    this.session = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  // Fix: Added peekNextRandom to provide deterministic random values without advancing the nonce
  public peekNextRandom(): number {
    const rng = new LCG(this.session.serverSeed + this.session.clientSeed + this.session.nonce);
    let rawRandom = rng.next();

    // Rigging for educational display
    if (this.session.settings.isRigged && Math.random() > this.session.settings.forcedRTP) {
      rawRandom = 0.0001; 
    }
    return rawRandom;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    const playerEntry: LeaderboardEntry = {
      username: this.session.username,
      wagered: this.session.totalWagered,
      maxMultiplier: this.session.maxMultiplier,
      isPlayer: true
    };
    return [...BOTS, playerEntry];
  }

  public deposit(amount: number, method: string): Transaction {
    const tx: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: 'DEPOSIT',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method
    };
    this.session.balance += amount;
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 50);
    this.saveSession(this.session);
    return tx;
  }

  public withdraw(amount: number, method: string): Transaction {
    if (amount > this.session.balance) throw new Error("Insufficient funds");
    const tx: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: 'WITHDRAW',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method
    };
    this.session.balance -= amount;
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 50);
    this.saveSession(this.session);
    return tx;
  }

  public claimRakeback(): number {
    const amount = this.session.rakebackBalance;
    if (amount <= 0) return 0;
    const tx: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: 'RAKEBACK',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method: 'VIP Bonus'
    };
    this.session.balance += amount;
    this.session.rakebackBalance = 0;
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 50);
    this.saveSession(this.session);
    return amount;
  }

  public requestBailout(): string {
    if (this.session.balance > 10) return "Account still has funds. Wager them first.";
    const amount = DAILY_ALLOWANCE;
    this.session.balance = amount;
    const tx: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: 'BAILOUT',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method: 'System Pity'
    };
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 50);
    this.saveSession(this.session);
    return "The Bookie covers you this time. Last warning.";
  }

  public placeBet(game: GameType, amount: number, resultCallback: (rawRandom: number) => { multiplier: number; outcome: string }): BetResult {
    if (amount > this.session.balance) throw new Error("Insufficient funds");
    
    const rng = new LCG(this.session.serverSeed + this.session.clientSeed + this.session.nonce);
    let rawRandom = rng.next();

    // Rigging for educational display
    if (this.session.settings.isRigged && Math.random() > this.session.settings.forcedRTP) {
      rawRandom = 0.0001; 
    }

    const { multiplier, outcome } = resultCallback(rawRandom);
    const payout = amount * multiplier;
    
    this.session.balance = this.session.balance - amount + payout;
    this.session.totalBets += 1;
    this.session.totalWagered += amount;
    this.session.nonce += 1;
    this.session.settings.globalProfit += (amount - payout);
    
    if (multiplier > this.session.maxMultiplier) {
      this.session.maxMultiplier = multiplier;
    }

    const edge = HOUSE_EDGES[game];
    this.session.rakebackBalance += (amount * edge * 0.1);

    if (payout > amount) this.session.totalWins += 1;
    else if (amount > 0) this.session.totalLosses += 1;

    const record: BetResult = {
      id: Math.random().toString(36).substring(7),
      gameType: game,
      betAmount: amount,
      payoutMultiplier: multiplier,
      payoutAmount: payout,
      timestamp: Date.now(),
      outcome,
      balanceAfter: this.session.balance,
      nonce: this.session.nonce - 1,
      clientSeed: this.session.clientSeed,
      serverSeedHash: 'sha256_' + this.session.serverSeed.substring(0, 10),
      resultInput: rawRandom
    };

    this.session.history = [record, ...this.session.history].slice(0, 50);
    this.saveSession(this.session);
    return record;
  }

  public getCrashPoint(r: number): number {
    const edge = HOUSE_EDGES[GameType.CRASH];
    if (r < edge) return 1.00;
    return Math.max(1.00, Math.floor(((1 - edge) / (1 - r)) * 100) / 100);
  }

  public calculateDiceResult(r: number, target: number, condition: 'over' | 'under') {
    const roll = r * 100;
    const won = condition === 'over' ? roll > target : roll < target;
    return { roll, won };
  }

  public calculateRouletteResult(r: number): number {
    return Math.floor(r * 37);
  }

  public calculateSlotsResult(r: number): { symbols: string[], multiplier: number } {
    const symbolsSet = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const rng = new LCG(r.toString());
    const result = [
      symbolsSet[Math.floor(rng.next() * symbolsSet.length)],
      symbolsSet[Math.floor(rng.next() * symbolsSet.length)],
      symbolsSet[Math.floor(rng.next() * symbolsSet.length)]
    ];
    let multiplier = 0;
    if (result[0] === result[1] && result[1] === result[2]) {
      if (result[0] === '7️⃣') multiplier = 50;
      else if (result[0] === '💎') multiplier = 25;
      else multiplier = 10;
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      multiplier = 2;
    }
    return { symbols: result, multiplier };
  }

  public calculatePlinkoResult(r: number, rows: number) {
    const path: number[] = [];
    const rng = new LCG(r.toString());
    for (let i = 0; i < rows; i++) {
      path.push(rng.next() > 0.5 ? 1 : 0);
    }
    const finalBin = path.reduce((a, b) => a + b, 0);
    const multipliers = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    return { path, multiplier: multipliers[finalBin], bin: finalBin };
  }

  public generateMinesGrid(r: number, minesCount: number): boolean[] {
    const grid = Array(25).fill(false);
    let minesPlaced = 0;
    const rng = new LCG(r.toString());
    while (minesPlaced < minesCount) {
      const idx = Math.floor(rng.next() * 25);
      if (!grid[idx]) { grid[idx] = true; minesPlaced++; }
    }
    return grid;
  }

  public toggleAdmin() { this.session.isAdmin = !this.session.isAdmin; this.saveSession(this.session); }
  public updateAdminSettings(s: Partial<AdminSettings>) { this.session.settings = { ...this.session.settings, ...s }; this.saveSession(this.session); }
  public resetBalance() { this.session.balance = DAILY_ALLOWANCE; this.saveSession(this.session); }
  public updateBalance(a: number) { this.session.balance += a; this.saveSession(this.session); }
}

export const engine = new SimulationEngine();
