
import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry } from '../types';

const DAILY_ALLOWANCE = 10000;
const STORAGE_KEY = 'satking_v1';

const BOTS: LeaderboardEntry[] = [
  { username: 'Rahul_Betting', wagered: 450000, maxMultiplier: 25.0 },
  { username: 'Mumbai_Don', wagered: 1200000, maxMultiplier: 88.0 },
  { username: 'Lakhpati_Anil', wagered: 890000, maxMultiplier: 5.5 },
  { username: 'UP_Satta_King', wagered: 2400000, maxMultiplier: 450.0 },
  { username: 'Gully_Boy_B', wagered: 45000, maxMultiplier: 12.0 },
  { username: 'Pintu_FixedDraw', wagered: 670000, maxMultiplier: 9.0 },
];

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
      username: 'User_' + Math.floor(1000 + Math.random() * 9000),
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
      clientSeed: Math.random().toString(36),
      serverSeed: Math.random().toString(36),
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

  public placeBet(game: GameType, amount: number, logic: (r: number) => { multiplier: number; outcome: string }): BetResult {
    if (amount > this.session.balance) throw new Error("Insufficient Balance");
    
    // Seeded randomness logic (simulated)
    const r = Math.random();
    const { multiplier, outcome } = logic(r);
    const payout = amount * multiplier;
    
    this.session.balance = this.session.balance - amount + payout;
    this.session.totalWagered += amount;
    this.session.totalBets += 1;
    this.session.rakebackBalance += amount * 0.001;
    
    if (multiplier > this.session.maxMultiplier) this.session.maxMultiplier = multiplier;

    const record: BetResult = {
      id: Math.random().toString(36).substring(7),
      gameType: game,
      betAmount: amount,
      payoutMultiplier: multiplier,
      payoutAmount: payout,
      timestamp: Date.now(),
      outcome,
      balanceAfter: this.session.balance,
      nonce: this.session.nonce++,
      clientSeed: this.session.clientSeed,
      serverSeedHash: 'verified_draw_' + this.session.serverSeed.substring(0, 8),
      resultInput: r
    };

    this.session.history = [record, ...this.session.history].slice(0, 50);
    this.saveSession(this.session);
    return record;
  }

  public deposit(amount: number, method: string) {
    this.session.balance += amount;
    this.session.transactions = [{
      id: Math.random().toString(36),
      type: 'DEPOSIT',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method
    }, ...this.session.transactions];
    this.saveSession(this.session);
  }

  public getLeaderboard() {
    return [...BOTS, { username: this.session.username, wagered: this.session.totalWagered, maxMultiplier: this.session.maxMultiplier, isPlayer: true }]
      .sort((a,b) => b.wagered - a.wagered);
  }

  public getCrashPoint(r: number): number {
    if (r < 0.01) return 1.00; 
    return Math.max(1, +(0.99 / (1 - r)).toFixed(2));
  }

  public calculateDiceResult(r: number, target: number, type: 'over' | 'under') {
    const roll = +(r * 100).toFixed(2);
    const won = type === 'over' ? roll > target : roll < target;
    return { roll, won };
  }

  public calculateRouletteResult(r: number) {
    return Math.floor(r * 37);
  }

  public calculateSlotsResult(r: number) {
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const s1 = symbols[Math.floor(r * 5)];
    const s2 = symbols[Math.floor((r * 10) % 5)];
    const s3 = symbols[Math.floor((r * 100) % 5)];
    const result = [s1, s2, s3];
    let multiplier = 0;
    if (s1 === s2 && s2 === s3) {
      if (s1 === '7️⃣') multiplier = 50;
      else if (s1 === '💎') multiplier = 20;
      else multiplier = 10;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      multiplier = 2;
    }
    return { symbols: result, multiplier };
  }

  public setClientSeed(seed: string) {
    this.session.clientSeed = seed;
    this.session.nonce = 0;
    this.saveSession(this.session);
  }

  public peekNextRandom(): number {
    return Math.random();
  }

  public generateMinesGrid(r: number, minesCount: number): boolean[] {
    const grid = Array(25).fill(false);
    let placed = 0;
    let seed = r;
    while (placed < minesCount) {
      const idx = Math.floor(seed * 25);
      if (!grid[idx]) {
        grid[idx] = true;
        placed++;
      }
      seed = (seed * 16807 + 1) % 2147483647 / 2147483647;
    }
    return grid;
  }

  public calculatePlinkoResult(r: number, rows: number) {
    const path = [];
    let seed = r;
    for (let i = 0; i < rows; i++) {
      const dir = seed > 0.5 ? 1 : 0;
      path.push(dir);
      seed = (seed * 16807 + 1) % 2147483647 / 2147483647;
    }
    const finalBin = path.reduce((a, b) => a + b, 0);
    const multiTable: Record<number, number[]> = {
        16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
    };
    const multiplier = multiTable[rows]?.[finalBin] || 0;
    return { path, multiplier };
  }

  public claimRakeback() {
    this.session.balance += this.session.rakebackBalance;
    this.session.rakebackBalance = 0;
    this.saveSession(this.session);
  }

  public updateAdminSettings(settings: Partial<AdminSettings>) {
    this.session.settings = { ...this.session.settings, ...settings };
    this.saveSession(this.session);
  }

  public resetBalance() {
    this.session.balance = DAILY_ALLOWANCE;
    this.saveSession(this.session);
  }

  public getSattaMatkaResult(r: number) {
     const c1 = Math.floor(r * 10);
     const c2 = Math.floor((r * 1.5 * 10) % 10);
     const c3 = Math.floor((r * 2.2 * 10) % 10);
     const single = (c1 + c2 + c3) % 10;
     return { cards: `${c1}${c2}${c3}`, single };
  }

  public calculateTeenPatti(r: number) {
     const won = r > 0.525; // 2.5% edge
     const hands = ["High Card", "Pair", "Color", "Sequence", "Pure Sequence", "Trail"];
     return { won, hand: hands[Math.floor(r * 6)] };
  }

  public updateBalance(a: number) { 
    this.session.balance += a; 
    this.saveSession(this.session); 
  }
  
  public toggleAdmin() { 
    this.session.isAdmin = !this.session.isAdmin; 
    this.saveSession(this.session); 
  }
}

export const engine = new SimulationEngine();
