import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Matka() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<{ cards: string, single: number } | null>(null);
  const [message, setMessage] = useState('');

  const play = () => {
    if (betAmount > engine.getSession().balance || selectedNum === null) return;
    setIsDrawing(true);
    setResult(null);
    setMessage('');
    audio.playBet();

    setTimeout(() => {
      engine.placeBet(GameType.MATKA, betAmount, (r) => {
        const res = engine.getSattaMatkaResult(r);
        setResult(res);
        setIsDrawing(false);
        if (res.single === selectedNum) {
          audio.playWin();
          setMessage('JACKPOT!');
          return { multiplier: 9, outcome: `Kalyan Result: ${res.single} (Win)` };
        } else {
          audio.playLoss();
          setMessage('TRY AGAIN');
          return { multiplier: 0, outcome: `Kalyan Result: ${res.single} (Loss)` };
        }
      }, '');
    }, 2500);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <div className="bg-bet-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                 <h1 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3 bazar-font">Kalyan <span className="text-bet-primary drop-shadow-[0_0_15px_#22d3ee]">Draw</span></h1>
                 <p className="text-[10px] lg:text-[12px] font-bold text-slate-500 uppercase tracking-[0.6em] leading-none">Verified Office Result Engine</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-bet-primary/10 px-6 py-3 rounded-xl border border-bet-primary/30 text-bet-primary font-black text-xl whitespace-nowrap bazar-font leading-none">ANK: 9x</div>
              </div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                 <div className="flex justify-between items-center px-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Select Luck Number (Ank)</label>
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-bet-success animate-pulse"></span>
                       <span className="text-[10px] font-bold text-bet-success uppercase tracking-widest">Draw Live</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-3 lg:gap-4">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-2xl lg:rounded-3xl font-black text-3xl lg:text-5xl transition-all border-2 ${selectedNum === i ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-xl scale-105' : 'bg-bet-800 text-slate-500 border-white/5 hover:border-bet-primary hover:text-white'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-6 bg-bet-950 p-8 rounded-[2rem] border border-white/10 h-fit shadow-xl">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block px-2 leading-none">Stake (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-black text-2xl lg:text-3xl outline-none focus:border-bet-primary transition-all text-center tabular-nums shadow-inner" 
                    />
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-6 bg-bet-primary text-bet-950 font-black text-xl lg:text-2xl rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font leading-none"
                 >
                    {isDrawing ? 'DRAWING...' : 'Bet Lagao'}
                 </button>
              </div>
           </div>
        </div>

        {/* Result Area - Laptop Optimized */}
        <div className="bg-black/60 border border-white/5 rounded-[3rem] p-10 lg:p-16 flex flex-col items-center justify-center min-h-[350px] lg:min-h-[450px] relative shadow-inner overflow-hidden">
           {isDrawing ? (
              <div className="flex flex-col items-center gap-8 animate-fade-in">
                 <div className="w-24 h-24 rounded-full border-[10px] border-bet-primary border-t-transparent animate-spin shadow-xl"></div>
                 <div className="text-2xl lg:text-3xl font-black text-bet-primary animate-pulse uppercase tracking-[0.5em] bazar-font">Processing...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-12 animate-fade-in">
                 <div className="flex gap-4 justify-center">
                    {result.cards.split('').map((c, i) => (
                      <div key={i} className="w-16 h-28 lg:w-28 lg:h-44 bg-white text-bet-950 flex items-center justify-center text-4xl lg:text-7xl font-black rounded-xl lg:rounded-3xl shadow-2xl border-b-8 border-slate-300">
                        {c}
                      </div>
                    ))}
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-8xl lg:text-[12rem] font-black gold-text drop-shadow-[0_10px_40px_rgba(251,191,36,0.5)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className={`text-3xl lg:text-5xl font-black uppercase italic tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-primary animate-bounce' : 'text-bet-danger opacity-80'}`}>
                       {message}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-8 opacity-10">
                 <div className="text-[10rem] leading-none">🏺</div>
                 <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter bazar-font">Ready For Result</h2>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}