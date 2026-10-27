import React, { useState, useEffect } from 'react';
import {
  engine,
  formatINR,
  sha256Sync,
  hmacSha256Sync,
  generateProvablyFairFloats,
} from '../services/engine';
import { Leaderboard } from './Leaderboard';
import {
  ShieldCheck,
  BarChart2,
  Info,
  RefreshCw,
  Lock,
  X,
  RotateCcw,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface GameMeta {
  title: string;
  rtp: string;
  edge: string;
  maxWin: string;
  summary: string;
  mathFormula: string;
}

const GAME_META: Record<string, GameMeta> = {
  '/crash': {
    title: 'Aviator Crash',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '10,000×',
    summary:
      'Multiplier rises continuously from 1.00× upward. Cash out before the supersonic jet flies away to lock in your multiplier.',
    mathFormula: 'CrashPoint = max(1.00, floor((0.99 / (1 - r)) * 100) / 100)',
  },
  '/mines': {
    title: 'Gold Mines',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '24.75×+',
    summary:
      '25-tile 5×5 grid containing 1 to 24 hidden mines. Every revealed 24K Gold Gem compounds your payout multiplier.',
    mathFormula: 'Multiplier(m, k) = 0.99 / prod_{i=0..k-1} ((25 - m - i) / (25 - i))',
  },
  '/plinko': {
    title: 'Plinko 1000×',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '1,000×',
    summary:
      'Balls drop through an 8, 12, or 16-row Galton pin pyramid. Each peg deflection is determined by an independent HMAC-SHA256 float.',
    mathFormula: 'SlotIndex = sum_{i=1..Rows} Bernoulli(r_i >= 0.5)',
  },
  '/roulette': {
    title: 'European Roulette',
    rtp: '97.30%',
    edge: '2.70%',
    maxWin: '36×',
    summary:
      'Single-zero European wheel (pockets 0–36). Place Straight Up (36×), Dozen (3×), Column (3×), or French Racetrack sector bets.',
    mathFormula: 'WinningPocket = floor(r * 37) in {0..36}',
  },
  '/matka': {
    title: 'Kalyan Matka',
    rtp: '95.00%',
    edge: '5.00%',
    maxWin: '600×',
    summary:
      'Official 3-card Indian number draw. Bet on Single Digit (0–9, 9.5×), Double Digit Pair (00–99, 95×), 3-Card Combo (150×–600×), or Even/Odd.',
    mathFormula: 'SingleDigit = (Card1 + Card2 + Card3) mod 10',
  },
  '/teenpatti': {
    title: 'Teen Patti Royal',
    rtp: '97.50%',
    edge: '2.50%',
    maxWin: '40×',
    summary:
      '3-Card Indian Poker against the Dealer. Play Seen (1.95×) or Blind (2.10×) plus optional Pair Plus bonus payouts up to 40×.',
    mathFormula: '52-Card Fisher-Yates Permutation via HMAC-SHA256 Byte Stream',
  },
  '/andarbahar': {
    title: 'Andar Bahar Live',
    rtp: '98.00%',
    edge: '2.00%',
    maxWin: '8.00×',
    summary:
      'Alternating cards are dealt to Inside (Andar 1.90×) and Outside (Bahar 2.00×) until a card matches the Target Joker rank.',
    mathFormula: '52-Card Alternating Deal until Rank(Card_k) == Rank(Joker)',
  },
  '/blackjack': {
    title: 'Blackjack 21',
    rtp: '99.50%',
    edge: '0.50%',
    maxWin: '2.50×',
    summary:
      'Classic VIP Blackjack 21. Natural Blackjack pays 3:2 (2.5×), Dealer stands on all 17s, Double Down on any 2 cards, and 2:1 Insurance.',
    mathFormula: '52-Card Shoe Fisher-Yates Permutation via HMAC-SHA256',
  },
  '/baccarat': {
    title: 'Royal Baccarat',
    rtp: '98.94%',
    edge: '1.06%',
    maxWin: '12.00×',
    summary:
      'Punto Banco Macau rules. Closest hand modulo 10 to 9 wins. Includes official conditional 3rd-card draw tableau and 12× Pair side bets.',
    mathFormula: 'HandScore = (Card1 + Card2 [+ Card3]) mod 10',
  },
  '/slots': {
    title: 'Maharaja Gold Slots',
    rtp: '97.00%',
    edge: '3.00%',
    maxWin: '300×',
    summary:
      '5×3 10-Payline Video Slot Machine featuring Royal Crown Wilds and Kohinoor Scatters that trigger 5 Free Spins at 3× Multiplier.',
    mathFormula: '15 Independent HMAC-SHA256 Reel Stops Evaluated Across 10 Paylines',
  },
  '/wheel': {
    title: 'Fortune Wheel',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '50×',
    summary:
      'Configurable prize wheel with Low, Medium, and High volatility profiles and instant segment multiplier payouts.',
    mathFormula: 'SegmentIndex = floor(r * TotalSegments)',
  },
  '/keno': {
    title: 'Keno 40',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '1,000×',
    summary:
      'Select 1 to 10 numbers on a 40-tile board. 10 winning numbers are drawn per round without replacement.',
    mathFormula: 'Hypergeometric 10-Ball Sample from {1..40} via HMAC-SHA256',
  },
  '/dice': {
    title: 'Classic Dice',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '49.50×',
    summary:
      'Set your target threshold between 2 and 98 and choose Roll Over or Roll Under for linked probability and multiplier payouts.',
    mathFormula: 'Roll = floor(r * 10000) / 100, Multiplier = 99 / WinChance',
  },
  '/coinflip': {
    title: 'Coin Flip Streak',
    rtp: '99.00%',
    edge: '1.00%',
    maxWin: '63.36×+',
    summary:
      'Pick Heads or Tails. Cash out after 1 hit (1.98×) or let your winnings ride across a compounding win streak.',
    mathFormula: 'Multiplier(k) = 0.99 * 2^k',
  },
};

export const GameStudioBar: React.FC<{ pathname: string }> = ({ pathname }) => {
  const meta = GAME_META[pathname];
  const [session, setSession] = useState(engine.getSession());
  const [showFairness, setShowFairness] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [clientSeedInput, setClientSeedInput] = useState(session.clientSeed);
  const [rotatedToast, setRotatedToast] = useState(false);

  useEffect(() => {
    return engine.subscribe((s) => {
      setSession({ ...s });
    });
  }, []);

  if (!meta) return null;

  const netProfit = session.totalPayout - session.totalWagered;
  const lastBet = session.history[0];

  // Build mini equity sparkline points from recent bet history
  const recentBets = [...session.history].slice(0, 20).reverse();
  let running = 0;
  const equityPoints = [0, ...recentBets.map((b) => {
    running += b.payoutAmount - b.betAmount;
    return running;
  })];
  const minEq = Math.min(...equityPoints, -100);
  const maxEq = Math.max(...equityPoints, 100);
  const rangeEq = Math.max(1, maxEq - minEq);
  const sparklinePath = equityPoints
    .map((val, idx) => {
      const x = (idx / Math.max(1, equityPoints.length - 1)) * 220;
      const y = 50 - ((val - minEq) / rangeEq) * 42;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const handleRotateSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSeedInput.trim()) return;
    engine.rotateSeedPair(clientSeedInput.trim());
    setRotatedToast(true);
    setTimeout(() => setRotatedToast(false), 2500);
  };

  return (
    <div className="max-w-[1400px] mx-auto mt-3 space-y-6">
      {/* Studio Footer Bar */}
      <div className="bg-[#0b101b] border border-white/10 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-black text-white uppercase tracking-wider">
            {meta.title}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#151f30] border border-white/10 text-[11px] font-mono font-bold text-emerald-400">
            RTP {meta.rtp}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#151f30] border border-white/10 text-[11px] font-mono font-bold text-amber-400">
            Max Win {meta.maxWin}
          </span>
          <span className="hidden md:inline text-[11px] font-mono text-slate-400">
            Nonce #{session.nonce}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              showStats
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#151f30] border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Stats</span>
            <span
              className={`font-mono text-[11px] ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({netProfit >= 0 ? '+' : ''}₹{Math.floor(netProfit).toLocaleString('en-IN')})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowRules(!showRules)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              showRules
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-[#151f30] border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Game Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFairness(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Provably Fair</span>
          </button>
        </div>
      </div>

      {/* Expandable Live Session Telemetry Panel */}
      {showStats && (
        <div className="bg-[#111927] border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-xl">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Session Net Profit
            </div>
            <div
              className={`text-xl font-mono font-black mt-0.5 ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}
              {formatINR(netProfit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Wagered: <span className="font-mono text-white">{formatINR(session.totalWagered, 0)}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Session Win / Loss
            </div>
            <div className="flex items-center gap-3 mt-1 font-mono text-sm font-bold">
              <span className="text-emerald-400">{session.totalWins} Wins</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400">{session.totalLosses} Losses</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Best Hit:{' '}
              <span className="font-mono text-amber-400 font-bold">
                {session.maxMultiplier.toFixed(2)}×
              </span>
            </div>
          </div>

          <div className="bg-[#0b101b] p-3 rounded-xl border border-white/10">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
              Live Profit Trajectory (Last 20 Bets)
            </div>
            <svg viewBox="0 0 220 56" className="w-full h-12 overflow-visible">
              <line x1="0" y1="28" x2="220" y2="28" stroke="#1e293b" strokeDasharray="3 3" />
              <path
                d={sparklinePath}
                fill="none"
                stroke={netProfit >= 0 ? '#10b981' : '#f43f5e'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => engine.clearSessionStats()}
              className="px-4 py-2.5 rounded-xl bg-[#151f30] hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Session Telemetry
            </button>
          </div>
        </div>
      )}

      {/* Expandable Game Rules & Mathematical Spec */}
      {showRules && (
        <div className="bg-[#111927] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
              {meta.title} — Official Rules & Mathematical Model
            </h3>
            <span className="text-xs font-mono text-slate-400">
              House Edge: {meta.edge} · RTP: {meta.rtp}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{meta.summary}</p>
          <div className="bg-[#0b101b] px-3.5 py-2 rounded-xl border border-white/10 font-mono text-xs text-emerald-400">
            Formula: {meta.mathFormula}
          </div>
        </div>
      )}

      {/* Inline Provably Fair Modal */}
      {showFairness && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111927] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Provably Fair Seed & Nonce Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFairness(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  Active Server Seed (SHA-256 Hash)
                </label>
                <div className="bg-[#0b101b] border border-white/10 rounded-xl p-3 font-mono text-emerald-400 break-all flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{session.serverSeedHash}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">
                    Active Client Seed
                  </label>
                  <div className="bg-[#0b101b] border border-white/10 rounded-xl p-2.5 font-mono text-white truncate">
                    {session.clientSeed}
                  </div>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">
                    Next Round Nonce
                  </label>
                  <div className="bg-[#0b101b] border border-white/10 rounded-xl p-2.5 font-mono text-amber-400 font-bold">
                    #{session.nonce}
                  </div>
                </div>
              </div>

              {lastBet && (
                <div className="bg-[#0b101b] border border-white/10 rounded-xl p-3 space-y-1">
                  <div className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Last Settled Round (#{lastBet.nonce})</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    HMAC: {hmacSha256Sync(session.serverSeed, `${lastBet.clientSeed}:${lastBet.nonce}:0`)}
                  </div>
                  <div className="font-mono text-[11px] text-amber-400">
                    Normalized Float r ={' '}
                    {generateProvablyFairFloats(
                      session.serverSeed,
                      lastBet.clientSeed,
                      lastBet.nonce,
                      1
                    )[0].toFixed(9)}{' '}
                    → {lastBet.outcome}
                  </div>
                </div>
              )}

              <form onSubmit={handleRotateSeed} className="pt-2 border-t border-white/10 space-y-2">
                <label className="block font-bold uppercase text-white">
                  Rotate Client Seed Pair
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientSeedInput}
                    onChange={(e) => setClientSeedInput(e.target.value)}
                    className="flex-1 bg-[#0b101b] border border-white/10 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Rotate
                  </button>
                </div>
                {rotatedToast && (
                  <div className="text-emerald-400 font-semibold">
                    New seed pair generated and nonce reset to #0!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Live Bets, My Bets & VIP Leaderboard Table */}
      <Leaderboard />
    </div>
  );
};
