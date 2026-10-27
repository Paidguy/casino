import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Shuffle, Trash2 } from 'lucide-react';

const PAYOUTS: Record<number, number[]> = {
  1: [0, 3.8],
  2: [0, 1.7, 5.2],
  3: [0, 1.0, 2.8, 25],
  4: [0, 0.5, 2.2, 8.0, 60],
  5: [0, 0.5, 1.4, 4.0, 18, 120],
  6: [0, 0, 1.1, 2.5, 9.0, 50, 250],
  7: [0, 0, 1.0, 2.0, 5.0, 22, 100, 400],
  8: [0, 0, 0.5, 1.6, 3.5, 12, 50, 200, 600],
  9: [0, 0, 0.5, 1.2, 2.5, 8, 30, 120, 400, 800],
  10: [0, 0, 0, 1.1, 2.0, 5, 18, 75, 250, 500, 1000],
};

export const Keno: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [selected, setSelected] = useState<number[]>([3, 7, 12, 19, 24, 33]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);

  const toggleNumber = (n: number) => {
    if (drawing) return;
    sound.click();
    setDrawn([]);
    if (selected.includes(n)) {
      setSelected(selected.filter((x) => x !== n));
    } else if (selected.length < 10) {
      setSelected([...selected, n]);
    }
  };

  const autoPick = () => {
    if (drawing) return;
    sound.click();
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSelected(pool.slice(0, 8).sort((a, b) => a - b));
    setDrawn([]);
  };

  const playKeno = () => {
    const state = gameEngine.getState();
    if (drawing || selected.length === 0 || bet <= 0 || bet > state.balance) return;

    sound.click();
    setDrawing(true);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const resultNumbers = pool.slice(0, 10);

    setTimeout(() => {
      setDrawn(resultNumbers);
      const hits = selected.filter((n) => resultNumbers.includes(n)).length;
      const multTable = PAYOUTS[selected.length] || [0];
      const mult = multTable[hits] ?? 0;

      gameEngine.placeBet('Keno 40', bet, mult);
      if (mult >= 1) sound.win();
      else sound.lose();
      setDrawing(false);
    }, 450);
  };

  const currentPaytable = PAYOUTS[selected.length] || [];
  const hitsCount = selected.filter((n) => drawn.includes(n)).length;

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
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
              disabled={drawing}
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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={autoPick}
            disabled={drawing}
            className="py-2.5 bg-[#151f30] hover:bg-[#1e2b42] text-slate-200 rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" /> Auto Pick 8
          </button>
          <button
            onClick={() => {
              setSelected([]);
              setDrawn([]);
            }}
            disabled={drawing}
            className="py-2.5 bg-[#151f30] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Board
          </button>
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={playKeno}
            disabled={drawing || selected.length === 0}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
          >
            {drawing
              ? 'Drawing 10 Numbers...'
              : selected.length === 0
              ? 'Select 1–10 Numbers'
              : `Play Round (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Up to 1,000× Multiplier
          </span>
          <span className="font-mono text-slate-500">{selected.length}/10 Picked</span>
        </div>
      </div>

      {/* Main Keno 40 Grid Stage */}
      <div className="flex-1 bg-[#0d1422] p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6">
        <div className="grid grid-cols-8 gap-2 sm:gap-2.5 max-w-[640px] mx-auto w-full my-auto">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
            const isPicked = selected.includes(n);
            const isDrawn = drawn.includes(n);
            const isHit = isPicked && isDrawn;

            let cls = 'bg-[#172236] hover:bg-[#20304b] text-slate-200 border-white/10';
            if (isHit) {
              cls =
                'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105';
            } else if (isPicked) {
              cls = 'bg-amber-500 text-slate-950 border-amber-300 shadow-md';
            } else if (isDrawn) {
              cls = 'bg-rose-500/25 text-rose-300 border-rose-500/50';
            }

            return (
              <button
                key={n}
                onClick={() => toggleNumber(n)}
                className={`aspect-square rounded-xl border font-mono font-black text-sm sm:text-base transition-all flex items-center justify-center ${cls}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Dynamic Hit Multiplier Ladder */}
        <div className="max-w-[640px] mx-auto w-full grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {currentPaytable.map((m, hits) => (
            <div
              key={hits}
              className={`p-2 rounded-xl border text-center ${
                drawn.length > 0 && hits === hitsCount
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-[#151f30] border-white/10 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase">{hits}× Hit</div>
              <div className="text-xs font-mono font-black text-white">{m}×</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};