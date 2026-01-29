import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Crash() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  
  // Auto Bet State
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0); // 0 = infinite
  const [autoCashOutAt, setAutoCashOutAt] = useState<number>(2.00);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  // Refs for State Safety in Loops
  const autoStateRef = useRef({ active: false, count: 0, remaining: 0 });
  const multiplierRef = useRef<number>(1.00);
  const crashPointRef = useRef<number>(1);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCashOutProcessing = useRef<boolean>(false);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.00);

  // Sync Ref
  useEffect(() => {
    autoStateRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  // Clean up on unmount
  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          // If unmounted while running, we must resolve the bet to prevent balance lock
          // However, we can't easily refund here without causing issues. 
          // Best effort: stop auto.
          setAutoActive(false); 
      };
  }, []);

  // --- Auto Bet Loop ---
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (autoActive && gameState === 'IDLE') {
       const { count, remaining } = autoStateRef.current;
       
       if (count === 0 || remaining > 0) {
           timeout = setTimeout(() => {
               if (engine.getSession().balance >= betAmount) {
                   start();
                   if (count > 0) setAutoBetsRemaining(prev => prev - 1);
               } else {
                   setAutoActive(false);
               }
           }, 2000); // 2s cooldown between rounds
       } else {
           setAutoActive(false);
       }
    }
    return () => clearTimeout(timeout);
  }, [gameState, autoActive]); 

  // Auto Cashout Logic
  useEffect(() => {
      if (gameState === 'RUNNING' && mode === 'AUTO' && !isCashOutProcessing.current) {
          if (displayMultiplier >= autoCashOutAt) {
              cashOut();
          }
      }
  }, [displayMultiplier, gameState, mode, autoCashOutAt]);

  // Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
          canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
          if (gameState !== 'RUNNING') drawGraph(0, 1);
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  const start = () => {
    const bal = engine.getSession().balance;
    if (betAmount > bal || betAmount <= 0) {
        setAutoActive(false); 
        return;
    }
    
    try {
      // 1. Visual Hold: Deduct balance immediately so user can't double spend
      engine.updateBalance(-betAmount);
      audio.playBet();
      
      // 2. Determine Fate
      const r = engine.peekNextRandom();
      crashPointRef.current = engine.getCrashPoint(r);
      
      // 3. Reset State
      multiplierRef.current = 1.00;
      startTimeRef.current = performance.now();
      isCashOutProcessing.current = false;
      setDisplayMultiplier(1.00);
      setGameState('RUNNING');
      
      // 4. Start Animation
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(animate);
    } catch (e) { console.error(e); }
  };

  const animate = (time: number) => {
    if (isCashOutProcessing.current) return;

    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, 0.06 * elapsed);
    
    multiplierRef.current = currentMult;
    drawGraph(elapsed, currentMult);

    // Throttle UI updates to 60fps equivalent but decouple slightly
    setDisplayMultiplier(currentMult);

    if (currentMult >= crashPointRef.current) {
      handleCrash(crashPointRef.current);
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleCrash = (finalMult: number) => {
      cancelAnimationFrame(requestRef.current);
      multiplierRef.current = finalMult;
      setDisplayMultiplier(finalMult);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [finalMult, ...prev].slice(0, 8));
      
      // LOGIC FIX: Refund the visual hold, then commit the real bet (loss)
      // This ensures stats (wagered, loss count) are correct in engine
      engine.updateBalance(betAmount); // Refund
      engine.placeBet(GameType.CRASH, betAmount, 0, `Crashed @ ${finalMult.toFixed(2)}x`);
      
      setTimeout(() => setGameState('IDLE'), 3000); 
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING' || isCashOutProcessing.current) return;
    
    // 1. Lock immediately
    isCashOutProcessing.current = true;
    cancelAnimationFrame(requestRef.current); 
    const finalMult = multiplierRef.current;
    
    // Safety check: Did we crash in the last millisecond?
    if (finalMult > crashPointRef.current) {
        handleCrash(crashPointRef.current);
        return;
    }

    // 2. Success State
    setGameState('CASHED_OUT');
    setDisplayMultiplier(finalMult);
    audio.playWin();
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 8));
    
    // 3. Logic Fix: Refund visual hold, then commit real bet (win)
    engine.updateBalance(betAmount); // Refund
    engine.placeBet(GameType.CRASH, betAmount, finalMult, `Cashed out @ ${finalMult.toFixed(2)}x`);
    
    setTimeout(() => setGameState('IDLE'), 2000);
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

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Line
    const crashed = m >= crashPointRef.current && gameState === 'CRASHED';
    ctx.strokeStyle = crashed ? '#ef4444' : '#facc15';
    ctx.lineWidth = 4 * window.devicePixelRatio;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    
    const steps = 50; 
    for (let i = 0; i <= steps; i++) {
        const stepT = (t / steps) * i;
        const stepM = Math.pow(Math.E, 0.06 * stepT);
        
        // Scale logic to keep line in view
        const scaleX = Math.max(10, t * 1.2); 
        const scaleY = Math.max(2, m * 1.2);
        
        const x = padding + (stepT / scaleX) * graphW;
        const y = h - padding - ((stepM - 1) / (scaleY - 1)) * graphH;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Fill
    ctx.fillStyle = crashed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(250, 204, 21, 0.1)';
    ctx.lineTo(padding + (t / Math.max(10, t*1.2)) * graphW, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.fill();
  };

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
      <div className="flex flex-col gap-4 lg:gap-6 pb-20">
        <div className="relative bg-bet-900 border border-white/5 rounded-[2rem] p-4 lg:p-6 shadow-2xl overflow-hidden min-h-[300px] lg:min-h-[400px] flex flex-col justify-center items-center">
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
           
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`text-6xl lg:text-8xl font-black italic -skew-x-12 tabular-nums drop-shadow-2xl transition-all duration-75 ${gameState === 'CRASHED' ? 'text-bet-danger scale-110' : gameState === 'CASHED_OUT' ? 'text-bet-success scale-110' : 'text-white'}`}>
                {displayMultiplier.toFixed(2)}x
              </div>
              
              {gameState === 'CRASHED' && (
                  <div className="text-xs lg:text-sm text-white font-black uppercase tracking-widest bg-bet-danger px-6 py-2 rounded-full animate-bounce shadow-lg">
                      Flew Away
                  </div>
              )}
              
              {gameState === 'CASHED_OUT' && (
                  <div className="text-xs lg:text-sm text-bet-950 font-black uppercase tracking-widest bg-bet-success px-6 py-2 rounded-full animate-pulse shadow-lg">
                      Cashed Out
                  </div>
              )}
              
              {gameState === 'RUNNING' && (
                  <div className="text-[10px] text-bet-accent font-black uppercase tracking-[0.3em] animate-pulse">
                      Flying...
                  </div>
              )}
           </div>

           <div className="absolute top-4 left-0 right-0 flex justify-center px-4 gap-2 overflow-hidden pointer-events-none">
              {history.map((h, i) => (
                <div key={i} className={`px-2 py-1 rounded-md text-[9px] font-black border backdrop-blur-md animate-fade-in ${h >= 2 ? 'bg-bet-success/10 border-bet-success/30 text-bet-success' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
           <div className="md:col-span-5 bg-bet-900 p-5 lg:p-6 rounded-[2rem] border border-white/5 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex bg-black/40 p-1 rounded-xl">
                  <button onClick={() => setMode('MANUAL')} disabled={autoActive} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'MANUAL' ? 'bg-bet-800 text-white shadow' : 'text-slate-500'}`}>Manual</button>
                  <button onClick={() => setMode('AUTO')} disabled={autoActive || gameState === 'RUNNING'} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'AUTO' ? 'bg-bet-primary text-bet-950 shadow' : 'text-slate-500'}`}>Auto</button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 leading-none">Stake Amount (₹)</label>
                <div className="relative">
                   <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} disabled={gameState === 'RUNNING' || autoActive} className="w-full bg-black border border-white/10 p-3 lg:p-4 rounded-xl text-white font-black text-xl outline-none" />
                   <div className="absolute right-2 top-2 flex gap-1">
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} disabled={gameState === 'RUNNING' || autoActive} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase hover:bg-bet-700">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} disabled={gameState === 'RUNNING' || autoActive} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase hover:bg-bet-700">2X</button>
                   </div>
                </div>
              </div>

              {mode === 'AUTO' && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase">Bets (0=Inf)</label>
                          <input type="number" value={autoBetCount} onChange={e => setAutoBetCount(Number(e.target.value))} disabled={autoActive} className="w-full bg-black border border-white/10 p-2 rounded-lg text-white font-black outline-none text-sm" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase">Cashout At</label>
                          <input type="number" value={autoCashOutAt} onChange={e => setAutoCashOutAt(Number(e.target.value))} disabled={autoActive} className="w-full bg-black border border-white/10 p-2 rounded-lg text-white font-black outline-none text-sm" step="0.1" />
                      </div>
                  </div>
              )}

              {mode === 'MANUAL' ? (
                gameState === 'RUNNING' ? (
                    <button 
                        onClick={cashOut} 
                        className="w-full py-4 bg-bet-success text-bet-950 font-black text-2xl rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest cursor-pointer cyan-glow"
                    >
                        Cash Out
                        <span className="block text-sm opacity-80">₹{(betAmount * displayMultiplier).toFixed(0)}</span>
                    </button>
                ) : (
                    <button 
                        onClick={start} 
                        disabled={betAmount <= 0} 
                        className="w-full py-4 bg-bet-accent text-black font-black text-lg rounded-xl shadow-lg transition-all uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                        Bet Lagao
                    </button>
                )
              ) : (
                  <button onClick={toggleAuto} className={`w-full py-4 font-black text-lg rounded-xl shadow-lg transition-all uppercase tracking-widest hover:scale-[1.02] active:scale-95 ${autoActive ? 'bg-bet-danger text-white' : 'bg-bet-primary text-bet-950'}`}>
                      {autoActive ? `Stop Auto (${autoBetsRemaining === 999999 ? 'Inf' : autoBetsRemaining})` : 'Start Auto Bet'}
                  </button>
              )}
           </div>
           
           <div className="md:col-span-7 bg-bet-900/40 p-6 lg:p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center items-center text-center gap-4 shadow-inner">
              <div className="flex gap-8">
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Current Profit</div>
                    <div className={`text-xl lg:text-3xl font-black tabular-nums transition-colors ${gameState === 'RUNNING' ? 'text-white' : gameState === 'CASHED_OUT' ? 'text-bet-success' : 'text-slate-600'}`}>
                        ₹{gameState === 'RUNNING' ? (betAmount * displayMultiplier - betAmount).toFixed(0) : gameState === 'CASHED_OUT' ? (betAmount * displayMultiplier - betAmount).toFixed(0) : '0'}
                    </div>
                 </div>
                 <div className="w-px h-12 bg-white/5"></div>
                 <div>
                    <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Engine Node</div>
                    <div className="text-xl lg:text-3xl font-black text-bet-primary uppercase italic">@paidguy</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}