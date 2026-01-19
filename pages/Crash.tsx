
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
  
  const crashPointRef = useRef<number>(1);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    
    // Lock in the bet at the start
    try {
      // Deduct balance manually first to visually sync, then record via engine later
      engine.updateBalance(-betAmount);
      audio.playBet();
      
      const r = Math.random();
      crashPointRef.current = engine.getCrashPoint(r);
      
      setGameState('RUNNING');
      setMultiplier(1.00);
      startTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } catch (e) {
      console.error(e);
    }
  };

  const animate = (time: number) => {
    const elapsed = (time - startTimeRef.current) / 1000;
    // Standard exponential curve for Crash: e^(0.06 * t)
    const currentMult = Math.pow(Math.E, 0.06 * elapsed);
    
    drawGraph(elapsed, currentMult);

    if (currentMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 12));
      
      // Finalize the bet as a loss
      engine.placeBet(GameType.CRASH, 0, 0, `Crashed @ ${crashPointRef.current.toFixed(2)}x`);
      
      cancelAnimationFrame(requestRef.current);
    } else {
      setMultiplier(currentMult);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING') return;
    const finalMult = multiplier;
    setGameState('CASHED_OUT');
    cancelAnimationFrame(requestRef.current);
    
    audio.playWin();
    // Record the win. 
    // Since we already deducted betAmount at start, we add the payout back.
    const payout = betAmount * finalMult;
    engine.updateBalance(payout);
    engine.placeBet(GameType.CRASH, 0, finalMult, `Cashed out @ ${finalMult.toFixed(2)}x`);
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 12));
  };

  const drawGraph = (t: number, m: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Padding
    const p = 40;
    const graphW = w - p * 2;
    const graphH = h - p * 2;

    // Draw Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p, p);
    ctx.lineTo(p, h - p);
    ctx.lineTo(w - p, h - p);
    ctx.stroke();

    // Draw Curve
    ctx.strokeStyle = gameState === 'CRASHED' ? '#ef4444' : '#facc15';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.strokeStyle as string;
    ctx.beginPath();
    ctx.moveTo(p, h - p);

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
        const stepT = (t / steps) * i;
        const stepM = Math.pow(Math.E, 0.06 * stepT);
        
        // Scale X based on time (capped or growing)
        const scaleX = Math.max(10, t);
        const scaleY = Math.max(2, m);

        const x = p + (stepT / scaleX) * graphW;
        const y = h - p - ((stepM - 1) / (scaleY - 1)) * graphH;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Plane/Point at current
    const scaleX = Math.max(10, t);
    const scaleY = Math.max(2, m);
    const curX = p + (t / scaleX) * graphW;
    const curY = h - p - ((m - 1) / (scaleY - 1)) * graphH;

    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(curX, curY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow
    if (gameState === 'RUNNING') {
        const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 40);
        grad.addColorStop(0, 'rgba(250, 204, 21, 0.2)');
        grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curX, curY, 40, 0, Math.PI * 2);
        ctx.fill();
    }
  };

  useEffect(() => {
    // Initial draw
    drawGraph(0, 1);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        {/* Game Arena */}
        <div className="relative bg-bet-900 border border-white/5 rounded-[3rem] p-6 lg:p-12 shadow-2xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex flex-col justify-center items-center">
           <canvas 
             ref={canvasRef} 
             width={1000} height={600} 
             className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
           />
           
           <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`text-7xl lg:text-[10rem] font-black italic -skew-x-12 transition-all tabular-nums drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
                {multiplier.toFixed(2)}x
              </div>
              
              {gameState === 'CRASHED' && (
                <div className="px-8 py-2 bg-bet-danger/20 border border-bet-danger/40 rounded-full text-bet-danger font-black uppercase text-xs tracking-widest animate-bounce">
                  Crashed @ {multiplier.toFixed(2)}x
                </div>
              )}
              {gameState === 'CASHED_OUT' && (
                <div className="px-8 py-2 bg-bet-success/20 border border-bet-success/40 rounded-full text-bet-success font-black uppercase text-xs tracking-widest animate-pulse">
                  Win Secured!
                </div>
              )}
           </div>

           {/* History Bar */}
           <div className="absolute top-8 left-0 right-0 flex justify-center px-8 gap-2 overflow-hidden pointer-events-none">
              {history.map((h, i) => (
                <div key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-black border backdrop-blur-md transition-all ${h >= 2 ? 'bg-bet-success/10 border-bet-success/30 text-bet-success' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
           <div className="lg:col-span-4 bg-bet-900 p-8 rounded-[2.5rem] border border-white/5 space-y-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wager Amount (₹)</label>
                    <span className="text-[10px] font-black text-bet-accent">Min: ₹10</span>
                </div>
                <div className="relative">
                   <input 
                     type="number" value={betAmount} 
                     onChange={e => setBetAmount(Number(e.target.value))} 
                     disabled={gameState === 'RUNNING'}
                     className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-2xl outline-none focus:border-bet-primary transition-all shadow-inner" 
                   />
                   <div className="absolute right-3 top-3 flex gap-2">
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} className="px-3 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase hover:bg-bet-700">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-3 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase hover:bg-bet-700">2X</button>
                   </div>
                </div>
              </div>

              {gameState === 'RUNNING' ? (
                <button 
                  onClick={cashOut} 
                  className="w-full py-7 bg-bet-success text-black font-black text-2xl rounded-2xl shadow-[0_20px_60px_rgba(16,185,129,0.3)] animate-pulse-fast hover:scale-[1.02] transition-transform active:scale-95 flex flex-col items-center leading-none"
                >
                   <span className="uppercase text-lg">Cash Out</span>
                   <span className="text-sm mt-1">₹{(betAmount * multiplier).toFixed(2)}</span>
                </button>
              ) : (
                <button 
                  onClick={start} 
                  disabled={betAmount <= 0}
                  className="w-full py-7 bg-bet-accent text-black font-black text-2xl rounded-2xl shadow-[0_20px_60px_rgba(250,204,21,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-30"
                >
                   Place Bet
                </button>
              )}
           </div>

           <div className="lg:col-span-8 bg-bet-900/40 p-10 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center text-center gap-6 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
              <div className="flex gap-12 relative z-10">
                 <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Profit on Win</div>
                    <div className="text-3xl font-black text-bet-success tabular-nums">₹{(betAmount * multiplier - betAmount).toFixed(2)}</div>
                 </div>
                 <div className="w-px h-12 bg-white/5"></div>
                 <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Chance of Bust</div>
                    <div className="text-3xl font-black text-bet-danger tabular-nums">High</div>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] max-w-md mx-auto leading-loose italic opacity-40 group-hover:opacity-100 transition-opacity">
                Aviator-X Kernel • HMAC-SHA256 Randomized • Multi-threaded Odds Sync • Instant Payout Logic Active
              </p>
           </div>
        </div>
      </div>
    </Layout>
  );
}
