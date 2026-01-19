
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

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    
    // Deduct at start to lock the bet
    engine.updateBalance(-betAmount);
    audio.playBet();
    
    const r = Math.random();
    crashPointRef.current = engine.getCrashPoint(r);
    
    setGameState('RUNNING');
    setMultiplier(1.00);
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, 0.08 * elapsed);
    
    if (currentMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
      // Log as a loss (0 payout)
      engine.placeBet(GameType.CRASH, 0, 0, `Crashed @ ${crashPointRef.current}x`);
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
    // Record the win. The engine will add payout based on betAmount.
    // Since we already deducted betAmount at start, we pass 0 here to just record payout,
    // OR more simply, we add the payout directly.
    engine.updateBalance(betAmount * finalMult);
    engine.placeBet(GameType.CRASH, 0, finalMult, `Cashed out @ ${finalMult.toFixed(2)}x`);
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="h-64 lg:h-96 bg-bet-900 border-2 border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
           <div className={`text-6xl lg:text-9xl font-black italic -skew-x-12 transition-colors ${gameState === 'CRASHED' ? 'text-bet-danger' : 'text-white'}`}>
             {multiplier.toFixed(2)}x
           </div>
           
           <div className="absolute top-6 left-6 flex gap-2 overflow-x-auto no-scrollbar max-w-full">
              {history.map((h, i) => (
                <div key={i} className={`px-3 py-1 rounded-lg text-[10px] font-black border ${h >= 2 ? 'border-bet-success text-bet-success' : 'border-white/10 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </div>
              ))}
           </div>

           {gameState === 'CRASHED' && <div className="mt-4 font-black text-bet-danger uppercase animate-bounce">Flew Away!</div>}
           {gameState === 'CASHED_OUT' && <div className="mt-4 font-black text-bet-success uppercase">Secured Payout!</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-bet-800 p-8 rounded-[2rem] border border-white/5 space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
              <div className="flex gap-4">
                 <input 
                   type="number" value={betAmount} 
                   onChange={e => setBetAmount(Number(e.target.value))} 
                   disabled={gameState === 'RUNNING'}
                   className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl outline-none" 
                 />
                 <div className="flex flex-col gap-2">
                    <button onClick={() => setBetAmount(betAmount*2)} className="px-4 py-2 bg-bet-900 rounded-lg text-[10px] font-black">2X</button>
                    <button onClick={() => setBetAmount(Math.floor(betAmount/2))} className="px-4 py-2 bg-bet-900 rounded-lg text-[10px] font-black">1/2</button>
                 </div>
              </div>
              
              {gameState === 'RUNNING' ? (
                <button onClick={cashOut} className="w-full py-6 bg-bet-success text-black font-black text-2xl rounded-2xl shadow-xl animate-pulse">
                   CASH OUT (₹{(betAmount * multiplier).toFixed(0)})
                </button>
              ) : (
                <button onClick={start} className="w-full py-6 bg-bet-accent text-black font-black text-2xl rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest">
                   Bet
                </button>
              )}
           </div>

           <div className="bg-bet-900/50 p-8 rounded-[2rem] border border-white/5 flex items-center justify-center text-center opacity-40">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">
                Aviator Engine V4.2<br/>Deterministic Fairness Node-6<br/>Ping: 14ms
              </p>
           </div>
        </div>
      </div>
    </Layout>
  );
}
