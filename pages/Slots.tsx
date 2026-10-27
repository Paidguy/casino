import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface SymbolDef {
  id: string;
  label: string;
  badge: string;
  mult3: number;
  mult4: number;
  mult5: number;
  color: string;
  isWild?: boolean;
  isScatter?: boolean;
}

const SYMBOLS: SymbolDef[] = [
  {
    id: 'WILD',
    label: 'Royal Crown (Wild)',
    badge: '👑',
    mult3: 5,
    mult4: 20,
    mult5: 100,
    color: 'from-amber-400 to-yellow-600 text-slate-950',
    isWild: true,
  },
  {
    id: 'SCATTER',
    label: 'Kohinoor Scatter',
    badge: '💎',
    mult3: 3,
    mult4: 15,
    mult5: 50,
    color: 'from-cyan-400 to-blue-600 text-white',
    isScatter: true,
  },
  {
    id: 'SEVEN',
    label: 'Lucky 777',
    badge: '777',
    mult3: 3,
    mult4: 10,
    mult5: 40,
    color: 'from-rose-500 to-red-700 text-white',
  },
  {
    id: 'TIGER',
    label: 'Bengal Tiger',
    badge: '🐯',
    mult3: 2,
    mult4: 6,
    mult5: 25,
    color: 'from-orange-400 to-amber-700 text-white',
  },
  {
    id: 'ELEPHANT',
    label: 'Royal Gajraj',
    badge: '🐘',
    mult3: 1.5,
    mult4: 4,
    mult5: 15,
    color: 'from-purple-500 to-indigo-700 text-white',
  },
  {
    id: 'LOTUS',
    label: 'Golden Lotus',
    badge: '🪷',
    mult3: 1,
    mult4: 2.5,
    mult5: 10,
    color: 'from-emerald-400 to-teal-700 text-white',
  },
];

// 10 Standard 5-Reel Paylines (row indices 0..2 across columns 0..4)
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Middle horizontal
  [0, 0, 0, 0, 0], // Line 2: Top horizontal
  [2, 2, 2, 2, 2], // Line 3: Bottom horizontal
  [0, 1, 2, 1, 0], // Line 4: V-shape
  [2, 1, 0, 1, 2], // Line 5: Inverted V
  [0, 0, 1, 2, 2], // Line 6: Step down
  [2, 2, 1, 0, 0], // Line 7: Step up
  [1, 0, 0, 0, 1], // Line 8: Top arch
  [1, 2, 2, 2, 1], // Line 9: Bottom arch
  [0, 1, 1, 1, 0], // Line 10: Shallow V
];

