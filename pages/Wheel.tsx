import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SegmentDef {
  multi: number;
  color: string;
}

const WHEEL_CONFIGS: Record<'LOW' | 'MEDIUM' | 'HIGH', SegmentDef[]> = {
  LOW: [
    { multi: 1.5, color: '#3b82f6' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 0, color: '#131c31' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 1.2, color: '#94a3b8' },
    { multi: 0, color: '#131c31' },
  ],
  MEDIUM: [
    { multi: 0, color: '#131c31' },
    { multi: 1.5, color: '#10b981' },
    { multi: 0, color: '#131c31' },
    { multi: 2.0, color: '#f59e0b' },
    { multi: 0, color: '#131c31' },
    { multi: 1.5, color: '#10b981' },
    { multi: 0, color: '#131c31' },
    { multi: 3.0, color: '#a855f7' },
    { multi: 0, color: '#131c31' },
    { multi: 1.5, color: '#10b981' },
  ],
  HIGH: [
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 9.9, color: '#f43f5e' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
    { multi: 0, color: '#131c31' },
  ],
};

export default function Wheel() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [risk, setRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [segmentsCount, setSegmentsCount] = useState<number>(20);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SegmentDef | null>(null);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoRef = useRef({ active: false, count: 0, remaining: 0 });
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      setAutoActive(false);
    };
  }, []);

  const basePattern = WHEEL_CONFIGS[risk];
  const segments: SegmentDef[] = Array.from({ length: segmentsCount }, (_, i) => {
    const seg = basePattern[i % basePattern.length];
    if (risk === 'HIGH' && segmentsCount >= 20) {
      return i === 0 ? { multi: +(segmentsCount * 0.99).toFixed(1), color: '#f43f5e' } : { multi: 0, color: '#131c31' };
    }
    return seg;
  });

  const uniqueMultipliers = Array.from(new Set(segments.map((s) => s.multi))).sort((a, b) => a - b);

  const spin = () => {
    if (spinning) return;
    const validStake = Math.max(10, betAmount || 100);
    if (betAmount <= 0) setBetAmount(validStake);

    if (engine.getSession().balance < validStake) {
      if (autoRef.current.active) {
        setAutoActive(false);
        return;
      }
      engine.reloadBalance(Math.max(10000, validStake * 5));
    }

    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin();

    const r = engine.peekNextRandom();
    const targetIdx = Math.floor(r * segments.length);
    const targetSeg = segments[targetIdx];

    const segAngle = 360 / segments.length;
    const targetCenterAngle = 360 - (targetIdx * segAngle + segAngle / 2);
    const currentMod = rotationRef.current % 360;
    let delta = targetCenterAngle - currentMod;
    if (delta < 0) delta += 360;

    const isInstant = engine.getSession().settings.instantBet;
    const extraSpins = 360 * (isInstant ? 1 : 4);
    const nextRotation = rotationRef.current + extraSpins + delta;
    rotationRef.current = nextRotation;
    setRotation(nextRotation);

    const duration = isInstant ? 250 : 1600;

    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = setTimeout(() => {
      setSpinning(false);
      setResult(targetSeg);
      if (targetSeg.multi > 0) audio.playWin();
      else audio.playLoss();
      engine.placeBet(
        GameType.WHEEL,
        validStake,
        targetSeg.multi,
        `Wheel (${risk}): ${targetSeg.multi.toFixed(2)}x`
      );
    }, duration);
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoActive && !spinning) {
      const { count, remaining } = autoRef.current;
      if (engine.getSession().balance < betAmount) {
        setAutoActive(false);
        return;
      }
      if (count === 0 || remaining > 0) {
        timeout = setTimeout(() => {
          spin();
          if (count > 0) setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
        }, 700);
      } else {
        setAutoActive(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [autoActive, spinning, betAmount, risk, segmentsCount]);

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
      if (!spinning) spin();
    }
  };

  const conicStops = segments
    .map((s, idx) => {
      const startPct = (idx / segments.length) * 100;
      const endPct = ((idx + 1) / segments.length) * 100;
      return `${s.color} ${startPct}% ${endPct}%`;
    })
    .join(', ');

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[580px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action CTA at Top for Mobile Thumb Reach */}
              {mode === 'MANUAL' ? (
                <button
                  type="button"
                  onClick={spin}
                  disabled={spinning}
                  className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
                >
                  {spinning ? 'Spinning...' : `Spin Wheel (${formatINR(betAmount, 0)})`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAuto}
                  className={`w-full h-14 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center ${
                    autoActive
                      ? 'bg-[#f43f5e] text-white'
                      : 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#070b14]'
                  }`}
                >
                  {autoActive
                    ? `Stop Autobet (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})`
                    : 'Start Autobet'}
                </button>
              )}

              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => setMode('MANUAL')}
                  disabled={autoActive || spinning}
                  className={`py-2 rounded-lg text-xs font-extrabold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setMode('AUTO')}
                  disabled={autoActive || spinning}
                  className={`py-2 rounded-lg text-xs font-extrabold ${
                    mode === 'AUTO' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Auto
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Bet Amount (₹)</span>
                  <span className="font-mono text-[#fbbf24] tabular-nums">{formatINR(betAmount)}</span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b]/60 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={spinning || autoActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                    disabled={spinning || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={spinning || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    2×
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[100, 500, 1000, 5000].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setBetAmount(chip)}
                      disabled={spinning || autoActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Risk Level</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRisk(r)}
                      disabled={spinning || autoActive}
                      className={`py-2 rounded-lg text-xs font-extrabold capitalize ${
                        risk === r ? 'bg-[#131c31] text-[#fbbf24] border border-[#f59e0b]/40' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segments Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Segments</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                  {[10, 20, 30].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setSegmentsCount(seg)}
                      disabled={spinning || autoActive}
                      className={`py-2 rounded-lg text-xs font-mono font-bold ${
                        segmentsCount === seg ? 'bg-[#131c31] text-[#fbbf24] border border-[#f59e0b]/40' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'AUTO' && (
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                    Number of Bets (0 = Infinite)
                  </label>
                  <input
                    type="number"
                    value={autoBetCount}
                    onChange={(e) => setAutoBetCount(Math.max(0, Number(e.target.value)))}
                    disabled={autoActive}
                    className="w-full h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 text-sm font-mono font-bold text-white outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>Up to 29.7× Jackpot · 99.0% RTP</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Wheel Stage */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-10 royal-surface">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#fbbf24] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NAVRATNA MULTIPLIER WHEEL</span>
            </div>

            {/* Wheel Ring */}
            <div className="relative w-56 h-56 sm:w-80 sm:h-80 my-auto flex items-center justify-center">
              {/* Top Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-[#fbbf24] drop-shadow" />

              {/* Rotating Conic Ring */}
              <div
                className="w-full h-full rounded-full border-8 border-[#24324f] shadow-2xl"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? `transform ${engine.getSession().settings.instantBet ? 250 : 1600}ms cubic-bezier(0.15, 0.85, 0.25, 1)`
                    : 'none',
                  background: `conic-gradient(${conicStops})`,
                }}
              />

              {/* Inner Hub */}
              <div className="absolute w-36 h-36 sm:w-56 sm:h-56 rounded-full bg-[#070b14] border-8 border-[#f59e0b]/40 flex flex-col items-center justify-center z-20 shadow-inner">
                {result ? (
                  <>
                    <div
                      className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums"
                      style={{ color: result.multi > 0 ? result.color : '#64748b' }}
                    >
                      {result.multi.toFixed(2)}×
                    </div>
                    <div className="text-xs font-mono font-bold text-[#fbbf24] mt-1 tabular-nums">
                      {formatINR(betAmount * result.multi)}
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Spin the Wheel</span>
                )}
              </div>
            </div>

            {/* Bottom Unique Multiplier Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl pt-4">
              {uniqueMultipliers.map((m) => {
                const segColor = segments.find((s) => s.multi === m)?.color || '#131c31';
                const count = segments.filter((s) => s.multi === m).length;
                const isHit = result?.multi === m;
                return (
                  <div
                    key={m}
                    className={`bg-[#131c31] rounded-xl p-2.5 sm:p-3 border-b-4 text-center transition-transform ${
                      isHit ? '-translate-y-1 brightness-125' : ''
                    }`}
                    style={{ borderBottomColor: segColor }}
                  >
                    <div className="font-mono font-extrabold text-xs sm:text-sm text-white tabular-nums">
                      {m.toFixed(2)}×
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#94a3b8] mt-0.5">
                      {count}/{segments.length} chance
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}