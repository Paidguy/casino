import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { RotateCcw, Trash2, ShieldCheck, Compass } from 'lucide-react';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const FRENCH_CALL_BETS: {
  id: string;
  name: string;
  desc: string;
  numbers: number[];
}[] = [
  {
    id: 'VOISINS',
    name: 'Voisins du Zéro',
    desc: '17 Neighbors of Zero',
    numbers: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
  },
  {
    id: 'TIERS',
    name: 'Tiers du Cylindre',
    desc: '12 Opposite Wheel Pocket Numbers',
    numbers: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
  },
  {
    id: 'ORPHELINS',
    name: 'Orphelins',
    desc: '8 Orphan Wheel Slice Numbers',
    numbers: [1, 20, 14, 31, 9, 17, 34, 6],
  },
  {
    id: 'JEU_ZERO',
    name: 'Jeu Zéro (Zero Game)',
    desc: '7 Closest Pockets to Green 0',
    numbers: [12, 35, 3, 26, 0, 32, 15],
  },
];

type BetSpot = string;

export const Roulette: React.FC = () => {
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [bets, setBets] = useState<Record<BetSpot, number>>({});
  const [lastBets, setLastBets] = useState<Record<BetSpot, number>>({});
  const [spinning, setSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(17);
  const [history, setHistory] = useState<number[]>([17, 0, 32, 8, 19, 23, 4, 12]);
  const [winPayout, setWinPayout] = useState<number>(0);

  const totalBet: number = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  const addBet = (spot: BetSpot) => {
    if (spinning) return;
    const state = gameEngine.getState();
    if (totalBet + selectedChip > state.balance) return;

    sound.click();
    setBets((prev) => ({
      ...prev,
      [spot]: (prev[spot] || 0) + selectedChip,
    }));
  };

  const addCallBet = (numbers: number[]) => {
    if (spinning) return;
    const state = gameEngine.getState();
    const totalCost = numbers.length * selectedChip;
    if (totalBet + totalCost > state.balance) return;

    sound.click();
    setBets((prev) => {
      const next = { ...prev };
      numbers.forEach((n) => {
        const key = `N_${n}`;
        next[key] = (next[key] || 0) + selectedChip;
      });
      return next;
    });
  };

  const clearBets = () => {
    if (spinning) return;
    setBets({});
    setWinPayout(0);
  };

  const repeatBets = () => {
    if (spinning || Object.keys(lastBets).length === 0) return;
    setBets(lastBets);
  };

  const doubleBets = () => {
    if (spinning || totalBet === 0) return;
    const state = gameEngine.getState();
    if (totalBet * 2 > state.balance) return;
    const doubled: Record<BetSpot, number> = {};
    (Object.entries(bets) as [string, number][]).forEach(([k, v]) => {
      doubled[k] = v * 2;
    });
    setBets(doubled);
  };

  const spinWheel = () => {
    if (spinning || totalBet <= 0) return;
    const state = gameEngine.getState();
    if (totalBet > state.balance) return;

    sound.click();
    setSpinning(true);
    setWinPayout(0);
    setLastBets(bets);

    const floatVal = gameEngine.getNextFloats(1)[0] ?? Math.random();
    const result = Math.floor(floatVal * 37);
    const targetIdx = WHEEL_ORDER.indexOf(result);
    const pocketDeg = 360 / 37;
    const nextAngle = wheelAngle + 1440 + (360 - targetIdx * pocketDeg);
    setWheelAngle(nextAngle);
    setBallAngle((prev) => prev - 2160);

    setTimeout(() => {
      setWinningNumber(result);
      setHistory((prev) => [result, ...prev.slice(0, 11)]);

      let totalReturn = 0;
      (Object.entries(bets) as [string, number][]).forEach(([spot, amount]) => {
        if (spot === `N_${result}`) totalReturn += amount * 36;
        else if (spot === 'RED' && result !== 0 && RED_NUMBERS.has(result)) totalReturn += amount * 2;
        else if (spot === 'BLACK' && result !== 0 && !RED_NUMBERS.has(result)) totalReturn += amount * 2;
        else if (spot === 'EVEN' && result !== 0 && result % 2 === 0) totalReturn += amount * 2;
        else if (spot === 'ODD' && result !== 0 && result % 2 === 1) totalReturn += amount * 2;
        else if (spot === '1_18' && result >= 1 && result <= 18) totalReturn += amount * 2;
        else if (spot === '19_36' && result >= 19 && result <= 36) totalReturn += amount * 2;
        else if (spot === 'DOZ_1' && result >= 1 && result <= 12) totalReturn += amount * 3;
        else if (spot === 'DOZ_2' && result >= 13 && result <= 24) totalReturn += amount * 3;
        else if (spot === 'DOZ_3' && result >= 25 && result <= 36) totalReturn += amount * 3;
        else if (spot === 'COL_1' && result !== 0 && result % 3 === 1) totalReturn += amount * 3;
        else if (spot === 'COL_2' && result !== 0 && result % 3 === 2) totalReturn += amount * 3;
        else if (spot === 'COL_3' && result !== 0 && result % 3 === 0) totalReturn += amount * 3;
      });

      const effectiveMultiplier = totalBet > 0 ? totalReturn / totalBet : 0;
      gameEngine.placeBet('European Roulette', totalBet, Number(effectiveMultiplier.toFixed(2)));

      if (totalReturn > 0) {
        sound.win();
        setWinPayout(totalReturn);
      } else {
        sound.lose();
      }

      setSpinning(false);
    }, 1400);
  };

  const getNumColor = (n: number) => {
    if (n === 0) return 'bg-emerald-600 text-white border-emerald-400';
    return RED_NUMBERS.has(n)
      ? 'bg-rose-600 text-white border-rose-400'
      : 'bg-slate-800 text-white border-slate-600';
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Chip Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Select Chip Value (₹)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[50, 100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setSelectedChip(val)}
                className={`aspect-square rounded-full font-mono font-black text-xs flex items-center justify-center border-2 border-dashed transition-all ${
                  selectedChip === val
                    ? 'bg-amber-500 text-slate-950 border-white scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-[#151f30] text-slate-300 border-slate-600 hover:border-slate-400'
                }`}
              >
                {val >= 1000 ? `${val / 1000}K` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Total Stake Summary */}
        <div className="bg-[#151f30] p-3.5 rounded-xl border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Total Table Bet</div>
            <div className="text-lg font-mono font-black text-white">
              ₹{totalBet.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={repeatBets}
              disabled={spinning || Object.keys(lastBets).length === 0}
              className="p-2 bg-[#1e2b42] hover:bg-[#283956] rounded-lg text-slate-300 disabled:opacity-40"
              title="Repeat Last Bet"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={doubleBets}
              disabled={spinning || totalBet === 0}
              className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#283956] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40"
            >
              2×
            </button>
            <button
              onClick={clearBets}
              disabled={spinning || totalBet === 0}
              className="p-2 bg-[#1e2b42] hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-300 disabled:opacity-40"
              title="Clear Table"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* French Racetrack Call Bets */}
        <div className="bg-[#151f30]/60 rounded-xl border border-white/10 p-3 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> French Racetrack Call Bets
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {FRENCH_CALL_BETS.map((call) => (
              <button
                key={call.id}
                type="button"
                disabled={spinning}
                onClick={() => addCallBet(call.numbers)}
                className="p-2 rounded-lg bg-[#0b101b] hover:bg-[#1e2b42] border border-white/10 text-left transition-colors disabled:opacity-40"
              >
                <div className="text-[11px] font-black text-white truncate">{call.name}</div>
                <div className="text-[9px] font-mono text-slate-400">
                  {call.numbers.length} Chips (₹{(call.numbers.length * selectedChip).toLocaleString('en-IN')})
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Spots Breakdown */}
        <div className="flex-1 bg-[#151f30]/60 rounded-xl border border-white/5 p-3 overflow-y-auto max-h-36 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Active Chips on Felt ({Object.keys(bets).length})
          </div>
          {Object.keys(bets).length === 0 ? (
            <div className="text-xs text-slate-500 py-3 text-center">
              Click any number, racetrack sector, or color to place chips
            </div>
          ) : (
            (Object.entries(bets) as [string, number][]).map(([spot, amt]) => (
              <div key={spot} className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">{spot.replace('N_', 'Straight #')}</span>
                <span className="text-amber-400 font-bold">₹{amt.toLocaleString('en-IN')}</span>
              </div>
            ))
          )}
        </div>

        {/* Primary CTA Button */}
        <div className="order-first lg:order-none">
          <button
            onClick={spinWheel}
            disabled={spinning || totalBet <= 0}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:bg-[#1e2b42] disabled:from-transparent disabled:to-transparent disabled:text-slate-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
          >
            {spinning
              ? 'Spinning Wheel...'
              : totalBet > 0
              ? `Spin Wheel (₹${totalBet.toLocaleString('en-IN')})`
              : 'Place Chips to Spin'}
          </button>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Single-Zero European (97.3% RTP)
          </span>
        </div>
      </div>

      {/* Main Roulette Stage */}
      <div className="flex-1 felt-surface p-4 sm:p-6 flex flex-col justify-between gap-6 overflow-x-auto">
        {/* Top Wheel & Recent Numbers Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0b111e]/85 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-4">
            {/* Animated SVG 37-Pocket European Roulette Wheel with Orbiting Ivory Ball */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full drop-shadow-[0_4px_15px_rgba(0,0,0,0.7)] transition-transform duration-[1400ms] ease-out"
                style={{ transform: `rotate(${wheelAngle}deg)` }}
              >
                <circle cx="60" cy="60" r="58" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                {WHEEL_ORDER.map((num, idx) => {
                  const startAngle = (idx * 360) / 37;
                  const endAngle = ((idx + 1) * 360) / 37;
                  const rad1 = ((startAngle - 90) * Math.PI) / 180;
                  const rad2 = ((endAngle - 90) * Math.PI) / 180;
                  const x1 = 60 + 54 * Math.cos(rad1);
                  const y1 = 60 + 54 * Math.sin(rad1);
                  const x2 = 60 + 54 * Math.cos(rad2);
                  const y2 = 60 + 54 * Math.sin(rad2);
                  const color =
                    num === 0 ? '#10b981' : RED_NUMBERS.has(num) ? '#e11d48' : '#0f172a';
                  return (
                    <path
                      key={num}
                      d={`M60,60 L${x1},${y1} A54,54 0 0,1 ${x2},${y2} Z`}
                      fill={color}
                      stroke="#334155"
                      strokeWidth="0.5"
                    />
                  );
                })}
                <circle cx="60" cy="60" r="32" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="60" cy="60" r="10" fill="#f59e0b" />
              </svg>
              {/* Counter-Orbiting Ivory Ball */}
              <div
                className="absolute inset-0 pointer-events-none transition-transform duration-[1400ms] ease-out"
                style={{ transform: `rotate(${ballAngle}deg)` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff] mx-auto mt-2.5" />
              </div>
              {/* Center Winning Number Badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-base border-2 shadow-lg ${
                    winningNumber !== null ? getNumColor(winningNumber) : 'bg-slate-800 text-white'
                  }`}
                >
                  {winningNumber ?? '0'}
                </div>
              </div>
              {/* Top Pointer */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rotate-45 border border-slate-950" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {spinning ? 'Ivory Ball in Motion...' : 'Winning Pocket'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {winningNumber === 0
                  ? '0 — Green Zero'
                  : `${winningNumber} — ${RED_NUMBERS.has(winningNumber || 0) ? 'Red' : 'Black'} ${
                      (winningNumber || 0) % 2 === 0 ? 'Even' : 'Odd'
                    }`}
              </div>
              {winPayout > 0 && (
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  Won +₹{winPayout.toLocaleString('en-IN')}!
                </div>
              )}
            </div>
          </div>

          {/* Recent Roll History */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {history.map((n, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${getNumColor(
                  n
                )} ${idx === 0 ? 'ring-2 ring-amber-400 scale-105' : 'opacity-80'}`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* European Roulette Felt Board */}
        <div className="min-w-[660px] my-auto bg-[#0b1320]/90 p-4 rounded-2xl border border-white/10 shadow-inner">
          <div className="grid grid-cols-[56px_repeat(12,1fr)_52px] gap-1.5">
            {/* Zero */}
            <button
              onClick={() => addBet('N_0')}
              className="row-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-lg rounded-lg border border-emerald-400 flex items-center justify-center relative transition-colors"
            >
              0
              {bets['N_0'] && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full border border-white">
                  {bets['N_0']}
                </span>
              )}
            </button>

            {/* 3 Rows of 12 Numbers */}
            {[3, 2, 1].map((rem) =>
              Array.from({ length: 12 }, (_, col) => {
                const num = col * 3 + rem;
                const isRed = RED_NUMBERS.has(num);
                const spot = `N_${num}`;
                const isWinner = !spinning && winningNumber === num;
                return (
                  <button
                    key={num}
                    onClick={() => addBet(spot)}
                    className={`h-12 rounded-lg font-mono font-bold text-sm border transition-all relative flex items-center justify-center ${
                      isRed
                        ? 'bg-rose-600/90 hover:bg-rose-500 border-rose-400/50 text-white'
                        : 'bg-[#1a2436] hover:bg-[#25334d] border-white/15 text-white'
                    } ${isWinner ? 'ring-2 ring-amber-400 scale-105 z-10' : ''}`}
                  >
                    {num}
                    {bets[spot] && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border border-white shadow">
                        {bets[spot] >= 1000 ? `${bets[spot] / 1000}k` : bets[spot]}
                      </span>
                    )}
                  </button>
                );
              }).concat(
                <button
                  key={`col_${rem}`}
                  onClick={() => addBet(`COL_${rem === 3 ? 3 : rem}`)}
                  className="h-12 rounded-lg bg-[#151f30] hover:bg-[#1e2b42] border border-white/10 text-xs font-bold text-slate-300 relative"
                >
                  2:1
                  {bets[`COL_${rem === 3 ? 3 : rem}`] && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full">
                      {bets[`COL_${rem === 3 ? 3 : rem}`]}
                    </span>
                  )}
                </button>
              )
            )}
          </div>

          {/* Dozens */}
          <div className="grid grid-cols-3 gap-1.5 mt-2 pl-[62px] pr-[58px]">
            {[
              { id: 'DOZ_1', label: '1st 12 (1–12)' },
              { id: 'DOZ_2', label: '2nd 12 (13–24)' },
              { id: 'DOZ_3', label: '3rd 12 (25–36)' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => addBet(d.id)}
                className="py-2.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/10 rounded-lg text-xs font-bold text-slate-200 relative transition-colors"
              >
                {d.label}
                {bets[d.id] && (
                  <span className="ml-2 bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                    ₹{bets[d.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Outside 1:1 Bets */}
          <div className="grid grid-cols-6 gap-1.5 mt-1.5 pl-[62px] pr-[58px]">
            {[
              { id: '1_18', label: '1 to 18', cls: 'bg-[#151f30] hover:bg-[#1e2b42]' },
              { id: 'EVEN', label: 'EVEN', cls: 'bg-[#151f30] hover:bg-[#1e2b42]' },
              { id: 'RED', label: 'RED', cls: 'bg-rose-600/80 hover:bg-rose-600' },
              { id: 'BLACK', label: 'BLACK', cls: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'ODD', label: 'ODD', cls: 'bg-[#151f30] hover:bg-[#1e2b42]' },
              { id: '19_36', label: '19 to 36', cls: 'bg-[#151f30] hover:bg-[#1e2b42]' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => addBet(o.id)}
                className={`py-2.5 border border-white/10 rounded-lg text-xs font-bold text-white relative transition-colors ${o.cls}`}
              >
                {o.label}
                {bets[o.id] && (
                  <span className="ml-1.5 bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full">
                    ₹{bets[o.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};