export const Slots: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  // 3 rows x 5 columns
  const [grid, setGrid] = useState<SymbolDef[][]>([
    [SYMBOLS[2], SYMBOLS[3], SYMBOLS[0], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[0], SYMBOLS[0], SYMBOLS[0], SYMBOLS[2], SYMBOLS[1]],
    [SYMBOLS[5], SYMBOLS[1], SYMBOLS[4], SYMBOLS[3], SYMBOLS[2]],
  ]);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [winInfo, setWinInfo] = useState<{
    payout: number;
    mult: number;
    linesWon: number;
    triggeredFreeSpins: boolean;
  } | null>(null);

  const spinReels = () => {
    const state = gameEngine.getState();
    const isFreeSpin = freeSpinsLeft > 0;
    if (spinning || (!isFreeSpin && (bet <= 0 || bet > state.balance))) return;

    sound.click();
    setSpinning(true);
    setWinningCells(new Set());
    setWinInfo(null);

    if (isFreeSpin) {
      setFreeSpinsLeft((prev) => prev - 1);
    }

    const floats = gameEngine.getNextFloats(15);
    const pick = (f: number) => SYMBOLS[Math.floor(f * SYMBOLS.length)];

    setTimeout(() => {
      const nextGrid: SymbolDef[][] = [
        [pick(floats[0]), pick(floats[1]), pick(floats[2]), pick(floats[3]), pick(floats[4])],
        [pick(floats[5]), pick(floats[6]), pick(floats[7]), pick(floats[8]), pick(floats[9])],
        [pick(floats[10]), pick(floats[11]), pick(floats[12]), pick(floats[13]), pick(floats[14])],
      ];
      setGrid(nextGrid);

      let totalMult = 0;
      let linesWon = 0;
      const winCellKeys = new Set<string>();

      // Evaluate 10 Paylines left-to-right with Wild substitution
      PAYLINES.forEach((line) => {
        const lineSyms = line.map((r, c) => nextGrid[r][c]);
        const baseSym = lineSyms.find((s) => !s.isWild && !s.isScatter) || lineSyms[0];
        if (baseSym.isScatter) return;

        let matchLen = 0;
        for (let c = 0; c < 5; c++) {
          const s = lineSyms[c];
          if (s.id === baseSym.id || s.isWild) {
            matchLen++;
          } else {
            break;
          }
        }

        if (matchLen >= 3) {
          const lineMult =
            matchLen === 5 ? baseSym.mult5 : matchLen === 4 ? baseSym.mult4 : baseSym.mult3;
          totalMult += lineMult;
          linesWon++;
          for (let c = 0; c < matchLen; c++) {
            winCellKeys.add(`${line[c]}-${c}`);
          }
        }
      });

      // Evaluate Scatters anywhere on the 5x3 grid
      let scatterCount = 0;
      const scatterKeys: string[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          if (nextGrid[r][c].isScatter) {
            scatterCount++;
            scatterKeys.push(`${r}-${c}`);
          }
        }
      }

      let triggeredFreeSpins = false;
      if (scatterCount >= 3) {
        triggeredFreeSpins = true;
        setFreeSpinsLeft((prev) => prev + 5);
        totalMult += scatterCount === 3 ? 3 : scatterCount === 4 ? 15 : 50;
        scatterKeys.forEach((k) => winCellKeys.add(k));
      }

      if (isFreeSpin) {
        totalMult *= 3; // 3x Free Spin Multiplier!
      }

      totalMult = Number(totalMult.toFixed(2));
      const payout = Math.floor(bet * totalMult);

      gameEngine.placeBet(
        'Maharaja Gold Slots',
        isFreeSpin ? 0.01 : bet,
        isFreeSpin ? totalMult * bet * 100 : totalMult
      );

      if (totalMult > 0) sound.win();
      else sound.lose();

      setWinningCells(winCellKeys);
      setWinInfo({ payout, mult: totalMult, linesWon, triggeredFreeSpins });
      setSpinning(false);
    }, 480);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Total Spin Bet (₹)</span>
            <span className="font-mono text-amber-400">5×3 · 10 Paylines</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={spinning || freeSpinsLeft > 0}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                disabled={spinning || freeSpinsLeft > 0}
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300"
              >
                ½
              </button>
              <button
                disabled={spinning || freeSpinsLeft > 0}
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
                disabled={spinning || freeSpinsLeft > 0}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Reel Paytable */}
        <div className="bg-[#151f30] rounded-xl border border-white/10 p-3.5 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Symbol Paytable
            </span>
            <span className="font-mono text-slate-400">3× / 4× / 5×</span>
          </div>
          {SYMBOLS.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-200 flex items-center gap-1.5">
                <span>{s.badge}</span> {s.label}
              </span>
              <span className="font-mono font-bold text-amber-400">
                {s.mult3}× / {s.mult4}× / {s.mult5}×
              </span>
            </div>
          ))}
        </div>

        {/* Primary CTA Button */}
        <div className="order-first lg:order-none">
          <button
            onClick={spinReels}
            disabled={spinning}
            className={`w-full py-4 font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.99] text-sm ${
              freeSpinsLeft > 0
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_8px_25px_rgba(34,211,238,0.4)]'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_8px_25px_rgba(245,158,11,0.3)]'
            }`}
          >
            {spinning
              ? 'Spinning 5 Reels...'
              : freeSpinsLeft > 0
              ? `Use Free Spin (${freeSpinsLeft} Left · 3× Multiplier)`
              : `Spin Reels (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Wilds + 3× Free Spins Scatter
          </span>
        </div>
      </div>

      {/* Main 5x3 Slots Stage */}
      <div className="flex-1 royal-surface p-4 sm:p-8 flex flex-col items-center justify-between">
        <div className="w-full max-w-[680px] flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Maharaja Gold 5×3 Video Slots
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              👑 Crown Wild Substitutes · 3+ 💎 Scatters Award 5 Free Spins (3×)
            </h2>
          </div>
          {freeSpinsLeft > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono font-black text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> {freeSpinsLeft} FREE SPINS ACTIVE (3×)
            </div>
          )}
        </div>

        {/* 5x3 Slot Cabinet */}
        <div className="my-auto p-3 sm:p-5 rounded-3xl bg-[#090d16] border-4 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.2)] w-full max-w-[680px]">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[0, 1, 2].map((rIdx) =>
              [0, 1, 2, 3, 4].map((cIdx) => {
                const sym = grid[rIdx][cIdx];
                const isWinner = winningCells.has(`${rIdx}-${cIdx}`);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square rounded-2xl bg-[#151f30] border-2 flex flex-col items-center justify-center p-1.5 sm:p-2 transition-all duration-200 ${
                      isWinner
                        ? 'border-emerald-400 bg-emerald-950/60 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.45)]'
                        : rIdx === 1
                        ? 'border-amber-400/35'
                        : 'border-white/10'
                    } ${spinning ? 'animate-pulse scale-95' : ''}`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${sym.color} flex items-center justify-center font-black text-lg sm:text-2xl shadow-lg`}
                    >
                      {sym.badge}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 mt-1 text-center truncate w-full">
                      {sym.id}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Win Readout */}
        <div className="h-14 flex items-center justify-center">
          {winInfo && winInfo.payout > 0 ? (
            <div className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-black text-base sm:text-lg">
              WON +₹{winInfo.payout.toLocaleString('en-IN')} ({winInfo.mult}× across {winInfo.linesWon} lines)
              {winInfo.triggeredFreeSpins ? ' + 5 FREE SPINS!' : ''}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              10 Active Paylines · Left-to-Right 3, 4, or 5 matching symbols win
            </div>
          )}
        </div>
      </div>
    </div>
  );
};