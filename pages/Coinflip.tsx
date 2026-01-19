import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Coinflip() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [side, setSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);

  const flip = () => {
     if (betAmount > engine.getSession().balance) return;
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
     }, 1200);
  };

  return (
    <Layout>
       <div className="max-w-3xl mx-auto space-y-12 pb-32">
          <div className="bg-bet-900 p-12 lg:p-20 rounded-[4rem] border border-white/10 text-center shadow-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-bet-primary/10 blur-[150px] pointer-events-none"></div>
             
             <div className="mb-16 flex justify-center perspective-1000">
                <div className={`w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-bet-primary border-[12px] border-bet-950 flex items-center justify-center text-8xl font-black text-bet-950 shadow-[0_0_60px_rgba(34,211,238,0.4)] transition-all duration-1000 transform-gpu ${flipping ? 'animate-[spin_0.3s_linear_infinite]' : ''}`}>
                   {result ? (result === 'HEADS' ? 'H' : 'T') : '?'}
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6 mb-12">
                <button 
                   onClick={() => { setSide('HEADS'); audio.playClick(); }}
                   disabled={flipping}
                   className={`p-10 rounded-[2.5rem] border-4 font-black text-3xl lg:text-5xl transition-all bazar-font ${side === 'HEADS' ? 'bg-bet-primary/10 border-bet-primary text-bet-primary shadow-2xl cyan-glow' : 'bg-black/40 border-white/5 text-slate-700'}`}
                >
                   HEADS
                </button>
                <button 
                   onClick={() => { setSide('TAILS'); audio.playClick(); }}
                   disabled={flipping}
                   className={`p-10 rounded-[2.5rem] border-4 font-black text-3xl lg:text-5xl transition-all bazar-font ${side === 'TAILS' ? 'bg-bet-secondary/10 border-bet-secondary text-bet-secondary shadow-2xl magenta-glow' : 'bg-black/40 border-white/5 text-slate-700'}`}
                >
                   TAILS
                </button>
             </div>

             <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="flex-1 text-left space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4">Stake Amount (₹)</label>
                  <input 
                      type="number" 
                      value={betAmount} 
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl lg:text-3xl outline-none focus:border-bet-primary transition-all"
                      disabled={flipping}
                 />
                </div>
                <button 
                  onClick={flip}
                  disabled={flipping || betAmount <= 0}
                  className="px-12 py-6 bg-bet-primary text-bet-950 font-black text-2xl lg:text-4xl rounded-[2rem] shadow-xl active:scale-95 transition-all w-full md:w-80 bazar-font cyan-glow"
                >
                  {flipping ? 'FLIPPING...' : 'TOSS (1.96x)'}
                </button>
             </div>
          </div>

          <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 text-center">
             <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic leading-relaxed">
               Instant 50/50 Probabilistic Result • Verified via Mumbai Nodes
             </p>
          </div>
       </div>
    </Layout>
  );
}