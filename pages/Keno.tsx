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
      let next;
      do { next = Math.floor(Math.random() * 40) + 1; } while (drawn.includes(next));
      
      setDrawn(prev => [...prev, next]);
      count++;
      audio.playSpin();
      
      if (count >= 10) {
        clearInterval(interval);
        const hits = selected.filter(x => [...drawn, next].includes(x)).length;
        const multi = hits > 0 ? (hits * 1.5) : 0;
        
        setGameState('RESULT');
        if (hits > 0) audio.playWin(); else audio.playLoss();
        engine.placeBet(GameType.KENO, betAmount, multi, `Keno: ${hits} hits out of 10`);
      }
    }, 200);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-32">
         <div className="bg-bet-900 p-8 rounded-[2.5rem] border border-white/5 space-y-8 h-fit shadow-2xl order-2 xl:order-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter bazar-font">Keno <span className="text-bet-primary drop-shadow-[0_0_10px_#22d3ee]">Bazar</span></h2>
            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">Bet Amount (₹)</label>
               <input 
                  type="number" value={betAmount} 
                  onChange={e => setBetAmount(Number(e.target.value))} 
                  disabled={gameState === 'DRAWING'}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-2xl outline-none focus:border-bet-primary transition-all text-center" 
               />
            </div>
            <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-4 shadow-inner">
               <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Picks Selected</span>
                  <span className="text-white text-lg">{selected.length}/10</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                  <span>Current Odds</span>
                  <span className="text-bet-primary text-lg">{(selected.length * 1.5).toFixed(1)}x</span>
               </div>
            </div>
            <button 
              onClick={draw} 
              disabled={gameState === 'DRAWING' || selected.length === 0 || betAmount <= 0} 
              className="w-full py-7 bg-bet-primary text-bet-950 font-black text-2xl rounded-3xl shadow-xl uppercase tracking-[0.2em] bazar-font hover:scale-105 active:scale-95 transition-all"
            >
               {gameState === 'DRAWING' ? 'DRAWING...' : 'START DRAW'}
            </button>
         </div>

         <div className="xl:col-span-2 bg-bet-900 p-6 lg:p-12 rounded-[3.5rem] border border-white/5 shadow-inner order-1 xl:order-2">
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
               {[...Array(40)].map((_, i) => {
                  const n = i + 1;
                  const isSelected = selected.includes(n);
                  const isDrawn = drawn.includes(n);
                  const isHit = isSelected && isDrawn;
                  return (
                    <button 
                      key={n} onClick={() => toggle(n)}
                      disabled={gameState === 'DRAWING'}
                      className={`h-16 lg:h-20 rounded-2xl font-black text-2xl transition-all border-2 flex items-center justify-center relative overflow-hidden group ${isHit ? 'bg-bet-success text-bet-950 border-bet-success scale-110 shadow-[0_0_30px_#22c55e] z-10' : isDrawn ? 'bg-white text-bet-950 border-white scale-105' : isSelected ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' : 'bg-black/40 text-slate-700 border-white/5 hover:border-white/20 hover:text-white'}`}
                    >
                      {n}
                      {isHit && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                    </button>
                  );
               })}
            </div>
            {gameState === 'RESULT' && (
               <div className="mt-12 text-center animate-fade-in bg-black/40 p-8 rounded-3xl border border-white/10">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Draw Outcome</div>
                  <div className="text-5xl lg:text-7xl font-black italic uppercase bazar-font tracking-tighter">
                     {selected.filter(x => drawn.includes(x)).length > 0 ? (
                        <span className="text-bet-primary">BHAARI HITS!</span>
                     ) : (
                        <span className="text-slate-600">ZERO HITS</span>
                     )}
                  </div>
                  <button onClick={() => { setDrawn([]); setGameState('IDLE'); }} className="mt-6 px-10 py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Clear Board</button>
               </div>
            )}
         </div>
      </div>
    </Layout>
  );
}