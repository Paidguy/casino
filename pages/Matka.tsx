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
          setMessage('BET FAIL');
          return { multiplier: 0, outcome: `Kalyan Result: ${res.single} (Loss)` };
        }
      }, '');
    }, 3500);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-16 lg:space-y-24 pb-32">
        <div className="bg-bet-900 border border-white/10 rounded-[4rem] lg:rounded-[6rem] p-10 lg:p-24 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-bet-primary/10 blur-[200px] pointer-events-none animate-pulse"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20 lg:mb-32">
              <div>
                 <h1 className="text-5xl lg:text-[6.5rem] font-black text-white uppercase italic tracking-tighter leading-none mb-6 bazar-font">Kalyan <span className="text-bet-primary drop-shadow-[0_0_20px_#22d3ee]">Bazar Fix</span></h1>
                 <p className="text-[12px] lg:text-[15px] font-bold text-slate-400 uppercase tracking-[0.8em] leading-none">Bharat's Most Trusted Direct Result Engine</p>
              </div>
              <div className="flex gap-6">
                 <div className="bg-bet-primary/15 px-8 py-5 rounded-3xl border border-bet-primary/40 text-bet-primary font-black text-xl lg:text-3xl shadow-xl whitespace-nowrap bazar-font">ANK: 9x</div>
                 <div className="hidden sm:block bg-bet-secondary/15 px-8 py-5 rounded-3xl border border-bet-secondary/40 text-bet-secondary font-black text-xl lg:text-3xl shadow-xl whitespace-nowrap bazar-font">PANNA: 100x</div>
              </div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-32">
              <div className="lg:col-span-2 space-y-14 lg:space-y-20">
                 <div className="flex justify-between items-center px-4">
                    <label className="text-[13px] font-black text-slate-200 uppercase tracking-widest">Apna Luck Number Select Karein</label>
                    <div className="flex items-center gap-4">
                       <span className="w-3 h-3 rounded-full bg-bet-success animate-pulse shadow-[0_0_15px_#22c55e]"></span>
                       <span className="text-[12px] font-bold text-bet-success uppercase tracking-widest">Market Live</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-4 lg:gap-8">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-[2rem] lg:rounded-[3.5rem] font-black text-3xl lg:text-7xl transition-all border-4 ${selectedNum === i ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-[0_0_60px_rgba(34,211,238,0.5)] scale-110' : 'bg-bet-800 text-slate-400 border-white/5 hover:border-bet-primary hover:text-white active:scale-90'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-10 bg-bet-950 p-12 lg:p-16 rounded-[4rem] border border-white/10 h-fit shadow-3xl">
                 <div className="space-y-6 lg:space-y-8">
                    <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest block px-3">Kitna Lagana Hai? (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-8 lg:p-10 rounded-[2.5rem] text-white font-black text-4xl lg:text-6xl outline-none focus:border-bet-primary transition-all shadow-inner text-center tabular-nums" 
                    />
                    <div className="grid grid-cols-3 gap-4 lg:gap-5">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-4 rounded-2xl text-[12px] lg:text-[14px] font-black uppercase text-white hover:bg-bet-700 transition-colors">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-10 lg:py-14 bg-bet-primary text-bet-950 font-black text-2xl lg:text-4xl rounded-[3rem] lg:rounded-[4rem] shadow-[0_20px_60px_rgba(34,211,238,0.3)] active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font hover:brightness-110"
                 >
                    {isDrawing ? 'Drawing Chalu Hai...' : 'Bet Lagao'}
                 </button>
              </div>
           </div>
        </div>

        {/* Result Area */}
        <div className="bg-bet-950 border border-white/10 rounded-[4.5rem] lg:rounded-[7rem] p-16 lg:p-32 flex flex-col items-center justify-center min-h-[600px] lg:min-h-[850px] relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-bet-primary/10 via-transparent to-bet-secondary/10 opacity-30"></div>
           {isDrawing ? (
              <div className="flex flex-col items-center gap-14 lg:gap-20 animate-fade-in relative z-10">
                 <div className="w-40 h-40 lg:w-72 lg:h-72 rounded-full border-[15px] lg:border-[25px] border-bet-primary border-t-transparent animate-spin shadow-[0_0_80px_rgba(34,211,238,0.3)]"></div>
                 <div className="text-3xl lg:text-5xl font-black text-bet-primary animate-pulse uppercase tracking-[0.7em] lg:tracking-[1.5em] text-center bazar-font">Kalyan Draw Process...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-16 lg:space-y-24 animate-fade-in w-full relative z-10">
                 <div className="space-y-8">
                    <div className="text-[13px] lg:text-[16px] font-black text-slate-500 uppercase tracking-[0.6em] italic leading-none">Office Result (Panna)</div>
                    <div className="flex gap-6 lg:gap-10 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-24 h-40 lg:w-44 lg:h-64 bg-white text-bet-950 flex items-center justify-center text-6xl lg:text-[10rem] font-black rounded-[2.5rem] lg:rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-b-[15px] lg:border-b-[25px] border-slate-300 transform hover:-translate-y-6 transition-transform">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="text-[10rem] lg:text-[22rem] font-black gold-text drop-shadow-[0_40px_100px_rgba(251,191,36,0.6)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className="text-[15px] lg:text-[20px] font-black text-bet-primary uppercase tracking-[1.5em] lg:tracking-[3em] mr-[-1.5em] lg:mr-[-3em]">Single Result</div>
                 </div>

                 <div className={`text-5xl lg:text-[10rem] font-black uppercase italic -skew-x-12 tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-80'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-12 lg:space-y-20 opacity-20 group cursor-default select-none relative z-10">
                 <div className="text-[15rem] lg:text-[25rem] leading-none transition-all duration-1000 group-hover:scale-110 drop-shadow-[0_0_60px_rgba(255,255,255,0.1)]">🏮</div>
                 <h2 className="text-5xl lg:text-9xl font-black text-white uppercase italic -skew-x-12 tracking-tighter leading-none bazar-font">Bazar Ready</h2>
                 <p className="text-[13px] lg:text-[16px] font-bold text-slate-400 uppercase tracking-[0.8em] lg:tracking-[2em] max-w-4xl mx-auto leading-none">Matka Nodes Online • Waiting For Punter</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}