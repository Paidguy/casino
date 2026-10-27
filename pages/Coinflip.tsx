import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck } from 'lucide-react';

export const Coinflip: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [choice, setChoice] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const [outcome, setOutcome] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [streak, setStreak] = useState<number>(0);

  const flipCoin = () => {
    const state = gameEngine.getState();
    if (flipping || bet <= 0 || bet > state.balance) return;

    sound.click();
    setFlipping(true);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    setTimeout(() => {
      const res: 'HEADS' | 'TAILS' = rng() > 0.5 ? 'HEADS' : 'TAILS';
      setOutcome(res);
      const won = res === choice;

      gameEngine.placeBet('Coin Flip', bet, won ? 1.98 : 0);
      if (won) {
        sound.win();
        setStreak((s) => s + 1);
      } else {
        sound.lose();
        setStreak(0);
      }
      setFlipping(false);
    }, 500);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Coin Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['HEADS', 'TAILS'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setChoice(side)}
                className={`py-3 rounded-xl font-black text-xs uppercase border transition-all ${
                  choice === side
                    ? 'bg-amber-500 text-slate-950 border-white shadow'
                    : 'bg-[#151f30] text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                {side === 'HEADS' ? '👑 Heads (Sun)' : '💎 Tails (Moon)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-emerald-400">1.98× Payout</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={flipping}
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
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={flipCoin}
            disabled={flipping}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {flipping ? 'Flipping Coin...' : `Flip Coin (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 50/50 Instant Coin Flip
          </span>
          <span className="font-mono text-amber-400">Win Streak: {streak}</span>
        </div>
      </div>

      {/* Main Coinflip Stage */}
      <div className="flex-1 bg-[#0d1422] p-8 flex flex-col items-center justify-center gap-6">
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] transition-transform duration-500 ${
            flipping ? 'rotate-y-180 scale-110 animate-spin' : ''
          } ${
            outcome === 'HEADS'
              ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-amber-200 text-slate-950'
              : 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-white text-slate-950'
          }`}
        >
          <span className="text-5xl sm:text-6xl">{outcome === 'HEADS' ? '👑' : '💎'}</span>
          <span className="text-base font-black uppercase tracking-widest mt-2">{outcome}</span>
        </div>

        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected: <span className="text-amber-400">{choice}</span> · Potential Payout:{' '}
            <span className="text-emerald-400 font-mono">
              ₹{Math.floor(bet * 1.98).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};