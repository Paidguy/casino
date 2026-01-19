import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

const MULTIPLIERS_16 = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];

interface Ball {
  id: number;
  path: number[];
  step: number;
  progress: number;
}

export default function Plinko() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [balls, setBalls] = useState<Ball[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rows = 16;

  const dropBall = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    
    const r = engine.peekNextRandom();
    const { path, multiplier } = engine.calculatePlinkoResult(r, rows);
    
    engine.placeBet(GameType.PLINKO, betAmount, () => ({ multiplier, outcome: `Plinko @ ${multiplier}x` }), '');
    
    setBalls(prev => [...prev, { id: Math.random(), path, step: 0, progress: 0 }]);
  };

  const getMultiColor = (m: number) => {
    if (m >= 100) return '#f43f5e'; // Danger/Rose
    if (m >= 10) return '#f97316'; // Saffron
    if (m >= 2) return '#22d3ee'; // Primary Cyan
    return '#1e293b'; // Slate
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
      const startY = 60;
      const spacingX = width / (rows + 4);
      const spacingY = (height - 180) / rows;

      // Pegs
      ctx.fillStyle = '#334155';
      for (let r = 0; r <= rows; r++) {
        const rowWidth = r * spacingX;
        const rowStartX = startX - rowWidth / 2;
        for (let c = 0; c <= r; c++) {
          ctx.beginPath();
          ctx.arc(rowStartX + c * spacingX, startY + r * spacingY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Balls
      setBalls(prev => {
        const nextBalls = [];
        for (const ball of prev) {
          ball.progress += 0.15; 
          if (ball.progress >= 1) {
            ball.step++;
            ball.progress = 0;
            audio.playSpin(); 
          }

          if (ball.step < rows) {
            const currentLevel = ball.step;
            const currentBin = ball.path.slice(0, currentLevel).reduce((a, b) => a + b, 0);
            const nextBin = currentBin + ball.path[currentLevel];

            const x1 = startX - (currentLevel * spacingX) / 2 + currentBin * spacingX;
            const x2 = startX - ((currentLevel + 1) * spacingX) / 2 + nextBin * spacingX;
            const y1 = startY + currentLevel * spacingY;
            const y2 = startY + (currentLevel + 1) * spacingY;

            const x = x1 + (x2 - x1) * ball.progress;
            const bounce = 15 * Math.sin(ball.progress * Math.PI);
            const y = y1 + (y2 - y1) * ball.progress - bounce;

            ctx.beginPath();
            ctx.fillStyle = '#d946ef'; // Laser Magenta
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(217, 70, 239, 0.6)';
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            nextBalls.push(ball);
          } else {
            const finalBin = ball.path.reduce((a, b) => a + b, 0);
            if (MULTIPLIERS_16[finalBin] >= 2) audio.playWin();
          }
        }
        return nextBalls;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
        <div className="w-full lg:w-96 bg-bet-900 p-8 rounded-[2.5rem] border border-white/10 flex flex-col gap-10 shadow-3xl shrink-0">
          <div className="bg-black/40 p-1.5 rounded-2xl flex border border-white/5">
             <button className="flex-1 py-3 text-[11px] font-black uppercase text-bet-950 bg-bet-primary rounded-xl shadow-lg">Manual</button>
             <button className="flex-1 py-3 text-[11px] font-black uppercase text-slate-500">Auto</button>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-2">Drop Stake (₹)</label>
            <div className="relative">
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Number(e.target.value))} 
                className="w-full bg-black border border-white/10 px-6 py-4 rounded-2xl text-white font-mono font-black text-xl outline-none focus:border-bet-primary transition-all"
              />
              <div className="absolute right-2 top-2 flex gap-1.5">
                 <button onClick={() => setBetAmount(Math.max(0, betAmount / 2))} className="bg-white/5 px-3 py-2 rounded-xl text-[10px] font-black uppercase">1/2</button>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-3 py-2 rounded-xl text-[10px] font-black uppercase">2x</button>
              </div>
            </div>
          </div>

          <button 
            onClick={dropBall}
            className="w-full py-7 bg-bet-primary text-bet-950 font-black text-2xl rounded-3xl shadow-xl hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font cyan-glow"
          >
            Drop Ball
          </button>
        </div>

        <div className="flex-1 bg-bet-900 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-between p-10 min-h-[650px] relative shadow-inner overflow-hidden">
          <canvas ref={canvasRef} width={800} height={600} className="w-full h-full max-w-[800px] pointer-events-none opacity-90" />
          
          <div className="flex gap-1 w-full max-w-[800px] justify-between px-1 relative z-10">
             {MULTIPLIERS_16.map((m, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-12 flex items-center justify-center text-[9px] lg:text-[11px] font-black rounded-lg text-white shadow-xl transition-all hover:scale-125 border-b-4 border-black/40 tabular-nums bazar-font"
                  style={{ backgroundColor: getMultiColor(m) }}
                >
                   {m >= 1000 ? '1k' : m}
                </div>
             ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}