
import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry } from '../types';

const DAILY_ALLOWANCE = 10000;
const STORAGE_KEY = 'stake_ind_v9_pro';

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

  public setClientSeed(seed: string) {
    this.session.clientSeed = seed;
    this.session.nonce = 0; // Standard practice to reset nonce when seed changes
    this.saveSession(this.session);
  }

  public peekNextRandom(): number {
    const rng = new LCG(this.session.serverSeed + this.session.clientSeed + this.session.nonce);
    let r = rng.next();
    // Simulate biased results for Rigged mode
    if (this.session.settings.isRigged && Math.random() > this.session.settings.forcedRTP) {
       r = r * 0.1; // Skews results toward lower outcomes
    }
    return r;
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
    this.session.balance += amount;
    this.session.rakebackBalance = 0;
    this.saveSession(this.session);
    return amount;
  }

  public placeBet(game: GameType, amount: number, resultCallback: (rawRandom: number) => { multiplier: number; outcome: string }): BetResult {
    if (amount > this.session.balance) throw new Error("Insufficient funds");
    
    const r = this.peekNextRandom();
    const { multiplier, outcome } = resultCallback(r);
    const payout = amount * multiplier;
    
    this.session.balance = this.session.balance - amount + payout;
    this.session.totalBets += 1;
    this.session.totalWagered += amount;
    this.session.nonce += 1;
    this.session.settings.globalProfit += (amount - payout);
    
    if (multiplier > this.session.maxMultiplier) this.session.maxMultiplier = multiplier;

    const edge = HOUSE_EDGES[game] || 0.01;
    this.session.rakebackBalance += (amount * edge * 0.1);

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
      serverSeedHash: 'sha256_' + this.session.serverSeed.substring(0, 8),
      resultInput: r
    };

    this.session.history = [record, ...this.session.history].slice(0, 50);
    this.saveSession(this.session);
    return record;
  }

  public calculateTeenPatti(r: number) {
    // Real Teen Patti Ranking Probabilities:
    // Trail: ~0.24%, Pure Seq: ~0.22%, Seq: ~3.26%, Color: ~4.96%, Pair: ~16.9%, High Card: ~74.4%
    const won = r > 0.525; // Adjusted for house edge (Approx 47.5% win rate)
    const hands = ['High Card', 'Pair', 'Color', 'Sequence', 'Pure Sequence', 'Trail'];
    
    // Weighted selection for visual flavor
    let handIdx = 0;
    if (r > 0.997) handIdx = 5;      // Trail
    else if (r > 0.994) handIdx = 4; // Pure Seq
    else if (r > 0.96) handIdx = 3;  // Seq
    else if (r > 0.91) handIdx = 2;  // Color
    else if (r > 0.74) handIdx = 1;  // Pair
    else handIdx = 0;               // High Card
    
    return { won, hand: hands[handIdx], mult: won ? 1.95 : 0 };
  }

  public getSattaMatkaResult(r: number) {
    // Traditional Satta Matka logic: Kalyan Open/Close style
    // Drawing 3 cards (Pana) and sum (Single)
    const rng = new LCG(r.toString());
    const cards = [
      Math.floor(rng.next() * 10),
      Math.floor(rng.next() * 10),
      Math.floor(rng.next() * 10)
    ].sort((a, b) => a - b);
    const sum = cards.reduce((a, b) => a + b, 0) % 10;
    return { cards: cards.join(''), single: sum };
  }

  public getCrashPoint(r: number): number {
    const edge = 0.01;
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
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const rng = new LCG(r.toString());
    const res = [
      symbols[Math.floor(rng.next() * symbols.length)],
      symbols[Math.floor(rng.next() * symbols.length)],
      symbols[Math.floor(rng.next() * symbols.length)]
    ];
    let mult = 0;
    if (res[0] === res[1] && res[1] === res[2]) {
      mult = res[0] === '7️⃣' ? 50 : res[0] === '💎' ? 25 : 10;
    } else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) {
      mult = 2;
    }
    return { symbols: res, multiplier: mult };
  }

  public calculatePlinkoResult(r: number, rows: number) {
    const rng = new LCG(r.toString());
    const path: number[] = [];
    for (let i = 0; i < rows; i++) path.push(rng.next() > 0.5 ? 1 : 0);
    const bin = path.reduce((a, b) => a + b, 0);
    const mults = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    return { path, multiplier: mults[bin] };
  }

  public generateMinesGrid(r: number, minesCount: number): boolean[] {
    const grid = Array(25).fill(false);
    let placed = 0;
    const rng = new LCG(r.toString());
    while (placed < minesCount) {
      const idx = Math.floor(rng.next() * 25);
      if (!grid[idx]) { grid[idx] = true; placed++; }
    }
    return grid;
  }

  public updateBalance(a: number) { this.session.balance += a; this.saveSession(this.session); }
  public resetBalance() { this.session.balance = DAILY_ALLOWANCE; this.saveSession(this.session); }
  public toggleAdmin() { this.session.isAdmin = !this.session.isAdmin; this.saveSession(this.session); }
  public updateAdminSettings(s: Partial<AdminSettings>) { this.session.settings = { ...this.session.settings, ...s }; this.saveSession(this.session); }
}

export const engine = new SimulationEngine();
