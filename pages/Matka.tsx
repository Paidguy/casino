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
          setMessage('JACKPOT DHAMAKA!');
          return { multiplier: 9, outcome: `Kalyan Result: ${res.single} (Win)` };
        } else {
          audio.playLoss();
          setMessage('BET FAIL - TRY AGAIN');
          return { multiplier: 0, outcome: `Kalyan Result: ${res.single} (Loss)` };
        }
      }, '');
    }, 3500);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-16 pb-32">
        <div className="bg-bet-900 border border-white/10 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-20 shadow-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-bet-primary/10 blur-[150px] pointer-events-none animate-pulse"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16 lg:mb-24">
              <div>
                 <h1 className="text-5xl lg:text-[7rem] font-black text-white uppercase italic tracking-tighter leading-none mb-4 bazar-font">Kalyan <span className="text-bet-primary drop-shadow-[0_0_15px_#22d3ee]">Main Fix</span></h1>
                 <p className="text-[12px] lg:text-[14px] font-bold text-slate-500 uppercase tracking-[0.6em] leading-none">Bharat's Most Trusted Office Result Engine</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-bet-primary/10 px-8 py-5 rounded-3xl border border-bet-primary/30 text-bet-primary font-black text-xl lg:text-3xl shadow-xl whitespace-nowrap bazar-font">ANK: 9x</div>
                 <div className="bg-bet-secondary/10 px-8 py-5 rounded-3xl border border-bet-secondary/30 text-bet-secondary font-black text-xl lg:text-3xl shadow-xl whitespace-nowrap bazar-font">PANNA: 100x</div>
              </div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                 <div className="flex justify-between items-center px-4">
                    <label className="text-[13px] font-black text-slate-300 uppercase tracking-widest">Apna Luck Number Choose Karein</label>
                    <div className="flex items-center gap-3">
                       <span className="w-2.5 h-2.5 rounded-full bg-bet-success animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                       <span className="text-[11px] font-bold text-bet-success uppercase tracking-widest">Draw Live</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-3 lg:gap-6">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-[1.5rem] lg:rounded-[2.5rem] font-black text-3xl lg:text-6xl transition-all border-4 ${selectedNum === i ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-[0_0_50px_rgba(34,211,238,0.4)] scale-110' : 'bg-bet-800 text-slate-500 border-white/5 hover:border-bet-primary hover:text-white active:scale-90'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-8 bg-bet-950 p-10 lg:p-14 rounded-[3rem] border border-white/10 h-fit shadow-2xl relative">
                 <div className="space-y-6">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block px-2">Investment Amount (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-6 lg:p-8 rounded-[2rem] text-white font-black text-3xl lg:text-5xl outline-none focus:border-bet-primary transition-all shadow-inner text-center tabular-nums" 
                    />
                    <div className="grid grid-cols-3 gap-3">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-3 rounded-xl text-[11px] font-black uppercase text-white hover:bg-bet-primary hover:text-bet-950 transition-colors">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-8 lg:py-12 bg-bet-primary text-bet-950 font-black text-2xl lg:text-4xl rounded-[2.5rem] shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font cyan-glow"
                 >
                    {isDrawing ? 'Drawing Chalu Hai...' : 'Bet Lagao'}
                 </button>
              </div>
           </div>
        </div>

        {/* Dynamic Result Theater */}
        <div className="bg-black/80 border border-white/10 rounded-[4rem] p-12 lg:p-24 flex flex-col items-center justify-center min-h-[500px] lg:min-h-[700px] relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-bet-primary/10 via-transparent to-bet-secondary/10 opacity-30"></div>
           {isDrawing ? (
              <div className="flex flex-col items-center gap-12 lg:gap-16 animate-fade-in relative z-10">
                 <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full border-[12px] border-bet-primary border-t-transparent animate-spin shadow-[0_0_60px_rgba(34,211,238,0.2)]"></div>
                 <div className="text-3xl lg:text-5xl font-black text-bet-primary animate-pulse uppercase tracking-[0.8em] text-center bazar-font">Kalyan Node Processing...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-16 animate-fade-in w-full relative z-10">
                 <div className="space-y-8">
                    <div className="text-[13px] font-black text-slate-500 uppercase tracking-[0.8em] leading-none italic">Verified Panna Result</div>
                    <div className="flex gap-4 lg:gap-8 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-20 h-32 lg:w-36 lg:h-52 bg-white text-bet-950 flex items-center justify-center text-5xl lg:text-8xl font-black rounded-[1.5rem] lg:rounded-[3rem] shadow-2xl border-b-[10px] lg:border-b-[20px] border-slate-300 transform transition-transform hover:-translate-y-4">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="text-[12rem] lg:text-[20rem] font-black gold-text drop-shadow-[0_20px_60px_rgba(251,191,36,0.5)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className="text-[14px] lg:text-[18px] font-black text-bet-primary uppercase tracking-[2em] mr-[-2em]">Single Result Out</div>
                 </div>

                 <div className={`text-4xl lg:text-8xl font-black uppercase italic -skew-x-12 tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-80'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-12 opacity-20 relative z-10 select-none cursor-default">
                 <div className="text-[10rem] lg:text-[18rem] leading-none drop-shadow-[0_0_40px_white]">🏮</div>
                 <h2 className="text-4xl lg:text-8xl font-black text-white uppercase italic -skew-x-12 tracking-tighter leading-none bazar-font">Bazar Ready</h2>
                 <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[1em] max-w-4xl mx-auto leading-none">Matka Connection Secured • Place Bet To Play</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}