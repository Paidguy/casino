import {
  UserSession,
  BetResult,
  GameType,
  HOUSE_EDGES,
  AdminSettings,
  Transaction,
  LeaderboardEntry,
  GameStats,
  BazarMarketResult,
} from '../types';

const DAILY_ALLOWANCE = 25000;
const STORAGE_KEY = 'maharaja_bookie_session_v4';

export function formatINR(amount: number, decimals = 2): string {
  const safe = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  return (
    '₹' +
    safe.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

// Deterministic FNV-1a / SHA-like hex hash & PRNG for synchronous Provably Fair verification
export function sha256Sync(input: string): string {
  const h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      const idx = (i + round) & 7;
      h[idx] = Math.imul(h[idx] ^ c, 0x01000193) >>> 0;
      h[(idx + 1) & 7] = (h[(idx + 1) & 7] + ((h[idx] << 5) | (h[idx] >>> 27))) >>> 0;
      h[(idx + 3) & 7] = (h[(idx + 3) & 7] ^ (h[idx] >>> 11)) >>> 0;
    }
  }
  return h.map((w) => w.toString(16).padStart(8, '0')).join('');
}

export function generateProvablyFairFloats(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  count: number = 1
): number[] {
  const results: number[] = [];
  for (let cursor = 0; cursor < count; cursor++) {
    const msg = `${serverSeed}:${clientSeed}:${nonce}:${cursor}`;
    const hex = sha256Sync(msg);
    const intVal = parseInt(hex.substring(0, 8), 16);
    const floatVal = (intVal >>> 0) / 0x100000000;
    results.push(Math.min(0.99999999, Math.max(0, floatVal)));
  }
  return results;
}

function randomHex(len = 32): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * 16)];
  }
  return out;
}

export function generateUTR(): string {
  let utr = '4';
  for (let i = 0; i < 11; i++) {
    utr += Math.floor(Math.random() * 10).toString();
  }
  return utr;
}

export const LIVE_BAZAR_MARKETS: BazarMarketResult[] = [
  {
    id: 'kalyan',
    name: 'KALYAN OFFICIAL',
    openTime: '04:15 PM',
    closeTime: '06:15 PM',
    openPanna: '148',
    jodi: '37',
    closePanna: '250',
    status: 'LIVE',
  },
  {
    id: 'worli',
    name: 'WORLI MUMBAI',
    openTime: '07:00 PM',
    closeTime: '09:30 PM',
    openPanna: '369',
    jodi: '81',
    closePanna: '146',
    status: 'LIVE',
  },
  {
    id: 'milan_night',
    name: 'MILAN NIGHT',
    openTime: '09:00 PM',
    closeTime: '11:00 PM',
    openPanna: '279',
    jodi: '84',
    closePanna: '130',
    status: 'LIVE',
  },
  {
    id: 'rajdhani',
    name: 'RAJDHANI NIGHT',
    openTime: '09:30 PM',
    closeTime: '11:45 PM',
    openPanna: '458',
    jodi: '72',
    closePanna: '246',
    status: 'DECLARED',
  },
  {
    id: 'main_bazar',
    name: 'MAIN BAZAR',
    openTime: '09:40 PM',
    closeTime: '12:05 AM',
    openPanna: '129',
    jodi: '29',
    closePanna: '379',
    status: 'LIVE',
  },
];

