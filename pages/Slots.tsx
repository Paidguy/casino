import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

const SYMBOLS = ['🍒', '🍋', '🍇', '💎', '7️⃣'];

export default function Slots() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const spin = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin();
    
    // Logic resolution
    setTimeout(() => {
      engine.placeBet(GameType.SLOTS, betAmount, (r) => {
        const res = engine.calculateSlotsResult(r);
        setReels(res.symbols);
        setResult(res);
        setSpinning(false);
        if (res.multiplier > 0) audio.playWin();
        else audio.playLoss();
        return { multiplier: res.multiplier, outcome: `Slots: ${res.symbols.join('')}` };
      }, '');
    }, 2000);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 lg:gap-12">
        {/* Slot Machine Container */}
        <div className="w-full max-w-3xl bg-bet-900 p-6 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] border-[8px] lg:border-[12px] border-bet-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.5),0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-16 lg:h-24 bg-gradient-to-b from-bet-accent/10 to-transparent"></div>
           
           <div className="flex justify-center gap-2 sm:gap-4 lg:gap-8 relative z-10 mb-8 lg:mb-12">
              {reels.map((symbol, i) => (
                <div key={i} className="w-20 h-28 sm:w-24 sm:h-36 lg:w-36 lg:h-52 bg-black/40 rounded-2xl lg:rounded-3xl border-2 lg:border-4 border-white/5 flex items-center justify-center text-4xl sm:text-5xl lg:text-7xl shadow-inner relative overflow-hidden">
                   <div className={`${spinning ? 'animate-bounce' : 'animate-none'}`}>
                      {symbol}
                   </div>
                </div>
              ))}
           </div>

           <div className="text-center h-12 lg:h-16 flex items-center justify-center">
              {result && (
                <div className={`text-2xl sm:text-4xl lg:text-6xl font-black italic -skew-x-12 uppercase tracking-tighter ${result.multiplier > 0 ? 'text-bet-accent' : 'text-slate-600 opacity-30'}`}>
                   {result.multiplier > 0 ? `JACKPOT ${result.multiplier}x!` : 'TRY AGAIN'}
                </div>
              )}
           </div>
        </div>

        {/* Controls */}
        <div className="bg-bet-900 w-full max-w-xl p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-white/5 space-y-6 lg:space-y-8 shadow-2xl">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Stake (₹)</label>
              <div className="flex gap-2 lg:gap-4">
                 <input 
                   type="number" value={betAmount} 
                   onChange={e => setBetAmount(Number(e.target.value))} 
                   disabled={spinning}
                   className="flex-1 bg-black border border-white/10 p-4 lg:p-5 rounded-xl lg:rounded-2xl text-white font-black text-xl lg:text-2xl outline-none focus:border-bet-primary transition-all" 
                 />
                 <div className="flex flex-col gap-2">
                    <button onClick={() => setBetAmount(betAmount*2)} className="bg-bet-800 px-3 lg:px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase hover:bg-bet-700">2X</button>
                    <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} className="bg-bet-800 px-3 lg:px-4 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase hover:bg-bet-700">1/2</button>
                 </div>
              </div>
           </div>

           <button 
             onClick={spin} 
             disabled={spinning || betAmount <= 0}
             className="w-full py-6 lg:py-8 bg-bet-accent text-black font-black text-2xl lg:text-3xl rounded-[2rem] lg:rounded-[2.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-30"
           >
             {spinning ? 'Spinning...' : 'Spin'}
           </button>
        </div>
      </div>
    </Layout>
  );
}