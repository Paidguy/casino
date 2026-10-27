import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck } from 'lucide-react';

interface Segment {
  mult: number;
  color: string;
  label: string;
}

const SEGMENTS: Segment[] = [
  { mult: 0, color: '#1e293b', label: '0×' },
  { mult: 1.5, color: '#0284c7', label: '1.5×' },
  { mult: 0, color: '#1e293b', label: '0×' },
  { mult: 2, color: '#10b981', label: '2×' },
  { mult: 0, color: '#1e293b', label: '0×' },
  { mult: 3, color: '#8b5cf6', label: '3×' },
  { mult: 1.5, color: '#0284c7', label: '1.5×' },
  { mult: 0, color: '#1e293b', label: '0×' },
  { mult: 5, color: '#f59e0b', label: '5×' },
  { mult: 0, color: '#1e293b', label: '0×' },
  { mult: 2, color: '#10b981', label: '2×' },
  { mult: 30, color: '#e11d48', label: '30×' },
];

export const Wheel: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastMult, setLastMult] = useState<number | null>(null);

  const spin = () => {
    const state = gameEngine.getState();
    if (spinning || bet <= 0 || bet > state.balance) return;

    sound.click();
    setSpinning(true);
    setLastMult(null);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    const idx = Math.floor(rng() * SEGMENTS.length);
    const segAngle = 360 / SEGMENTS.length;
    const targetDeg = 360 - idx * segAngle - segAngle / 2;
    const nextRot = rotation + 1440 + ((targetDeg - (rotation % 360) + 360) % 360);

    setRotation(nextRot);

    setTimeout(() => {
      const seg = SEGMENTS[idx];
      setLastMult(seg.mult);
      gameEngine.placeBet('Fortune Wheel', bet, seg.mult);
      if (seg.mult > 0) sound.win();
      else sound.lose();
      setSpinning(false);
    }, 1500);
  };

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

        {/* Segment Legend */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { mult: '30×', color: 'border-rose-500 text-rose-400' },
            { mult: '5.0×', color: 'border-amber-500 text-amber-400' },
            { mult: '3.0×', color: 'border-violet-500 text-violet-400' },
            { mult: '2.0×', color: 'border-emerald-500 text-emerald-400' },
            { mult: '1.5×', color: 'border-sky-500 text-sky-400' },
            { mult: '0.0×', color: 'border-slate-700 text-slate-500' },
          ].map((b) => (
            <div
              key={b.mult}
              className={`bg-[#151f30] p-2.5 rounded-xl border-l-4 ${b.color} font-mono font-bold text-xs flex justify-between`}
            >
              <span>Payout</span>
              <span>{b.mult}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {spinning ? 'Spinning Wheel...' : `Spin Wheel (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 12-Segment Multiplier Wheel
          </span>
        </div>
      </div>

      {/* Main Wheel Stage */}
      <div className="flex-1 bg-[#0d1422] p-6 sm:p-8 flex flex-col items-center justify-center relative">
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-6 h-6 bg-amber-400 rotate-45 border-2 border-slate-950 shadow-lg" />

          {/* SVG Spoked Wheel */}
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,0,0,0.65)] transition-transform duration-[1500ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <circle cx="120" cy="120" r="116" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
            {SEGMENTS.map((seg, i) => {
              const step = 360 / SEGMENTS.length;
              const startAngle = i * step;
              const endAngle = (i + 1) * step;
              const midAngle = startAngle + step / 2;
              const r1 = ((startAngle - 90) * Math.PI) / 180;
              const r2 = ((endAngle - 90) * Math.PI) / 180;
              const rm = ((midAngle - 90) * Math.PI) / 180;
              const x1 = 120 + 110 * Math.cos(r1);
              const y1 = 120 + 110 * Math.sin(r1);
              const x2 = 120 + 110 * Math.cos(r2);
              const y2 = 120 + 110 * Math.sin(r2);
              const tx = 120 + 78 * Math.cos(rm);
              const ty = 120 + 78 * Math.sin(rm);

              return (
                <g key={i}>
                  <path
                    d={`M120,120 L${x1},${y1} A110,110 0 0,1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx="120" cy="120" r="28" fill="#0b101b" stroke="#f59e0b" strokeWidth="4" />
            <circle cx="120" cy="120" r="10" fill="#f59e0b" />
          </svg>
        </div>

        {lastMult !== null && (
          <div className="mt-6 px-6 py-2.5 rounded-xl bg-[#151f30] border border-white/10 font-mono font-black text-base text-white">
            {lastMult > 0
              ? `Won +₹${Math.floor(bet * lastMult).toLocaleString('en-IN')} (${lastMult}×)`
              : '0× Segment — Try Again'}
          </div>
        )}
      </div>
    </div>
  );
};