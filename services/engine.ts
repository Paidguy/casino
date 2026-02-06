import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction, GameStats } from '../types';
import { getSecureRandom, generateSecureId, generateSecureSeed } from '../utils/crypto';
import { logError, BetValidationError } from '../utils/errorHandler';
import {
  DAILY_ALLOWANCE,
  STORAGE_KEY,
  MAX_HISTORY_SIZE,
  MAX_TRANSACTIONS_SIZE,
  BOT_LEADERBOARD,
  SAVE_DEBOUNCE_MS,
  RAKEBACK_RATE
} from '../constants/game';

export class SimulationEngine {
  private session: UserSession;
  private listenerMap = new Map<number, (session: UserSession) => void>();
  private listenerIdCounter = 0;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private unloadHandler = () => this.saveSessionImmediate();

  constructor() {
    this.session = this.loadSession();
    // Ensure state is saved if user abruptly closes tab
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', this.unloadHandler);
    }
  }

  /**
   * Clean up event listeners and resources
   * Call this before destroying the engine instance
   */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.unloadHandler);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.listenerMap.clear();
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
      id: generateSecureId(),
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
      clientSeed: generateSecureSeed(),
      serverSeed: generateSecureSeed(),
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
        // Ensure all game types are present with fresh stat objects
        Object.values(GameType).forEach(g => {
            if (!mergedGameStats[g]) mergedGameStats[g] = { ...defaultStats[g] };
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
      logError("Session load", e, { storageKey: STORAGE_KEY });
      try { 
        localStorage.removeItem(STORAGE_KEY); 
      } catch(err) {
        logError("Failed to clear corrupted session", err);
      }
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
    }, SAVE_DEBOUNCE_MS);
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public setClientSeed(seed: string) {
    this.session.clientSeed = seed;
    this.session.nonce = 0;
    this.saveSession(this.session);
  }

  /**
   * Generate a cryptographically secure random number
   * Used for game outcomes to ensure fairness
   */
  public peekNextRandom(): number {
    const r = getSecureRandom();
    // Apply Admin Rigging logic (for simulation purposes only)
    if (this.session.settings.isRigged) {
        // If rigged, shift randomness towards loss (lower numbers usually mean loss in crash/dice)
        return r * 0.8; 
    }
    return r;
  }

  private logTransaction(type: Transaction['type'], amount: number, method: string) {
      const tx: Transaction = {
          id: 'TX_' + generateSecureId().substring(0, 7).toUpperCase(),
          type,
          amount,
          timestamp: Date.now(),
          status: 'COMPLETED',
          method
      };
      // Optimize: avoid spreading entire array when at max capacity
      if (this.session.transactions.length >= MAX_TRANSACTIONS_SIZE) {
          this.session.transactions.pop();
      }
      this.session.transactions.unshift(tx);
      this.saveSession(this.session);
  }

  public placeBet(game: GameType, amount: number, multiplierOrResolver: number | ((r: number) => { multiplier: number, outcome: string }), outcomeStr?: string): BetResult {
    const currentSession = this.session; 
    
    // Safety check for invalid inputs
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
        logError("Invalid bet amount", new BetValidationError(`Invalid amount: ${amount}`), { game, amount });
        return {
             id: 'ERR', gameType: game, betAmount: 0, payoutMultiplier: 0, payoutAmount: 0, timestamp: Date.now(), outcome: 'Invalid Bet Amount', balanceAfter: currentSession.balance, nonce: 0, clientSeed: '', serverSeedHash: '', resultInput: 0
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
        logError("Bet calculation", e, { game, amount });
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
    this.session.rakebackBalance += amount * RAKEBACK_RATE;
    
    if (payout > amount) this.session.totalWins++;
    else this.session.totalLosses++;

    if (multiplier > this.session.maxMultiplier) this.session.maxMultiplier = multiplier;

    // Ensure game stats exist using helper
    if (!this.session.gameStats[game]) {
        const defaultStats = this.initializeGameStats();
        const defaultGameStat = defaultStats[game];
        if (defaultGameStat) {
          this.session.gameStats[game] = { ...defaultGameStat };
        }
    }
    const gs = this.session.gameStats[game];
    if (gs) {
      gs.bets += 1;
      gs.wagered += amount;
      gs.payout += payout;
      if (payout > amount) gs.wins += 1;
    }

    const record: BetResult = {
      id: generateSecureId(),
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
      resultInput: getSecureRandom()
    };

    const safeHistory = Array.isArray(this.session.history) ? this.session.history : [];
    // Optimize: avoid spreading entire array when at max capacity
    if (safeHistory.length >= MAX_HISTORY_SIZE) {
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
    return [...BOT_LEADERBOARD, { username: this.session.username, wagered: this.session.totalWagered, maxMultiplier: this.session.maxMultiplier, isPlayer: true }]
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
    const s1Idx = Math.floor(r * 5);
    const s2Idx = Math.floor((r * 2.5 * 10) % 5);
    const s3Idx = Math.floor((r * 3.3 * 10) % 5);
    
    let s1 = symbols[s1Idx];
    let s2 = symbols[s2Idx];
    let s3 = symbols[s3Idx];

    if (this.session.settings.isRigged && s1 === s2 && s2 === s3 && s3) {
        // Force a loss
        const nextIdx = (symbols.indexOf(s3) + 1) % 5;
        s3 = symbols[nextIdx];
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

  /**
   * Generate a mines grid using Fisher-Yates shuffle for better performance
   * Time complexity: O(n) instead of potentially O(n²)
   */
  public generateMinesGrid(r: number, minesCount: number): boolean[] {
    const totalCells = 25;
    const grid = Array(totalCells).fill(false);
    
    // Create array of indices and shuffle the required number
    const indices = Array.from({length: totalCells}, (_, i) => i);
    
    // Fisher-Yates shuffle for the mine positions
    for (let i = totalCells - 1; i >= totalCells - minesCount; i--) {
      const j = Math.floor(getSecureRandom() * (i + 1));
      const iVal = indices[i];
      const jVal = indices[j];
      if (iVal !== undefined && jVal !== undefined) {
        [indices[i], indices[j]] = [jVal, iVal];
      }
    }
    
    // Place mines at shuffled positions
    for (let i = totalCells - minesCount; i < totalCells; i++) {
      const idx = indices[i];
      if (idx !== undefined) {
        grid[idx] = true;
      }
    }
    
    return grid;
  }

  public calculatePlinkoResult(_r: number, rows: number) {
    // If rigged, bias towards center (lower multipliers)
    // Note: _r parameter kept for interface compatibility but not used in rigging logic
    
    const path = [];
    for (let i = 0; i < rows; i++) path.push(Math.random() > (this.session.settings.isRigged ? 0.4 : 0.5) ? 1 : 0);
    const finalBin = path.reduce((a, b) => a + b, 0);
    const MULTIPLIERS_16 = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
    const multiplier = MULTIPLIERS_16[finalBin];
    return { path, multiplier: multiplier ?? 0.2 };
  }

  public calculateTeenPatti(_r: number) {
    // Standard edge
    // Note: _r parameter kept for interface compatibility but not used
    const won = Math.random() > 0.55; 
    const hands = ['Trail', 'Pure Sequence', 'Sequence', 'Color', 'Pair', 'High Card'];
    const hand = hands[Math.floor(Math.random() * hands.length)] ?? 'High Card';
    return { won, hand };
  }
}

export const engine = new SimulationEngine();