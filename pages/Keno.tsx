import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, KENO_PAYOUTS, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Shuffle, Trash2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Keno() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [risk, setRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [selected, setSelected] = useState<number[]>([3, 12, 19, 27, 34]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'DRAWING' | 'RESULT'>('IDLE');
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoRef = useRef({ active: false, count: 0, remaining: 0 });
  const drawIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    return () => {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
      setAutoActive(false);
    };
  }, []);

  const toggleNumber = (n: number) => {
    if (gameState === 'DRAWING' || autoActive) return;
    setDrawn([]);
    setLastMultiplier(null);
    if (selected.includes(n)) {
      setSelected(selected.filter((x) => x !== n));
    } else if (selected.length < 10) {
      setSelected([...selected, n]);
    }
    audio.playClick();
  };

  const autoPick = () => {
    if (gameState === 'DRAWING' || autoActive) return;
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const picks: number[] = [];
    while (picks.length < 10) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    setSelected(picks.sort((a, b) => a - b));
    setDrawn([]);
    setLastMultiplier(null);
    audio.playClick();
  };

  const clearTable = () => {
    if (gameState === 'DRAWING' || autoActive) return;
    setSelected([]);
    setDrawn([]);
    setLastMultiplier(null);
    audio.playClick();
  };

  const payoutTable = selected.length > 0 ? KENO_PAYOUTS[risk][selected.length] || [] : [];
  const hitsCount = selected.filter((x) => drawn.includes(x)).length;

  const draw = () => {
    if (
      gameState === 'DRAWING' ||
      betAmount > engine.getSession().balance ||
      selected.length === 0 ||
      betAmount <= 0
    ) {
      if (autoRef.current.active) setAutoActive(false);
      return;
    }

    setGameState('DRAWING');
    setDrawn([]);
    setLastMultiplier(null);
    audio.playBet();

    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const floats = engine.getNextFloats(10);
    const finalDrawn: number[] = [];
    for (let i = 0; i < 10; i++) {
      const f = floats[i] ?? Math.random();
      const idx = Math.floor(f * pool.length);
      finalDrawn.push(pool.splice(idx, 1)[0]);
    }

    if (engine.getSession().settings.instantBet) {
      setDrawn(finalDrawn);
      finalizeKeno(finalDrawn);
      return;
    }

    let step = 0;
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    drawIntervalRef.current = setInterval(() => {
      step++;
      setDrawn(finalDrawn.slice(0, step));
      audio.playSpin();

      if (step >= 10) {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        finalizeKeno(finalDrawn);
      }
    }, 65);
  };

  const finalizeKeno = (finalDrawn: number[]) => {
    const hits = selected.filter((x) => finalDrawn.includes(x)).length;
    const table = KENO_PAYOUTS[risk][selected.length] || [];
    const mult = table[hits] ?? 0;

    setLastMultiplier(mult);
    if (mult > 0) audio.playWin();
    else audio.playLoss();

    engine.placeBet(
      GameType.KENO,
      betAmount,
      mult,
      `Keno (${risk}): ${hits}/${selected.length} hits (${mult}x)`
    );
    setGameState('RESULT');
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoActive && gameState !== 'DRAWING') {
      const { count, remaining } = autoRef.current;
      if (engine.getSession().balance < betAmount || selected.length === 0) {
        setAutoActive(false);
        return;
      }
      if (count === 0 || remaining > 0) {
        timeout = setTimeout(() => {
          draw();
          if (count > 0) setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
        }, 700);
      } else {
        setAutoActive(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [gameState, autoActive, betAmount, risk, selected]);

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      if (selected.length === 0) return;
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
    }
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    KENO 40 BAZAR
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-2 py-0.5 rounded">
                  99.0% RTP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => setMode('MANUAL')}
                  disabled={autoActive || gameState === 'DRAWING'}
                  className={`py-2 rounded-lg text-xs font-extrabold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setMode('AUTO')}
                  disabled={autoActive || gameState === 'DRAWING'}
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
                    disabled={gameState === 'DRAWING' || autoActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                    disabled={gameState === 'DRAWING' || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={gameState === 'DRAWING' || autoActive}
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
                      disabled={gameState === 'DRAWING' || autoActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Risk</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRisk(r)}
                      disabled={gameState === 'DRAWING' || autoActive}
                      className={`py-2 rounded-lg text-xs font-extrabold capitalize ${
                        risk === r ? 'bg-[#131c31] text-[#fbbf24] border border-[#f59e0b]/40' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Pick & Clear */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={autoPick}
                  disabled={gameState === 'DRAWING' || autoActive}
                  className="h-11 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#fbbf24]" /> Auto Pick
                </button>
                <button
                  type="button"
                  onClick={clearTable}
                  disabled={gameState === 'DRAWING' || autoActive || selected.length === 0}
                  className="h-11 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#f43f5e]" /> Clear Table
                </button>
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

              {mode === 'MANUAL' ? (
                <button
                  type="button"
                  onClick={draw}
                  disabled={gameState === 'DRAWING' || selected.length === 0 || betAmount <= 0}
                  className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center"
                >
                  {gameState === 'DRAWING' ? 'Drawing...' : `Draw Numbers (${formatINR(betAmount, 0)})`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAuto}
                  disabled={selected.length === 0}
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

              {lastMultiplier !== null && (
                <div className="p-3 rounded-xl bg-[#070b14] border border-[#24324f] flex items-center justify-between text-xs">
                  <span className="text-[#94a3b8]">Last Draw Payout</span>
                  <span className={`font-mono font-bold ${lastMultiplier > 0 ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>
                    {formatINR(betAmount * lastMultiplier)} ({lastMultiplier}×)
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>40-Number Lotto Draw</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right 40-Tile Keno Stage */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 space-y-6 royal-surface min-w-0">
            {/* 8x5 Grid of 40 Tiles */}
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 sm:gap-2.5 max-w-2xl w-full mx-auto my-auto">
              {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
                const isSelected = selected.includes(n);
                const isDrawn = drawn.includes(n);
                const isHit = isSelected && isDrawn;

                let btnStyle =
                  'bg-[#131c31] hover:bg-[#1e293b] text-white border-b-4 border-[#070b14]';
                if (isHit) {
                  btnStyle = 'bg-[#10b981] text-[#070b14] border-b-4 border-[#059669] shadow-lg';
                } else if (isDrawn) {
                  btnStyle = 'bg-[#070b14] text-[#f43f5e] border border-[#f43f5e]/50';
                } else if (isSelected) {
                  btnStyle = 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] border-b-4 border-[#b45309]';
                }

                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNumber(n)}
                    disabled={gameState === 'DRAWING' || autoActive}
                    className={`h-11 sm:h-14 rounded-xl font-mono font-extrabold text-sm sm:text-base flex items-center justify-center transition-colors ${btnStyle}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Payout Multiplier Ladder */}
            <div className="space-y-2 max-w-2xl w-full mx-auto overflow-x-auto no-scrollbar">
              {selected.length === 0 ? (
                <div className="bg-[#131c31] py-3 px-4 rounded-xl text-center text-xs font-medium text-[#94a3b8]">
                  Select 1 to 10 numbers on the board to view payout multipliers
                </div>
              ) : (
                <div
                  className="grid gap-1.5 min-w-[300px]"
                  style={{ gridTemplateColumns: `repeat(${payoutTable.length}, minmax(0, 1fr))` }}
                >
                  {payoutTable.map((mult, hitsIdx) => {
                    const isActiveHit = drawn.length === 10 && hitsCount === hitsIdx;
                    return (
                      <div
                        key={hitsIdx}
                        className={`rounded-xl py-2 px-1 text-center border transition-colors ${
                          isActiveHit
                            ? 'bg-[#10b981] text-[#070b14] border-white font-extrabold'
                            : 'bg-[#131c31] text-white border-[#24324f]'
                        }`}
                      >
                        <div className="text-[10px] sm:text-xs font-mono font-bold tabular-nums">
                          {mult}×
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isActiveHit ? 'text-[#070b14]' : 'text-[#94a3b8]'
                          }`}
                        >
                          {hitsIdx}× hit
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}