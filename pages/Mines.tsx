import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { RefreshCw, ShieldCheck, Sparkles, Eye, Zap, CheckSquare } from 'lucide-react';
import { sound } from '../services/sound';

const GoldGemSVG = () => (
  <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_4px_12px_rgba(245,158,11,0.55)]">
    <defs>
      <linearGradient id="goldTop" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="goldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="goldRight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
    <polygon points="18,12 46,12 56,26 8,26" fill="url(#goldTop)" />
    <polygon points="8,26 32,26 32,54" fill="url(#goldLeft)" />
    <polygon points="32,26 56,26 32,54" fill="url(#goldRight)" />
    <polygon points="20,26 44,26 32,54" fill="url(#goldTop)" opacity="0.85" />
    <polygon points="18,12 26,26 32,12" fill="#ffffff" opacity="0.45" />
    <circle cx="23" cy="18" r="2" fill="#ffffff" />
  </svg>
);

const MineBombSVG = ({ exploded }: { exploded?: boolean }) => (
  <svg viewBox="0 0 64 64" className={`w-9 h-9 sm:w-11 sm:h-11 ${exploded ? 'drop-shadow-[0_0_14px_rgba(244,63,94,0.85)]' : 'opacity-80'}`}>
    <defs>
      <radialGradient id="bombBody" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="55%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </radialGradient>
    </defs>
    <line x1="32" y1="8" x2="32" y2="56" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <line x1="8" y1="32" x2="56" y2="32" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <line x1="15" y1="15" x2="49" y2="49" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <line x1="49" y1="15" x2="15" y2="49" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="32" r="16" fill="url(#bombBody)" stroke={exploded ? '#f43f5e' : '#64748b'} strokeWidth="2.5" />
    <circle cx="26" cy="26" r="4" fill="#94a3b8" opacity="0.45" />
    <circle cx="32" cy="32" r="5" fill={exploded ? '#f43f5e' : '#ef4444'} />
  </svg>
);

