import React, { useState, useRef, useEffect } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles } from 'lucide-react';

const MULTIPLIERS: Record<number, Record<'LOW' | 'MEDIUM' | 'HIGH', number[]>> = {
  8: {
    LOW: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    MEDIUM: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    HIGH: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  12: {
    LOW: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    MEDIUM: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    HIGH: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  16: {
    LOW: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    MEDIUM: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    HIGH: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  path: number[];
  currentRow: number;
  targetX: number;
  bet: number;
  multipliers: number[];
  done: boolean;
}

const LOGICAL_WIDTH = 720;
const LOGICAL_HEIGHT = 460;

export const Plinko: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [risk, setRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [rows, setRows] = useState<8 | 12 | 16>(16);
  const [recentHits, setRecentHits] = useState<{ mult: number; id: number }[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const pegFlashRef = useRef<Record<string, number>>({});
  const reqIdRef = useRef<number>(0);

  const currentMultipliers = MULTIPLIERS[rows][risk];

  const dropBall = () => {
    const state = gameEngine.getState();
    if (bet <= 0 || bet > state.balance) return;

    sound.click();

    const path: number[] = [];
    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    for (let i = 0; i < rows; i++) {
      path.push(rng() > 0.5 ? 1 : 0);
    }

    const newBall: Ball = {
      id: Date.now() + Math.random(),
      x: LOGICAL_WIDTH / 2,
      y: 26,
      vx: 0,
      vy: 0,
      path,
      currentRow: 0,
      targetX: LOGICAL_WIDTH / 2,
      bet,
      multipliers: [...currentMultipliers],
      done: false,
    };

    ballsRef.current.push(newBall);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOGICAL_WIDTH * dpr;
    canvas.height = LOGICAL_HEIGHT * dpr;

    const topPadding = 46;
    const bottomPadding = 30;
    const usableHeight = LOGICAL_HEIGHT - topPadding - bottomPadding;
    const rowSpacing = usableHeight / rows;
    const maxCols = rows + 2;
    const colSpacing = Math.min(38, (LOGICAL_WIDTH - 80) / maxCols);

    const render = () => {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      // Draw Pegs
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        const rowWidth = (pegsInRow - 1) * colSpacing;
        const startX = (LOGICAL_WIDTH - rowWidth) / 2;
        const y = topPadding + r * rowSpacing;

        for (let c = 0; c < pegsInRow; c++) {
          const x = startX + c * colSpacing;
          const key = `${r}-${c}`;
          const flash = pegFlashRef.current[key] || 0;

          if (flash > 0) {
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${flash * 0.45})`;
            ctx.fill();
            pegFlashRef.current[key] = Math.max(0, flash - 0.08);
          }

          ctx.beginPath();
          ctx.arc(x, y, rows === 16 ? 3.8 : 4.8, 0, Math.PI * 2);
          ctx.fillStyle = flash > 0 ? '#fbbf24' : '#cbd5e1';
          ctx.fill();
        }
      }

      // Update and Draw Balls
      ballsRef.current.forEach((b) => {
        if (b.done) return;

        const targetRowY = topPadding + b.currentRow * rowSpacing;
        b.y += 4.8;

        const dx = b.targetX - b.x;
        b.x += dx * 0.24;

        if (b.y >= targetRowY && b.currentRow < rows) {
          const dir = b.path[b.currentRow];
          const offset = dir === 1 ? colSpacing / 2 : -colSpacing / 2;
          b.targetX += offset;

          const pegsInRow = b.currentRow + 3;
          const rowWidth = (pegsInRow - 1) * colSpacing;
          const startX = (LOGICAL_WIDTH - rowWidth) / 2;
          const approxCol = Math.round((b.x - startX) / colSpacing);
          pegFlashRef.current[`${b.currentRow}-${approxCol}`] = 1;

          b.currentRow++;
        }

        if (b.currentRow >= rows && b.y >= LOGICAL_HEIGHT - 16) {
          b.done = true;
          const slotIndex = b.path.reduce((acc, v) => acc + v, 0);
          const mult = b.multipliers[slotIndex] ?? 1;
          if (mult >= 2) sound.win();
          else sound.tick();

          setActiveSlot(slotIndex);
          setTimeout(() => setActiveSlot(null), 260);
          setRecentHits((prev) => [{ mult, id: b.id }, ...prev.slice(0, 5)]);
          gameEngine.placeBet('Plinko', b.bet, mult);
        }

        // Draw glowing ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, rows === 16 ? 7 : 8.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, 9);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.55, '#f59e0b');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      ballsRef.current = ballsRef.current.filter((b) => !b.done);
      ctx.restore();
      reqIdRef.current = requestAnimationFrame(render);
    };

    reqIdRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [rows, risk]);

  const getSlotColor = (idx: number, total: number) => {
    const dist = Math.abs(idx - (total - 1) / 2) / ((total - 1) / 2);
    if (dist > 0.8) return 'bg-rose-600 text-white border-rose-400';
    if (dist > 0.5) return 'bg-orange-500 text-slate-950 border-orange-300';
    if (dist > 0.25) return 'bg-amber-500 text-slate-950 border-amber-300';
    return 'bg-yellow-400 text-slate-950 border-yellow-200';
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
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
              onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 transition-colors"
              >
                ½
              </button>
              <button
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 transition-colors"
              >
                2×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300 transition-colors"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Risk Level</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#151f30] p-1 rounded-xl border border-white/10">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  risk === r
                    ? 'bg-[#22304a] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'LOW' ? 'Low' : r === 'MEDIUM' ? 'Medium' : 'High'}
              </button>
            ))}
          </div>
        </div>

        {/* Rows Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pin Rows</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#151f30] p-1 rounded-xl border border-white/10">
            {([8, 12, 16] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRows(r)}
                className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                  rows === r
                    ? 'bg-[#22304a] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r} Rows
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none space-y-2 mt-1">
          <button
            onClick={dropBall}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
          >
            Drop Ball (₹{bet.toLocaleString('en-IN')})
          </button>
          <button
            onClick={() => {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => dropBall(), i * 110);
              }
            }}
            className="w-full py-2.5 bg-[#151f30] hover:bg-[#1e2b42] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/25 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Drop 5 Balls Burst
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Max Payout: 1,000×
          </span>
          <span className="font-mono text-slate-500">99% RTP</span>
        </div>
      </div>

      {/* Main Plinko Stage */}
      <div className="flex-1 bg-[#0d1422] p-4 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden">
        {/* Recent Multipliers Pill Strip */}
        <div className="w-full flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Plinko Board ({rows} Rows · {risk} Risk)
          </span>
          <div className="flex gap-1.5">
            {recentHits.map((h) => (
              <div
                key={h.id}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                  h.mult >= 10
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : h.mult >= 2
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                {h.mult}×
              </div>
            ))}
          </div>
        </div>

        {/* High-DPI Canvas */}
        <div className="w-full flex flex-col items-center my-auto">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: `${LOGICAL_WIDTH}px`, height: 'auto', aspectRatio: `${LOGICAL_WIDTH}/${LOGICAL_HEIGHT}` }}
            className="block"
          />

          {/* Bottom Multiplier Buckets */}
          <div className="w-full max-w-[660px] flex justify-center gap-1 px-2 -mt-2">
            {currentMultipliers.map((m, idx) => (
              <div
                key={idx}
                className={`flex-1 py-1.5 rounded-md text-center font-mono font-black text-[9px] sm:text-[11px] border-b-2 transition-transform duration-150 select-none ${getSlotColor(
                  idx,
                  currentMultipliers.length
                )} ${activeSlot === idx ? 'translate-y-1.5 scale-110 brightness-125' : ''}`}
              >
                {m >= 100 ? `${m}` : `${m}×`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};