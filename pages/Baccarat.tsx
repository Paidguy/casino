import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck } from 'lucide-react';

interface Card {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  val: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const RANKS = [
  { rank: 'A', val: 1 },
  { rank: '2', val: 2 },
  { rank: '3', val: 3 },
  { rank: '4', val: 4 },
  { rank: '5', val: 5 },
  { rank: '6', val: 6 },
  { rank: '7', val: 7 },
  { rank: '8', val: 8 },
  { rank: '9', val: 9 },
  { rank: '10', val: 0 },
  { rank: 'J', val: 0 },
  { rank: 'Q', val: 0 },
  { rank: 'K', val: 0 },
];

export const Baccarat: React.FC = () => {
  const [bet, setBet] = useState<number>(200);
  const [selection, setSelection] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [dealing, setDealing] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([
    { rank: '8', suit: '♠', val: 8 },
    { rank: 'A', suit: '♦', val: 1 },
  ]);
  const [bankerHand, setBankerHand] = useState<Card[]>([
    { rank: 'K', suit: '♥', val: 0 },
    { rank: '7', suit: '♣', val: 7 },
  ]);
  const [roadHistory, setRoadHistory] = useState<('P' | 'B' | 'T')[]>([
    'P', 'B', 'B', 'P', 'T', 'B', 'P', 'P', 'B', 'P', 'B', 'B',
  ]);
  const [lastResult, setLastResult] = useState<{
    winner: 'PLAYER' | 'BANKER' | 'TIE';
    payout: number;
  } | null>(null);

  const baccScore = (cards: Card[]) => cards.reduce((s, c) => s + c.val, 0) % 10;

  const dealHand = () => {
    const state = gameEngine.getState();
    if (dealing || bet <= 0 || bet > state.balance) return;

    sound.card();
    setDealing(true);
    setLastResult(null);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    const drawCard = (): Card => {
      const rk = RANKS[Math.floor(rng() * RANKS.length)];
      const suit = SUITS[Math.floor(rng() * SUITS.length)];
      return { ...rk, suit };
    };

    setTimeout(() => {
      const p = [drawCard(), drawCard()];
      const b = [drawCard(), drawCard()];

      let pScore = baccScore(p);
      let bScore = baccScore(b);

      if (pScore < 8 && bScore < 8) {
        if (pScore <= 5) p.push(drawCard());
        if (bScore <= 5) b.push(drawCard());
      }

      pScore = baccScore(p);
      bScore = baccScore(b);

      const winner: 'PLAYER' | 'BANKER' | 'TIE' =
        pScore > bScore ? 'PLAYER' : bScore > pScore ? 'BANKER' : 'TIE';

      setPlayerHand(p);
      setBankerHand(b);
      setRoadHistory((prev) => [...prev.slice(-15), winner === 'PLAYER' ? 'P' : winner === 'BANKER' ? 'B' : 'T']);

      let mult = 0;
      if (selection === winner) {
        mult = winner === 'PLAYER' ? 2.0 : winner === 'BANKER' ? 1.95 : 9.0;
      } else if (winner === 'TIE') {
        mult = 1.0; // Push on tie for Player/Banker bets
      }

      gameEngine.placeBet('Royal Baccarat', bet, mult);
      if (mult > 1) sound.win();
      else if (mult === 0) sound.lose();

      setLastResult({
        winner,
        payout: Math.floor(bet * mult),
      });
      setDealing(false);
    }, 550);
  };

  const renderCard = (c: Card) => {
    const isRed = c.suit === '♥' || c.suit === '♦';
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white border-2 border-slate-200 shadow-xl p-2.5 flex flex-col justify-between">
        <div className={`text-sm font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          <div>{c.rank}</div>
          <div>{c.suit}</div>
        </div>
        <div className={`text-2xl sm:text-3xl self-center ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.suit}
        </div>
        <div className={`text-xs font-bold self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.rank}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Bet Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Bet Outcome
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'PLAYER', label: 'Player', sub: '2.00×', color: 'border-sky-400 bg-sky-500/20' },
              { id: 'TIE', label: 'Tie', sub: '9.00×', color: 'border-emerald-400 bg-emerald-500/20' },
              { id: 'BANKER', label: 'Banker', sub: '1.95×', color: 'border-rose-400 bg-rose-500/20' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelection(opt.id as 'PLAYER' | 'BANKER' | 'TIE')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selection === opt.id
                    ? `${opt.color} text-white shadow`
                    : 'bg-[#151f30] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-black uppercase">{opt.label}</div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-slate-300">₹{bet.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={dealing}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300"
              >
                ½
              </button>
              <button
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300"
              >
                2×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={dealHand}
            disabled={dealing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {dealing
              ? 'Dealing Punto Banco...'
              : `Deal ${selection} (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tie Pushes Player/Banker Bets
          </span>
        </div>
      </div>

      {/* Main Baccarat Stage */}
      <div className="flex-1 felt-surface p-6 sm:p-8 flex flex-col justify-between gap-6">
        {/* Bead Road History Strip */}
        <div className="bg-[#0b111e]/85 border border-white/10 px-4 py-3 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Shoe Bead Road
          </span>
          <div className="flex items-center gap-1.5">
            {roadHistory.map((item, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full font-mono font-black text-[11px] flex items-center justify-center border ${
                  item === 'P'
                    ? 'bg-sky-500 text-white border-sky-300'
                    : item === 'B'
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-emerald-500 text-slate-950 border-emerald-300'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Player vs Banker Hands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
          {/* Player Side */}
          <div className="bg-[#0b111e]/75 border border-sky-500/30 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-black uppercase tracking-wider text-sky-400">
                Player Hand
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 font-mono font-black text-base text-white">
                {baccScore(playerHand)}
              </span>
            </div>
            <div className="flex gap-3">
              {playerHand.map((c, idx) => (
                <div key={idx}>{renderCard(c)}</div>
              ))}
            </div>
          </div>

          {/* Banker Side */}
          <div className="bg-[#0b111e]/75 border border-rose-500/30 rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-black uppercase tracking-wider text-rose-400">
                Banker Hand
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 font-mono font-black text-base text-white">
                {baccScore(bankerHand)}
              </span>
            </div>
            <div className="flex gap-3">
              {bankerHand.map((c, idx) => (
                <div key={idx}>{renderCard(c)}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Banner */}
        <div className="h-14 flex items-center justify-center">
          {lastResult ? (
            <div
              className={`px-6 py-2.5 rounded-xl border text-center ${
                lastResult.payout > bet
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : lastResult.payout === bet
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <span className="font-black uppercase text-sm mr-3">
                {lastResult.winner} WINS!
              </span>
              <span className="font-mono font-bold text-white">
                {lastResult.payout > 0
                  ? `Payout: ₹${lastResult.payout.toLocaleString('en-IN')}`
                  : 'No Return'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Closest hand total to 9 wins · Natural 8 or 9 stands immediately
            </div>
          )}
        </div>
      </div>
    </div>
  );
};