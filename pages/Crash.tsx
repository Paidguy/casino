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
  const startTimeRef = useRef<number>(0);

  const start = async () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    await engine.placeBet(GameType.CRASH, betAmount, (r) => {
        const point = engine.getCrashPoint(r);
        crashPointRef.current = point;
        return { multiplier: 0, outcome: `Aviator Crashed @ ${point}x` };
    });
    setGameState('RUNNING');
    setMultiplier(1.00);
    startTimeRef.current = performance.now();
    requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (gameState !== 'RUNNING') return;
    const elapsed = (time - startTimeRef.current) / 1000;
    const newMult = Math.pow(Math.E, 0.085 * elapsed); // Slightly tweaked velocity
    if (newMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState('CRASHED');
      audio.playLoss();
      setHistory(prev => [crashPointRef.current, ...prev].slice(0, 15));
    } else {
      setMultiplier(newMult);
      requestAnimationFrame(animate);
    }
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING') return;
    const finalMult = multiplier;
    setGameState('CASHED_OUT');
    audio.playWin();
    engine.updateBalance(betAmount * finalMult);
    setHistory(prev => [crashPointRef.current, ...prev].slice(0, 15));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 h-full">
        
        {/* Aviator Engine Screen */}
        <div className="game-viewport bg-bet-900 border-2 border-white/5 rounded-[3rem] relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           
           {/* Dynamic Background Effects */}
           <div className={`absolute inset-0 transition-all duration-1000 ${gameState === 'RUNNING' ? 'bg-bet-primary/5' : ''}`}></div>
           
           <div className="relative z-10 flex flex-col items-center">
              <div className={`text-6xl lg:text-9xl font-black italic transform -skew-x-12 transition-all duration-75 tabular-nums ${gameState === 'CRASHED' ? 'text-bet-danger scale-90' : 'text-white'}`}>
                {multiplier.toFixed(2)}<span className="text-2xl lg:text-4xl text-white/20 ml-4 font-black">X</span>
              </div>
              
              {gameState === 'CRASHED' && (
                <div className="mt-8 bg-bet-danger text-white px-10 py-3 rounded-2xl font-black uppercase text-sm tracking-[0.4em] animate-bounce shadow-xl">Flew Away!</div>
              )}
              {gameState === 'CASHED_OUT' && (
                <div className="mt-8 bg-success text-black px-10 py-3 rounded-2xl font-black uppercase text-sm tracking-[0.4em] shadow-xl">Safe Landing!</div>
              )}
           </div>

           {/* Live Result History Ticker */}
           <div className="absolute top-8 left-8 right-8 flex gap-3 overflow-x-auto no-scrollbar mask-fade-right">
              {history.map((h, i) => (
                <span key={i} className={`px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black shadow-lg border transition-all hover:scale-110 ${h >= 2 ? 'bg-bet-primary/10 border-bet-primary/30 text-bet-primary' : 'bg-bet-800 border-white/5 text-slate-500'}`}>
                  {h.toFixed(2)}x
                </span>
              ))}
              {history.length === 0 && <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Waiting for nodes...</span>}
           </div>

           {/* Plane Icon Decoration */}
           {gameState === 'RUNNING' && (
             <div className="absolute bottom-1/4 right-1/4 text-4xl animate-pulse opacity-20 rotate-45">✈️</div>
           )}
        </div>

        {/* Tactical Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
           <div className="bg-bet-800 p-8 lg:p-12 rounded-[2.5rem] border border-white/5 flex flex-col justify-between min-h-[250px] shadow-xl">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake Amount (₹)</label>
                   <span className="text-[10px] font-bold text-bet-accent">Max: ₹5,00,000</span>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 bg-bet-950 border border-white/10 rounded-2xl flex items-center px-6 overflow-hidden focus-within:border-bet-primary transition-all">
                      <span className="text-bet-accent font-black text-lg mr-4">₹</span>
                      <input 
                         type="number" 
                         value={betAmount} 
                         onChange={e => setBetAmount(Number(e.target.value))} 
                         className="bg-transparent w-full py-5 text-white font-mono font-black text-2xl outline-none" 
                         disabled={gameState === 'RUNNING'} 
                      />
                   </div>
                   <div className="flex flex-col gap-2">
                      <button onClick={() => setBetAmount(betAmount*2)} className="px-4 py-2 bg-bet-900 border border-white/10 rounded-xl text-[10px] font-black hover:bg-bet-700 transition-all">2X</button>
                      <button onClick={() => setBetAmount(Math.floor(betAmount/2))} className="px-4 py-2 bg-bet-900 border border-white/10 rounded-xl text-[10px] font-black hover:bg-bet-700 transition-all">1/2</button>
                   </div>
                </div>
              </div>
              
              <div className="pt-8">
                {gameState === 'RUNNING' ? (
                   <button 
                     onClick={cashOut} 
                     className="w-full py-8 bg-success text-black font-black text-2xl lg:text-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,200,5,0.3)] animate-pulse-slow hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center leading-none"
                   >
                     <span>CASH OUT</span>
                     <span className="text-sm mt-2 opacity-60">₹{(betAmount * multiplier).toFixed(0)}</span>
                   </button>
                ) : (
                   <button 
                     onClick={start} 
                     disabled={betAmount <= 0}
                     className="w-full py-8 bg-bet-accent text-black font-black text-2xl lg:text-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(250,204,21,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                   >
                     Bet
                   </button>
                )}
              </div>
           </div>

           <div className="hidden md:flex bg-bet-800 p-12 rounded-[2.5rem] border border-white/5 items-center justify-center relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">✈️</div>
              <div className="text-center space-y-4">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Aviator Network Status</div>
                 <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-black text-white">4.2k</span>
                       <span className="text-[8px] font-bold text-slate-600 uppercase">Online</span>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-black text-white">14ms</span>
                       <span className="text-[8px] font-bold text-slate-600 uppercase">Ping</span>
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                   Verified by SattaKing Global Nodes. <br/>
                   Outcome deterministic via HMAC-SHA256.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}