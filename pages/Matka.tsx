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
    }, 2000);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 lg:gap-8 pb-20">
        <div className="bg-bet-900 border border-white/5 rounded-[2.5rem] p-6 lg:p-8 shadow-3xl">
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                 <h1 className="text-3xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 bazar-font">Kalyan <span className="text-bet-primary drop-shadow-[0_0_15px_#22d3ee]">Matka</span></h1>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] leading-none">Made by @paidguy</p>
              </div>
              <div className="bg-bet-primary/10 px-6 py-3 rounded-xl border border-bet-primary/30 text-bet-primary font-black text-xl bazar-font leading-none">ANK: 9x</div>
           </header>
           
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-6">
                 <div className="grid grid-cols-5 gap-2 lg:gap-3">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-2xl font-black text-3xl lg:text-5xl transition-all border-2 ${selectedNum === i ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-2xl scale-105' : 'bg-bet-800 text-slate-600 border-white/5 hover:border-bet-primary hover:text-white'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="xl:col-span-4 flex flex-col gap-4">
                 <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4 shadow-inner">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">Stake (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-black text-3xl outline-none focus:border-bet-primary transition-all text-center tabular-nums" 
                    />
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="flex-1 py-8 bg-bet-primary text-bet-950 font-black text-2xl rounded-3xl shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font leading-none"
                 >
                    {isDrawing ? 'DRAWING...' : 'Bet Lagao'}
                 </button>
              </div>
           </div>
        </div>

        {/* Result Area */}
        <div className="bg-bet-900 border border-white/5 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px] relative shadow-2xl overflow-hidden">
           {isDrawing ? (
              <div className="flex flex-col items-center gap-6 animate-fade-in">
                 <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-[6px] lg:border-[8px] border-bet-primary border-t-transparent animate-spin"></div>
                 <div className="text-lg lg:text-xl font-black text-bet-primary animate-pulse uppercase tracking-[0.5em] bazar-font">Node Connecting...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-6 lg:space-y-10 animate-fade-in">
                 <div className="flex gap-2 lg:gap-4 justify-center">
                    {result.cards.split('').map((c, i) => (
                      <div key={i} className="w-12 h-20 sm:w-16 sm:h-28 lg:w-28 lg:h-44 bg-white text-bet-950 flex items-center justify-center text-4xl sm:text-5xl lg:text-7xl font-black rounded-lg sm:rounded-xl lg:rounded-[2rem] shadow-3xl">
                        {c}
                      </div>
                    ))}
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-7xl sm:text-8xl lg:text-[10rem] font-black gold-text drop-shadow-[0_10px_60px_rgba(251,191,36,0.6)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className={`text-3xl lg:text-5xl font-black uppercase italic tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-primary animate-bounce' : 'text-bet-danger opacity-80'}`}>
                       {message}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-4 lg:space-y-8 opacity-20">
                 <div className="text-7xl lg:text-[10rem] leading-none">🏺</div>
                 <h2 className="text-2xl lg:text-5xl font-black text-white uppercase italic tracking-tighter bazar-font">Select Luck Number</h2>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}