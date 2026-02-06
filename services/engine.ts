import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, LeaderboardEntry, GameStats } from '../types';

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
  private listenerMap = new Map<number, (session: UserSession) => void>();
  private listenerIdCounter = 0;
  private saveTimeout: any = null;
  private unloadHandler = () => this.saveSessionImmediate();

  constructor() {
    this.session = this.loadSession();
    // Ensure state is saved if user abruptly closes tab
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', this.unloadHandler);
    }
  }

  public subscribe(listener: (session: UserSession) => void) {
    const id = this.listenerIdCounter++;
    this.listenerMap.set(id, listener);
    try { listener({ ...this.session }); } catch (e) { console.error(e); }
    return () => { this.listenerMap.delete(id); };
  }

  private notify() {
    this.listenerMap.forEach(l => { try { l({ ...this.session }); } catch (e) { console.error(e); } });
  }

  private initializeGameStats(): Record<string, GameStats> {
    const stats: Record<string, GameStats> = {};
    Object.values(GameType).forEach(g => {
      stats[g] = { bets: 0, wagered: 0, wins: 0, payout: 0 };
    });
    return stats;
  }

  private createDefaultSession(): UserSession {
    return {
      id: Math.random().toString(36).substring(7),
      username: 'Punter_' + Math.floor(1000 + Math.random() * 9000),
      balance: DAILY_ALLOWANCE,
      rakebackBalance: 0,
      isAdmin: false,
      startBalance: DAILY_ALLOWANCE,
      startTime: Date.now(),
      totalBets: 0,
      totalWagered: 0,
      totalPayout: 0,
      totalWins: 0,
      totalLosses: 0,
      maxMultiplier: 0,
      history: [],
      transactions: [],
      gameStats: this.initializeGameStats(),
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
  }

  private loadSession(): UserSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== "undefined" && stored !== "null") {
        const parsed = JSON.parse(stored);
        const defaults = this.createDefaultSession();
        
        const safeBalance = (typeof parsed.balance === 'number' && !isNaN(parsed.balance) && isFinite(parsed.balance)) 
          ? parsed.balance 
          : defaults.balance;

        const safeHistory = Array.isArray(parsed.history) ? parsed.history : [];
        const safeTransactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];

        // Merge gameStats safely using helper
        const defaultStats = this.initializeGameStats();
        const mergedGameStats = { ...defaultStats, ...(parsed.gameStats || {}) };
        Object.values(GameType).forEach(g => {
            if (!mergedGameStats[g]) mergedGameStats[g] = defaultStats[g];
        });

        const mergedSettings: AdminSettings = {
            ...defaults.settings,
            ...(parsed.settings || {}),
            houseEdgeOverrides: {
                ...defaults.settings.houseEdgeOverrides,
                ...(parsed.settings?.houseEdgeOverrides || {})
            }
        };

        (Object.keys(HOUSE_EDGES) as GameType[]).forEach((key) => {
            if (typeof mergedSettings.houseEdgeOverrides[key] !== 'number') {
                mergedSettings.houseEdgeOverrides[key] = HOUSE_EDGES[key];
            }
        });

        return {
            ...defaults,
            ...parsed,
            balance: safeBalance,
            totalPayout: typeof parsed.totalPayout === 'number' ? parsed.totalPayout : 0,
            gameStats: mergedGameStats,
            settings: mergedSettings,
            transactions: safeTransactions,
            history: safeHistory
        };
      }
    } catch (e) {
      console.error("Failed to load session, resetting:", e);
      try { localStorage.removeItem(STORAGE_KEY); } catch(err) {}
    }
    return this.initializeSession();
  }

  private initializeSession(): UserSession {
    const session = this.createDefaultSession();
    this.saveSession(session);
    return session;
  }

  private saveSessionImmediate() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session)); } catch (e) {}
  }

  private saveSession(session: UserSession) {
    this.session = session;
    this.notify();
    
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
        this.saveSessionImmediate();
    }, 2000);
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
    const r = Math.random();
    // Apply Admin Rigging logic
    if (this.session.settings.isRigged) {
        // If rigged, shift randomness towards loss (lower numbers usually mean loss in crash/dice)
        return r * 0.8; 
    }
    return r;
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
      // Optimize: avoid spreading entire array when at max capacity
      if (this.session.transactions.length >= 100) {
          this.session.transactions.pop();
      }
      this.session.transactions.unshift(tx);
      this.saveSession(this.session);
  }

  public placeBet(game: GameType, amount: number, multiplierOrResolver: number | ((r: number) => { multiplier: number, outcome: string }), outcomeStr?: string): BetResult {
    const currentSession = this.session; 
    
    // Safety check for invalid inputs
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount < 0) {
        console.error("Invalid bet amount:", amount);
        return {
             id: 'ERR', gameType: game, betAmount: 0, payoutMultiplier: 0, payoutAmount: 0, timestamp: Date.now(), outcome: 'Error', balanceAfter: currentSession.balance, nonce: 0, clientSeed: '', serverSeedHash: '', resultInput: 0
        }; 
    }
    
    if (amount > currentSession.balance) {
        return {
             id: 'ERR_BAL', gameType: game, betAmount: 0, payoutMultiplier: 0, payoutAmount: 0, timestamp: Date.now(), outcome: 'Insufficient Funds', balanceAfter: currentSession.balance, nonce: 0, clientSeed: '', serverSeedHash: '', resultInput: 0
        };
    }
    
    let multiplier: number = 0;
    let outcome: string = '';

    try {
        if (typeof multiplierOrResolver === 'function') {
            const r = this.peekNextRandom(); 
            const res = multiplierOrResolver(r);
            multiplier = res.multiplier;
            outcome = res.outcome;
        } else {
            multiplier = multiplierOrResolver;
            outcome = outcomeStr || '';
        }
        
        // Sanitize multiplier
        if (isNaN(multiplier) || !isFinite(multiplier)) {
            multiplier = 0;
            outcome = 'Error: Invalid Multiplier';
        }
    } catch (e) {
        console.error("Error calculating bet result:", e);
        multiplier = 0;
        outcome = "System Error - Bet Refunded";
        amount = 0; 
    }

    const payout = amount * multiplier;
    
    // Update global profit tracking for admin
    const profit = amount - payout;
    this.session.settings.globalProfit += profit;

    this.session.balance = Math.max(0, this.session.balance - amount + payout); 
    this.session.totalWagered += amount;
    this.session.totalBets += 1;
    this.session.totalPayout += payout;
    this.session.rakebackBalance += amount * 0.005;
    
    if (payout > amount) this.session.totalWins++;
    else this.session.totalLosses++;

    if (multiplier > this.session.maxMultiplier) this.session.maxMultiplier = multiplier;

    // Ensure game stats exist using helper
    if (!this.session.gameStats[game]) {
        const defaultStats = this.initializeGameStats();
        this.session.gameStats[game] = defaultStats[game];
    }
    const gs = this.session.gameStats[game];
    gs.bets += 1;
    gs.wagered += amount;
    gs.payout += payout;
    if (payout > amount) gs.wins += 1;

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

    const safeHistory = Array.isArray(this.session.history) ? this.session.history : [];
    // Optimize: avoid spreading entire array when at max capacity
    if (safeHistory.length >= 50) {
        safeHistory.pop();
    }
    this.session.history = [record, ...safeHistory];
    
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
    // Apply rigging: If rigged, crash early
    if (this.session.settings.isRigged && r > 0.4) {
        return 1.00 + Math.random() * 0.5; // Crash between 1.00x and 1.50x
    }

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
    this.session.balance = DAILY_ALLOWANCE;
    this.logTransaction('BAILOUT', DAILY_ALLOWANCE, 'System Reset');
    this.saveSession(this.session);
  }
  
  public hardReset() {
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch(e) { console.error(e); }
    this.session = this.initializeSession();
    this.notify();
    window.location.reload();
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
    // Apply rigging logic for Dice
    let finalR = r;
    if (this.session.settings.isRigged) {
        // If rigged, push the roll towards the losing side
        if (mode === 'over') finalR = Math.min(r, target / 100 - 0.01);
        else finalR = Math.max(r, target / 100 + 0.01);
        // Ensure bounds
        finalR = Math.max(0, Math.min(0.99, finalR));
    }

    const roll = finalR * 100;
    const won = mode === 'over' ? roll > target : roll < target;
    return { roll, won };
  }

  public calculateRouletteResult(r: number) {
    return Math.floor(r * 37);
  }

  public calculateSlotsResult(r: number) {
    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    
    // In rigged mode, ensure s1 != s2
    let s1 = symbols[Math.floor(r * 5)];
    let s2 = symbols[Math.floor((r * 2.5 * 10) % 5)];
    let s3 = symbols[Math.floor((r * 3.3 * 10) % 5)];

    if (this.session.settings.isRigged && s1 === s2 && s2 === s3) {
        // Force a loss
        s3 = symbols[(symbols.indexOf(s3) + 1) % 5];
    }

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
    // If rigged, bias towards center (lower multipliers)
    let biasedR = r;
    if (this.session.settings.isRigged) {
        // Skew probability distribution closer to 0.5 (center)
        biasedR = (r + 0.5) / 2; 
    }

    const path = [];
    for (let i = 0; i < rows; i++) path.push(Math.random() > (this.session.settings.isRigged ? 0.4 : 0.5) ? 1 : 0);
    const finalBin = path.reduce((a, b) => a + b, 0);
    const MULTIPLIERS_16 = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    return { path, multiplier: MULTIPLIERS_16[finalBin] };
  }

  public calculateTeenPatti(r: number) {
    // Standard edge
    const won = r > 0.55; 
    const hands = ['Trail', 'Pure Sequence', 'Sequence', 'Color', 'Pair', 'High Card'];
    const hand = hands[Math.floor(Math.random() * hands.length)];
    return { won, hand };
  }
}

export const engine = new SimulationEngine();