import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Users, Plane, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SimPlayer {
  name: string;
  bet: number;
  target: number;
  cashedOut: boolean;
}

const BOT_NAMES = [
  'Vikram_MumbaiVIP',
  'Raja_SattaKing',
  'Aarav_DelhiHigh',
  'KalyanBoss_07',
  'Kabir_PuneBookie',
];

export default function Crash() {
  const [balance, setBalance] = useState<number>(engine.getSession().balance);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [cashOutAt, setCashOutAt] = useState<number>(2.0);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [history, setHistory] = useState<number[]>([2.45, 1.18, 6.84, 1.92, 14.2, 1.35, 3.1]);
  const [simPlayers, setSimPlayers] = useState<SimPlayer[]>([]);

  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  const autoStateRef = useRef({ active: false, count: 0, remaining: 0 });
  const cashOutConfigRef = useRef({ enabled: false, target: 2.0 });
  const multiplierRef = useRef<number>(1.0);
  const crashPointRef = useRef<number>(1.0);
  const startTimeRef = useRef<number>(0);
  const lastActionTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isCashOutProcessing = useRef<boolean>(false);
  const isGameRunning = useRef<boolean>(false);
  const hasCashedOutRef = useRef<boolean>(false);
  const activeStakeRef = useRef<number>(500);
  const mounted = useRef<boolean>(true);

  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.0);
  const [cashedMultiplier, setCashedMultiplier] = useState<number | null>(null);

  useEffect(() => {
    return engine.subscribe((s) => setBalance(s.balance));
  }, []);

  useEffect(() => {
    autoStateRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    cashOutConfigRef.current = {
      enabled: mode === 'AUTO' || autoCashOutEnabled,
      target: Math.max(1.01, cashOutAt),
    };
  }, [mode, autoCashOutEnabled, cashOutAt]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      isGameRunning.current = false;
      setAutoActive(false);
    };
  }, []);

  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (autoActive && gameState === 'IDLE' && !isGameRunning.current) {
      const { count, remaining } = autoStateRef.current;
      if (count === 0 || remaining > 0) {
        autoTimerRef.current = setTimeout(() => {
          if (!mounted.current || isGameRunning.current) return;
          if (engine.getSession().balance >= betAmount && betAmount > 0) {
            startRound();
            if (count > 0) setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
          } else {
            setAutoActive(false);
          }
        }, 900);
      } else {
        setAutoActive(false);
      }
    }
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [gameState, autoActive, betAmount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const updateCanvasSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(280, Math.floor(rect.width * dpr));
      canvas.height = Math.max(220, Math.floor(rect.height * dpr));
      if (!isGameRunning.current) {
        drawGraph(0, multiplierRef.current, gameState === 'CRASHED');
      }
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(canvas.parentElement);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [gameState]);

  const startRound = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    if (!mounted.current || isGameRunning.current) return;

    if (betAmount <= 0) return;
    if (engine.getSession().balance < betAmount) {
      engine.resetBalance();
    }
    if (!engine.deductStake(betAmount)) {
      setAutoActive(false);
      return;
    }

    lastActionTimeRef.current = now;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    audio.playBet();
    activeStakeRef.current = betAmount;

    const r = engine.peekNextRandom();
    crashPointRef.current = engine.getCrashPoint(r);

    const bots = BOT_NAMES.map((name) => ({
      name,
      bet: [500, 1000, 2500, 5000, 10000][Math.floor(Math.random() * 5)],
      target: +(1.3 + Math.random() * 4.5).toFixed(2),
      cashedOut: false,
    }));
    setSimPlayers(bots);

    multiplierRef.current = 1.0;
    startTimeRef.current = performance.now();
    isCashOutProcessing.current = false;
    hasCashedOutRef.current = false;
    isGameRunning.current = true;

    setCashedMultiplier(null);
    setDisplayMultiplier(1.0);
    setGameState('RUNNING');

    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (!isGameRunning.current || !mounted.current) return;

    const speedFactor = engine.getSession().settings.instantBet ? 0.16 : 0.075;
    const elapsed = Math.max(0, (time - startTimeRef.current) / 1000);
    const currentMult = Math.pow(Math.E, speedFactor * elapsed);

    multiplierRef.current = currentMult;

    const { enabled: autoCashEnabled, target: autoCashTarget } = cashOutConfigRef.current;

    if (
      !hasCashedOutRef.current &&
      autoCashEnabled &&
      autoCashTarget >= 1.01 &&
      currentMult >= autoCashTarget &&
      autoCashTarget <= crashPointRef.current
    ) {
      executeCashOut(autoCashTarget);
    }

    setSimPlayers((prev) => {
      let changed = false;
      const next = prev.map((p) => {
        if (!p.cashedOut && currentMult >= p.target && p.target <= crashPointRef.current) {
          changed = true;
          return { ...p, cashedOut: true };
        }
        return p;
      });
      return changed ? next : prev;
    });

    if (currentMult >= crashPointRef.current) {
      handleCrash(crashPointRef.current, elapsed);
    } else {
      drawGraph(elapsed, currentMult, false);
      setDisplayMultiplier(currentMult);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleCrash = (finalMult: number, elapsed: number) => {
    isGameRunning.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    drawGraph(elapsed, finalMult, true);

    if (mounted.current) {
      multiplierRef.current = finalMult;
      setDisplayMultiplier(finalMult);
      setGameState('CRASHED');
      setHistory((prev) => [finalMult, ...prev].slice(0, 10));
    }

    if (!hasCashedOutRef.current) {
      audio.playLoss();
      engine.settleDeductedBet(
        GameType.CRASH,
        activeStakeRef.current,
        0,
        `Aviator Flew Away @ ${finalMult.toFixed(2)}x`
      );
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (mounted.current && !isGameRunning.current) {
        setGameState('IDLE');
      }
    }, 1100);
  };

  const executeCashOut = (targetMult?: number) => {
    const now = Date.now();
    if (!targetMult && now - lastActionTimeRef.current < 200) return;
    if (!isGameRunning.current || isCashOutProcessing.current || hasCashedOutRef.current) return;

    lastActionTimeRef.current = now;
    const rawMult = targetMult ?? multiplierRef.current;
    const finalMult = Math.min(crashPointRef.current, Math.max(1.01, +rawMult.toFixed(2)));

    isCashOutProcessing.current = true;
    hasCashedOutRef.current = true;

    audio.playWin();
    engine.settleDeductedBet(
      GameType.CRASH,
      activeStakeRef.current,
      finalMult,
      `Aviator Cashed Out @ ${finalMult.toFixed(2)}x`
    );

    if (mounted.current) {
      setCashedMultiplier(finalMult);
    }
  };

  const drawGraph = (t: number, m: number, crashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    const padLeft = 44 * dpr;
    const padRight = 24 * dpr;
    const padTop = 26 * dpr;
    const padBottom = 30 * dpr;
    const graphW = Math.max(10, w - padLeft - padRight);
    const graphH = Math.max(10, h - padTop - padBottom);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1 * dpr;
    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${10 * dpr}px "JetBrains Mono", monospace`;

    const maxScaleY = Math.max(2.0, m * 1.25);
    for (let i = 0; i <= 4; i++) {
      const yRatio = i / 4;
      const yPos = padTop + graphH - yRatio * graphH;
      const val = 1 + yRatio * (maxScaleY - 1);

      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(w - padRight, yPos);
      ctx.stroke();

      ctx.fillText(`${val.toFixed(1)}x`, 6 * dpr, yPos + 3 * dpr);
    }

    if (t <= 0 && m <= 1.0) return;

    const strokeColor = crashed ? '#f43f5e' : hasCashedOutRef.current ? '#10b981' : '#f59e0b';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + graphH);

    const steps = 60;
    const maxT = Math.max(6, t * 1.15);
    let endX = padLeft;
    let endY = padTop + graphH;

    for (let i = 1; i <= steps; i++) {
      const stepT = (t / steps) * i;
      const progress = i / steps;
      const stepM = 1 + Math.pow(progress, 1.8) * (m - 1);

      const x = padLeft + (stepT / maxT) * graphW;
      const y = padTop + graphH - ((stepM - 1) / (maxScaleY - 1)) * graphH;
      ctx.lineTo(x, y);
      if (i === steps) {
        endX = x;
        endY = y;
      }
    }
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + graphH);
    if (crashed) {
      grad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    } else if (hasCashedOutRef.current) {
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.30)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    }
    ctx.fillStyle = grad;
    ctx.lineTo(endX, padTop + graphH);
    ctx.lineTo(padLeft, padTop + graphH);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = crashed ? '#f43f5e' : hasCashedOutRef.current ? '#10b981' : '#fbbf24';
    ctx.arc(endX, endY, 6.5 * dpr, 0, Math.PI * 2);
    ctx.fill();
  };

  const toggleAuto = () => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      setAutoCashOutEnabled(true);
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
    }
  };

  const expectedProfit = Math.max(0, betAmount * cashOutAt - betAmount);
  const isRoundBusy = gameState === 'RUNNING';

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        {/* flex-col-reverse on mobile puts the Aviator Radar Stage on TOP and Controls immediately below */}
        <div className="flex flex-col-reverse lg:flex-row min-h-[520px]">
          {/* Left Bookie Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary CTA Button — Placed at the very top on mobile so it sits directly beneath the plane canvas */}
              <div className="order-first">
                {mode === 'MANUAL' ? (
                  gameState === 'RUNNING' ? (
                    cashedMultiplier !== null ? (
                      <button
                        type="button"
                        disabled
                        className="w-full h-14 bg-[#10b981]/20 border-2 border-[#10b981] text-[#10b981] font-extrabold text-xs sm:text-sm rounded-xl flex flex-col items-center justify-center leading-tight"
                      >
                        <span>CASHED OUT @ {cashedMultiplier.toFixed(2)}×</span>
                        <span className="text-xs font-mono tabular-nums mt-0.5">
                          WON +{formatINR(activeStakeRef.current * cashedMultiplier)}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => executeCashOut()}
                        className="w-full h-14 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight select-none"
                      >
                        <span>CASH OUT NOW</span>
                        <span className="text-xs font-mono tabular-nums mt-0.5">
                          {formatINR(activeStakeRef.current * displayMultiplier)} (
                          {displayMultiplier.toFixed(2)}×)
                        </span>
                      </button>
                    )
                  ) : gameState === 'CRASHED' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                        setGameState('IDLE');
                        startRound();
                      }}
                      className="w-full h-14 bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 border border-[#f43f5e] text-[#f43f5e] font-extrabold text-xs sm:text-sm rounded-xl flex flex-col items-center justify-center leading-tight"
                    >
                      <span>FLEW AWAY @ {displayMultiplier.toFixed(2)}×</span>
                      <span className="text-[11px] text-white mt-0.5">Tap to Launch Next Flight</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRound}
                      disabled={betAmount <= 0}
                      className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center"
                    >
                      {balance < betAmount
                        ? `Refill ₹25,000 & Fly (${formatINR(betAmount, 0)})`
                        : `Place Aviator Bet (${formatINR(betAmount, 0)})`}
                    </button>
                  )
                ) : (
                  <div className="space-y-2">
                    {gameState === 'RUNNING' && cashedMultiplier === null && (
                      <button
                        type="button"
                        onClick={() => executeCashOut()}
                        className="w-full h-12 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 font-mono tabular-nums"
                      >
                        <span>MANUAL CASH OUT</span>
                        <span>({formatINR(activeStakeRef.current * displayMultiplier)})</span>
                      </button>
                    )}
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
                        ? `Stop Auto (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})`
                        : 'Start Auto Pilot'}
                    </button>
                  </div>
                )}
              </div>

              {/* Manual / Auto Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => setMode('MANUAL')}
                  disabled={autoActive || isRoundBusy}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual Bet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('AUTO');
                    setAutoCashOutEnabled(true);
                  }}
                  disabled={autoActive || isRoundBusy}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'AUTO' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Auto Pilot
                </button>
              </div>

              {/* Bet Amount with Quick INR Chips */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Lagaya Stake (INR)</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(betAmount)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b] rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={isRoundBusy || autoActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, +(betAmount / 2).toFixed(0)))}
                    disabled={isRoundBusy || autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(+(betAmount * 2).toFixed(0))}
                    disabled={isRoundBusy || autoActive}
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
                      disabled={isRoundBusy || autoActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1d2a47] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Cashout Toggle + Input */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'MANUAL') setAutoCashOutEnabled((prev) => !prev);
                    }}
                    disabled={isRoundBusy || autoActive || mode === 'AUTO'}
                    className="flex items-center gap-2 text-left"
                  >
                    <span
                      className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                        mode === 'AUTO' || autoCashOutEnabled
                          ? 'bg-[#10b981]'
                          : 'bg-[#070b14] border border-[#24324f]'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                          mode === 'AUTO' || autoCashOutEnabled ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </span>
                    <span className="text-white font-semibold">Auto Cashout</span>
                  </button>
                  <span className="font-mono text-[#10b981] tabular-nums">
                    {mode === 'AUTO' || autoCashOutEnabled
                      ? `Target: ${cashOutAt.toFixed(2)}×`
                      : 'Manual Mode'}
                  </span>
                </div>
                <div
                  className={`flex h-11 bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b] rounded-xl overflow-hidden transition-opacity ${
                    mode === 'MANUAL' && !autoCashOutEnabled ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <input
                    type="number"
                    step="0.1"
                    min="1.01"
                    value={cashOutAt}
                    onChange={(e) => setCashOutAt(Math.max(1.01, Number(e.target.value)))}
                    disabled={isRoundBusy || autoActive || (mode === 'MANUAL' && !autoCashOutEnabled)}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAutoCashOutEnabled(true);
                      setCashOutAt(2.0);
                    }}
                    disabled={isRoundBusy || autoActive}
                    className="px-2.5 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    2.0×
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoCashOutEnabled(true);
                      setCashOutAt(5.0);
                    }}
                    disabled={isRoundBusy || autoActive}
                    className="px-2.5 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    5.0×
                  </button>
                </div>
              </div>

              {mode === 'AUTO' && (
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Number of Flights (0 = Infinite)
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

              {/* Live Indian Punters in Flight */}
              <div className="pt-3 border-t border-[#24324f] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Users className="w-3.5 h-3.5 text-[#f59e0b]" /> Punters in Flight
                  </span>
                  <span className="font-mono tabular-nums">
                    {simPlayers.length + (gameState === 'RUNNING' ? 1 : 0)}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {simPlayers.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#070b14]"
                    >
                      <span className="text-[#94a3b8] truncate pr-2">{p.name}</span>
                      <span
                        className={`font-mono tabular-nums shrink-0 ${
                          p.cashedOut ? 'text-[#10b981] font-extrabold' : 'text-[#fbbf24]'
                        }`}
                      >
                        {p.cashedOut
                          ? `+${formatINR(p.bet * p.target, 0)} (${p.target.toFixed(2)}×)`
                          : formatINR(p.bet, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>99.0% RTP · Aviator Pro</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Interactive Aviator Stage (Top on Mobile, Right on Desktop) */}
          <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-6 relative min-h-[270px] sm:min-h-[420px] royal-surface">
            {/* Top History Multipliers */}
            <div className="flex items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#fbbf24] shrink-0">
                <Plane className="w-4 h-4 text-[#f43f5e]" />
                <span>AVIATOR RADAR</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold tabular-nums shrink-0 ${
                      h >= 2.0
                        ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                        : 'bg-[#131c31] text-[#94a3b8] border border-[#24324f]'
                    }`}
                  >
                    {h.toFixed(2)}×
                  </span>
                ))}
              </div>
            </div>

            {/* Canvas & Central Multiplier Readout */}
            <div className="relative flex-1 flex items-center justify-center my-2 sm:my-4 min-h-[190px] sm:min-h-[260px]">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              <div className="relative z-10 text-center select-none px-4">
                <div
                  className={`text-4xl sm:text-7xl font-extrabold font-mono tabular-nums tracking-tight ${
                    gameState === 'CRASHED'
                      ? 'text-[#f43f5e]'
                      : cashedMultiplier !== null
                      ? 'text-[#10b981]'
                      : 'text-[#fbbf24]'
                  }`}
                >
                  {displayMultiplier.toFixed(2)}×
                </div>

                <div className="h-10 mt-2 flex items-center justify-center">
                  {gameState === 'CRASHED' && (
                    <div className="inline-block px-3.5 py-1 rounded-xl bg-[#f43f5e]/20 border border-[#f43f5e]/50 text-[#f43f5e] text-xs font-extrabold">
                      FLEW AWAY @ {displayMultiplier.toFixed(2)}×
                    </div>
                  )}

                  {cashedMultiplier !== null && (
                    <div className="inline-block px-3.5 py-1.5 rounded-xl bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-xs font-extrabold font-mono tabular-nums">
                      CASHED OUT +{formatINR(activeStakeRef.current * cashedMultiplier)} @{' '}
                      {cashedMultiplier.toFixed(2)}×
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Stage Bar */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#94a3b8] pt-2 border-t border-[#24324f]">
              <span>
                {mode === 'AUTO' || autoCashOutEnabled
                  ? `Auto Cashout: ${cashOutAt.toFixed(2)}× (${formatINR(betAmount * cashOutAt)})`
                  : 'Mode: Manual Cashout Anytime'}
              </span>
              <span>Max Bhav: 10,000×</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}