export const Mines: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [lockedStake, setLockedStake] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'EXPLODED' | 'WON'>('IDLE');
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [mines, setMines] = useState<boolean[]>(Array(25).fill(false));
  const [explodedIdx, setExplodedIdx] = useState<number | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoPattern, setAutoPattern] = useState<number[]>([6, 8, 12, 16, 18]);

  const getMultiplier = (m: number, r: number) => {
    if (r === 0) return 1.0;
    let prob = 1;
    for (let i = 0; i < r; i++) {
      prob *= (25 - m - i) / (25 - i);
    }
    return Math.max(1.01, Number((0.99 / prob).toFixed(2)));
  };

  /**
   * Deterministic Provably Fair Fisher-Yates 5x5 Board Permutation
   * Uses 25 HMAC-SHA256 floats from the current session seed pair & nonce
   */
  const generateDeterministicBoard = (): boolean[] => {
    const floats = gameEngine.getNextFloats(25);
    const indices = Array.from({ length: 25 }, (_, i) => i);
    for (let i = 24; i > 0; i--) {
      const j = Math.floor(floats[i] * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const grid = Array(25).fill(false);
    for (let m = 0; m < mineCount; m++) {
      grid[indices[m]] = true;
    }
    return grid;
  };

  const startGame = () => {
    if (!gameEngine.deductStake(bet)) return;

    sound.click();
    const newMines = generateDeterministicBoard();
    setLockedStake(bet);
    setMines(newMines);
    setRevealed(Array(25).fill(false));
    setExplodedIdx(null);
    setGameState('PLAYING');
    setCurrentMultiplier(1.0);
  };

  const toggleAutoPatternTile = (idx: number) => {
    if (gameState === 'PLAYING') return;
    sound.click();
    setRevealed(Array(25).fill(false));
    setGameState('IDLE');
    if (autoPattern.includes(idx)) {
      if (autoPattern.length > 1) {
        setAutoPattern(autoPattern.filter((x) => x !== idx));
      }
    } else if (autoPattern.length < 25 - mineCount) {
      setAutoPattern([...autoPattern, idx]);
    }
  };

  const randomizeAutoPattern = (count = 4) => {
    sound.click();
    const maxSafe = Math.min(count, 25 - mineCount);
    const pool = Array.from({ length: 25 }, (_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setAutoPattern(pool.slice(0, maxSafe));
    setRevealed(Array(25).fill(false));
    setGameState('IDLE');
  };

  const runAutoRound = () => {
    const validPattern = autoPattern.slice(0, 25 - mineCount);
    if (validPattern.length === 0) return;
    if (!gameEngine.deductStake(bet)) return;

    sound.click();
    setLockedStake(bet);
    const newMines = generateDeterministicBoard();
    const newRevealed = Array(25).fill(false);
    let hitBomb: number | null = null;

    for (const idx of validPattern) {
      newRevealed[idx] = true;
      if (newMines[idx]) {
        hitBomb = idx;
        break;
      }
    }

    setMines(newMines);
    setRevealed(newRevealed);

    if (hitBomb !== null) {
      sound.lose();
      setExplodedIdx(hitBomb);
      setGameState('EXPLODED');
      gameEngine.settleDeductedBet('Gold Mines', bet, 0, `Auto Hit Mine at Tile #${hitBomb + 1}`);
    } else {
      const mult = getMultiplier(mineCount, validPattern.length);
      setCurrentMultiplier(mult);
      sound.win();
      setExplodedIdx(null);
      setGameState('WON');
      gameEngine.settleDeductedBet('Gold Mines', bet, mult, `Auto Cleared ${validPattern.length} Gems (${mult}×)`);
    }
  };

  const clickTile = (idx: number) => {
    if (mode === 'AUTO' && gameState !== 'PLAYING') {
      toggleAutoPatternTile(idx);
      return;
    }
    if (gameState !== 'PLAYING' || revealed[idx]) return;

    const newRevealed = [...revealed];
    newRevealed[idx] = true;
    setRevealed(newRevealed);

    if (mines[idx]) {
      sound.lose();
      setExplodedIdx(idx);
      setGameState('EXPLODED');
      gameEngine.settleDeductedBet('Gold Mines', lockedStake, 0, `Hit Mine on Tile #${idx + 1}`);
    } else {
      const count = newRevealed.filter(Boolean).length;
      sound.gem(count);
      const nextMult = getMultiplier(mineCount, count);
      setCurrentMultiplier(nextMult);

      if (count === 25 - mineCount) {
        sound.win();
        setGameState('WON');
        gameEngine.settleDeductedBet('Gold Mines', lockedStake, nextMult, `Cleared Full Board (${nextMult}×)`);
      }
    }
  };

  const pickRandomTile = () => {
    if (gameState !== 'PLAYING') return;
    const hiddenIndices = revealed.map((r, i) => (!r ? i : -1)).filter((i) => i !== -1);
    if (hiddenIndices.length === 0) return;
    const floats = gameEngine.getNextFloats(1);
    const randomIdx = hiddenIndices[Math.floor(floats[0] * hiddenIndices.length)];
    clickTile(randomIdx);
  };

  const cashout = () => {
    if (gameState !== 'PLAYING') return;
    const revealedCount = revealed.filter(Boolean).length;
    if (revealedCount === 0) return;

    sound.win();
    setGameState('WON');
    gameEngine.settleDeductedBet('Gold Mines', lockedStake, currentMultiplier, `Cashed Out ${revealedCount} Gems (${currentMultiplier}×)`);
  };

  const revealedCount = revealed.filter(Boolean).length;
  const nextMultiplier = getMultiplier(mineCount, revealedCount + 1);
  const activeBet = gameState === 'PLAYING' ? lockedStake : bet;
  const currentPayout = Math.floor(activeBet * currentMultiplier);
  const autoTargetMult = getMultiplier(mineCount, Math.min(autoPattern.length, 25 - mineCount));

  const stepPreview = Array.from({ length: Math.min(6, 25 - mineCount) }, (_, i) => {
    const stepNum = Math.max(1, revealedCount) + i;
    if (stepNum > 25 - mineCount) return null;
    return {
      gems: stepNum,
      mult: getMultiplier(mineCount, stepNum),
    };
  }).filter(Boolean) as { gems: number; mult: number }[];

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Manual / Auto Tabs */}
        <div className="flex bg-[#151f30] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              setMode('MANUAL');
              setGameState('IDLE');
              setRevealed(Array(25).fill(false));
            }}
            disabled={gameState === 'PLAYING'}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              mode === 'MANUAL'
                ? 'bg-[#22304a] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => {
              setMode('AUTO');
              setGameState('IDLE');
              setRevealed(Array(25).fill(false));
            }}
            disabled={gameState === 'PLAYING'}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              mode === 'AUTO'
                ? 'bg-[#22304a] text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto Pattern
          </button>
        </div>

        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-slate-300">₹{bet.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden transition-colors">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={gameState === 'PLAYING'}
              onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                disabled={gameState === 'PLAYING'}
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50 transition-colors"
              >
                ½
              </button>
              <button
                disabled={gameState === 'PLAYING'}
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50 transition-colors"
              >
                2×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                disabled={gameState === 'PLAYING'}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300 disabled:opacity-40 transition-colors"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Mines Count Selector */}
        {gameState !== 'PLAYING' ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Mines Count</span>
                <span className="text-amber-400 font-mono font-bold">{25 - mineCount} Gold Gems</span>
              </div>
              <select
                value={mineCount}
                onChange={(e) => {
                  const nextMines = Number(e.target.value);
                  setMineCount(nextMines);
                  setAutoPattern((prev) => prev.slice(0, Math.max(1, 25 - nextMines)));
                }}
                className="w-full bg-[#151f30] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-500/60"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 24].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Mine' : 'Mines'} — ({getMultiplier(n, 1)}× First Hit)
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {[1, 3, 5, 10, 24].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setMineCount(preset);
                      setAutoPattern((prev) => prev.slice(0, Math.max(1, 25 - preset)));
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      mineCount === preset
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-[#151f30] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'AUTO' && (
              <div className="bg-[#151f30] p-3.5 rounded-xl border border-white/10 space-y-2.5">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1 text-white">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> {autoPattern.length} Pattern Tiles
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {autoTargetMult}× (₹{Math.floor(bet * autoTargetMult).toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 4, 5, 8].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => randomizeAutoPattern(cnt)}
                      className="py-1.5 rounded-lg bg-[#0b101b] hover:bg-[#1e2b42] border border-white/10 text-[11px] font-mono font-bold text-slate-300"
                    >
                      Pick {cnt}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400">
                  Click any tiles on the 5×5 grid to customize your auto-reveal pattern.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#151f30] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Gems Found</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  {revealedCount} / {25 - mineCount}
                </div>
              </div>
              <div className="bg-[#151f30] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Next Tile</div>
                <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                  {nextMultiplier.toFixed(2)}×
                </div>
              </div>
            </div>

            <div className="bg-[#151f30] p-3.5 rounded-xl border border-emerald-500/25">
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Current Payout ({currentMultiplier.toFixed(2)}×)</span>
                <span className="text-emerald-400 font-mono font-bold">
                  +₹{Math.max(0, currentPayout - lockedStake).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-xl font-mono font-black text-white">
                ₹{currentPayout.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={pickRandomTile}
              className="w-full py-2.5 bg-[#1a263b] hover:bg-[#23324d] text-slate-200 font-bold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Pick Random Tile
            </button>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="order-first lg:order-none mt-1">
          {gameState !== 'PLAYING' ? (
            mode === 'AUTO' ? (
              <button
                onClick={runAutoRound}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Auto Reveal {autoPattern.length} Tiles (₹{bet.toLocaleString('en-IN')})
              </button>
            ) : (
              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
              >
                Start Round (₹{bet.toLocaleString('en-IN')})
              </button>
            )
          ) : (
            <button
              onClick={cashout}
              disabled={revealedCount === 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:bg-[#1a263b] disabled:from-transparent disabled:to-transparent disabled:text-slate-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.35)] active:scale-[0.99] text-sm"
            >
              {revealedCount === 0
                ? 'Select a Tile to Start'
                : `Cash Out ₹${currentPayout.toLocaleString('en-IN')} (${currentMultiplier.toFixed(2)}×)`}
            </button>
          )}
        </div>

        {/* Provably Fair Footer */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HMAC-SHA256 Fisher-Yates
          </span>
          <span className="font-mono text-slate-500">99% RTP</span>
        </div>
      </div>

      {/* Main 5x5 Stage */}
      <div className="flex-1 bg-[#0d1422] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between relative">
        {/* Top Multiplier Step Ladder */}
        <div className="w-full max-w-[480px] mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2 px-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Gold Mines Multiplier Ladder
            </span>
            <span className="font-mono text-slate-400">
              {mineCount} {mineCount === 1 ? 'Mine' : 'Mines'} · {25 - mineCount} Gems
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {stepPreview.map((step) => {
              const isCurrent = step.gems === revealedCount && gameState === 'PLAYING';
              const isNext = step.gems === revealedCount + 1 && gameState === 'PLAYING';
              return (
                <div
                  key={step.gems}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : isNext
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-[#151f30]/90 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase opacity-75">{step.gems} Hit{step.gems > 1 ? 's' : ''}</div>
                  <div className="text-xs font-mono font-black text-white">{step.mult}×</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5x5 Grid */}
        <div className="w-full max-w-[460px] aspect-square grid grid-cols-5 gap-2 sm:gap-3 my-auto relative">
          {Array.from({ length: 25 }).map((_, idx) => {
            const isRevealed = revealed[idx];
            const isMine = mines[idx];
            const showUnrevealed = (gameState === 'EXPLODED' || gameState === 'WON') && !isRevealed;
            const isAutoSelected = mode === 'AUTO' && autoPattern.includes(idx);

            let tileStyle =
              'bg-[#1a263b] hover:bg-[#23334f] border-b-4 border-[#0e1624] shadow-md hover:-translate-y-0.5 cursor-pointer';
            if (gameState === 'IDLE' && mode === 'MANUAL') {
              tileStyle = 'bg-[#172236] border-b-4 border-[#0e1624] cursor-default opacity-90';
            } else if (isRevealed) {
              if (isMine) {
                tileStyle =
                  'bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.45)] scale-[0.98]';
              } else {
                tileStyle =
                  'bg-[#0f2922] border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[0.98]';
              }
            } else if (showUnrevealed) {
              tileStyle = 'bg-[#111927] border border-white/5 opacity-45 scale-95 cursor-default';
            } else if (isAutoSelected) {
              tileStyle =
                'bg-[#1e324a] border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer';
            }

            return (
              <button
                key={idx}
                disabled={mode === 'MANUAL' && (gameState !== 'PLAYING' || isRevealed)}
                onClick={() => clickTile(idx)}
                className={`rounded-xl flex items-center justify-center transition-all duration-150 relative overflow-hidden ${tileStyle}`}
              >
                {!isRevealed && !showUnrevealed && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isAutoSelected ? 'bg-amber-400 scale-125' : 'bg-white/10'
                    }`}
                  />
                )}
                {(isRevealed || showUnrevealed) && (
                  <div className={`transition-transform duration-200 ${isRevealed ? 'scale-100' : 'scale-75'}`}>
                    {isMine ? <MineBombSVG exploded={explodedIdx === idx} /> : <GoldGemSVG />}
                  </div>
                )}
              </button>
            );
          })}

          {/* Win Overlay Banner */}
          {gameState === 'WON' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-[#0b111e]/95 backdrop-blur-md border-2 border-emerald-400 px-8 py-6 rounded-2xl text-center shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-bounce">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  Round Cashed Out
                </div>
                <div className="text-4xl font-mono font-black text-white mb-1">
                  {currentMultiplier.toFixed(2)}×
                </div>
                <div className="text-lg font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-1">
                  +₹{currentPayout.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="w-full max-w-[460px] mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" /> Stake is locked on round start and all mines reveal on completion
          </span>
        </div>
      </div>
    </div>
  );
};