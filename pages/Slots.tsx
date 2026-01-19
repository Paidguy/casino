
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Slots() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [reels, setReels] = useState(['?', '?', '?']);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');

  const spin = () => {
    if (betAmount > engine.getSession().balance) return;
    setSpinning(true);
    setMessage('');
    audio.playBet();
    audio.playSpin();
    
    const interval = setInterval(() => {
      setReels([
        ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random()*5)],
        ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random()*5)],
        ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random()*5)]
      ]);
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      engine.placeBet(GameType.SLOTS, betAmount, (r) => {
         const result = engine.calculateSlotsResult(r);
         setReels(result.symbols);
         setSpinning(false);
         const isWin = result.multiplier > 0;
         setMessage(isWin ? `WIN ${result.multiplier}x` : 'Try Again');
         if (isWin) audio.playWin(); else audio.playLoss();
         return { multiplier: result.multiplier, outcome: `Slots: ${result.symbols.join(' ')}` };
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-casino-800 p-8 rounded-xl border border-casino-700 text-center">
          <div className="bg-casino-900 p-8 rounded-lg border-4 border-yellow-600 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] mb-8 flex justify-center gap-4">
            {reels.map((symbol, i) => (
              <div key={i} className="w-24 h-32 bg-slate-100 rounded flex items-center justify-center text-5xl shadow-inner border-2 border-slate-300">
                <span className={spinning ? 'animate-bounce-short' : ''}>{symbol}</span>
              </div>
            ))}
          </div>
          <div className="h-8 mb-4">
             {message && <span className="text-2xl font-black text-emerald-400 animate-pulse">{message}</span>}
          </div>
          <div className="flex gap-4 items-end">
             <div className="flex-1 text-left">
               <label className="text-xs text-slate-400 font-bold uppercase">Bet Amount</label>
               <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-casino-900 border border-casino-600 rounded p-3 text-white font-mono mt-1" disabled={spinning} />
             </div>
             <button onClick={spin} disabled={spinning} className={`px-8 py-3 h-[52px] font-black text-xl rounded shadow-lg ${spinning ? 'bg-slate-700' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}>SPIN</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