export const PLINKO_MULTIPLIERS: Record<'LOW' | 'MEDIUM' | 'HIGH', Record<number, number[]>> = {
  LOW: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  MEDIUM: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  HIGH: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

export const KENO_PAYOUTS: Record<'LOW' | 'MEDIUM' | 'HIGH', Record<number, number[]>> = {
  LOW: {
    1: [0.7, 1.85],
    2: [0, 2, 3.8],
    3: [0, 1.1, 1.38, 26],
    4: [0, 0, 2.2, 7.9, 90],
    5: [0, 0, 1.5, 4.2, 13, 300],
    6: [0, 0, 1.1, 2, 6.2, 100, 700],
    7: [0, 0, 1.1, 1.6, 3.5, 15, 225, 700],
    8: [0, 0, 1.1, 1.5, 2, 5.5, 39, 100, 800],
    9: [0, 0, 1.1, 1.3, 1.7, 2.5, 7.5, 50, 250, 1000],
    10: [0, 0, 1.1, 1.2, 1.3, 1.8, 3.5, 13, 50, 250, 1000],
  },
  MEDIUM: {
    1: [0.4, 2.75],
    2: [0, 1.8, 5.1],
    3: [0, 0, 2.8, 50],
    4: [0, 0, 1.7, 10, 100],
    5: [0, 0, 1.4, 4, 14, 390],
    6: [0, 0, 0, 3, 9, 180, 710],
    7: [0, 0, 0, 2, 7, 30, 400, 800],
    8: [0, 0, 0, 2, 4, 11, 67, 400, 900],
    9: [0, 0, 0, 2, 2.5, 5, 15, 100, 500, 1000],
    10: [0, 0, 0, 1.6, 2, 4, 7, 26, 100, 500, 1000],
  },
  HIGH: {
    1: [0, 3.96],
    2: [0, 0, 17.1],
    3: [0, 0, 0, 81.5],
    4: [0, 0, 0, 10, 259],
    5: [0, 0, 0, 4.5, 48, 450],
    6: [0, 0, 0, 0, 11, 350, 710],
    7: [0, 0, 0, 0, 7, 90, 400, 800],
    8: [0, 0, 0, 0, 5, 20, 270, 600, 900],
    9: [0, 0, 0, 0, 4, 11, 56, 500, 800, 1000],
    10: [0, 0, 0, 0, 3.5, 8, 13, 63, 500, 800, 1000],
  },
};

const BOTS: LeaderboardEntry[] = [
  { username: 'Vikram_Mumbai', wagered: 1842500, profit: 464200, maxMultiplier: 412.5, vipTier: 'Diamond', city: 'Mumbai' },
  { username: 'Rohan_Bengaluru', wagered: 1319000, profit: 328900, maxMultiplier: 1000.0, vipTier: 'Platinum', city: 'Bengaluru' },
  { username: 'Aarav_Delhi', wagered: 894200, profit: 194000, maxMultiplier: 150.0, vipTier: 'Platinum', city: 'New Delhi' },
  { username: 'Karan_Hyderabad', wagered: 528400, profit: 114200, maxMultiplier: 95.0, vipTier: 'Gold', city: 'Hyderabad' },
  { username: 'Kabir_Pune', wagered: 284500, profit: 54200, maxMultiplier: 88.4, vipTier: 'Gold', city: 'Pune' },
  { username: 'Aditya_Jaipur', wagered: 142100, profit: 25300, maxMultiplier: 41.0, vipTier: 'Silver', city: 'Jaipur' },
];

export class SimulationEngine {
  private session: UserSession;
  private listeners: ((session: UserSession) => void)[] = [];

  constructor() {
    this.session = this.loadSession();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveSessionImmediate());
    }
  }

  public subscribe(listener: (session: UserSession) => void) {
    this.listeners.push(listener);
    try {
      listener({ ...this.session });
    } catch (e) {
      console.error(e);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l({ ...this.session });
      } catch (e) {
        console.error(e);
      }
    });
  }

  private createDefaultSession(): UserSession {
    const gameStats: Record<string, GameStats> = {};
    Object.values(GameType).forEach((g) => {
      gameStats[g] = { bets: 0, wagered: 0, wins: 0, payout: 0 };
    });

    const serverSeed = randomHex(32);
    const clientSeed = 'maharaja_' + randomHex(8);

    return {
      id: randomHex(8),
      username: 'Player_' + Math.floor(1000 + Math.random() * 9000),
      balance: DAILY_ALLOWANCE,
      vaultBalance: 0,
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
      transactions: [
        {
          id: 'UPI_WELCOME',
          type: 'DEPOSIT',
          amount: DAILY_ALLOWANCE,
          timestamp: Date.now(),
          status: 'COMPLETED',
          method: 'Welcome Bonus Credit',
          utr: generateUTR(),
        },
      ],
      gameStats,
      clientSeed,
      serverSeed,
      serverSeedHash: sha256Sync(serverSeed),
      seedHistory: [],
      nonce: 0,
      settings: {
        isRigged: false,
        forcedRTP: 0.99,
        houseEdgeOverrides: { ...HOUSE_EDGES },
        globalProfit: 0,
        instantBet: false,
      },
    };
  }

  private loadSession(): UserSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        const defaults = this.createDefaultSession();

        const safeBalance =
          typeof parsed.balance === 'number' && !isNaN(parsed.balance) && isFinite(parsed.balance)
            ? parsed.balance
            : defaults.balance;

        const mergedGameStats = { ...defaults.gameStats, ...(parsed.gameStats || {}) };
        Object.values(GameType).forEach((g) => {
          if (!mergedGameStats[g]) mergedGameStats[g] = { bets: 0, wagered: 0, wins: 0, payout: 0 };
        });

        const mergedSettings: AdminSettings = {
          ...defaults.settings,
          ...(parsed.settings || {}),
          houseEdgeOverrides: {
            ...defaults.settings.houseEdgeOverrides,
            ...(parsed.settings?.houseEdgeOverrides || {}),
          },
        };

        const serverSeed = parsed.serverSeed || defaults.serverSeed;

        return {
          ...defaults,
          ...parsed,
          balance: safeBalance,
          vaultBalance: typeof parsed.vaultBalance === 'number' ? parsed.vaultBalance : 0,
          rakebackBalance: typeof parsed.rakebackBalance === 'number' ? parsed.rakebackBalance : 0,
          totalPayout: typeof parsed.totalPayout === 'number' ? parsed.totalPayout : 0,
          serverSeed,
          serverSeedHash: sha256Sync(serverSeed),
          seedHistory: Array.isArray(parsed.seedHistory) ? parsed.seedHistory : [],
          gameStats: mergedGameStats,
          settings: mergedSettings,
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : defaults.transactions,
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      }
    } catch (e) {
      console.error('Failed to load session, resetting:', e);
    }
    return this.initializeSession();
  }

  private initializeSession(): UserSession {
    const session = this.createDefaultSession();
    this.saveSession(session);
    return session;
  }

  private saveSessionImmediate() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session));
    } catch (e) {}
  }

  private saveSession(session: UserSession) {
    this.session = session;
    this.saveSessionImmediate();
    this.notify();
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public getVipTier(wagered = this.session.totalWagered): {
    name: string;
    next: string;
    progress: number;
    rakebackRate: number;
  } {
    if (wagered >= 1000000) return { name: 'Diamond', next: 'Max Tier', progress: 100, rakebackRate: 0.02 };
    if (wagered >= 300000)
      return { name: 'Platinum', next: 'Diamond', progress: ((wagered - 300000) / 700000) * 100, rakebackRate: 0.015 };
    if (wagered >= 100000)
      return { name: 'Gold', next: 'Platinum', progress: ((wagered - 100000) / 200000) * 100, rakebackRate: 0.012 };
    if (wagered >= 25000)
      return { name: 'Silver', next: 'Gold', progress: ((wagered - 25000) / 75000) * 100, rakebackRate: 0.01 };
    return { name: 'Bronze', next: 'Silver', progress: (wagered / 25000) * 100, rakebackRate: 0.0075 };
  }

  public rotateSeedPair(newClientSeed?: string): { revealedServerSeed: string; newServerSeedHash: string } {
    const oldServerSeed = this.session.serverSeed;
    const oldHash = this.session.serverSeedHash;
    const oldClient = this.session.clientSeed;
    const oldNonce = this.session.nonce;

    const nextServerSeed = randomHex(32);
    const nextClientSeed = newClientSeed && newClientSeed.trim() ? newClientSeed.trim() : 'maharaja_' + randomHex(8);

    this.session.seedHistory = [
      {
        serverSeed: oldServerSeed,
        serverSeedHash: oldHash,
        clientSeed: oldClient,
        totalBets: oldNonce,
        rotatedAt: Date.now(),
      },
      ...(this.session.seedHistory || []),
    ].slice(0, 20);

    this.session.serverSeed = nextServerSeed;
    this.session.serverSeedHash = sha256Sync(nextServerSeed);
    this.session.clientSeed = nextClientSeed;
    this.session.nonce = 0;
    this.saveSession(this.session);

    return {
      revealedServerSeed: oldServerSeed,
      newServerSeedHash: this.session.serverSeedHash,
    };
  }

  public setClientSeed(seed: string) {
    this.rotateSeedPair(seed);
  }

  public peekNextRandom(offset = 0): number {
    const floats = generateProvablyFairFloats(
      this.session.serverSeed,
      this.session.clientSeed,
      this.session.nonce,
      offset + 1
    );
    const r = floats[offset];
    if (this.session.settings.isRigged) {
      return r * 0.78;
    }
    return r;
  }

  public getNextFloats(count: number): number[] {
    return generateProvablyFairFloats(
      this.session.serverSeed,
      this.session.clientSeed,
      this.session.nonce,
      count
    );
  }

  private logTransaction(type: Transaction['type'], amount: number, method: string, utr?: string) {
    const tx: Transaction = {
      id: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      type,
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      method,
      utr: utr || generateUTR(),
    };
    this.session.transactions = [tx, ...this.session.transactions].slice(0, 100);
    this.saveSession(this.session);
  }

  public deductStake(amount: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > this.session.balance) {
      return false;
    }
    this.session.balance = +(this.session.balance - amount).toFixed(2);
    this.saveSession(this.session);
    return true;
  }

  public settleDeductedBet(
    game: GameType,
    betAmount: number,
    multiplier: number,
    outcome: string,
    resultInput?: number
  ): BetResult {
    const safeMult = isNaN(multiplier) || !isFinite(multiplier) || multiplier < 0 ? 0 : multiplier;
    const payout = +(betAmount * safeMult).toFixed(2);
    const profit = betAmount - payout;

    this.session.settings.globalProfit += profit;
    this.session.balance = +(this.session.balance + payout).toFixed(2);
    this.session.totalWagered += betAmount;
    this.session.totalBets += 1;
    this.session.totalPayout += payout;

    const vip = this.getVipTier(this.session.totalWagered);
    this.session.rakebackBalance = +(this.session.rakebackBalance + betAmount * vip.rakebackRate).toFixed(2);

    if (payout >= betAmount && safeMult > 0) this.session.totalWins++;
    else this.session.totalLosses++;

    if (safeMult > this.session.maxMultiplier) this.session.maxMultiplier = safeMult;

    if (!this.session.gameStats[game]) {
      this.session.gameStats[game] = { bets: 0, wagered: 0, wins: 0, payout: 0 };
    }
    const gs = this.session.gameStats[game];
    gs.bets += 1;
    gs.wagered += betAmount;
    gs.payout += payout;
    if (payout >= betAmount && safeMult > 0) gs.wins += 1;

    const usedNonce = this.session.nonce++;
    const record: BetResult = {
      id: randomHex(10),
      gameType: game,
      betAmount,
      payoutMultiplier: safeMult,
      payoutAmount: payout,
      timestamp: Date.now(),
      outcome,
      balanceAfter: this.session.balance,
      nonce: usedNonce,
      clientSeed: this.session.clientSeed,
      serverSeedHash: this.session.serverSeedHash,
      resultInput: resultInput ?? this.peekNextRandom(),
    };

    const safeHistory = Array.isArray(this.session.history) ? this.session.history : [];
    this.session.history = [record, ...safeHistory].slice(0, 100);
    this.saveSession(this.session);
    return record;
  }

  public placeBet(
    game: GameType | string,
    amount: number,
    multiplierOrResolver: number | ((r: number) => { multiplier: number; outcome: string }),
    outcomeStr?: string
  ): BetResult {
    const nameMap: Record<string, GameType> = {
      'Gold Mines': GameType.MINES,
      'Plinko': GameType.PLINKO,
      'European Roulette': GameType.ROULETTE,
      'Kalyan Matka': GameType.MATKA,
      'Teen Patti Royal': GameType.TEENPATTI,
      'Andar Bahar Live': GameType.ANDARBAHAR,
      'Blackjack 21': GameType.BLACKJACK,
      'Royal Baccarat': GameType.BACCARAT,
      'Maharaja Gold Slots': GameType.SLOTS,
      'Fortune Wheel': GameType.WHEEL,
      'Keno 40': GameType.KENO,
      'Classic Dice': GameType.DICE,
      'Coin Flip': GameType.COINFLIP,
    };
    const resolvedGame: GameType = nameMap[game as string] || (game as GameType);
    const currentSession = this.session;

    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
      return {
        id: 'ERR',
        gameType: resolvedGame,
        betAmount: 0,
        payoutMultiplier: 0,
        payoutAmount: 0,
        timestamp: Date.now(),
        outcome: 'Invalid Bet',
        balanceAfter: currentSession.balance,
        nonce: currentSession.nonce,
        clientSeed: currentSession.clientSeed,
        serverSeedHash: currentSession.serverSeedHash,
        resultInput: 0,
      };
    }

    if (amount > currentSession.balance) {
      return {
        id: 'ERR_BAL',
        gameType: resolvedGame,
        betAmount: 0,
        payoutMultiplier: 0,
        payoutAmount: 0,
        timestamp: Date.now(),
        outcome: 'Insufficient Balance',
        balanceAfter: currentSession.balance,
        nonce: currentSession.nonce,
        clientSeed: currentSession.clientSeed,
        serverSeedHash: currentSession.serverSeedHash,
        resultInput: 0,
      };
    }

    const r = this.peekNextRandom();
    let multiplier = 0;
    let outcome = '';

    try {
      if (typeof multiplierOrResolver === 'function') {
        const res = multiplierOrResolver(r);
        multiplier = res.multiplier;
        outcome = res.outcome;
      } else {
        multiplier = multiplierOrResolver;
        outcome = outcomeStr || (multiplier > 0 ? `Won ${multiplier}×` : 'Lost');
      }
      if (isNaN(multiplier) || !isFinite(multiplier) || multiplier < 0) {
        multiplier = 0;
      }
    } catch (e) {
      console.error('Error calculating bet result:', e);
      multiplier = 0;
      outcome = 'Error';
    }

    this.session.balance = +(this.session.balance - amount).toFixed(2);
    return this.settleDeductedBet(resolvedGame, amount, multiplier, outcome, r);
  }

  public getState() {
    const s = this.session;
    return {
      ...s,
      vipPoints: s.totalWagered,
      stats: {
        totalWagered: s.totalWagered,
        netProfit: s.totalPayout - s.totalWagered,
        highestMultiplier: s.maxMultiplier,
      },
      seeds: {
        serverSeedHash: s.serverSeedHash,
        clientSeed: s.clientSeed,
        nonce: s.nonce,
      },
      history: (s.history || []).map((h) => ({
        ...h,
        game: h.gameType,
        wager: h.betAmount,
        multiplier: h.payoutMultiplier,
        payout: h.payoutAmount,
      })),
    };
  }

  public getProvablyFairRNG(): () => number {
    let offset = 0;
    return () => {
      const val = this.peekNextRandom(offset);
      offset++;
      return val;
    };
  }

  public rotateSeeds(newClientSeed?: string) {
    return this.rotateSeedPair(newClientSeed);
  }

  public resetAccount() {
    this.resetBalance();
  }

  public deposit(amount: number, method = 'UPI Instant (GPay / PhonePe)', utr?: string): string {
    if (amount <= 0 || isNaN(amount)) return '';
    const refUtr = utr || generateUTR();
    this.session.balance = +(this.session.balance + amount).toFixed(2);
    this.logTransaction('DEPOSIT', amount, method, refUtr);
    return refUtr;
  }

  public reloadBalance(amount = 25000): string {
    return this.deposit(amount, 'Instant Wallet Top-Up');
  }

  public withdraw(amount: number, method = 'IMPS / UPI Instant Payout'): { ok: boolean; utr: string } {
    if (amount <= 0 || isNaN(amount) || amount > this.session.balance) return { ok: false, utr: '' };
    const refUtr = generateUTR();
    this.session.balance = +(this.session.balance - amount).toFixed(2);
    this.logTransaction('WITHDRAW', amount, method, refUtr);
    return { ok: true, utr: refUtr };
  }

  public transferToVault(amount: number): boolean {
    if (amount <= 0 || isNaN(amount) || amount > this.session.balance) return false;
    this.session.balance = +(this.session.balance - amount).toFixed(2);
    this.session.vaultBalance = +(this.session.vaultBalance + amount).toFixed(2);
    this.logTransaction('VAULT_DEPOSIT', amount, 'Vault Deposit');
    return true;
  }

  public withdrawFromVault(amount: number): boolean {
    if (amount <= 0 || isNaN(amount) || amount > this.session.vaultBalance) return false;
    this.session.vaultBalance = +(this.session.vaultBalance - amount).toFixed(2);
    this.session.balance = +(this.session.balance + amount).toFixed(2);
    this.logTransaction('VAULT_WITHDRAW', amount, 'Vault Withdrawal');
    return true;
  }

  public updateBalance(a: number) {
    this.session.balance = Math.max(0, +(this.session.balance + a).toFixed(2));
    this.saveSession(this.session);
  }

  public claimRakeback(): number {
    const amount = +this.session.rakebackBalance.toFixed(2);
    if (amount > 0) {
      this.session.balance = +(this.session.balance + amount).toFixed(2);
      this.session.rakebackBalance = 0;
      this.logTransaction('RAKEBACK', amount, 'VIP Rakeback Claim');
    }
    return amount;
  }

  public clearSessionStats() {
    Object.values(GameType).forEach((g) => {
      this.session.gameStats[g] = { bets: 0, wagered: 0, wins: 0, payout: 0 };
    });
    this.session.totalBets = 0;
    this.session.totalWagered = 0;
    this.session.totalPayout = 0;
    this.session.totalWins = 0;
    this.session.totalLosses = 0;
    this.session.maxMultiplier = 0;
    this.session.history = [];
    this.session.startBalance = this.session.balance;
    this.saveSession(this.session);
  }

  public getLeaderboard(): LeaderboardEntry[] {
    const playerProfit = this.session.totalPayout - this.session.totalWagered;
    const vip = this.getVipTier(this.session.totalWagered);
    return [
      ...BOTS,
      {
        username: this.session.username,
        wagered: this.session.totalWagered,
        profit: playerProfit,
        maxMultiplier: this.session.maxMultiplier,
        vipTier: vip.name,
        city: 'India',
        isPlayer: true,
      },
    ].sort((a, b) => b.wagered - a.wagered);
  }

  public getCrashPoint(r: number): number {
    if (this.session.settings.isRigged && r > 0.35) {
      return +(1.0 + (r % 0.45)).toFixed(2);
    }
    const houseEdge = this.session.settings.houseEdgeOverrides[GameType.CRASH] ?? 0.01;
    if (r < houseEdge) return 1.0;
    const raw = (1 - houseEdge) / (1 - r);
    return Math.min(10000, Math.max(1.0, +raw.toFixed(2)));
  }

  public getSattaMatkaResult(r: number) {
    const floats = this.getNextFloats(6);
    const sortDigit = (n: number) => (n === 0 ? 10 : n);

    const o1 = Math.floor(((r + floats[0]) % 1) * 10);
    const o2 = Math.floor(((r * 3.7 + floats[1]) % 1) * 10);
    const o3 = Math.floor(((r * 7.3 + floats[2]) % 1) * 10);
    const openSorted = [o1, o2, o3].sort((a, b) => sortDigit(a) - sortDigit(b));
    const openAnk = (o1 + o2 + o3) % 10;

    const c1 = Math.floor(((r * 5.1 + floats[3]) % 1) * 10);
    const c2 = Math.floor(((r * 8.9 + floats[4]) % 1) * 10);
    const c3 = Math.floor(((r * 2.3 + floats[5]) % 1) * 10);
    const closeSorted = [c1, c2, c3].sort((a, b) => sortDigit(a) - sortDigit(b));
    const closeAnk = (c1 + c2 + c3) % 10;

    const uniqueDigits = new Set(openSorted).size;
    const pannaType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' =
      uniqueDigits === 1 ? 'TRIPLE' : uniqueDigits === 2 ? 'DOUBLE' : 'SINGLE';

    return {
      cards: `${openSorted[0]}${openSorted[1]}${openSorted[2]}`,
      closeCards: `${closeSorted[0]}${closeSorted[1]}${closeSorted[2]}`,
      single: openAnk,
      closeAnk,
      jodi: `${openAnk}${closeAnk}`,
      pannaType,
      digits: openSorted,
    };
  }

  public resetBalance() {
    this.session.balance = DAILY_ALLOWANCE;
    this.logTransaction('BAILOUT', DAILY_ALLOWANCE, 'Demo Balance Refill');
    this.saveSession(this.session);
  }

  public hardReset() {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    this.session = this.initializeSession();
    this.notify();
  }

  public toggleAdmin() {
    this.session.isAdmin = !this.session.isAdmin;
    this.saveSession(this.session);
  }

  public updateAdminSettings(settings: Partial<AdminSettings>) {
    this.session.settings = { ...this.session.settings, ...settings };
    this.saveSession(this.session);
  }
}

export const engine = new SimulationEngine();
export const gameEngine = engine;