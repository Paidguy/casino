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

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      drawGraph(0, 1);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    
    try {
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
    const currentMult = Math.pow(Math.E, 0.06 * elapsed);
    
    drawGraph(elapsed, currentMult);

    if (currentMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 8));
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
    const payout = betAmount * finalMult;
    engine.updateBalance(payout);
    engine.placeBet(GameType.CRASH, 0, finalMult, `Cashed out @ ${finalMult.toFixed(2)}x`);
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 8));
  };

  const drawGraph = (t: number, m: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padding = w * 0.1;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    ctx.strokeStyle = gameState === 'CRASHED' ? '#ef4444' : '#facc15';
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.shadowBlur = 10 * window.devicePixelRatio;
    ctx.shadowColor = ctx.strokeStyle as string;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);

    const steps = 40;
    for (let i = 0; i <= steps; i++) {
        const stepT = (t / steps) * i;
        const stepM = Math.pow(Math.E, 0.06 * stepT);
        const scaleX = Math.max(10, t);
        const scaleY = Math.max(2, m);
        const x = padding + (stepT / scaleX) * graphW;
        const y = h - padding - ((stepM - 1) / (scaleY - 1)) * graphH;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    const scaleX = Math.max(10, t);
    const scaleY = Math.max(2, m);
    const curX = padding + (t / scaleX) * graphW;
    const curY = h - padding - ((m - 1) / (scaleY - 1)) * graphH;

    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(curX, curY, 6 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 lg:gap-10">
        {/* Game Arena */}
        <div className="relative bg-bet-900 border border-white/5 rounded-[2.5rem] p-6 lg:p-12 shadow-2xl overflow-hidden min-h-[350px] lg:min-h-[500px] flex flex-col justify-center items-center">
           <canvas 
             ref={canvasRef} 
             className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
           />
           
           <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`text-6xl lg:text-[10rem] font-black italic -skew-x-12 transition-all tabular-nums drop-shadow-2xl ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
                {multiplier.toFixed(2)}x
              </div>
              
              {gameState === 'CRASHED' && (
                <div className="px-6 py-1.5 bg-bet-danger/20 border border-bet-danger/40 rounded-full text-bet-danger font-black uppercase text-[10px] tracking-widest animate-bounce">
                  Crashed @ {multiplier.toFixed(2)}x
                </div>
              )}
              {gameState === 'CASHED_OUT' && (
                <div className="px-6 py-1.5 bg-bet-success/20 border border-bet-success/40 rounded-full text-bet-success font-black uppercase text-[10px] tracking-widest animate-pulse">
                  Win Secured!
                </div>
              )}
           </div>

           {/* History Bar */}
           <div className="absolute top-4 lg:top-8 left-0 right-0 flex justify-center px-4 gap-1.5 lg:gap-2 overflow-hidden pointer-events-none">
              {history.map((h, i) => (
                <div key={i} className={`px-3 lg:px-4 py-1 rounded-lg text-[8px] lg:text-[10px] font-black border backdrop-blur-md transition-all ${h >= 2 ? 'bg-bet-success/10 border-bet-success/30 text-bet-success' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
           <div className="lg:col-span-4 bg-bet-900 p-6 lg:p-8 rounded-[2rem] border border-white/5 space-y-6 lg:space-y-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stake (₹)</label>
                    <span className="text-[8px] font-black text-bet-accent">Min: ₹10</span>
                </div>
                <div className="relative">
                   <input 
                     type="number" value={betAmount} 
                     onChange={e => setBetAmount(Number(e.target.value))} 
                     disabled={gameState === 'RUNNING'}
                     className="w-full bg-black border border-white/10 p-4 lg:p-5 rounded-2xl text-white font-black text-xl lg:text-2xl outline-none focus:border-bet-primary transition-all shadow-inner" 
                   />
                   <div className="absolute right-2 top-2 flex gap-1.5">
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[8px] font-black uppercase">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[8px] font-black uppercase">2X</button>
                   </div>
                </div>
              </div>

              {gameState === 'RUNNING' ? (
                <button 
                  onClick={cashOut} 
                  className="w-full py-6 bg-bet-success text-black font-black text-xl rounded-2xl shadow-xl animate-pulse-fast active:scale-95 flex flex-col items-center leading-none"
                >
                   <span className="uppercase text-sm lg:text-base">Cash Out</span>
                   <span className="text-xs mt-1">₹{(betAmount * multiplier).toFixed(0)}</span>
                </button>
              ) : (
                <button 
                  onClick={start} 
                  disabled={betAmount <= 0}
                  className="w-full py-6 bg-bet-accent text-black font-black text-xl rounded-2xl shadow-lg hover:brightness-110 transition-all uppercase tracking-widest disabled:opacity-30 active:scale-95"
                >
                   Place Bet
                </button>
              )}
           </div>

           <div className="lg:col-span-8 bg-bet-900/40 p-8 lg:p-10 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center gap-4 lg:gap-6 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
              <div className="flex gap-8 lg:gap-12 relative z-10">
                 <div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Profit on Win</div>
                    <div className="text-xl lg:text-3xl font-black text-bet-success tabular-nums">₹{(betAmount * multiplier - betAmount).toFixed(0)}</div>
                 </div>
                 <div className="w-px h-10 bg-white/5"></div>
                 <div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Bust Probability</div>
                    <div className="text-xl lg:text-3xl font-black text-bet-danger tabular-nums uppercase italic">High</div>
                 </div>
              </div>
              <p className="text-[8px] lg:text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] max-w-md mx-auto leading-loose italic opacity-40 group-hover:opacity-80 transition-opacity">
                Aviator Engine V2 • HMAC-SHA256 • High Fidelity Randomized Outcomes
              </p>
           </div>
        </div>
      </div>
    </Layout>
  );
}