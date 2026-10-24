import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_GRID = [
  ['💎', '7️⃣', '🔔'],
  ['👑', '💎', '🍒'],
  ['🍉', '💎', '7️⃣'],
  ['🔔', '👑', '🍉'],
  ['🍒', '7️⃣', '💎'],
];

const PAYTABLE = [
  { sym: '💎', name: 'Kohinoor Wild', m3: '12.5×', m4: '37.5×', m5: '100×' },
  { sym: '7️⃣', name: 'Lucky Seven', m3: '7.5×', m4: '22.5×', m5: '60×' },
  { sym: '👑', name: 'Maharaja Crown', m3: '5.0×', m4: '15.0×', m5: '40×' },
  { sym: '🔔', name: 'Mandir Bell', m3: '3.0×', m4: '9.0×', m5: '24×' },
  { sym: '🍉', name: 'Melon', m3: '2.0×', m4: '6.0×', m5: '16×' },
  { sym: '🍒', name: 'Cherry', m3: '1.25×', m4: '3.75×', m5: '10×' },
];

export default function Slots() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [grid, setGrid] = useState<string[][]>(INITIAL_GRID);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ multiplier: number; winningLines: number[] } | null>(null);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoRef = useRef({ active: false, count: 0, remaining: 0 });
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const betRef = useRef(500);

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    betRef.current = betAmount;
  }, [betAmount]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      setAutoActive(false);
    };
  }, []);

  const spin = () => {
    if (spinning) return;
    const validStake = Math.max(10, betRef.current || 100);
    if (betRef.current <= 0) {
      setBetAmount(validStake);
      betRef.current = validStake;
    }

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

    const delay = engine.getSession().settings.instantBet ? 120 : 500;

    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.SLOTS,
        validStake,
        (r) => {
          const res = engine.calculateSlotsResult(r);
          setGrid(res.grid);
          setResult({ multiplier: res.multiplier, winningLines: res.winningLines });
          setSpinning(false);
          if (res.multiplier > 0) audio.playWin();
          else audio.playLoss();
          return {
            multiplier: res.multiplier,
            outcome: `Slots: ${res.multiplier.toFixed(2)}x (${res.winningLines.length} lines)`,
          };
        },
        ''
      );
    }, delay);
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoActive && !spinning) {
      const { count, remaining } = autoRef.current;
      if (engine.getSession().balance < betRef.current) {
        setAutoActive(false);
        return;
      }
      if (count === 0 || remaining > 0) {
        timeout = setTimeout(() => {
          spin();
          if (count > 0) setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
        }, 650);
      } else {
        setAutoActive(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [autoActive, spinning]);

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
      if (!spinning) spin();
    }
  };

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
                  {spinning ? 'Spinning Reels...' : `Spin Reels (${formatINR(betAmount, 0)})`}
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
                  <span>Bet Amount (5 Paylines)</span>
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

              {mode === 'AUTO' && (
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                    Number of Spins (0 = Infinite)
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

              {/* Paytable Summary */}
              <div className="pt-3 border-t border-[#24324f] space-y-1.5">
                <div className="text-xs font-bold text-[#94a3b8] mb-1">Symbol Multipliers (3 / 4 / 5)</div>
                {PAYTABLE.map((row) => (
                  <div
                    key={row.sym}
                    className="flex items-center justify-between text-xs bg-[#070b14] px-2.5 py-1.5 rounded-lg border border-[#24324f]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{row.sym}</span>
                      <span className="text-[#94a3b8] font-medium">{row.name}</span>
                    </span>
                    <span className="font-mono font-bold text-[#fbbf24] tabular-nums">
                      {row.m3} · {row.m4} · {row.m5}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>5-Reel Gold Matrix · 97.0% RTP</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right 5x3 Video Slot Stage */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-10 royal-surface">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#fbbf24] text-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5 REELS · 5 PAYLINES · 💎 KOHINOOR WILD</span>
            </div>

            {/* 5x3 Reel Matrix */}
            <div className="my-4 w-full max-w-2xl bg-[#131c31] p-3 sm:p-6 rounded-2xl border-2 border-[#f59e0b]/40 shadow-2xl">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                {grid.map((col, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-1.5 sm:gap-3">
                    {col.map((sym, rIdx) => {
                      const isMiddleLine = rIdx === 1;
                      return (
                        <div
                          key={rIdx}
                          className={`h-16 sm:h-28 rounded-xl bg-[#070b14] border flex items-center justify-center text-2xl sm:text-5xl select-none transition-transform ${
                            spinning ? 'animate-pulse scale-95 opacity-70' : 'scale-100'
                          } ${
                            result && result.multiplier > 0 && isMiddleLine
                              ? 'border-[#10b981] bg-[#10b981]/15 shadow-lg shadow-[#10b981]/20'
                              : 'border-[#24324f]'
                          }`}
                        >
                          {sym}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Banner */}
            <div className="min-h-[44px] flex items-center justify-center">
              {result && (
                <div
                  className={`px-5 sm:px-6 py-2 rounded-xl font-extrabold text-xs sm:text-sm font-mono tabular-nums border text-center ${
                    result.multiplier > 0
                      ? 'bg-[#10b981]/15 border-[#10b981] text-[#10b981]'
                      : 'bg-[#131c31] border-[#24324f] text-[#94a3b8]'
                  }`}
                >
                  {result.multiplier > 0
                    ? `WIN +${formatINR(betAmount * result.multiplier)} (${result.multiplier.toFixed(2)}×)`
                    : 'No winning payline'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}