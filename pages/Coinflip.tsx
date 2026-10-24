import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Coinflip() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [activeStake, setActiveStake] = useState<number>(500);
  const [side, setSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [history, setHistory] = useState<('HEADS' | 'TAILS')[]>([]);

  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  const currentMultiplier = streak === 0 ? 1.0 : +(0.98 * Math.pow(2, streak)).toFixed(2);
  const nextMultiplier = +(0.98 * Math.pow(2, streak + 1)).toFixed(2);

  const flipCoin = (chosenSide: 'HEADS' | 'TAILS') => {
    if (flipping) return;

    let roundStake = activeStake;
    let currentStreak = streak;

    if (!isRoundActive) {
      const validStake = Math.max(10, betAmount || 100);
      if (betAmount <= 0) setBetAmount(validStake);

      if (engine.getSession().balance < validStake) {
        engine.reloadBalance(Math.max(10000, validStake * 5));
      }
      if (!engine.deductStake(validStake)) return;

      roundStake = validStake;
      currentStreak = 0;
      setActiveStake(validStake);
      setIsRoundActive(true);
      setStreak(0);
    }

    setSide(chosenSide);
    setFlipping(true);
    audio.playBet();
    audio.playSpin();

    const delay = engine.getSession().settings.instantBet ? 120 : 500;

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      const r = engine.peekNextRandom(currentStreak);
      const outcomeSide: 'HEADS' | 'TAILS' = r >= 0.5 ? 'HEADS' : 'TAILS';
      const won = chosenSide === outcomeSide;

      setResult(outcomeSide);
      setHistory((prev) => [outcomeSide, ...prev].slice(0, 10));
      setFlipping(false);

      if (won) {
        const nextStreak = currentStreak + 1;
        setStreak(nextStreak);
        audio.playTileSafe(nextStreak);
      } else {
        audio.playLoss();
        engine.settleDeductedBet(
          GameType.COINFLIP,
          roundStake,
          0,
          `Flip: Lost on ${outcomeSide} after ${currentStreak} streak`
        );
        setIsRoundActive(false);
        setStreak(0);
      }
    }, delay);
  };

  const cashOut = () => {
    if (!isRoundActive || streak === 0 || flipping) return;
    audio.playWin();
    engine.settleDeductedBet(
      GameType.COINFLIP,
      activeStake,
      currentMultiplier,
      `Flip: Cashed out ${streak} streak @ ${currentMultiplier.toFixed(2)}x`
    );
    setIsRoundActive(false);
    setStreak(0);
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[560px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action Controls at Top for Mobile Thumb Reach */}
              {isRoundActive && streak > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={cashOut}
                    disabled={flipping}
                    className="h-14 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight active:scale-[0.99]"
                  >
                    <span>CASHOUT STREAK</span>
                    <span className="text-xs font-mono tabular-nums mt-0.5">
                      {formatINR(activeStake * currentMultiplier)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => flipCoin(side)}
                    disabled={flipping}
                    className="h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight active:scale-[0.99]"
                  >
                    <span>FLIP {side} AGAIN</span>
                    <span className="text-[11px] font-mono mt-0.5">For {nextMultiplier}×</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => flipCoin(side)}
                  disabled={flipping}
                  className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
                >
                  {flipping ? 'Flipping...' : `Toss ${side} (${formatINR(betAmount, 0)})`}
                </button>
              )}

              {/* Pick Heads or Tails */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                  Pick Side ({nextMultiplier.toFixed(2)}× Next)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => flipCoin('HEADS')}
                    disabled={flipping}
                    className={`h-11 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-2 ${
                      side === 'HEADS'
                        ? 'bg-[#f59e0b] text-[#070b14] border-amber-300'
                        : 'bg-[#070b14] text-white border-[#24324f] hover:bg-[#1e293b]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-300 inline-block" />
                    <span>Heads (Gold)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => flipCoin('TAILS')}
                    disabled={flipping}
                    className={`h-11 rounded-xl font-extrabold text-xs border flex items-center justify-center gap-2 ${
                      side === 'TAILS'
                        ? 'bg-[#10b981] text-[#070b14] border-emerald-300'
                        : 'bg-[#070b14] text-white border-[#24324f] hover:bg-[#1e293b]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-300 inline-block" />
                    <span>Tails (Emerald)</span>
                  </button>
                </div>
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
                    disabled={isRoundActive || flipping}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                    disabled={isRoundActive || flipping}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={isRoundActive || flipping}
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
                      disabled={isRoundActive || flipping}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Streak Telemetry */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#24324f]">
                  <span className="block text-[11px] text-[#94a3b8]">Current Streak</span>
                  <span className="text-base font-mono font-bold text-white tabular-nums">
                    {streak} {streak === 1 ? 'Hit' : 'Hits'}
                  </span>
                </div>
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#24324f]">
                  <span className="block text-[11px] text-[#94a3b8]">Multiplier</span>
                  <span className="text-base font-mono font-bold text-[#10b981] tabular-nums">
                    {currentMultiplier.toFixed(2)}×
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>Royal Mohur Streak · 98.0% RTP</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Coinflip Stage */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-10 royal-surface">
            {/* History Badges */}
            <div className="flex items-center justify-between gap-2 w-full h-8 overflow-x-auto no-scrollbar">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#fbbf24] shrink-0">
                <Coins className="w-4 h-4" /> GOLD MOHUR TOSS
              </span>
              <div className="flex items-center gap-1.5">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 ${
                      h === 'HEADS'
                        ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40'
                        : 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    }`}
                  >
                    {h === 'HEADS' ? 'H' : 'T'}
                  </span>
                ))}
              </div>
            </div>

            {/* Central 3D Coin */}
            <div className="my-4 sm:my-6 flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={() => flipCoin(side)}
                disabled={flipping}
                className={`w-40 h-40 sm:w-56 sm:h-56 rounded-full border-8 flex flex-col items-center justify-center shadow-2xl transition-transform duration-300 cursor-pointer ${
                  flipping ? 'animate-spin scale-95' : 'scale-100 hover:scale-105'
                } ${
                  result === 'TAILS'
                    ? 'bg-gradient-to-br from-[#10b981] to-[#047857] border-emerald-200 text-[#070b14]'
                    : 'bg-gradient-to-br from-[#fbbf24] to-[#d97706] border-amber-200 text-[#070b14]'
                }`}
              >
                <span className="text-5xl sm:text-6xl font-extrabold font-mono">
                  {flipping ? '₹' : result ? (result === 'HEADS' ? 'H' : 'T') : 'H'}
                </span>
                <span className="text-xs font-extrabold mt-2 tracking-widest">
                  {flipping ? 'TOSSING' : result || 'TAP TO TOSS'}
                </span>
              </button>

              {/* Streak Multiplier Chain Preview */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-full px-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const m = +(0.98 * Math.pow(2, s)).toFixed(2);
                  const reached = streak >= s;
                  return (
                    <div
                      key={s}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tabular-nums ${
                        reached
                          ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                          : 'bg-[#131c31] border-[#24324f] text-[#94a3b8]'
                      }`}
                    >
                      {s}× Hit: {m}×
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-[#94a3b8] w-full flex flex-wrap justify-between gap-2 pt-2 border-t border-[#24324f]">
              <span>Chain consecutive flips to compound your multiplier</span>
              <span>Cash out anytime after 1+ hit</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}