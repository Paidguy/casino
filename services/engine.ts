import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry } from '../types';

const DAILY_ALLOWANCE = 100000;
const STORAGE_KEY = 'satking_pro_v2';

const BOTS: LeaderboardEntry[] = [
  { username: 'Rahul_Satta_King', wagered: 850000, maxMultiplier: 45.0 },
  { username: 'Mumbai_Khaiwal', wagered: 2200000, maxMultiplier: 120.0 },
  { username: 'Delhi_Tiger_786', wagered: 1400000, maxMultiplier: 9.0 },
  { username: 'Gully_Sniper_Boss', wagered: 95000, maxMultiplier: 22.0 },
  { username: 'Kalyan_Expert_Punter', wagered: 3500000, maxMultiplier: 100.0 },
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
      username: 'Punter_' + Math.floor(1000 + Math.random() * 9000),
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

  public setClientSeed(seed: string) {
    this.session.clientSeed = seed;
    this.session.nonce = 0;
    this.saveSession(this.session);
  }

  public peekNextRandom(): number {
    return Math.random();
  }

  private logTransaction(type: Transaction['type'], amount: number, method: string) {
      const tx: Transaction = {
          id: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type,
          amount,
          timestamp: Date.now(),
          status: 'COMPLETED',
          method
      };
      this.session.transactions = [tx, ...this.session.transactions];
      this.saveSession(this.session);
  }

  public placeBet(game: GameType, amount: number, multiplierOrResolver: number | ((r: number) => { multiplier: number, outcome: string }), outcomeStr?: string): BetResult {
    const currentSession = this.getSession();
    if (amount > currentSession.balance && amount > 0) throw new Error("Insufficient Balance");
    
    let multiplier: number;
    let outcome: string;

    if (typeof multiplierOrResolver === 'function') {
      const r = Math.random();
      const res = multiplierOrResolver(r);
      multiplier = res.multiplier;
      outcome = res.outcome;
    } else {
      multiplier = multiplierOrResolver;
      outcome = outcomeStr || '';
    }

    const payout = amount * multiplier;
    this.session.balance = this.session.balance - (amount > 0 ? amount : 0) + payout;
    this.session.totalWagered += amount;
    this.session.totalBets += 1;
    this.session.rakebackBalance += amount * 0.005;
    
    if (payout > amount) this.session.totalWins++;
    else this.session.totalLosses++;

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
      serverSeedHash: 'verified_' + this.session.serverSeed.substring(0, 8),
      resultInput: Math.random()
    };

    this.session.history = [record, ...this.session.history].slice(0, 50);
    this.saveSession(this.session);
    return record;
  }

  public deposit(amount: number, method: string) {
    this.session.balance += amount;
    this.logTransaction('DEPOSIT', amount, method);
  }

  public updateBalance(a: number) { 
    this.session.balance += a; 
    this.saveSession(this.session); 
  }

  public claimRakeback() {
    const amount = this.session.rakebackBalance;
    if (amount > 0) {
      this.session.balance += amount;
      this.session.rakebackBalance = 0;
      this.logTransaction('RAKEBACK', amount, 'VIP Reward');
    }
  }

  public getLeaderboard() {
    return [...BOTS, { username: this.session.username, wagered: this.session.totalWagered, maxMultiplier: this.session.maxMultiplier, isPlayer: true }]
      .sort((a,b) => b.wagered - a.wagered);
  }

  public getCrashPoint(r: number): number {
    const houseEdge = 0.03; 
    if (r < houseEdge) return 1.00;
    return Math.max(1, +( (1 - houseEdge) / (1 - r) ).toFixed(2));
  }

  public getSattaMatkaResult(r: number) {
     const c1 = Math.floor(r * 10);
     const c2 = Math.floor((r * 1.5 * 10) % 10);
     const c3 = Math.floor((r * 2.2 * 10) % 10);
     const single = (c1 + c2 + c3) % 10;
     return { cards: `${c1}${c2}${c3}`, single };
  }

  public resetBalance() {
    const oldBalance = this.session.balance;
    this.session.balance = DAILY_ALLOWANCE;
    this.logTransaction('BAILOUT', DAILY_ALLOWANCE, 'System Reset');
    this.saveSession(this.session);
  }

  public toggleAdmin() {
    this.session.isAdmin = !this.session.isAdmin;
    this.saveSession(this.session);
  }

  public updateAdminSettings(settings: Partial<AdminSettings>) {
    this.session.settings = { ...this.session.settings, ...settings };
    this.saveSession(this.session);
  }

  public calculateDiceResult(r: number, target: number, mode: 'over' | 'under') {
    const roll = r * 100;
    const won = mode === 'over' ? roll > target : roll < target;
    return { roll, won };
  }

  public calculateRouletteResult(r: number) {
    return Math.floor(r * 37);
  }

  public calculateSlotsResult(r: number) {
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const s1 = symbols[Math.floor(r * 5)];
    const s2 = symbols[Math.floor((r * 2.5 * 10) % 5)];
    const s3 = symbols[Math.floor((r * 3.3 * 10) % 5)];
    const res = [s1, s2, s3];
    let multiplier = 0;
    if (s1 === s2 && s2 === s3) {
      if (s1 === '7️⃣') multiplier = 100;
      else if (s1 === '💎') multiplier = 50;
      else multiplier = 20;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      multiplier = 2;
    }
    return { symbols: res, multiplier };
  }

  public generateMinesGrid(r: number, minesCount: number): boolean[] {
    const grid = Array(25).fill(false);
    let placed = 0;
    while (placed < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!grid[idx]) {
        grid[idx] = true;
        placed++;
      }
    }
    return grid;
  }

  public calculatePlinkoResult(r: number, rows: number) {
    const path = [];
    for (let i = 0; i < rows; i++) path.push(Math.random() > 0.5 ? 1 : 0);
    const finalBin = path.reduce((a, b) => a + b, 0);
    const MULTIPLIERS_16 = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    return { path, multiplier: MULTIPLIERS_16[finalBin] };
  }

  public calculateTeenPatti(r: number) {
    const won = r > 0.55; 
    const hands = ['Trail', 'Pure Sequence', 'Sequence', 'Color', 'Pair', 'High Card'];
    const hand = hands[Math.floor(Math.random() * hands.length)];
    return { won, hand };
  }
}

export const engine = new SimulationEngine();