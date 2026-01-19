
import React, { useState, useEffect, useRef } from 'react';
// Fix: Layout is a named export, not a default export.
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
    
    engine.placeBet(GameType.PLINKO, betAmount, () => ({ multiplier, outcome: `Plinko @ ${multiplier}x` }));
    
    setBalls(prev => [...prev, { id: Math.random(), path, step: 0, progress: 0 }]);
  };

  const getMultiColor = (m: number) => {
    if (m >= 100) return '#ff0033';
    if (m >= 10) return '#ffb800';
    if (m >= 2) return '#00e701';
    return '#2d333b';
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
      const startY = 40;
      const spacingX = width / (rows + 6);
      const spacingY = (height - 120) / rows;

      // Pegs
      ctx.fillStyle = '#2d333b';
      for (let r = 0; r <= rows; r++) {
        const rowWidth = r * spacingX;
        const rowStartX = startX - rowWidth / 2;
        for (let c = 0; c <= r; c++) {
          ctx.beginPath();
          ctx.arc(rowStartX + c * spacingX, startY + r * spacingY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Balls
      setBalls(prev => {
        const nextBalls = [];
        for (const ball of prev) {
          ball.progress += 0.12; 
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
            const bounce = 12 * Math.sin(ball.progress * Math.PI);
            const y = y1 + (y2 - y1) * ball.progress - bounce;

            ctx.beginPath();
            ctx.fillStyle = '#ff0033';
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(255, 0, 51, 0.4)';
            ctx.arc(x, y, 6, 0, Math.PI * 2);
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
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-full">
        <div className="w-full lg:w-80 bg-[#0f1116] p-6 rounded-2xl border border-white/5 flex flex-col gap-6 shadow-2xl shrink-0">
          <div className="bg-[#07080a] p-1 rounded-lg flex border border-white/5">
             <button className="flex-1 py-2 text-[10px] font-black uppercase text-white bg-white/5 rounded">Manual</button>
             <button className="flex-1 py-2 text-[10px] font-black uppercase text-slate-500">Auto</button>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Bet Amount</label>
            <div className="relative">
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Number(e.target.value))} 
                className="w-full bg-[#07080a] border border-white/10 px-4 py-3 rounded-lg text-white font-mono font-black"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                 <button onClick={() => setBetAmount(Math.max(0, betAmount / 2))} className="bg-white/5 px-2 py-1 rounded text-[10px] font-black">1/2</button>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-2 py-1 rounded text-[10px] font-black">2x</button>
              </div>
            </div>
          </div>

          <button 
            onClick={dropBall}
            className="w-full py-5 bg-[#00e701] text-black font-black text-xl rounded-xl shadow-[0_0_50px_rgba(0,231,1,0.2)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
          >
            Bet
          </button>
        </div>

        <div className="flex-1 bg-[#0f1116] rounded-3xl border border-white/5 flex flex-col items-center justify-between p-8 min-h-[600px] relative shadow-inner overflow-hidden">
          <canvas ref={canvasRef} width={800} height={550} className="w-full h-full max-w-[800px] pointer-events-none" />
          
          <div className="flex gap-1 w-full max-w-[800px] justify-between px-1 relative z-10">
             {MULTIPLIERS_16.map((m, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-10 flex items-center justify-center text-[9px] font-black rounded-sm text-white shadow-xl transition-all hover:scale-125 border-b-4 border-black/30"
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
