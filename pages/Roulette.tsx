import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, RotateCcw, Trash2, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const CHIPS = [100, 500, 1000, 5000];

export default function Roulette() {
  const [balance, setBalance] = useState<number>(engine.getSession().balance);
  const [selectedChip, setSelectedChip] = useState<number>(500);
  // Pre-populate a ₹500 chip on RED so Spin Wheel works immediately on first tap!
  const [bets, setBets] = useState<Record<string, number>>({ RED: 500 });
  const [betHistoryStack, setBetHistoryStack] = useState<string[]>(['RED']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([17, 0, 32, 8, 19, 24, 5]);

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = engine.subscribe((s) => setBalance(s.balance));
    return () => {
      unsub();
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, []);

  const totalWager = (Object.values(bets) as number[]).reduce((sum, v) => sum + v, 0);

  const placeChip = (spot: string) => {
    if (spinning) return;
    audio.playClick();
    setBets((prev) => ({
      ...prev,
      [spot]: (prev[spot] || 0) + selectedChip,
    }));
    setBetHistoryStack((prev) => [...prev, spot]);
  };

  const quickPickLucky5 = () => {
    if (spinning) return;
    audio.playClick();
    const nextBets: Record<string, number> = {};
    const stack: string[] = [];
    for (let i = 0; i < 5; i++) {
      const n = Math.floor(Math.random() * 37);
      const key = `NUM_${n}`;
      nextBets[key] = (nextBets[key] || 0) + selectedChip;
      stack.push(key);
    }
    setBets(nextBets);
    setBetHistoryStack(stack);
  };

  const undoBet = () => {
    if (spinning || betHistoryStack.length === 0) return;
    audio.playClick();
    const lastSpot = betHistoryStack[betHistoryStack.length - 1];
    setBetHistoryStack((prev) => prev.slice(0, -1));
    setBets((prev) => {
      const next = { ...prev };
      if (next[lastSpot] <= selectedChip) delete next[lastSpot];
      else next[lastSpot] -= selectedChip;
      return next;
    });
  };

  const clearBets = () => {
    if (spinning) return;
    audio.playClick();
    setBets({});
    setBetHistoryStack([]);
  };

  const doubleBets = () => {
    if (spinning || totalWager === 0) return;
    audio.playClick();
    setBets((prev) => {
      const next: Record<string, number> = {};
      Object.entries(prev).forEach(([k, v]) => {
        next[k] = (v as number) * 2;
      });
      return next;
    });
  };

  const evaluateSpotMultiplier = (spot: string, winningNumber: number): number => {
    if (spot.startsWith('NUM_')) {
      const n = parseInt(spot.replace('NUM_', ''), 10);
      return n === winningNumber ? 36 : 0;
    }
    if (winningNumber === 0) return 0;

    const isRed = REDS.includes(winningNumber);
    const isEven = winningNumber % 2 === 0;

    switch (spot) {
      case 'RED':
        return isRed ? 2 : 0;
      case 'BLACK':
        return !isRed ? 2 : 0;
      case 'EVEN':
        return isEven ? 2 : 0;
      case 'ODD':
        return !isEven ? 2 : 0;
      case '1_18':
        return winningNumber >= 1 && winningNumber <= 18 ? 2 : 0;
      case '19_36':
        return winningNumber >= 19 && winningNumber <= 36 ? 2 : 0;
      case 'DOZ_1':
        return winningNumber >= 1 && winningNumber <= 12 ? 3 : 0;
      case 'DOZ_2':
        return winningNumber >= 13 && winningNumber <= 24 ? 3 : 0;
      case 'DOZ_3':
        return winningNumber >= 25 && winningNumber <= 36 ? 3 : 0;
      default:
        return 0;
    }
  };

  const spin = () => {
    if (spinning) return;

    let activeBets = bets;
    let activeWager = totalWager;

    // If user cleared table and clicked Spin, default to selectedChip on RED so Spin always works!
    if (activeWager <= 0) {
      activeBets = { RED: selectedChip };
      activeWager = selectedChip;
      setBets(activeBets);
      setBetHistoryStack(['RED']);
    }

    if (engine.getSession().balance < activeWager) {
      engine.resetBalance();
    }

    setSpinning(true);
    setLastPayout(null);
    audio.playBet();
    audio.playSpin();

    const delay = engine.getSession().settings.instantBet ? 180 : 900;

    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.ROULETTE,
        activeWager,
        (r) => {
          const num = engine.calculateRouletteResult(r);
          let totalReturn = 0;

          Object.entries(activeBets).forEach(([spot, stake]) => {
            const mult = evaluateSpotMultiplier(spot, num);
            totalReturn += (stake as number) * mult;
          });

          const effectiveMultiplier = activeWager > 0 ? +(totalReturn / activeWager).toFixed(4) : 0;

          setResult(num);
          setLastPayout(totalReturn);
          setHistory((prev) => [num, ...prev].slice(0, 12));
          setSpinning(false);

          if (totalReturn > 0) audio.playWin();
          else audio.playLoss();

          return {
            multiplier: effectiveMultiplier,
            outcome: `Roulette: ${num} (${num === 0 ? 'Zero' : REDS.includes(num) ? 'Red' : 'Black'})`,
          };
        },
        ''
      );
    }, delay);
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        {/* flex-col-reverse on mobile puts the Roulette Stage on TOP and Spin button right below */}
        <div className="flex flex-col-reverse lg:flex-row min-h-[560px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Spin CTA at top of controls */}
              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center"
              >
                {spinning
                  ? 'Spinning Wheel...'
                  : totalWager > 0
                  ? balance < totalWager
                    ? `Refill ₹25,000 & Spin (${formatINR(totalWager, 0)})`
                    : `Spin Wheel (${formatINR(totalWager, 0)})`
                  : `Spin Red (${formatINR(selectedChip, 0)})`}
              </button>

              {/* Chip Value Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-2">
                  Select INR Chip ({formatINR(selectedChip, 0)})
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setSelectedChip(chip);
                        audio.playClick();
                      }}
                      disabled={spinning}
                      className={`h-11 rounded-full font-mono text-xs font-extrabold border-2 flex items-center justify-center shadow ${
                        selectedChip === chip
                          ? 'bg-[#f59e0b] text-[#070b14] border-white'
                          : 'bg-[#070b14] text-[#fbbf24] border-[#24324f] hover:border-[#f59e0b]'
                      }`}
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Bet Buttons */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                  1-Tap Quick Bets
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => placeChip('RED')}
                    disabled={spinning}
                    className="h-9 rounded-lg bg-[#be123c] hover:bg-[#e11d48] text-white text-xs font-bold"
                  >
                    + Red (2×)
                  </button>
                  <button
                    type="button"
                    onClick={() => placeChip('BLACK')}
                    disabled={spinning}
                    className="h-9 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-white text-xs font-bold"
                  >
                    + Black (2×)
                  </button>
                  <button
                    type="button"
                    onClick={quickPickLucky5}
                    disabled={spinning}
                    className="h-9 rounded-lg bg-[#1d2a47] hover:bg-[#24324f] text-[#fbbf24] text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" /> Lucky 5
                  </button>
                </div>
              </div>

              {/* Total Bet Readout */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Total Table Stake</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(totalWager)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {formatINR(totalWager)}
                  </span>
                  <button
                    type="button"
                    onClick={doubleBets}
                    disabled={spinning || totalWager === 0}
                    className="px-2.5 py-1 bg-[#131c31] hover:bg-[#1d2a47] rounded-lg text-xs font-bold text-[#fbbf24]"
                  >
                    2× All
                  </button>
                </div>
              </div>

              {/* Undo / Clear */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={undoBet}
                  disabled={spinning || betHistoryStack.length === 0}
                  className="h-10 bg-[#1d2a47] hover:bg-[#24324f] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Undo
                </button>
                <button
                  type="button"
                  onClick={clearBets}
                  disabled={spinning || totalWager === 0}
                  className="h-10 bg-[#1d2a47] hover:bg-[#24324f] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Table
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>97.3% RTP · 36× Straight</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Fairness
              </Link>
            </div>
          </div>

          {/* Right European Roulette Felt Stage (Top on Mobile, Right on Desktop) */}
          <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-6 space-y-4 felt-surface min-w-0">
            {/* Top History & Wheel Result Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070b14]/80 p-3.5 sm:p-4 rounded-2xl border border-[#f59e0b]/30">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#fbbf24] flex items-center justify-center font-mono text-xl sm:text-2xl font-extrabold shadow-xl shrink-0 ${
                    spinning ? 'animate-spin' : ''
                  } ${
                    result === null
                      ? 'bg-[#0d1322] text-[#fbbf24]'
                      : result === 0
                      ? 'bg-[#10b981] text-[#070b14]'
                      : REDS.includes(result)
                      ? 'bg-[#e11d48] text-white'
                      : 'bg-[#0f172a] text-white'
                  }`}
                >
                  {result !== null ? result : '0'}
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs text-[#94a3b8]">Maharaja European Wheel</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">
                    {spinning
                      ? 'Ivory ball spinning in wheel...'
                      : result !== null
                      ? `Winning Number: ${result} (${
                          result === 0 ? 'Green Zero · 36×' : REDS.includes(result) ? 'Red' : 'Black'
                        })`
                      : 'Tap numbers or boxes below to place INR chips'}
                  </div>
                  {lastPayout !== null && !spinning && (
                    <div
                      className={`text-xs font-mono font-extrabold mt-0.5 ${
                        lastPayout > 0 ? 'text-[#10b981]' : 'text-[#94a3b8]'
                      }`}
                    >
                      {lastPayout > 0 ? `WON +${formatINR(lastPayout)}` : 'No win on this spin'}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Numbers Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {history.map((n, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold tabular-nums shrink-0 border border-white/20 ${
                      n === 0
                        ? 'bg-[#10b981] text-[#070b14]'
                        : REDS.includes(n)
                        ? 'bg-[#e11d48] text-white'
                        : 'bg-[#0f172a] text-white'
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Responsive European Roulette Board — Fits Mobile & Desktop without horizontal clipping */}
            <div className="w-full space-y-2 bg-[#070b14]/70 p-3 sm:p-4 rounded-2xl border border-[#f59e0b]/30">
              {/* Even-Money Outside Bets Row (2x) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: 'RED', label: 'Red (2×)', bg: 'bg-[#be123c] hover:bg-[#e11d48]' },
                  { id: 'BLACK', label: 'Black (2×)', bg: 'bg-[#0f172a] hover:bg-[#1e293b]' },
                  { id: 'EVEN', label: 'Even (2×)', bg: 'bg-[#0d1322] hover:bg-[#131c31]' },
                  { id: 'ODD', label: 'Odd (2×)', bg: 'bg-[#0d1322] hover:bg-[#131c31]' },
                  { id: '1_18', label: '1–18 (2×)', bg: 'bg-[#0d1322] hover:bg-[#131c31]' },
                  { id: '19_36', label: '19–36 (2×)', bg: 'bg-[#0d1322] hover:bg-[#131c31]' },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => placeChip(o.id)}
                    className={`h-10 rounded-xl ${o.bg} border border-[#24324f] text-xs font-bold text-white flex items-center justify-center gap-1`}
                  >
                    <span>{o.label}</span>
                    {bets[o.id] && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#fbbf24] text-[#070b14] font-mono text-[10px] font-extrabold">
                        ₹{bets[o.id] >= 1000 ? `${bets[o.id] / 1000}K` : bets[o.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Dozens Row (3x) */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'DOZ_1', label: '1st 12 (3×)' },
                  { id: 'DOZ_2', label: '2nd 12 (3×)' },
                  { id: 'DOZ_3', label: '3rd 12 (3×)' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => placeChip(d.id)}
                    className="h-9 rounded-xl bg-[#0d1322] hover:bg-[#131c31] border border-[#24324f] text-xs font-bold text-white flex items-center justify-center gap-1.5"
                  >
                    <span>{d.label}</span>
                    {bets[d.id] && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#fbbf24] text-[#070b14] font-mono text-[10px] font-extrabold">
                        ₹{bets[d.id] >= 1000 ? `${bets[d.id] / 1000}K` : bets[d.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Zero + 1-36 Straight-Up Numbers (36x) */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => placeChip('NUM_0')}
                  className={`w-full h-9 rounded-xl font-mono font-extrabold text-xs flex items-center justify-center gap-2 border ${
                    result === 0
                      ? 'bg-[#10b981] text-[#070b14] border-white'
                      : 'bg-[#059669] hover:bg-[#10b981] text-white border-[#10b981]/50'
                  }`}
                >
                  <span>0 GREEN ZERO (36×)</span>
                  {bets['NUM_0'] && (
                    <span className="px-2 py-0.5 rounded-full bg-[#fbbf24] text-[#070b14] text-[10px] font-extrabold">
                      ₹{bets['NUM_0']}
                    </span>
                  )}
                </button>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {Array.from({ length: 36 }, (_, idx) => idx + 1).map((num) => {
                    const isRed = REDS.includes(num);
                    const spotKey = `NUM_${num}`;
                    const chipAmt = bets[spotKey];
                    const isWinner = result === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => placeChip(spotKey)}
                        className={`h-10 sm:h-11 rounded-xl font-mono font-bold text-xs flex flex-col items-center justify-center relative border ${
                          isWinner ? 'ring-2 ring-[#fbbf24] z-10' : ''
                        } ${
                          isRed
                            ? 'bg-[#be123c] hover:bg-[#e11d48] text-white border-[#f43f5e]/40'
                            : 'bg-[#0f172a] hover:bg-[#1e293b] text-white border-[#334155]'
                        }`}
                      >
                        <span>{num}</span>
                        {chipAmt && (
                          <span className="px-1 rounded-full bg-[#fbbf24] text-[#070b14] text-[9px] font-extrabold leading-tight">
                            ₹{chipAmt >= 1000 ? `${chipAmt / 1000}K` : chipAmt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-white/80 flex flex-wrap justify-between gap-2 pt-1 border-t border-white/15">
              <span>Straight Up: 36× · Dozens: 3× · Red/Black/Even/Odd: 2×</span>
              <span>Maharaja Single-Zero Felt Table</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}