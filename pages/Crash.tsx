import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Crash() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  
  // Use refs for high-frequency data to avoid React re-renders blocking the thread
  const multiplierRef = useRef<number>(1.00);
  const crashPointRef = useRef<number>(1);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUiUpdateRef = useRef<number>(0);
  
  // State for the big number display - throttled updates
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.00);

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      if (gameState !== 'RUNNING') drawGraph(0, 1);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    try {
      engine.updateBalance(-betAmount);
      audio.playBet();
      
      const r = Math.random();
      crashPointRef.current = engine.getCrashPoint(r);
      
      setGameState('RUNNING');
      multiplierRef.current = 1.00;
      setDisplayMultiplier(1.00);
      startTimeRef.current = performance.now();
      lastUiUpdateRef.current = 0;
      
      // Start the optimized loop
      requestRef.current = requestAnimationFrame(animate);
    } catch (e) { console.error(e); }
  };

  const animate = (time: number) => {
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, 0.06 * elapsed);
    
    multiplierRef.current = currentMult;
    
    // Draw canvas every frame (high performance)
    drawGraph(elapsed, currentMult);

    // Update UI state throttled (every ~80ms / 12fps) to keep main thread free for clicks
    if (time - lastUiUpdateRef.current > 80) {
        setDisplayMultiplier(currentMult);
        lastUiUpdateRef.current = time;
    }

    if (currentMult >= crashPointRef.current) {
      // Crash logic
      multiplierRef.current = crashPointRef.current;
      setDisplayMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 8));
      engine.placeBet(GameType.CRASH, 0, 0, `Crashed @ ${crashPointRef.current.toFixed(2)}x`);
      cancelAnimationFrame(requestRef.current);
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const cashOut = () => {
    // This function must be extremely fast and not rely on state updates
    if (gameState !== 'RUNNING') return;
    
    cancelAnimationFrame(requestRef.current); // Stop animation immediately
    const finalMult = multiplierRef.current;
    
    setGameState('CASHED_OUT');
    setDisplayMultiplier(finalMult);
    audio.playWin();
    
    // Calculate payout
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
    const padding = w * 0.05;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Curve
    ctx.strokeStyle = gameState === 'CRASHED' ? '#ef4444' : '#facc15';
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    
    const steps = 40; // Reduced steps for performance
    for (let i = 0; i <= steps; i++) {
        const stepT = (t / steps) * i;
        const stepM = Math.pow(Math.E, 0.06 * stepT);
        
        // Dynamic scaling
        const scaleX = Math.max(8, t);
        const scaleY = Math.max(2, m);
        
        const x = padding + (stepT / scaleX) * graphW;
        const y = h - padding - ((stepM - 1) / (scaleY - 1)) * graphH;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Fill area
    ctx.fillStyle = gameState === 'CRASHED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(250, 204, 21, 0.1)';
    ctx.lineTo(padding + (t / Math.max(8, t)) * graphW, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.fill();
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 lg:gap-6 pb-20">
        {/* Arena */}
        <div className="relative bg-bet-900 border border-white/5 rounded-[2rem] p-4 lg:p-6 shadow-2xl overflow-hidden min-h-[300px] lg:min-h-[350px] flex flex-col justify-center items-center">
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`text-6xl lg:text-8xl font-black italic -skew-x-12 tabular-nums drop-shadow-2xl ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
                {displayMultiplier.toFixed(2)}x
              </div>
              {gameState === 'CRASHED' && <div className="text-[10px] text-bet-danger font-black uppercase tracking-widest bg-bet-danger/10 px-4 py-1 rounded-full">Bust @ {displayMultiplier.toFixed(2)}x</div>}
           </div>
           
           {/* History Bar */}
           <div className="absolute top-4 left-0 right-0 flex justify-center px-4 gap-2 overflow-hidden pointer-events-none">
              {history.map((h, i) => (
                <div key={i} className={`px-2 py-1 rounded-md text-[9px] font-black border backdrop-blur-md animate-fade-in ${h >= 2 ? 'bg-bet-success/10 border-bet-success/30 text-bet-success' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
           <div className="md:col-span-5 bg-bet-900 p-5 lg:p-6 rounded-[2rem] border border-white/5 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 leading-none">Stake Amount (₹)</label>
                <div className="relative">
                   <input 
                     type="number" 
                     value={betAmount} 
                     onChange={e => setBetAmount(Number(e.target.value))} 
                     disabled={gameState === 'RUNNING'} 
                     className="w-full bg-black border border-white/10 p-3 lg:p-4 rounded-xl text-white font-black text-xl outline-none" 
                   />
                   <div className="absolute right-2 top-2 flex gap-1">
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} disabled={gameState === 'RUNNING'} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} disabled={gameState === 'RUNNING'} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase">2X</button>
                   </div>
                </div>
              </div>
              {gameState === 'RUNNING' ? (
                <button 
                    onClick={cashOut} 
                    className="w-full py-4 bg-bet-success text-black font-black text-lg rounded-xl shadow-xl animate-pulse active:scale-95 transition-transform hover:brightness-110"
                >
                   Cash Out (₹{(betAmount * displayMultiplier).toFixed(0)})
                </button>
              ) : (
                <button onClick={start} disabled={betAmount <= 0} className="w-full py-4 bg-bet-accent text-black font-black text-lg rounded-xl shadow-lg transition-all uppercase tracking-widest hover:scale-[1.02] active:scale-95">
                   Bet Lagao
                </button>
              )}
           </div>
           
           <div className="md:col-span-7 bg-bet-900/40 p-6 lg:p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center gap-4 shadow-inner">
              <div className="flex gap-8">
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Profit On Win</div>
                    <div className="text-xl lg:text-2xl font-black text-bet-success tabular-nums">₹{(betAmount * displayMultiplier - betAmount).toFixed(0)}</div>
                 </div>
                 <div className="w-px h-10 bg-white/5"></div>
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Engine Node</div>
                    <div className="text-xl lg:text-2xl font-black text-bet-primary uppercase italic">@paidguy</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}