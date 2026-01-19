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
          setMessage('9.0x WINNER!');
          return { multiplier: 9, outcome: `Matka Draw: ${res.single}` };
        } else {
          audio.playLoss();
          setMessage('LOST');
          return { multiplier: 0, outcome: `Matka Draw: ${res.single}` };
        }
      }, '');
    }, 3000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
        <div className="bg-bet-900 border border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-14 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-bet-accent/5 blur-[100px] pointer-events-none"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 lg:mb-16">
              <div>
                 <h1 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">Kalyan <span className="text-bet-accent">Main Draw</span></h1>
                 <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] leading-none">Global Satta Node • Virtual Settlement</p>
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-bet-accent/20 text-bet-accent font-black text-xs lg:text-sm shadow-lg whitespace-nowrap">₹ ANK Payout: 9.0x</div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                 <div className="flex justify-between items-center mb-2 lg:mb-4 px-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Single Ank</label>
                    <div className="flex items-center gap-2">
                       <span className="w-1 h-1 rounded-full bg-bet-success animate-pulse"></span>
                       <span className="text-[8px] font-bold text-bet-success uppercase tracking-widest">Live Market</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-2 lg:gap-4">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-xl lg:rounded-2xl font-black text-xl lg:text-3xl transition-all border ${selectedNum === i ? 'bg-bet-accent text-black border-bet-accent shadow-lg scale-105' : 'bg-bet-800 text-white border-white/5 hover:border-white/20 active:scale-95'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6 bg-black/20 p-6 lg:p-8 rounded-[2rem] border border-white/5 h-fit">
                 <div className="space-y-3 lg:space-y-4">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1">Stake Amount (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-4 lg:p-5 rounded-2xl text-white font-black text-xl lg:text-2xl outline-none focus:border-bet-primary transition-all shadow-inner" 
                    />
                    <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-2 rounded-xl text-[8px] lg:text-[9px] font-black uppercase text-slate-400 active:bg-bet-700 transition-colors">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-5 lg:py-7 bg-bet-accent text-black font-black text-lg lg:text-xl rounded-[1.5rem] lg:rounded-[2rem] shadow-xl active:scale-95 transition-all uppercase tracking-widest disabled:opacity-20"
                 >
                    {isDrawing ? 'Drawing...' : 'Place Satta'}
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-bet-900 border border-white/5 rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-16 flex flex-col items-center justify-center min-h-[400px] lg:min-h-[500px] relative shadow-inner overflow-hidden">
           {isDrawing ? (
              <div className="flex flex-col items-center gap-8 lg:gap-10 animate-fade-in">
                 <div className="w-24 h-24 lg:w-48 lg:h-48 rounded-full border-[10px] lg:border-[16px] border-bet-accent border-t-transparent animate-spin"></div>
                 <div className="text-base lg:text-xl font-black text-bet-accent animate-pulse uppercase tracking-[0.5em] lg:tracking-[1em] text-center">Processing Draw...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-10 lg:space-y-12 animate-fade-in w-full">
                 <div className="space-y-4">
                    <div className="text-[8px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Official Satta Draw Outcome</div>
                    <div className="flex gap-2 lg:gap-4 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-16 h-24 lg:w-24 lg:h-40 bg-white text-black flex items-center justify-center text-4xl lg:text-6xl font-black rounded-xl lg:rounded-[2rem] shadow-2xl border-b-[8px] lg:border-b-[12px] border-slate-300">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-8xl lg:text-[12rem] font-black gold-text drop-shadow-[0_20px_40px_rgba(250,204,21,0.4)] leading-none">
                       {result.single}
                    </div>
                    <div className="text-[10px] lg:text-[12px] font-black text-slate-500 uppercase tracking-[1em] lg:tracking-[2em] mr-[-1em] lg:mr-[-2em]">Final Ank</div>
                 </div>

                 <div className={`text-3xl lg:text-7xl font-black uppercase italic -skew-x-12 tracking-tighter ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-50'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-8 lg:space-y-10 opacity-10 group cursor-default select-none pointer-events-none">
                 <div className="text-[10rem] lg:text-[15rem] leading-none transition-all duration-700 drop-shadow-2xl">🏺</div>
                 <h2 className="text-3xl lg:text-6xl font-black text-white uppercase italic -skew-x-12 tracking-tighter leading-none">Awaiting Draw</h2>
                 <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] lg:tracking-[1em] max-w-lg mx-auto leading-none">Satta Nodes Standing By For Verification</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}