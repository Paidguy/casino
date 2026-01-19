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
          setMessage('DHAMAKA WINNER 9.0x!');
          return { multiplier: 9, outcome: `Kalyan Draw: ${res.single}` };
        } else {
          audio.playLoss();
          setMessage('AGLI BAAR PAKKA');
          return { multiplier: 0, outcome: `Kalyan Draw: ${res.single}` };
        }
      }, '');
    }, 3000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16 pb-24">
        <div className="bg-bet-900 border border-white/10 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] lg:w-[600px] h-[500px] lg:h-[600px] bg-bet-saffron/10 blur-[150px] pointer-events-none animate-pulse"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 lg:mb-24">
              <div>
                 <h1 className="text-4xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-5 bazar-font">Kalyan <span className="text-bet-saffron drop-shadow-[0_0_15px_#ff6b00]">Bazar Draw</span></h1>
                 <p className="text-[10px] lg:text-[12px] font-bold text-slate-400 uppercase tracking-[0.6em] leading-none">Bharat's Most Vibrant Satta Engine</p>
              </div>
              <div className="flex gap-5">
                 <div className="bg-bet-saffron/20 px-6 py-3 rounded-2xl border border-bet-saffron/40 text-bet-saffron font-black text-sm lg:text-lg shadow-xl whitespace-nowrap bazar-font">ANK: 9.0x</div>
                 <div className="hidden sm:block bg-bet-primary/20 px-6 py-3 rounded-2xl border border-bet-primary/40 text-bet-primary font-black text-sm lg:text-lg shadow-xl whitespace-nowrap bazar-font">PANNA: 100x</div>
              </div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
              <div className="lg:col-span-2 space-y-10 lg:space-y-12">
                 <div className="flex justify-between items-center mb-4 lg:mb-6 px-2">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Apna Shubh Ank Chuniye</label>
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-bet-success animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                       <span className="text-[10px] font-bold text-bet-success uppercase tracking-widest">Market Open</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-3 lg:gap-6">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-2xl lg:rounded-[2.5rem] font-black text-2xl lg:text-5xl transition-all border-2 ${selectedNum === i ? 'bg-bet-saffron text-white border-bet-saffron shadow-[0_0_40px_rgba(255,107,0,0.4)] scale-110' : 'bg-bet-800 text-slate-400 border-white/10 hover:border-bet-primary hover:text-white active:scale-95'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-8 bg-bet-950/50 p-10 lg:p-12 rounded-[3.5rem] border border-white/10 h-fit shadow-2xl">
                 <div className="space-y-5 lg:space-y-6">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-2">Stake (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-6 lg:p-8 rounded-3xl text-white font-black text-3xl lg:text-4xl outline-none focus:border-bet-saffron transition-all shadow-inner tabular-nums" 
                    />
                    <div className="grid grid-cols-3 gap-2 lg:gap-3">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-3 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase text-slate-200 hover:bg-bet-700 transition-colors">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-7 lg:py-10 bg-bet-saffron text-white font-black text-xl lg:text-3xl rounded-[2.5rem] lg:rounded-[3rem] shadow-[0_15px_40px_rgba(255,107,0,0.3)] active:scale-95 transition-all uppercase tracking-widest bazar-font hover:brightness-110"
                 >
                    {isDrawing ? 'Pot Hil Raha Hai...' : 'Satta Lagao'}
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-bet-950 border border-white/10 rounded-[3.5rem] lg:rounded-[5rem] p-12 lg:p-24 flex flex-col items-center justify-center min-h-[500px] lg:min-h-[650px] relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-bet-primary/5 via-transparent to-bet-secondary/5"></div>
           {isDrawing ? (
              <div className="flex flex-col items-center gap-10 lg:gap-14 animate-fade-in relative z-10">
                 <div className="w-32 h-32 lg:w-56 lg:h-56 rounded-full border-[12px] lg:border-[20px] border-bet-saffron border-t-transparent animate-spin shadow-[0_0_60px_rgba(255,107,0,0.2)]"></div>
                 <div className="text-2xl lg:text-4xl font-black text-bet-saffron animate-pulse uppercase tracking-[0.6em] lg:tracking-[1.2em] text-center bazar-font">Draw Shuru Hai...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-12 lg:space-y-16 animate-fade-in w-full relative z-10">
                 <div className="space-y-6">
                    <div className="text-[11px] lg:text-[13px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none">Vibrant Matka Panna Outcome</div>
                    <div className="flex gap-4 lg:gap-8 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-20 h-32 lg:w-32 lg:h-52 bg-white text-black flex items-center justify-center text-5xl lg:text-8xl font-black rounded-[2rem] lg:rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-b-[12px] lg:border-b-[20px] border-slate-300 transform hover:-translate-y-4 transition-transform">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-9xl lg:text-[16rem] font-black gold-text drop-shadow-[0_25px_50px_rgba(251,191,36,0.6)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className="text-[12px] lg:text-[14px] font-black text-bet-accent uppercase tracking-[1.2em] lg:tracking-[2.5em] mr-[-1.2em] lg:mr-[-2.5em]">Final Single Ank</div>
                 </div>

                 <div className={`text-4xl lg:text-8xl font-black uppercase italic -skew-x-12 tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-70'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-10 lg:space-y-14 opacity-20 group cursor-default select-none relative z-10">
                 <div className="text-[12rem] lg:text-[18rem] leading-none transition-all duration-1000 group-hover:scale-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">🏺</div>
                 <h2 className="text-4xl lg:text-7xl font-black text-white uppercase italic -skew-x-12 tracking-tighter leading-none bazar-font">Tayaar Ho?</h2>
                 <p className="text-[11px] lg:text-[13px] font-bold text-slate-400 uppercase tracking-[0.6em] lg:tracking-[1.4em] max-w-2xl mx-auto leading-none">Matka Nodes Awaiting Your Bet</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}