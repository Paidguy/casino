
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
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
        });
     }, 1000);
  };

  return (
    <Layout>
       <div className="max-w-2xl mx-auto bg-casino-800 p-8 rounded-xl border border-casino-700 text-center">
          <div className="mb-12 flex justify-center perspective-1000">
             <div className={`w-48 h-48 rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center text-5xl font-black text-yellow-800 shadow-[0_0_50px_rgba(250,204,21,0.4)] transition-transform duration-1000 ${flipping ? 'animate-[spin_0.5s_linear_infinite]' : ''}`}>
                {result ? (result === 'HEADS' ? 'H' : 'T') : '?'}
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <button 
                onClick={() => setSide('HEADS')}
                className={`p-6 rounded-xl border-2 font-bold text-xl transition-all ${side === 'HEADS' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-casino-900 border-casino-700 text-slate-500'}`}
             >
                HEADS
             </button>
             <button 
                onClick={() => setSide('TAILS')}
                className={`p-6 rounded-xl border-2 font-bold text-xl transition-all ${side === 'TAILS' ? 'bg-slate-500/20 border-slate-400 text-slate-300' : 'bg-casino-900 border-casino-700 text-slate-500'}`}
             >
                TAILS
             </button>
          </div>

          <div className="flex gap-4 items-end">
             <div className="flex-1 text-left">
               <label className="text-xs text-slate-400 font-bold uppercase">Bet Amount</label>
               <input 
                   type="number" 
                   value={betAmount} 
                   onChange={(e) => setBetAmount(Number(e.target.value))}
                   className="w-full bg-casino-900 border border-casino-600 rounded p-3 text-white font-mono mt-1"
                   disabled={flipping}
              />
             </div>
             <button 
               onClick={flip}
               disabled={flipping}
               className="px-8 py-3 h-[52px] font-black text-xl rounded shadow-lg bg-emerald-500 hover:bg-emerald-400 text-casino-900 w-48"
             >
               FLIP (1.96x)
             </button>
          </div>
       </div>
    </Layout>
  );
}
