import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Coinflip() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [side, setSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);

  // Auto Bet State
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);
  
  const autoRef = useRef({ active: false, count: 0, remaining: 0 });

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  const flip = () => {
     if (betAmount > engine.getSession().balance || betAmount <= 0) {
        if (autoRef.current.active) setAutoActive(false);
        return;
     }
     setFlipping(true);
     setResult(null); 
     audio.playBet();
     audio.playSpin();

     setTimeout(() => {
        engine.placeBet(GameType.COINFLIP, betAmount, (r) => {
           const isHeads = r > 0.5;
           const outcomeSide = isHeads ? 'HEADS' : 'TAILS';
           const won = side === outcomeSide;
           const mult = won ? 1.96 : 0;
           
           setResult(outcomeSide);
           setFlipping(false);
           
           if (won) audio.playWin(); else audio.playLoss();
           return { multiplier: mult, outcome: `Coinflip: ${outcomeSide}` };
        }, '');
     }, 1000); 
  };

  // Auto Loop
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      if (autoActive && !flipping && result !== null) {
          const { count, remaining } = autoRef.current;
          
          if (engine.getSession().balance < betAmount) {
              setAutoActive(false);
              return;
          }

          if (count === 0 || remaining > 0) {
              timeout = setTimeout(() => {
                  flip();
                  if (count > 0) setAutoBetsRemaining(prev => prev - 1);
              }, 1000); // 1s wait after result
          } else {
              setAutoActive(false);
          }
      }
      return () => clearTimeout(timeout);
  }, [autoActive, flipping, result]); // Trigger when flipping ends (result updates)

  const toggleAuto = () => {
      if (autoActive) {
          setAutoActive(false);
      } else {
          setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
          if (!flipping) flip(); // Start first one immediately
          setAutoActive(true);
      }
  };

  return (
    <Layout>
       <div className="max-w-3xl mx-auto space-y-12 pb-32">
          <div className="bg-bet-900 p-12 lg:p-20 rounded-[4rem] border border-white/10 text-center shadow-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-bet-primary/10 blur-[150px] pointer-events-none"></div>
             
             <div className="mb-16 flex justify-center perspective-1000">
                <div className={`w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-bet-primary border-[12px] border-bet-950 flex items-center justify-center text-8xl font-black text-bet-950 shadow-[0_0_60px_rgba(34,211,238,0.4)] transition-all duration-1000 transform-gpu ${flipping ? 'animate-[spin_0.3s_linear_infinite]' : ''}`}>
                   {!flipping && result ? (result === 'HEADS' ? 'H' : 'T') : '?'}
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6 mb-12">
                <button 
                   onClick={() => { setSide('HEADS'); audio.playClick(); }}
                   disabled={flipping || autoActive}
                   className={`p-10 rounded-[2.5rem] border-4 font-black text-3xl lg:text-5xl transition-all bazar-font ${side === 'HEADS' ? 'bg-bet-primary/10 border-bet-primary text-bet-primary shadow-2xl cyan-glow' : 'bg-black/40 border-white/5 text-slate-700'}`}
                >
                   HEADS
                </button>
                <button 
                   onClick={() => { setSide('TAILS'); audio.playClick(); }}
                   disabled={flipping || autoActive}
                   className={`p-10 rounded-[2.5rem] border-4 font-black text-3xl lg:text-5xl transition-all bazar-font ${side === 'TAILS' ? 'bg-bet-secondary/10 border-bet-secondary text-bet-secondary shadow-2xl magenta-glow' : 'bg-black/40 border-white/5 text-slate-700'}`}
                >
                   TAILS
                </button>
             </div>

             <div className="space-y-4">
                 <div className="flex bg-black/40 p-1 rounded-xl max-w-xs mx-auto mb-4">
                    <button onClick={() => setMode('MANUAL')} disabled={autoActive} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'MANUAL' ? 'bg-bet-800 text-white shadow' : 'text-slate-500'}`}>Manual</button>
                    <button onClick={() => setMode('AUTO')} disabled={autoActive} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'AUTO' ? 'bg-bet-primary text-bet-950 shadow' : 'text-slate-500'}`}>Auto</button>
                 </div>

                 <div className="flex flex-col md:flex-row gap-6 items-stretch">
                    <div className="flex-1 text-left space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">Stake (₹)</label>
                      <input 
                          type="number" 
                          value={betAmount} 
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl lg:text-3xl outline-none focus:border-bet-primary transition-all"
                          disabled={flipping || autoActive}
                     />
                    </div>
                    {mode === 'AUTO' && (
                        <div className="flex-1 text-left space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">Count</label>
                          <input 
                              type="number" 
                              value={autoBetCount} 
                              onChange={(e) => setAutoBetCount(Number(e.target.value))}
                              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl lg:text-3xl outline-none"
                              disabled={autoActive}
                         />
                        </div>
                    )}
                    
                    {!autoActive ? (
                        <button 
                          onClick={flip}
                          disabled={flipping || betAmount <= 0}
                          className="px-12 py-6 bg-bet-primary text-bet-950 font-black text-2xl lg:text-4xl rounded-[2rem] shadow-xl active:scale-95 transition-all w-full md:w-80 bazar-font cyan-glow"
                        >
                          {flipping ? 'FLIPPING' : 'TOSS'}
                        </button>
                    ) : (
                        <button 
                          onClick={toggleAuto}
                          className="px-12 py-6 bg-bet-danger text-white font-black text-xl lg:text-2xl rounded-[2rem] shadow-xl active:scale-95 transition-all w-full md:w-80 bazar-font"
                        >
                          STOP ({autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})
                        </button>
                    )}
                 </div>
             </div>
          </div>
       </div>
    </Layout>
  );
}