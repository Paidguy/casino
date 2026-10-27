import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, ArrowLeftRight } from 'lucide-react';

export const Dice: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [target, setTarget] = useState<number>(50);
  const [rollOver, setRollOver] = useState<boolean>(true);
  const [lastRoll, setLastRoll] = useState<number | null>(64.28);
  const [lastWon, setLastWon] = useState<boolean>(true);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ val: number; won: boolean }[]>([
    { val: 64.28, won: true },
    { val: 21.14, won: false },
    { val: 88.05, won: true },
    { val: 52.9, won: true },
  ]);

  const winChance = rollOver ? 100 - target : target;
  const multiplier = Number((99 / Math.max(2, Math.min(98, winChance))).toFixed(4));

  const handleChanceChange = (chanceVal: number) => {
    const clamped = Math.max(2, Math.min(98, Math.round(chanceVal)));
    setTarget(rollOver ? 100 - clamped : clamped);
  };

  const rollDice = () => {
    const state = gameEngine.getState();
    if (rolling || bet <= 0 || bet > state.balance) return;

    sound.click();
    setRolling(true);

    const floatVal = gameEngine.getNextFloats(1)[0] ?? Math.random();
    setTimeout(() => {
      const result = Number((floatVal * 100).toFixed(2));
      const won = rollOver ? result > target : result < target;

      setLastRoll(result);
      setLastWon(won);
      setHistory((prev) => [{ val: result, won }, ...prev.slice(0, 9)]);

      gameEngine.placeBet('Classic Dice', bet, won ? multiplier : 0);
      if (won) sound.win();
      else sound.lose();
      setRolling(false);
    }, 180);
  };

  const trackBackground = rollOver
    ? `linear-gradient(to right, #e11d48 0%, #e11d48 ${target}%, #10b981 ${target}%, #10b981 100%)`
    : `linear-gradient(to right, #10b981 0%, #10b981 ${target}%, #e11d48 ${target}%, #e11d48 100%)`;

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

        {/* Profit on Win */}
        <div className="bg-[#151f30] p-3.5 rounded-xl border border-white/10">
          <div className="text-xs font-semibold text-slate-400">Profit on Win</div>
          <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
            +₹{Math.max(0, Math.floor(bet * multiplier - bet)).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="order-first lg:order-none">
          <button
            onClick={rollDice}
            disabled={rolling}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
          >
            Roll Dice (₹{bet.toLocaleString('en-IN')})
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 1% House Edge (99% RTP)
          </span>
        </div>
      </div>

      {/* Main Dice Slider Stage */}
      <div className="flex-1 bg-[#0d1422] p-6 sm:p-8 flex flex-col justify-between">
        {/* Recent Rolls */}
        <div className="flex justify-end gap-2 flex-wrap">
          {history.map((h, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full font-mono font-bold text-xs border ${
                h.won
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {h.val.toFixed(2)}
            </div>
          ))}
        </div>

        {/* Dual-Zone Probability Bar & Floating Roll Marker */}
        <div className="max-w-[680px] w-full mx-auto my-auto space-y-10">
          <div className="text-center">
            <div
              className={`text-6xl sm:text-7xl font-mono font-black tracking-tight transition-colors ${
                lastWon ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {lastRoll !== null ? lastRoll.toFixed(2) : '50.00'}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
              {rollOver ? `Roll Over ${target}.00 to Win` : `Roll Under ${target}.00 to Win`}
            </div>
          </div>

          {/* Stake-Style Dual-Zone Slider with Floating Cube Marker */}
          <div className="bg-[#151f30] p-6 pt-12 rounded-2xl border border-white/10 relative">
            {/* Floating Roll Cube Indicator */}
            {lastRoll !== null && (
              <div
                className="absolute top-2.5 -translate-x-1/2 transition-all duration-300 z-20"
                style={{ left: `calc(24px + (100% - 48px) * ${lastRoll / 100})` }}
              >
                <div
                  className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs shadow-lg border ${
                    lastWon
                      ? 'bg-emerald-500 text-slate-950 border-white'
                      : 'bg-rose-500 text-white border-white/40'
                  }`}
                >
                  {lastRoll.toFixed(2)}
                </div>
              </div>
            )}

            <input
              type="range"
              min={2}
              max={98}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              style={{ background: trackBackground }}
              className="w-full h-4 rounded-full appearance-none cursor-pointer accent-white shadow-inner"
            />
            <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400 mt-3">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Bottom 3 Interactive Parameter Cards */}
        <div className="max-w-[680px] w-full mx-auto grid grid-cols-3 gap-3 bg-[#151f30] p-4 rounded-2xl border border-white/10">
          <div className="bg-[#0b101b] p-3 rounded-xl border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400">Multiplier</div>
            <div className="text-lg font-mono font-black text-white mt-0.5">
              {multiplier.toFixed(4)}×
            </div>
          </div>
          <div className="bg-[#0b101b] p-3 rounded-xl border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400">
              {rollOver ? 'Roll Over' : 'Roll Under'}
            </div>
            <button
              onClick={() => setRollOver(!rollOver)}
              className="mt-0.5 flex items-center gap-1.5 text-lg font-mono font-black text-amber-400 hover:text-amber-300"
            >
              {target}.00 <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#0b101b] p-3 rounded-xl border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400">Win Chance (%)</div>
            <input
              type="number"
              min={2}
              max={98}
              value={winChance}
              onChange={(e) => handleChanceChange(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-mono font-black text-emerald-400 mt-0.5 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};