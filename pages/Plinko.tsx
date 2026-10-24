import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, PLINKO_MULTIPLIERS, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ball {
  id: number;
  path: number[];
  rows: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  step: number;
  progress: number;
  finished: boolean;
}

export default function Plinko() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [risk, setRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [rows, setRows] = useState<number>(16);
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);
  const [recentHits, setRecentHits] = useState<number[]>([]);
  const [activeBucket, setActiveBucket] = useState<number | null>(null);

  const ballsRef = useRef<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const bucketTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStateRef = useRef({ active: false, count: 0, remaining: 0 });
  const paramsRef = useRef({ betAmount: 500, risk: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH', rows: 16 });

  useEffect(() => {
    autoStateRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  useEffect(() => {
    paramsRef.current = { betAmount, risk, rows };
  }, [betAmount, risk, rows]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (bucketTimerRef.current) clearTimeout(bucketTimerRef.current);
      setAutoActive(false);
    };
  }, []);

  const multipliers = PLINKO_MULTIPLIERS[risk][rows] || PLINKO_MULTIPLIERS.HIGH[16];

  const dropBall = () => {
    const { betAmount: curBet, risk: curRisk, rows: curRows } = paramsRef.current;
    if (curBet > engine.getSession().balance || curBet <= 0) {
      setAutoActive(false);
      return;
    }
    if (ballsRef.current.length > 40) return;

    audio.playBet();
    const r = engine.peekNextRandom();
    const { path, multiplier } = engine.calculatePlinkoResult(r, curRows, curRisk);

    engine.placeBet(
      GameType.PLINKO,
      curBet,
      () => ({ multiplier, outcome: `Plinko (${curRisk}, ${curRows}r) @ ${multiplier}x` }),
      ''
    );

    ballsRef.current.push({
      id: Math.random(),
      path,
      rows: curRows,
      risk: curRisk,
      step: 0,
      progress: 0,
      finished: false,
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoActive) {
      interval = setInterval(() => {
        const { active, count, remaining } = autoStateRef.current;
        if (!active) return;
        if (engine.getSession().balance < paramsRef.current.betAmount) {
          setAutoActive(false);
          return;
        }
        if (count === 0 || remaining > 0) {
          dropBall();
          if (count > 0) {
            setAutoBetsRemaining((prev) => Math.max(0, prev - 1));
          }
        } else {
          setAutoActive(false);
        }
      }, 240);
    }
    return () => clearInterval(interval);
  }, [autoActive]);

  const getBucketColor = (index: number, total: number) => {
    const center = (total - 1) / 2;
    const distRatio = Math.abs(index - center) / center;
    if (distRatio > 0.82) return '#f43f5e';
    if (distRatio > 0.5) return '#f97316';
    if (distRatio > 0.25) return '#f59e0b';
    return '#eab308';
  };

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const startX = width / 2;
      const startY = 44;
      const spacingX = Math.min(42, (width - 60) / (rows + 2));
      const spacingY = (height - 80) / rows;

      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        const rowWidth = (pegsInRow - 1) * spacingX;
        const rowStartX = startX - rowWidth / 2;
        const y = startY + r * spacingY;

        for (let c = 0; c < pegsInRow; c++) {
          const x = rowStartX + c * spacingX;
          ctx.beginPath();
          ctx.fillStyle = '#e2e8f0';
          ctx.arc(x, y, rows === 16 ? 3.5 : 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const activeBalls: Ball[] = [];
      const speed = engine.getSession().settings.instantBet ? 0.24 : 0.11;

      ballsRef.current.forEach((ball) => {
        if (ball.finished) return;

        ball.progress += speed;
        if (ball.progress >= 1) {
          ball.step++;
          ball.progress = 0;
          if (Math.random() > 0.65) audio.playSpin();
        }

        if (ball.step < ball.rows) {
          const currentLevel = ball.step;
          const currentBin = ball.path.slice(0, currentLevel).reduce((a, b) => a + b, 0);
          const nextBin = currentBin + ball.path[currentLevel];

          const curRowWidth = currentLevel * spacingX;
          const nextRowWidth = (currentLevel + 1) * spacingX;

          const x1 = startX - curRowWidth / 2 + currentBin * spacingX;
          const x2 = startX - nextRowWidth / 2 + nextBin * spacingX;
          const y1 = startY + currentLevel * spacingY;
          const y2 = startY + (currentLevel + 1) * spacingY;

          const x = x1 + (x2 - x1) * ball.progress;
          const arc = 10 * Math.sin(ball.progress * Math.PI);
          const y = y1 + (y2 - y1) * ball.progress - arc;

          ctx.beginPath();
          ctx.fillStyle = '#fbbf24';
          ctx.arc(x, y, rows === 16 ? 7 : 8.5, 0, Math.PI * 2);
          ctx.fill();

          activeBalls.push(ball);
        } else {
          ball.finished = true;
          const finalBin = ball.path.reduce((a, b) => a + b, 0);
          const hitMult =
            (PLINKO_MULTIPLIERS[ball.risk]?.[ball.rows] || PLINKO_MULTIPLIERS.HIGH[16])[finalBin] ?? 1;
          setActiveBucket(finalBin);
          setRecentHits((prev) => [hitMult, ...prev].slice(0, 6));
          if (hitMult >= 2) audio.playWin();
          else audio.playClick();
          if (bucketTimerRef.current) clearTimeout(bucketTimerRef.current);
          bucketTimerRef.current = setTimeout(() => setActiveBucket(null), 200);
        }
      });

      ballsRef.current = activeBalls;
      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [rows, risk]);

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
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          {/* Left Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Manual / Auto Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => {
                    setAutoActive(false);
                    setMode('MANUAL');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'MANUAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Manual Drop
                </button>
                <button
                  type="button"
                  onClick={() => setMode('AUTO')}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    mode === 'AUTO' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Auto Cascade
                </button>
              </div>

              {/* Bet Amount */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Ball Stake (INR)</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(betAmount)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={autoActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, +(betAmount / 2).toFixed(0)))}
                    disabled={autoActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(+(betAmount * 2).toFixed(0))}
                    disabled={autoActive}
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
                      disabled={autoActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1d2a47] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Risk Level</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((rLevel) => (
                    <button
                      key={rLevel}
                      type="button"
                      onClick={() => setRisk(rLevel)}
                      disabled={autoActive}
                      className={`py-2 rounded-lg text-xs font-bold capitalize ${
                        risk === rLevel ? 'bg-[#131c31] text-[#fbbf24]' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {rLevel.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows Selector */}
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Pyramid Rows</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                  {[8, 12, 16].map((rowCount) => (
                    <button
                      key={rowCount}
                      type="button"
                      onClick={() => setRows(rowCount)}
                      disabled={autoActive}
                      className={`py-2 rounded-lg text-xs font-mono font-bold ${
                        rows === rowCount ? 'bg-[#131c31] text-[#fbbf24]' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {rowCount}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'AUTO' && (
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Number of Balls (0 = Infinite)
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

              {/* Primary CTA */}
              {mode === 'MANUAL' ? (
                <button
                  type="button"
                  onClick={dropBall}
                  disabled={betAmount <= 0}
                  className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center"
                >
                  Drop Golden Ball ({formatINR(betAmount, 0)})
                </button>
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
                    ? `Stop Cascade (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})`
                    : 'Start Auto Cascade'}
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>99.0% RTP · 1,000× Peak</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Fairness
              </Link>
            </div>
          </div>

          {/* Right Plinko Stage */}
          <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 relative royal-surface overflow-hidden">
            {/* Recent Hits Pill Strip on Right */}
            <div className=" absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1.5 z-10">
              {recentHits.map((m, idx) => (
                <div
                  key={idx}
                  className="w-14 py-1.5 rounded-lg text-center font-mono text-xs font-extrabold tabular-nums shadow"
                  style={{
                    backgroundColor: m >= 10 ? '#f43f5e' : m >= 2 ? '#f59e0b' : '#eab308',
                    color: m >= 10 ? '#ffffff' : '#070b14',
                  }}
                >
                  {m}×
                </div>
              ))}
            </div>

            <canvas
              ref={canvasRef}
              width={720}
              height={460}
              className="w-full max-w-[660px] h-[320px] sm:h-[440px] pointer-events-none"
            />

            {/* Multiplier Buckets */}
            <div
              className="flex gap-0.5 sm:gap-1 w-full justify-center px-1 sm:px-2 relative z-10"
              style={{ maxWidth: `${Math.min(640, (rows + 2) * 44)}px` }}
            >
              {multipliers.map((m, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 sm:h-9 flex items-center justify-center text-[8px] sm:text-xs font-mono font-extrabold rounded sm:rounded-md shadow transition-transform tabular-nums ${
                    activeBucket === i ? 'translate-y-1.5 brightness-125' : ''
                  }`}
                  style={{
                    backgroundColor: getBucketColor(i, multipliers.length),
                    color: i === 0 || i === multipliers.length - 1 ? '#ffffff' : '#070b14',
                  }}
                >
                  {m >= 1000 ? '1K' : rows === 16 ? `${m}` : `${m}×`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}