
import React, { useState, useEffect, useRef } from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Crash() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  const [crashPoint, setCrashPoint] = useState<number>(0);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (gameState !== 'RUNNING') return;
    if (!startTimeRef.current) startTimeRef.current = time;
    
    const elapsed = time - startTimeRef.current;
    const seconds = elapsed / 1000;
    // Real Stake-style growth formula
    const newMultiplier = Math.pow(1.06, seconds);

    if (newMultiplier >= crashPoint) {
      setMultiplier(crashPoint);
      setGameState('CRASHED');
      audio.playLoss();
      engine.placeBet(GameType.CRASH, betAmount, () => ({ multiplier: 0, outcome: `Bust @ ${crashPoint.toFixed(2)}x` }));
      setHistory(prev => [crashPoint, ...prev].slice(0, 8));
    } else {
      setMultiplier(newMultiplier);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (gameState === 'RUNNING') {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, crashPoint]);

  const startGame = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    const r = engine.peekNextRandom();
    const point = engine.getCrashPoint(r);
    setCrashPoint(point);
    setGameState('RUNNING');
    setMultiplier(1.00);
    startTimeRef.current = 0;
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING') return;
    const finalMult = multiplier;
    setGameState('CASHED_OUT');
    audio.playWin();
    engine.placeBet(GameType.CRASH, betAmount, () => ({ multiplier: finalMult, outcome: `Win @ ${finalMult.toFixed(2)}x` }));
    setHistory(prev => [crashPoint, ...prev].slice(0, 8));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
        {/* Betting Terminal */}
        <div className="w-full lg:w-80 bg-[#0f1116] p-6 rounded-2xl border border-white/5 flex flex-col gap-6 shadow-2xl shrink-0">
          <div className="bg-[#07080a] p-1 rounded-lg flex border border-white/5">
             <button className="flex-1 py-2 text-[10px] font-black uppercase text-white bg-white/5 rounded">Manual</button>
             <button className="flex-1 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Auto</button>
          </div>

          <div>
            <div className="flex justify-between mb-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount</label>
               <span className="text-[10px] font-bold text-slate-600">$ USD</span>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Number(e.target.value))} 
                className="w-full bg-[#07080a] border border-white/10 px-4 py-3 rounded-lg text-white font-mono font-black text-lg focus:outline-none focus:border-[#00e701] transition-all"
                disabled={gameState === 'RUNNING'}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                 <button onClick={() => setBetAmount(Math.max(0, betAmount / 2))} className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[10px] font-black text-white border border-white/5 transition-all">1/2</button>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-[10px] font-black text-white border border-white/5 transition-all">2x</button>
              </div>
            </div>
          </div>

          {gameState === 'RUNNING' ? (
            <button onClick={cashOut} className="w-full py-5 bg-[#00e701] text-black font-black text-xl rounded-xl shadow-[0_0_50px_rgba(0,231,1,0.2)] transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest">
              Cashout (${(betAmount * multiplier).toFixed(2)})
            </button>
          ) : (
            <button 
              onClick={startGame} 
              className="w-full py-5 bg-[#00e701] text-black font-black text-xl rounded-xl shadow-[0_0_50px_rgba(0,231,1,0.2)] transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
            >
              Bet
            </button>
          )}

          <div className="mt-auto border-t border-white/5 pt-6">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Latest Results</div>
            <div className="flex flex-wrap gap-2">
               {history.map((h, i) => (
                  <div key={i} className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${h >= 2 ? 'bg-[#00e701]/10 text-[#00e701] border-[#00e701]/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {h.toFixed(2)}x
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Game Canvas Viewport */}
        <div className="flex-1 bg-[#0f1116] rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] shadow-inner group">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
           
           <div className="z-10 text-center select-none scale-100 group-hover:scale-105 transition-transform duration-700">
              <div className={`text-[140px] leading-none font-black tracking-tighter tabular-nums drop-shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-colors duration-300 ${gameState === 'CRASHED' ? 'text-rose-500' : 'text-white'}`}>
                {multiplier.toFixed(2)}x
              </div>
              {gameState === 'CRASHED' && <div className="text-3xl font-black text-rose-500 uppercase tracking-[0.5em] mt-6 animate-pulse">Busted!</div>}
              {gameState === 'CASHED_OUT' && <div className="text-3xl font-black text-[#00e701] uppercase tracking-[0.5em] mt-6">Profit: +${(betAmount * multiplier - betAmount).toFixed(2)}</div>}
           </div>

           {gameState === 'RUNNING' && (
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path 
                   d={`M 0 500 Q ${300 + (multiplier * 30)} ${500 - (multiplier * 15)} 1000 0`} 
                   fill="none" 
                   stroke="#00e701" 
                   strokeWidth="16" 
                   strokeLinecap="round"
                   className="animate-pulse"
                />
             </svg>
           )}
        </div>
      </div>
    </Layout>
  );
}
