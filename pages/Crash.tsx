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
  const lastUiUpdateRef = useRef<number>(0);
  const isCashOutProcessing = useRef<boolean>(false);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1.00);

  // Sync Ref
  useEffect(() => {
    autoStateRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

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
  }, [gameState, autoActive]); // Trigger when gameState goes back to IDLE

  useEffect(() => {
      // Auto Cashout Check inside the running loop state
      if (gameState === 'RUNNING' && mode === 'AUTO' && !isCashOutProcessing.current) {
          if (displayMultiplier >= autoCashOutAt) {
              cashOut();
          }
      }
  }, [displayMultiplier, gameState, mode, autoCashOutAt]);

  // Resize handling
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

  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  const start = () => {
    const bal = engine.getSession().balance;
    if (betAmount > bal || betAmount <= 0) {
        setAutoActive(false); 
        return;
    }
    
    try {
      engine.updateBalance(-betAmount);
      audio.playBet();
      
      const r = Math.random();
      crashPointRef.current = engine.getCrashPoint(r);
      
      multiplierRef.current = 1.00;
      startTimeRef.current = performance.now();
      lastUiUpdateRef.current = 0;
      isCashOutProcessing.current = false;
      setDisplayMultiplier(1.00);
      setGameState('RUNNING');
      
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

    if (time - lastUiUpdateRef.current > 80) {
        setDisplayMultiplier(currentMult);
        lastUiUpdateRef.current = time;
    }

    if (currentMult >= crashPointRef.current) {
      handleCrash(crashPointRef.current);
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleCrash = (finalMult: number) => {
      multiplierRef.current = finalMult;
      setDisplayMultiplier(finalMult);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [finalMult, ...prev].slice(0, 8));
      engine.placeBet(GameType.CRASH, 0, 0, `Crashed @ ${finalMult.toFixed(2)}x`);
      
      // Auto Reset State
      setTimeout(() => setGameState('IDLE'), 2000); 
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING' || isCashOutProcessing.current) return;
    
    isCashOutProcessing.current = true;
    cancelAnimationFrame(requestRef.current); 
    const finalMult = multiplierRef.current;
    
    setGameState('CASHED_OUT');
    setDisplayMultiplier(finalMult);
    audio.playWin();
    
    engine.updateBalance(betAmount * finalMult);
    engine.placeBet(GameType.CRASH, 0, finalMult, `Cashed out @ ${finalMult.toFixed(2)}x`);
    
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 8));
    
    // Auto Reset State
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

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    if (m >= crashPointRef.current && gameState === 'CRASHED') ctx.strokeStyle = '#ef4444';
    
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    
    const steps = 40; 
    for (let i = 0; i <= steps; i++) {
        const stepT = (t / steps) * i;
        const stepM = Math.pow(Math.E, 0.06 * stepT);
        const scaleX = Math.max(8, t);
        const scaleY = Math.max(2, m);
        
        const x = padding + (stepT / scaleX) * graphW;
        const y = h - padding - ((stepM - 1) / (scaleY - 1)) * graphH;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    ctx.fillStyle = (m >= crashPointRef.current && gameState === 'CRASHED') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(250, 204, 21, 0.1)';
    ctx.lineTo(padding + (t / Math.max(8, t)) * graphW, h - padding);
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
        <div className="relative bg-bet-900 border border-white/5 rounded-[2rem] p-4 lg:p-6 shadow-2xl overflow-hidden min-h-[300px] lg:min-h-[350px] flex flex-col justify-center items-center">
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`text-6xl lg:text-7xl font-black italic -skew-x-12 tabular-nums drop-shadow-2xl ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
                {displayMultiplier.toFixed(2)}x
              </div>
              {gameState === 'CRASHED' && <div className="text-[10px] text-bet-danger font-black uppercase tracking-widest bg-bet-danger/10 px-4 py-1 rounded-full">Bust @ {displayMultiplier.toFixed(2)}x</div>}
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
                      <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} disabled={gameState === 'RUNNING' || autoActive} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase">1/2</button>
                      <button onClick={() => setBetAmount(betAmount*2)} disabled={gameState === 'RUNNING' || autoActive} className="px-2 py-1.5 bg-bet-800 rounded-lg text-[9px] font-black uppercase">2X</button>
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
                    <button onClick={cashOut} className="w-full py-4 bg-bet-success text-black font-black text-lg rounded-xl shadow-xl animate-pulse active:scale-95 transition-transform hover:brightness-110">
                    Cash Out (₹{(betAmount * displayMultiplier).toFixed(0)})
                    </button>
                ) : (
                    <button onClick={start} disabled={betAmount <= 0} className="w-full py-4 bg-bet-accent text-black font-black text-lg rounded-xl shadow-lg transition-all uppercase tracking-widest hover:scale-[1.02] active:scale-95">
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