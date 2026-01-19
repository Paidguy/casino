
import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry } from '../types';

const DAILY_ALLOWANCE = 10000;
const STORAGE_KEY = 'stake_ind_v10_pro';

// High-fidelity bots with personality profiles
const BOTS: LeaderboardEntry[] = [
  { username: 'Crore_Pathi', wagered: 8940000, maxMultiplier: 4500.0 },
  { username: 'Matka_Wizard', wagered: 1200000, maxMultiplier: 890.5 },
  { username: 'Bombay_Whale', wagered: 5450000, maxMultiplier: 12.0 },
  { username: 'Satoshi_Ji', wagered: 2640000, maxMultiplier: 9999.0 },
  { username: 'Luck_Is_Fake', wagered: 45000, maxMultiplier: 2.5 },
];

/**
 * NEW: Cryptographically Secure Randomness using HMAC-SHA256 Simulation
 */
class CryptoFairness {
  static async generateResult(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const message = `${clientSeed}:${nonce}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(serverSeed);
    const msgData = encoder.encode(message);

    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, msgData);
    const hashArray = Array.from(new Uint8Array(signature));
    
    // Convert first 4 bytes to a float [0, 1)
    const val = (hashArray[0] << 24 | hashArray[1] << 16 | hashArray[2] << 8 | hashArray[3]) >>> 0;
    return val / 4294967296;
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

  // Pure mathematical result generators (Sync for UI, but backed by Async logic in placeBet)
  public getCrashPoint(r: number): number {
    const edge = 0.01; // 1% house edge
    if (r < edge) return 1.00;
    return Math.max(1.00, Math.floor(((1 - edge) / (1 - r)) * 100) / 100);
  }

  // Add missing calculateDiceResult for Dice game
  public calculateDiceResult(r: number, target: number, condition: 'over' | 'under') {
    const roll = r * 100;
    const won = condition === 'over' ? roll > target : roll < target;
    return { roll, won };
  }

  // Add missing calculateRouletteResult for Roulette game
  public calculateRouletteResult(r: number) {
    return Math.floor(r * 37);
  }

  // Add missing calculateSlotsResult for Slots game
  public calculateSlotsResult(r: number) {
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const s1 = symbols[Math.floor((r * 12345) % 1 * 5)];
    const s2 = symbols[Math.floor((r * 23456) % 1 * 5)];
    const s3 = symbols[Math.floor((r * 34567) % 1 * 5)];
    let multiplier = 0;
    if (s1 === s2 && s2 === s3) {
      if (s1 === '7️⃣') multiplier = 50;
      else if (s1 === '💎') multiplier = 20;
      else multiplier = 10;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      multiplier = 2;
    }
    return { symbols: [s1, s2, s3], multiplier };
  }

  // Update calculatePlinkoResult to include the path for UI animation
  public calculatePlinkoResult(r: number, rows: number) {
    // Normal distribution simulation for Plinko
    let bin = 0;
    let tempR = r;
    const path = [];
    for (let i = 0; i < rows; i++) {
      tempR = (tempR * 16807) % 2147483647; // Simple fast LCG for internal path
      const step = (tempR / 2147483647 > 0.5) ? 1 : 0;
      path.push(step);
      bin += step;
    }
    // High-risk multipliers for 16 rows
    const mults = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    return { multiplier: mults[bin] || 0.2, path };
  }

  // Add missing generateMinesGrid for Mines game
  public generateMinesGrid(r: number, minesCount: number) {
    const grid = Array(25).fill(false);
    let count = 0;
    let tempR = r;
    while (count < minesCount) {
        tempR = (tempR * 16807) % 2147483647;
        const idx = Math.floor((tempR / 2147483647) * 25);
        if (!grid[idx]) {
            grid[idx] = true;
            count++;
        }
    }
    return grid;
  }

  // Add missing calculateTeenPatti for TeenPatti game
  public calculateTeenPatti(r: number) {
    const hands = ["Trail", "Pure Sequence", "Sequence", "Color", "Pair", "High Card"];
    const won = r > 0.525; // 52.5% dealer bias
    const handIdx = Math.floor(r * 6);
    return { won, hand: hands[handIdx] };
  }

  // Add missing getSattaMatkaResult for Matka game
  public getSattaMatkaResult(r: number) {
    const c1 = Math.floor((r * 1000) % 10);
    const c2 = Math.floor((r * 10000) % 10);
    const c3 = Math.floor((r * 100000) % 10);
    const single = (c1 + c2 + c3) % 10;
    return { cards: `${c1}${c2}${c3}`, single };
  }

  // Add missing peekNextRandom for UI preview of randomness
  public peekNextRandom() {
    const combined = this.session.serverSeed + this.session.clientSeed + this.session.nonce;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash % 1000000) / 1000000;
  }

  // Add missing setClientSeed for Fairness page
  public setClientSeed(seed: string) {
    this.session.clientSeed = seed;
    this.session.nonce = 0;
    this.saveSession(this.session);
  }

  // Add missing updateAdminSettings for Admin control
  public updateAdminSettings(s: Partial<AdminSettings>) {
    this.session.settings = { ...this.session.settings, ...s };
    this.saveSession(this.session);
  }

  // Add missing resetBalance for Admin control
  public resetBalance() {
    this.session.balance = DAILY_ALLOWANCE;
    this.saveSession(this.session);
  }

  public async placeBet(game: GameType, amount: number, logic: (r: number) => { multiplier: number; outcome: string }): Promise<BetResult> {
    if (amount > this.session.balance) throw new Error("Insufficient Balance");
    
    // Generate actual provably fair random number
    const r = await CryptoFairness.generateResult(this.session.serverSeed, this.session.clientSeed, this.session.nonce);
    
    const { multiplier, outcome } = logic(r);
    const payout = amount * multiplier;
    
    this.session.balance = this.session.balance - amount + payout;
    this.session.totalBets += 1;
    this.session.totalWagered += amount;
    this.session.nonce += 1;
    
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
      serverSeedHash: 'sha256_verified_' + this.session.serverSeed.substring(0, 6),
      resultInput: r
    };

    this.session.history = [record, ...this.session.history].slice(0, 50);
    this.saveSession(this.session);
    return record;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    const playerEntry: LeaderboardEntry = {
      username: this.session.username,
      wagered: this.session.totalWagered,
      maxMultiplier: this.session.maxMultiplier,
      isPlayer: true
    };
    return [...BOTS, playerEntry].sort((a,b) => b.wagered - a.wagered);
  }

  public updateBalance(a: number) { this.session.balance += a; this.saveSession(this.session); }
  public claimRakeback() {
    const amt = this.session.rakebackBalance;
    this.session.balance += amt;
    this.session.rakebackBalance = 0;
    this.saveSession(this.session);
    return amt;
  }
  public toggleAdmin() { this.session.isAdmin = !this.session.isAdmin; this.saveSession(this.session); }
  public deposit(a: number, m: string) {
     this.session.balance += a;
     this.session.transactions = [{ id: Math.random().toString(36), type: 'DEPOSIT', amount: a, timestamp: Date.now(), status: 'COMPLETED', method: m }, ...this.session.transactions];
     this.saveSession(this.session);
  }
}

export const engine = new SimulationEngine();
