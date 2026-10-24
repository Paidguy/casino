import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { RefreshCw, ShieldCheck, Dices } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dice() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [winChance, setWinChance] = useState<number>(49.5);
  const [rollOver, setRollOver] = useState<boolean>(true);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ roll: number; won: boolean }[]>([]);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoRef = useRef({ active: false, count: 0, remaining: 0 });
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
      setAutoActive(false);
    };
  }, []);

  const clampedChance = Math.min(98, Math.max(1, winChance));
  const multiplier = +(99 / clampedChance).toFixed(4);
  const target = rollOver ? +(100 - clampedChance).toFixed(2) : +clampedChance.toFixed(2);
  const profitOnWin = Math.max(0, +(betAmount * multiplier - betAmount).toFixed(2));

  const handleMultiplierChange = (val: number) => {
    if (isNaN(val) || val < 1.0102) return;
    const newChance = Math.min(98, Math.max(1, +(99 / val).toFixed(2)));
    setWinChance(newChance);
  };

  const handleTargetChange = (newTarget: number) => {
    const clampedTarget = Math.min(98, Math.max(2, newTarget));
    const newChance = rollOver ? +(100 - clampedTarget).toFixed(2) : +clampedTarget.toFixed(2);
    setWinChance(newChance);
  };

  const handleRoll = () => {
    if (rolling) return;
    const validStake = Math.max(10, betAmount || 100);
    if (betAmount <= 0) setBetAmount(validStake);

    if (engine.getSession().balance < validStake) {
      if (autoRef.current.active) {
        setAutoActive(false);
        return;
      }
      engine.reloadBalance(Math.max(10000, validStake * 5));
    }

    const delay = engine.getSession().settings.instantBet ? 20 : 120;
    setRolling(true);
    audio.playBet();

    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    rollTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.DICE,
        validStake,
        (r) => {
          const { roll, won } = engine.calculateDiceResult(r, target, rollOver ? 'over' : 'under');
          setLastRoll(roll);
          setLastWin(won);
          setHistory((prev) => [{ roll, won }, ...prev].slice(0, 10));
          if (won) audio.playWin();
          else audio.playLoss();
          return {
            multiplier: won ? multiplier : 0,
            outcome: `Rolled ${roll.toFixed(2)} (${rollOver ? '>' : '<'} ${target.toFixed(2)})`,
          };
        },
        ''
      );
      setRolling(false);
    }, delay);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoActive) {
      interval = setInterval(() => {
        const { active, count, remaining } = autoRef.current;
        if (!active) return;

        if (engine.getSession().balance < betAmount) {
          setAutoActive(false);
          return;
        }

        if (count === 0 || remaining > 0) {
          handleRoll();
          if (count > 0) {
            setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
          }
        } else {
          setAutoActive(false);
        }
      }, 320);
    }
    return () => clearInterval(interval);
  }, [autoActive, betAmount, winChance, rollOver]);

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
    }
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[560px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action CTA at Top for Mobile Thumb Reach */}
              {mode === 'MANUAL' ? (
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={rolling}
                  className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
                >
                  {rolling ? 'Rolling...' : `Roll Dice (${formatINR(betAmount, 0)})`}
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
                  disabled={autoActive || rolling}
                  className={`py-2 rounded-lg text-xs font-extrabold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setMode('AUTO')}
                  disabled={autoActive || rolling}
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
                    disabled={autoActive || rolling}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                    disabled={autoActive || rolling}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={autoActive || rolling}
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
                      disabled={autoActive || rolling}
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

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Profit on Win</span>
                </div>
                <div className="h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 flex items-center text-sm font-mono font-bold text-[#10b981] tabular-nums">
                  +{formatINR(profitOnWin)}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>1% House Edge · 99.0% RTP</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Interactive Dice Stage */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 royal-surface min-w-0">
            {/* Top Recent Roll Badges */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar h-8">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#fbbf24] shrink-0">
                <Dices className="w-4 h-4" /> CHAUSAR DICE PRO
              </span>
              <div className="flex items-center gap-1.5">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold tabular-nums shrink-0 ${
                      h.won
                        ? 'bg-[#10b981] text-[#070b14]'
                        : 'bg-[#131c31] text-[#94a3b8]'
                    }`}
                  >
                    {h.roll.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            {/* Central 0-100 Slider Track */}
            <div className="my-auto py-12 sm:py-16 px-3 sm:px-8 max-w-3xl w-full mx-auto">
              <div className="relative">
                <div className="flex justify-between text-xs font-mono font-bold text-[#94a3b8] mb-3 px-2">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>

                <div className="p-3 bg-[#131c31] rounded-full border-4 border-[#24324f] shadow-xl relative">
                  <div className="h-3.5 w-full rounded-full overflow-hidden flex relative bg-[#070b14]">
                    <div
                      className="h-full transition-all duration-100"
                      style={{
                        width: `${target}%`,
                        backgroundColor: rollOver ? '#f43f5e' : '#10b981',
                      }}
                    />
                    <div
                      className="h-full transition-all duration-100"
                      style={{
                        width: `${100 - target}%`,
                        backgroundColor: rollOver ? '#10b981' : '#f43f5e',
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="2"
                    max="98"
                    step="1"
                    value={target}
                    onChange={(e) => handleTargetChange(Number(e.target.value))}
                    disabled={autoActive || rolling}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />

                  <div
                    className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 rounded-lg bg-[#f59e0b] border-2 border-white shadow-lg flex items-center justify-center pointer-events-none z-20 transition-all duration-100"
                    style={{ left: `${target}%` }}
                  >
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-[#070b14] rounded" />
                      <span className="w-0.5 h-3 bg-[#070b14] rounded" />
                    </div>
                  </div>

                  {lastRoll !== null && (
                    <div
                      className="absolute -top-14 -ml-8 w-16 h-11 rounded-lg bg-white shadow-2xl flex items-center justify-center font-mono font-extrabold text-sm tabular-nums z-20 transition-all duration-200 border-2"
                      style={{
                        left: `${Math.min(94, Math.max(6, lastRoll))}%`,
                        borderColor: lastWin ? '#10b981' : '#f43f5e',
                        color: lastWin ? '#059669' : '#f43f5e',
                      }}
                    >
                      {lastRoll.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom 3-Column Linked Parameter Bar */}
            <div className="bg-[#131c31] p-3.5 sm:p-4 rounded-xl border border-[#24324f] grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-[#94a3b8] mb-1">Multiplier</label>
                <div className="flex h-10 items-center bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b]/60 rounded-lg px-2 sm:px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={multiplier}
                    onChange={(e) => handleMultiplierChange(Number(e.target.value))}
                    disabled={autoActive || rolling}
                    className="w-full bg-transparent text-xs sm:text-sm font-mono font-bold text-white outline-none tabular-nums min-w-0"
                  />
                  <span className="text-xs font-bold text-[#fbbf24] ml-1">×</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-[#94a3b8] mb-1">
                  {rollOver ? 'Roll Over' : 'Roll Under'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRollOver(!rollOver);
                    audio.playClick();
                  }}
                  disabled={autoActive || rolling}
                  className="w-full h-10 flex items-center justify-between bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg px-2 sm:px-3 text-xs sm:text-sm font-mono font-bold text-white tabular-nums"
                >
                  <span>{target.toFixed(0)}</span>
                  <RefreshCw className="w-3.5 h-3.5 text-[#fbbf24]" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-[#94a3b8] mb-1">Win Chance</label>
                <div className="flex h-10 items-center bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b]/60 rounded-lg px-2 sm:px-3">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="98"
                    value={clampedChance}
                    onChange={(e) => setWinChance(Math.min(98, Math.max(1, Number(e.target.value))))}
                    disabled={autoActive || rolling}
                    className="w-full bg-transparent text-xs sm:text-sm font-mono font-bold text-white outline-none tabular-nums min-w-0"
                  />
                  <span className="text-xs font-bold text-[#fbbf24] ml-1">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}