
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Keno() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selected, setSelected] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'DRAWING' | 'RESULT'>('IDLE');

  const toggle = (n: number) => {
    if (gameState === 'DRAWING') return;
    if (selected.includes(n)) setSelected(selected.filter(x => x !== n));
    else if (selected.length < 10) setSelected([...selected, n]);
    audio.playClick();
  };

  const draw = () => {
    if (betAmount > engine.getSession().balance || selected.length === 0) return;
    setGameState('DRAWING');
    setDrawn([]);
    audio.playBet();

    let count = 0;
    const interval = setInterval(() => {
      setDrawn(prev => [...prev, Math.floor(Math.random() * 40) + 1]);
      count++;
      audio.playSpin();
      if (count >= 10) {
        clearInterval(interval);
        const hits = selected.filter(x => drawn.includes(x)).length;
        const multi = hits > 0 ? (hits * 1.5) : 0;
        
        setGameState('RESULT');
        if (hits > 0) audio.playWin(); else audio.playLoss();
        engine.placeBet(GameType.MATKA, betAmount, multi, `Keno: ${hits} hits`);
      }
    }, 200);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-bet-900 p-8 rounded-[2rem] border border-white/5 space-y-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Keno <span className="text-bet-accent">Board</span></h2>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake (₹)</label>
               <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl outline-none" />
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-2">
               <div className="flex justify-between text-[10px] font-black text-slate-500"><span>Selected</span><span className="text-white">{selected.length}/10</span></div>
               <div className="flex justify-between text-[10px] font-black text-slate-500"><span>Multiplier</span><span className="text-bet-accent">{(selected.length * 1.5).toFixed(1)}x</span></div>
            </div>
            <button onClick={draw} disabled={gameState === 'DRAWING' || selected.length === 0} className="w-full py-5 bg-bet-accent text-black font-black text-xl rounded-2xl shadow-xl uppercase">Start Draw</button>
         </div>

         <div className="lg:col-span-2 bg-bet-900 p-6 lg:p-10 rounded-[3rem] border border-white/5">
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
               {[...Array(40)].map((_, i) => {
                  const n = i + 1;
                  const isSelected = selected.includes(n);
                  const isDrawn = drawn.includes(n);
                  const isHit = isSelected && isDrawn;
                  return (
                    <button 
                      key={n} onClick={() => toggle(n)}
                      className={`h-12 lg:h-16 rounded-xl font-black transition-all ${isHit ? 'bg-bet-success text-black scale-110 shadow-lg' : isDrawn ? 'bg-white text-black' : isSelected ? 'bg-bet-accent text-black shadow-inner' : 'bg-black/40 text-slate-500 border border-white/5 hover:border-white/20'}`}
                    >
                      {n}
                    </button>
                  );
               })}
            </div>
         </div>
      </div>
    </Layout>
  );
}
