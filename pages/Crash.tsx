
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Crash() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  const crashPointRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (gameState !== 'RUNNING') return;
    if (!startTimeRef.current) startTimeRef.current = time;
    
    const elapsed = time - startTimeRef.current;
    const seconds = elapsed / 1000;
    // Mathematical growth formula: e^(0.06 * t)
    const newMultiplier = Math.pow(Math.E, 0.065 * seconds);

    if (newMultiplier >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
    } else {
      setMultiplier(newMultiplier);
      renderGraph(newMultiplier);
      requestAnimationFrame(animate);
    }
  };

  const renderGraph = (m: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for(let i=0; i<10; i++) {
        ctx.beginPath(); ctx.moveTo(0, h * (i/10)); ctx.lineTo(w, h * (i/10)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * (i/10), 0); ctx.lineTo(w * (i/10), h); ctx.stroke();
    }

    // Curve
    ctx.beginPath();
    ctx.strokeStyle = '#00e701';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.moveTo(0, h);

    const progress = Math.min(1, (m - 1) / 5); // Scale for graph visibility
    const targetX = w * progress;
    const targetY = h - (h * progress * 0.8);

    ctx.quadraticCurveTo(w * 0.2, h, targetX, targetY);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00e701';
    ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const start = async () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    
    // Provably fair generation happens inside the engine
    const session = engine.getSession();
    const r = await engine.placeBet(GameType.CRASH, betAmount, (r) => {
        const point = engine.getCrashPoint(r);
        crashPointRef.current = point;
        return { multiplier: 0, outcome: `Crash Bust @ ${point.toFixed(2)}x` };
    });

    setGameState('RUNNING');
    setMultiplier(1.00);
    startTimeRef.current = 0;
    requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING') return;
    const finalMult = multiplier;
    setGameState('CASHED_OUT');
    audio.playWin();
    engine.updateBalance(betAmount * finalMult);
    // Note: In a real app, the placeBet happens at start, and cashout just updates the record.
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[700px]">
        {/* Controls */}
        <div className="w-full lg:w-96 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl border-white/5">
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-white font-black italic uppercase -skew-x-12 text-xl">Crash Matka</h2>
                <div className="w-2 h-2 rounded-full bg-casino-accent animate-pulse shadow-neon-green"></div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wager Amount (₹)</label>
                <div className="bg-black/40 p-1 rounded-2xl border border-white/5 flex gap-1">
                   <input 
                      type="number" value={betAmount} 
                      onChange={(e) => setBetAmount(Number(e.target.value))} 
                      className="flex-1 bg-transparent px-4 py-3 text-white font-mono font-black text-xl outline-none"
                      disabled={gameState === 'RUNNING'}
                   />
                   <button onClick={() => setBetAmount(betAmount/2)} className="px-3 text-[10px] font-bold text-slate-500 hover:text-white">1/2</button>
                   <button onClick={() => setBetAmount(betAmount*2)} className="px-3 text-[10px] font-bold text-slate-500 hover:text-white border-l border-white/5">2X</button>
                </div>
             </div>

             {gameState === 'RUNNING' ? (
                <button onClick={cashOut} className="w-full py-6 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-neon-green hover:scale-[1.02] active:scale-95 transition-all">
                  CASHOUT ₹{(betAmount * multiplier).toFixed(0)}
                </button>
             ) : (
                <button onClick={start} className="w-full py-6 bg-white/5 border border-white/10 text-white font-black text-xl rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest">
                  PLACE BET
                </button>
             )}
          </div>

          <div className="space-y-4">
             <div className="h-px bg-white/5"></div>
             <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <div key={i} className={`px-2 py-1 rounded-md text-[10px] font-black border ${h >= 2 ? 'border-casino-accent/30 text-casino-accent bg-casino-accent/5' : 'border-casino-danger/30 text-casino-danger bg-casino-danger/5'}`}>
                    {h.toFixed(2)}x
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Display */}
        <div className="flex-1 glass-card rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center border-white/5 group">
           <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           </div>
           
           <canvas ref={canvasRef} width={1000} height={600} className="absolute inset-0 w-full h-full opacity-40" />

           <div className="relative z-10 flex flex-col items-center">
              <div className={`text-8xl lg:text-[12rem] font-black tabular-nums transition-all duration-300 transform ${gameState === 'CRASHED' ? 'text-casino-danger scale-90' : 'text-white'}`}>
                {multiplier.toFixed(2)}<span className="text-4xl lg:text-6xl text-white/20">x</span>
              </div>
              
              {gameState === 'CRASHED' && (
                <div className="mt-8 px-10 py-3 bg-casino-danger/10 border border-casino-danger/30 rounded-full text-casino-danger font-black uppercase tracking-[0.5em] animate-glitch italic -skew-x-12">
                   DRAW BUSTED
                </div>
              )}
              {gameState === 'CASHED_OUT' && (
                <div className="mt-8 px-10 py-3 bg-casino-accent/10 border border-casino-accent/30 rounded-full text-casino-accent font-black uppercase tracking-[0.5em] animate-bounce italic -skew-x-12">
                   JACKPOT CLAIMED
                </div>
              )}
           </div>

           {/* Decorative elements */}
           <div className="absolute bottom-8 right-8 text-[10px] font-bold text-white/5 uppercase tracking-[0.4em] italic">Algorithm: Matka-Crash-v10</div>
        </div>
      </div>
    </Layout>
  );
}
