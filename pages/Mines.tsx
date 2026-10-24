import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Sparkles, Bomb, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Mines() {
  const [balance, setBalance] = useState<number>(engine.getSession().balance);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStake, setActiveStake] = useState<number>(500);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [roundEnded, setRoundEnded] = useState(false);
  const [wonRound, setWonRound] = useState(false);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoSelectedTiles, setAutoSelectedTiles] = useState<number[]>([]);
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoRef = useRef({ active: false, count: 0, remaining: 0 });

  useEffect(() => {
    return engine.subscribe((s) => setBalance(s.balance));
  }, []);

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  const revealedSafeCount = revealed.filter((r, idx) => r && !grid[idx]).length;
  const currentMult = engine.getMinesMultiplier(minesCount, revealedSafeCount);
  const nextMult = engine.getMinesMultiplier(minesCount, revealedSafeCount + 1);

  const startManualGame = () => {
    if (isPlaying || betAmount <= 0) return;
    if (engine.getSession().balance < betAmount) {
      engine.resetBalance();
    }
    if (!engine.deductStake(betAmount)) return;

    audio.playBet();
    setActiveStake(betAmount);
    const newGrid = engine.generateMinesGrid(engine.peekNextRandom(), minesCount);
    setGrid(newGrid);
    setRevealed(Array(25).fill(false));
    setIsPlaying(true);
    setRoundEnded(false);
    setWonRound(false);
  };

  const handleTileClick = (i: number) => {
    if (mode === 'AUTO') {
      if (autoActive) return;
      if (autoSelectedTiles.includes(i)) {
        setAutoSelectedTiles(autoSelectedTiles.filter((t) => t !== i));
      } else if (autoSelectedTiles.length < 25 - minesCount) {
        setAutoSelectedTiles([...autoSelectedTiles, i]);
      }
      audio.playClick();
      return;
    }

    if (!isPlaying) {
      // Allow tapping directly on a tile when idle to start the round and reveal that tile immediately!
      if (betAmount <= 0) return;
      if (engine.getSession().balance < betAmount) {
        engine.resetBalance();
      }
      if (!engine.deductStake(betAmount)) return;

      audio.playBet();
      setActiveStake(betAmount);
      const newGrid = engine.generateMinesGrid(engine.peekNextRandom(), minesCount);
      const firstRev = Array(25).fill(false);
      firstRev[i] = true;
      setGrid(newGrid);
      setRevealed(firstRev);

      if (newGrid[i]) {
        setIsPlaying(false);
        setRoundEnded(true);
        setWonRound(false);
        audio.playLoss();
        engine.settleDeductedBet(
          GameType.MINES,
          betAmount,
          0,
          `Mines Tijori (${minesCount}m): Hit bomb on tile #1`
        );
      } else {
        setIsPlaying(true);
        setRoundEnded(false);
        setWonRound(false);
        audio.playTileSafe(1);
        if (25 - minesCount === 1) {
          const mult = engine.getMinesMultiplier(minesCount, 1);
          audio.playWin();
          engine.settleDeductedBet(
            GameType.MINES,
            betAmount,
            mult,
            `Mines Tijori (${minesCount}m): Cashed out 1 gold @ ${mult.toFixed(2)}x`
          );
          setIsPlaying(false);
          setRoundEnded(true);
          setWonRound(true);
        }
      }
      return;
    }

    if (revealed[i] || roundEnded) return;

    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);

    if (grid[i]) {
      setIsPlaying(false);
      setRoundEnded(true);
      setWonRound(false);
      audio.playLoss();
      engine.settleDeductedBet(
        GameType.MINES,
        activeStake,
        0,
        `Mines Tijori (${minesCount}m): Hit bomb after ${revealedSafeCount} gold bars`
      );
    } else {
      const nextSafeCount = revealedSafeCount + 1;
      audio.playTileSafe(nextSafeCount);
      if (nextSafeCount === 25 - minesCount) {
        cashOut(newRevealed);
      }
    }
  };

  const pickRandomTile = () => {
    if (!isPlaying || roundEnded) return;
    const unrevealedIndices = revealed
      .map((r, idx) => (!r ? idx : -1))
      .filter((idx) => idx !== -1);
    if (unrevealedIndices.length === 0) return;
    const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    handleTileClick(randomIdx);
  };

  const cashOut = (finalRev = revealed) => {
    if (!isPlaying) return;
    const count = finalRev.filter((r, idx) => r && !grid[idx]).length;
    if (count === 0) {
      pickRandomTile();
      return;
    }
    const mult = engine.getMinesMultiplier(minesCount, count);
    audio.playWin();
    engine.settleDeductedBet(
      GameType.MINES,
      activeStake,
      mult,
      `Mines Tijori (${minesCount}m): Cashed out ${count} gold @ ${mult.toFixed(2)}x`
    );
    setIsPlaying(false);
    setRoundEnded(true);
    setWonRound(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoActive) {
      interval = setInterval(() => {
        const { active, count, remaining } = autoRef.current;
        if (!active) return;

        if (engine.getSession().balance < betAmount || autoSelectedTiles.length === 0) {
          setAutoActive(false);
          return;
        }

        if (count === 0 || remaining > 0) {
          if (!engine.deductStake(betAmount)) {
            setAutoActive(false);
            return;
          }
          const newGrid = engine.generateMinesGrid(engine.peekNextRandom(), minesCount);
          const rev = Array(25).fill(false);
          let hitMine = false;

          autoSelectedTiles.forEach((idx) => {
            rev[idx] = true;
            if (newGrid[idx]) {
              hitMine = true;
            }
          });

          setGrid(newGrid);
          setRevealed(rev);
          setActiveStake(betAmount);
          setRoundEnded(true);

          if (hitMine) {
            setWonRound(false);
            audio.playLoss();
            engine.settleDeductedBet(GameType.MINES, betAmount, 0, `Mines Auto: Hit bomb`);
          } else {
            const mult = engine.getMinesMultiplier(minesCount, autoSelectedTiles.length);
            setWonRound(true);
            audio.playWin();
            engine.settleDeductedBet(
              GameType.MINES,
              betAmount,
              mult,
              `Mines Auto: Won @ ${mult.toFixed(2)}x`
            );
          }

          if (count > 0) {
            setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
          }
        } else {
          setAutoActive(false);
        }
      }, 900);
    }
    return () => clearInterval(interval);
  }, [autoActive, betAmount, minesCount, autoSelectedTiles]);

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      if (autoSelectedTiles.length === 0) {
        const picks: number[] = [];
        while (picks.length < 3) {
          const r = Math.floor(Math.random() * 25);
          if (!picks.includes(r)) picks.push(r);
        }
        setAutoSelectedTiles(picks);
      }
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
    }
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        {/* flex-col-reverse on mobile puts the 5x5 Vault Grid on TOP and Controls immediately below */}
        <div className="flex flex-col-reverse lg:flex-row min-h-[540px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary CTA Button — Placed at the top of controls so it sits directly beneath the 5x5 grid on mobile */}
              {mode === 'MANUAL' ? (
                !isPlaying ? (
                  <button
                    type="button"
                    onClick={startManualGame}
                    disabled={betAmount <= 0}
                    className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center"
                  >
                    {balance < betAmount
                      ? `Refill ₹25,000 & Open Vault (${formatINR(betAmount, 0)})`
                      : `Open Tijori Vault (${formatINR(betAmount, 0)})`}
                  </button>
                ) : revealedSafeCount === 0 ? (
                  <button
                    type="button"
                    onClick={pickRandomTile}
                    className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shuffle className="w-4 h-4" /> PICK RANDOM VAULT TILE
                    </span>
                    <span className="text-[11px] font-medium mt-0.5">
                      Or tap any tile on the 5×5 board above ({nextMult.toFixed(2)}×)
                    </span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => cashOut()}
                      className="col-span-2 h-14 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight"
                    >
                      <span>CASHOUT GOLD</span>
                      <span className="text-xs font-mono tabular-nums mt-0.5">
                        {formatINR(activeStake * currentMult)} ({currentMult.toFixed(2)}×)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={pickRandomTile}
                      className="h-14 bg-[#1d2a47] hover:bg-[#24324f] border border-[#f59e0b]/40 text-[#fbbf24] font-extrabold text-xs rounded-xl flex flex-col items-center justify-center leading-tight"
                    >
                      <Shuffle className="w-4 h-4 mb-0.5" />
                      <span>Random</span>
                    </button>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  onClick={toggleAuto}
                  className={`w-full h-14 font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center ${
                    autoActive
                      ? 'bg-[#f43f5e] text-white'
                      : 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14]'
                  }`}
                >
                  {autoActive
                    ? `Stop Autobet (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})`
                    : 'Start Autobet'}
                </button>
              )}

              {/* Manual / Auto Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('MANUAL');
                    setAutoActive(false);
                  }}
                  disabled={isPlaying || autoActive}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual Pick
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('AUTO');
                    setRoundEnded(false);
                  }}
                  disabled={isPlaying || autoActive}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'AUTO' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Auto Pattern
                </button>
              </div>

              {/* Bet Amount */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Lagaya Stake (INR)</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(betAmount)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={isPlaying || autoActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, +(betAmount / 2).toFixed(0)))}
                    disabled={isPlaying || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(+(betAmount * 2).toFixed(0))}
                    disabled={isPlaying || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
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
                      disabled={isPlaying || autoActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1d2a47] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mines Count Selector */}
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                  <span>Bombs in Tijori Vault</span>
                  <span className="font-mono text-[#fbbf24] tabular-nums">
                    {25 - minesCount - (isPlaying ? revealedSafeCount : 0)} Gold Left
                  </span>
                </div>
                <select
                  value={minesCount}
                  onChange={(e) => {
                    setMinesCount(Number(e.target.value));
                    setAutoSelectedTiles([]);
                  }}
                  disabled={isPlaying || autoActive}
                  className="w-full h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 text-sm font-mono font-bold text-white outline-none cursor-pointer disabled:opacity-60"
                >
                  {Array.from({ length: 24 }, (_, idx) => idx + 1).map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? 'Bomb' : 'Bombs'} ({25 - m} Gold Bars)
                    </option>
                  ))}
                </select>
              </div>

              {/* Stable Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#070b14] border border-[#24324f] rounded-xl p-2.5">
                  <span className="block text-[11px] text-[#94a3b8]">Current Bhav</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {currentMult.toFixed(2)}×
                  </span>
                </div>
                <div className="bg-[#070b14] border border-[#24324f] rounded-xl p-2.5">
                  <span className="block text-[11px] text-[#94a3b8]">Next Tile Bhav</span>
                  <span className="text-sm font-mono font-bold text-[#10b981] tabular-nums">
                    {nextMult.toFixed(2)}×
                  </span>
                </div>
              </div>

              {mode === 'AUTO' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                      Number of Bets (0 = Infinite)
                    </label>
                    <input
                      type="number"
                      value={autoBetCount}
                      onChange={(e) => setAutoBetCount(Math.max(0, Number(e.target.value)))}
                      disabled={autoActive}
                      className="w-full h-10 bg-[#070b14] border border-[#24324f] rounded-xl px-3 text-sm font-mono font-bold text-white outline-none"
                    />
                  </div>
                  <div className="text-xs text-[#94a3b8] flex justify-between">
                    <span>Tiles Selected: {autoSelectedTiles.length}</span>
                    <button
                      type="button"
                      onClick={() => setAutoSelectedTiles([])}
                      disabled={autoActive}
                      className="text-[#fbbf24] hover:underline font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>99.0% RTP · Mines Tijori</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Fairness
              </Link>
            </div>
          </div>

          {/* Right 5x5 Mines Tijori Grid Stage (Top on Mobile, Right on Desktop) */}
          <div className="flex-1 flex flex-col items-center justify-center p-3.5 sm:p-8 lg:p-10 relative royal-surface">
            <div className="text-xs font-bold text-[#fbbf24] mb-2.5 text-center">
              {isPlaying
                ? `Vault Active · Tap any tile to uncover Gold (${nextMult.toFixed(2)}× next)`
                : 'Tap any tile or click Open Tijori Vault to begin'}
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[330px] sm:max-w-[420px] aspect-square relative">
              {Array.from({ length: 25 }).map((_, i) => {
                const isMine = grid[i];
                const isUserRevealed = revealed[i];
                const isAutoSelected = mode === 'AUTO' && autoSelectedTiles.includes(i);
                const showFullBoard = roundEnded;

                let tileClass =
                  'bg-[#131c31] hover:bg-[#1d2a47] border-b-4 border-[#070b14] hover:border-[#f59e0b]/50';
                let content: React.ReactNode = null;

                if (isAutoSelected && !roundEnded) {
                  tileClass = 'bg-[#f59e0b] border-b-4 border-[#b45309] text-[#070b14]';
                }

                if (isUserRevealed) {
                  if (isMine) {
                    tileClass = 'bg-[#f43f5e] border-2 border-[#fda4af]';
                    content = <Bomb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
                  } else {
                    tileClass = 'bg-[#070b14] border-2 border-[#fbbf24] shadow-lg';
                    content = <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#fbbf24]" />;
                  }
                } else if (showFullBoard) {
                  tileClass = 'bg-[#070b14]/60 border border-[#24324f] opacity-40';
                  content = isMine ? (
                    <Bomb className="w-5 h-5 sm:w-6 sm:h-6 text-[#f43f5e]" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#fbbf24]" />
                  );
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleTileClick(i)}
                    className={`rounded-xl flex items-center justify-center transition-colors duration-150 ${tileClass}`}
                  >
                    {content}
                  </button>
                );
              })}

              {/* Cashout Floating Modal Card in Center */}
              {roundEnded && wonRound && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-[#0d1322]/95 border-2 border-[#fbbf24] rounded-2xl px-6 py-4 text-center shadow-2xl pointer-events-auto">
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#fbbf24] tabular-nums">
                      {currentMult.toFixed(2)}×
                    </div>
                    <div className="w-12 h-0.5 bg-[#24324f] mx-auto my-1.5" />
                    <div className="text-sm font-extrabold font-mono text-[#10b981] tabular-nums">
                      +{formatINR(activeStake * currentMult)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}