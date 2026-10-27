import React, { useState, useMemo } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck } from 'lucide-react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
type SegmentCount = 10 | 20 | 30;

interface Segment {
  mult: number;
  color: string;
  label: string;
}

const COLOR_MAP: Record<number, string> = {
  0: '#1e293b',
  1.2: '#0284c7',
  1.5: '#0284c7',
  2: '#10b981',
  3: '#8b5cf6',
  5: '#f59e0b',
  10: '#ec4899',
  20: '#e11d48',
  30: '#e11d48',
  50: '#f43f5e',
};

function buildWheelSegments(risk: RiskLevel, count: SegmentCount): Segment[] {
  const segments: number[] = [];
  if (risk === 'LOW') {
    for (let i = 0; i < count; i++) {
      if (i === 0) segments.push(3);
      else if (i % 5 === 0) segments.push(0);
      else if (i % 2 === 0) segments.push(1.5);
      else segments.push(1.2);
    }
  } else if (risk === 'MEDIUM') {
    for (let i = 0; i < count; i++) {
      if (i === 0) segments.push(count === 30 ? 30 : 20);
      else if (i % 6 === 0) segments.push(5);
      else if (i % 3 === 0) segments.push(3);
      else if (i % 2 === 0) segments.push(2);
      else segments.push(0);
    }
  } else {
    // HIGH RISK
    for (let i = 0; i < count; i++) {
      if (i === 0) segments.push(count === 30 ? 50 : count === 20 ? 30 : 10);
      else if (i === Math.floor(count / 2) && count >= 20) segments.push(10);
      else if (i % 5 === 0) segments.push(3);
      else segments.push(0);
    }
  }

  return segments.map((mult) => ({
    mult,
    color: COLOR_MAP[mult] || '#10b981',
    label: `${mult}×`,
  }));
}

export const Wheel: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [risk, setRisk] = useState<RiskLevel>('MEDIUM');
  const [segCount, setSegCount] = useState<SegmentCount>(20);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastMult, setLastMult] = useState<number | null>(null);

  const segments = useMemo(() => buildWheelSegments(risk, segCount), [risk, segCount]);
  const uniqueMultipliers = useMemo(
    () => Array.from(new Set(segments.map((s) => s.mult))).sort((a, b) => b - a),
    [segments]
  );

  const spin = () => {
    const state = gameEngine.getState();
    if (spinning || bet <= 0 || bet > state.balance) return;

    sound.click();
    setSpinning(true);
    setLastMult(null);

    const floatVal = gameEngine.getNextFloats(1)[0] ?? Math.random();
    const idx = Math.floor(floatVal * segments.length);
    const segAngle = 360 / segments.length;
    const targetDeg = 360 - idx * segAngle - segAngle / 2;
    const nextRot = rotation + 1440 + ((targetDeg - (rotation % 360) + 360) % 360);

    setRotation(nextRot);

    setTimeout(() => {
      const seg = segments[idx];
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

        {/* Risk Level Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Risk Level</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#151f30] p-1 rounded-xl border border-white/10">
            {(['LOW', 'MEDIUM', 'HIGH'] as RiskLevel[]).map((r) => (
              <button
                key={r}
                disabled={spinning}
                onClick={() => setRisk(r)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  risk === r
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Segment Count Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Wheel Segments
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#151f30] p-1 rounded-xl border border-white/10">
            {([10, 20, 30] as SegmentCount[]).map((c) => (
              <button
                key={c}
                disabled={spinning}
                onClick={() => setSegCount(c)}
                className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  segCount === c
                    ? 'bg-[#24344d] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c} Pins
              </button>
            ))}
          </div>
        </div>

        {/* Segment Legend */}
        <div className="grid grid-cols-2 gap-2">
          {uniqueMultipliers.map((m) => (
            <div
              key={m}
              className="bg-[#151f30] p-2.5 rounded-xl border border-white/10 font-mono font-bold text-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLOR_MAP[m] || '#10b981' }}
                />
                Hit {m}×
              </span>
              <span className="text-white">₹{Math.floor(bet * m).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA Button */}
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
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {segCount}-Segment {risk} Risk Wheel
          </span>
        </div>
      </div>

      {/* Main Wheel Stage */}
      <div className="flex-1 bg-[#0d1422] p-6 sm:p-8 flex flex-col items-center justify-center relative">
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-6 h-6 bg-amber-400 rotate-45 border-2 border-slate-950 shadow-lg" />

          {/* SVG Spoked Wheel */}
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,0,0,0.65)] transition-transform duration-[1500ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <circle cx="120" cy="120" r="116" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
            {segments.map((seg, i) => {
              const step = 360 / segments.length;
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
              const tx = 120 + 84 * Math.cos(rm);
              const ty = 120 + 84 * Math.sin(rm);

              return (
                <g key={i}>
                  <path
                    d={`M120,120 L${x1},${y1} A110,110 0 0,1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#ffffff"
                    fontSize={segCount === 30 ? '7' : '9'}
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