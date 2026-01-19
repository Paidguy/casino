
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
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="bg-bet-900 border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-bet-accent/5 blur-[100px] pointer-events-none"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <div>
                 <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">Kalyan <span className="text-bet-accent">Main Draw</span></h1>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">Global Payout Node • Instant Settlement</p>
              </div>
              <div className="bg-black/40 px-6 py-3 rounded-2xl border border-bet-accent/20 text-bet-accent font-black text-sm shadow-[0_0_30px_rgba(250,204,21,0.1)]">₹ SINGLE ANK Payout: 9.0x</div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Your Single Ank</label>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-bet-success animate-pulse"></span>
                       <span className="text-[10px] font-bold text-bet-success uppercase">Market Open</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-2xl font-black text-3xl transition-all border-2 ${selectedNum === i ? 'bg-bet-accent text-black border-bet-accent shadow-[0_0_30px_rgba(250,204,21,0.4)] scale-105' : 'bg-bet-800 text-white border-white/5 hover:border-white/20'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-8 bg-black/20 p-8 rounded-[2.5rem] border border-white/5 h-fit">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Stake (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-2xl outline-none focus:border-bet-primary" 
                    />
                    <div className="grid grid-cols-3 gap-2">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-2 rounded-xl text-[9px] font-black uppercase text-slate-400">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-7 bg-bet-accent text-black font-black text-xl rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-20"
                 >
                    {isDrawing ? 'Sinking Pot...' : 'Place Satta'}
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-bet-900 border border-white/5 rounded-[4rem] p-16 flex flex-col items-center justify-center min-h-[500px] relative shadow-inner overflow-hidden">
           {isDrawing ? (
              <div className="flex flex-col items-center gap-10">
                 <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full border-[16px] border-bet-accent border-t-transparent animate-spin"></div>
                 <div className="text-xl font-black text-bet-accent animate-pulse uppercase tracking-[1em]">Drawing...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-12 animate-fade-in">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Official Draw Result</div>
                    <div className="flex gap-4 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-20 h-32 lg:w-24 lg:h-40 bg-white text-black flex items-center justify-center text-6xl font-black rounded-[2rem] shadow-2xl border-b-[12px] border-slate-300">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-9xl lg:text-[12rem] font-black gold-text drop-shadow-[0_30px_60px_rgba(250,204,21,0.5)] leading-none">
                       {result.single}
                    </div>
                    <div className="text-[12px] font-black text-slate-500 uppercase tracking-[2em] mr-[-2em]">Final Ank</div>
                 </div>

                 <div className={`text-4xl lg:text-7xl font-black uppercase italic -skew-x-12 tracking-tighter ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-50'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-10 opacity-10 group cursor-default select-none">
                 <div className="text-[15rem] leading-none transition-all duration-700 group-hover:scale-110 drop-shadow-2xl">🏺</div>
                 <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic -skew-x-12 tracking-tighter">Awaiting Result</h2>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[1em] max-w-lg mx-auto">Deterministic Matka HMAC-SHA256 Nodes Standing By</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
