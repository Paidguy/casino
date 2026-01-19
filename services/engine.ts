
import { UserSession, BetResult, GameType, HOUSE_EDGES, AdminSettings, Transaction } from '../types';

const DAILY_ALLOWANCE = 10000;
const STORAGE_KEY = 'stake_ind_v3_premium';

const SARCASTIC_BAILOUTS = [
  "Back for more punishment? Here's 10k. Try not to lose it in 5 minutes this time.",
  "Your wallet is as empty as your betting strategy. Re-upping your balance...",
  "Watching you play is our staff's favorite comedy. Take some credits, the show must go on.",
  "A gold fish has a higher win rate than you. Here's a pity deposit.",
  "Is this a hobby or a cry for help? Either way, take the money and go.",
  "The 'Bookie' is feeling generous today. Don't tell your financial advisor.",
  "You're single-handedly funding our next yacht. Here, keep the donations coming."
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
      isAdmin: false,
      startBalance: DAILY_ALLOWANCE,
      startTime: Date.now(),
      totalBets: 0,
      totalWagered: 0,
      totalWins: 0,
      totalLosses: 0,
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
    if (amount > this.session.balance) throw new Error("Insufficient funds for withdrawal");
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

  public requestBailout(): string {
    if (this.session.balance > 10) return "You still have cash. Go lose that first.";
    const amount = DAILY_ALLOWANCE;
    this.session.balance = amount;
    const tx: Transaction = {
      id: Math.random().toString(36).substring(7),
      type: 'BAILOUT',
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method: 'System Charity'
    };
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 50);
    this.saveSession(this.session);
    return SARCASTIC_BAILOUTS[Math.floor(Math.random() * SARCASTIC_BAILOUTS.length)];
  }

  public toggleAdmin() {
    this.session.isAdmin = !this.session.isAdmin;
    this.saveSession(this.session);
  }

  public updateBalance(amount: number) {
    this.session.balance += amount;
    this.saveSession(this.session);
  }

  public updateAdminSettings(settings: Partial<AdminSettings>) {
    this.session.settings = { ...this.session.settings, ...settings };
    this.saveSession(this.session);
  }

  public resetBalance() {
    this.session.balance = DAILY_ALLOWANCE;
    this.session.transactions = [];
    this.saveSession(this.session);
  }

  public peekNextRandom(): number {
    const rng = new LCG(this.session.serverSeed + this.session.clientSeed + this.session.nonce);
    return rng.next();
  }

  public placeBet(game: GameType, amount: number, resultCallback: (rawRandom: number) => { multiplier: number; outcome: string }): BetResult {
    if (amount > this.session.balance && amount > 0) throw new Error("Insufficient funds");
    
    const rng = new LCG(this.session.serverSeed + this.session.clientSeed + this.session.nonce);
    let rawRandom = rng.next();

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
    const edge = this.session.settings.houseEdgeOverrides[GameType.CRASH];
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
      if (!grid[idx]) {
        grid[idx] = true;
        minesPlaced++;
      }
    }
    return grid;
  }
}

export const engine = new SimulationEngine();
