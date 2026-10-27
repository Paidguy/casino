import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SymbolDef {
  id: string;
  label: string;
  badge: string;
  mult3: number;
  color: string;
}

const SYMBOLS: SymbolDef[] = [
  { id: 'CROWN', label: 'Royal Crown', badge: '👑', mult3: 50, color: 'from-amber-400 to-yellow-600 text-slate-950' },
  { id: 'SEVEN', label: 'Lucky 777', badge: '777', mult3: 25, color: 'from-rose-500 to-red-700 text-white' },
  { id: 'DIAMOND', label: 'Kohinoor Gem', badge: '💎', mult3: 15, color: 'from-cyan-400 to-blue-600 text-white' },
  { id: 'TIGER', label: 'Bengal Tiger', badge: '🐯', mult3: 10, color: 'from-orange-400 to-amber-700 text-white' },
  { id: 'LOTUS', label: 'Golden Lotus', badge: '🪷', mult3: 5, color: 'from-emerald-400 to-teal-700 text-white' },
];

export const Slots: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<SymbolDef[][]>([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[1]],
  ]);
  const [winInfo, setWinInfo] = useState<{ payout: number; mult: number; lines: number } | null>(
    null
  );

  const spinReels = () => {
    const state = gameEngine.getState();
    if (spinning || bet <= 0 || bet > state.balance) return;

    sound.click();
    setSpinning(true);
    setWinInfo(null);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    const pick = () => SYMBOLS[Math.floor(rng() * SYMBOLS.length)];

    setTimeout(() => {
      const nextGrid = [
        [pick(), pick(), pick()],
        [pick(), pick(), pick()],
        [pick(), pick(), pick()],
      ];
      setGrid(nextGrid);

      let totalMult = 0;
      let winningLines = 0;

      // Check 3 horizontal rows + 2 diagonals
      const lines = [
        [nextGrid[0][0], nextGrid[0][1], nextGrid[0][2]],
        [nextGrid[1][0], nextGrid[1][1], nextGrid[1][2]],
        [nextGrid[2][0], nextGrid[2][1], nextGrid[2][2]],
        [nextGrid[0][0], nextGrid[1][1], nextGrid[2][2]],
        [nextGrid[2][0], nextGrid[1][1], nextGrid[0][2]],
      ];

      lines.forEach((line) => {
        if (line[0].id === line[1].id && line[1].id === line[2].id) {
          totalMult += line[0].mult3;
          winningLines++;
        } else if (line[0].id === line[1].id || line[1].id === line[2].id) {
          totalMult += 0.5;
        }
      });

      totalMult = Number(totalMult.toFixed(2));
      const payout = Math.floor(bet * totalMult);

      gameEngine.placeBet('Maharaja Gold Slots', bet, totalMult);
      if (totalMult >= 1) sound.win();
      else sound.lose();

      setWinInfo({ payout, mult: totalMult, lines: winningLines });
      setSpinning(false);
    }, 550);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Total Spin Bet (₹)</span>
            <span className="font-mono text-slate-300">5 Paylines Active</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={spinning}
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

        {/* Paytable */}
        <div className="bg-[#151f30] rounded-xl border border-white/10 p-3.5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 3-of-a-Kind Paytable
          </div>
          {SYMBOLS.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-200 flex items-center gap-2">
                <span>{s.badge}</span> {s.label}
              </span>
              <span className="font-mono font-bold text-amber-400">{s.mult3}×</span>
            </div>
          ))}
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={spinReels}
            disabled={spinning}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {spinning ? 'Spinning Reels...' : `Spin Reels (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 3×3 Grid · 5 Paylines
          </span>
        </div>
      </div>

      {/* Main Slots Stage */}
      <div className="flex-1 royal-surface p-6 sm:p-8 flex flex-col items-center justify-between">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Maharaja Gold 3×3 Reels
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            Match 3 Symbols Horizontally or Diagonally
          </h2>
        </div>

        {/* 3x3 Slot Cabinet */}
        <div className="my-auto p-4 sm:p-6 rounded-3xl bg-[#090d16] border-4 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.2)] w-full max-w-[440px]">
          <div className="grid grid-cols-3 gap-3">
            {grid.map((row, rIdx) =>
              row.map((sym, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`aspect-square rounded-2xl bg-[#151f30] border-2 ${
                    rIdx === 1 ? 'border-amber-400/60' : 'border-white/10'
                  } flex flex-col items-center justify-center p-2 transition-transform duration-200 ${
                    spinning ? 'animate-pulse scale-95' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${sym.color} flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg`}
                  >
                    {sym.badge}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 mt-1.5 text-center leading-tight">
                    {sym.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Win Readout */}
        <div className="h-14 flex items-center justify-center">
          {winInfo && winInfo.payout > 0 ? (
            <div className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-black text-lg">
              WON +₹{winInfo.payout.toLocaleString('en-IN')} ({winInfo.mult}×)
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Center row & diagonal matches pay instant multipliers up to 250×
            </div>
          )}
        </div>
      </div>
    </div>
  );
};