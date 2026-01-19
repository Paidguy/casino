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
    } catch (e) { console.error(e); }
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
    engine.updateBalance(betAmount * finalMult);
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
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    const steps = 30;
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
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 lg:gap-8 pb-20">
        {/* Arena - Reduced height for laptop scaling */}
        <div className="relative bg-bet-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden min-h-[300px] lg:min-h-[400px] flex flex-col justify-center items-center">
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`text-6xl lg:text-9xl font-black italic -skew-x-12 tabular-nums drop-shadow-2xl ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
                {multiplier.toFixed(2)}x
              </div>
              {gameState === 'CRASHED' && <div className="text-[10px] text-bet-danger font-black uppercase tracking-widest bg-bet-danger/10 px-4 py-1 rounded-full">Bust @ {multiplier.toFixed(2)}x</div>}
           </div>
           <div className="absolute top-4 left-0 right-0 flex justify-center px-4 gap-2 overflow-hidden pointer-events-none">
              {history.map((h, i) => (
                <div key={i} className={`px-3 py-1 rounded-lg text-[9px] font-black border backdrop-blur-md ${h >= 2 ? 'bg-bet-success/10 border-bet-success/30 text-bet-success' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>
        </div>

        {/* Controls - More compact for laptops */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-5 bg-bet-900 p-6 lg:p-8 rounded-[2rem] border border-white/5 space-y-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 leading-none">Stake Amount (₹)</label>
                <div className="relative">
                   <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} disabled={gameState === 'RUNNING'} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl lg:text-2xl outline-none" />
                   <div className="absolute right-2 top-2 flex gap-1">
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} className="px-2 py-2 bg-bet-800 rounded-lg text-[9px] font-black uppercase">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-2 py-2 bg-bet-800 rounded-lg text-[9px] font-black uppercase">2X</button>
                   </div>
                </div>
              </div>
              {gameState === 'RUNNING' ? (
                <button onClick={cashOut} className="w-full py-5 bg-bet-success text-black font-black text-lg rounded-xl shadow-xl animate-pulse">Cash Out (₹{(betAmount * multiplier).toFixed(0)})</button>
              ) : (
                <button onClick={start} disabled={betAmount <= 0} className="w-full py-5 bg-bet-accent text-black font-black text-lg rounded-xl shadow-lg transition-all uppercase tracking-widest">Bet Lagao</button>
              )}
           </div>
           <div className="md:col-span-7 bg-bet-900/40 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center gap-4 shadow-inner">
              <div className="flex gap-8">
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Profit On Win</div>
                    <div className="text-2xl font-black text-bet-success tabular-nums">₹{(betAmount * multiplier - betAmount).toFixed(0)}</div>
                 </div>
                 <div className="w-px h-10 bg-white/5"></div>
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Engine Node</div>
                    <div className="text-2xl font-black text-bet-primary uppercase italic">@paidguy</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}