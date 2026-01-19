
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
      // Providing empty string as the 4th argument
      engine.placeBet(GameType.MATKA, betAmount, (r) => {
        const res = engine.getSattaMatkaResult(r);
        setResult(res);
        setIsDrawing(false);
        if (res.single === selectedNum) {
          audio.playWin();
          setMessage('JACKPOT WIN!');
          return { multiplier: 9, outcome: `Matka Draw: ${res.single}` };
        } else {
          audio.playLoss();
          setMessage('Try Again');
          return { multiplier: 0, outcome: `Matka Draw: ${res.single}` };
        }
      }, '');
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-12">
        <div className="bg-bet-900 border border-white/5 rounded-[2rem] p-6 lg:p-10 shadow-2xl">
           <header className="flex justify-between items-center mb-10">
              <div>
                 <h1 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Kalyan Main <span className="text-bet-accent">Bazar</span></h1>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Draw Time: Instant Selection</p>
              </div>
              <div className="bg-bet-800 px-4 py-2 rounded-xl text-bet-accent font-black text-xs">Payout: 9.0x</div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Number Selection */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Single Digit (0-9)</label>
                    <span className="text-[10px] font-bold text-bet-accent uppercase">Single Ank Mode</span>
                 </div>
                 <div className="grid grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`py-5 lg:py-8 rounded-2xl font-black text-2xl transition-all border ${selectedNum === i ? 'bg-bet-accent text-black border-bet-accent shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-105' : 'bg-bet-800 text-white border-white/5 hover:border-white/20'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Right: Controls */}
              <div className="space-y-6">
                 <div className="bg-bet-950 p-6 rounded-3xl border border-white/5 space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Stake Amount (₹)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bet-accent font-black">₹</span>
                       <input 
                         type="number" 
                         value={betAmount} 
                         onChange={e => setBetAmount(Number(e.target.value))} 
                         disabled={isDrawing}
                         className="w-full bg-black border border-white/10 p-4 pl-10 rounded-2xl text-white font-black text-xl outline-none focus:border-bet-primary" 
                       />
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount/2)))} className="flex-1 bg-bet-800 py-2 rounded-lg text-[10px] font-black">1/2</button>
                       <button onClick={() => setBetAmount(betAmount*2)} className="flex-1 bg-bet-800 py-2 rounded-lg text-[10px] font-black">2X</button>
                    </div>
                    <div className="text-[10px] text-center text-success font-black uppercase tracking-tighter opacity-80">Win ₹{betAmount * 9} Total</div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-6 bg-bet-accent text-black font-black text-xl rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-30"
                 >
                    {isDrawing ? 'Spinning Pot...' : 'Confirm Bet'}
                 </button>
              </div>
           </div>
        </div>

        {/* Draw Display Panel */}
        <div className="bg-bet-900 border border-white/5 rounded-[3rem] p-10 lg:p-16 flex flex-col items-center justify-center min-h-[400px] relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-bet-accent/5 to-transparent pointer-events-none"></div>
           
           {isDrawing ? (
              <div className="flex flex-col items-center gap-8">
                 <div className="text-8xl lg:text-9xl animate-spin-slow">🏺</div>
                 <div className="text-[10px] font-black text-bet-accent animate-pulse uppercase tracking-[0.5em]">Generating Deterministic Result</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-8 animate-fade-in">
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 italic">Kalyan Main Draw Result</div>
                    <div className="flex gap-3 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-16 h-24 lg:w-20 lg:h-32 bg-white text-black flex items-center justify-center text-5xl font-black rounded-2xl shadow-2xl border-4 border-slate-200 transform hover:-translate-y-2 transition-transform">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-8xl lg:text-9xl font-black gold-text drop-shadow-[0_20px_40px_rgba(250,204,21,0.4)]">
                       {result.single}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[1em]">Final Ank</div>
                 </div>

                 <div className={`text-2xl lg:text-4xl font-black uppercase italic -skew-x-12 tracking-tighter ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-6 opacity-20 group">
                 <div className="text-8xl grayscale group-hover:grayscale-0 transition-all duration-700">🏺</div>
                 <div className="text-3xl lg:text-5xl font-black text-white uppercase italic -skew-x-12 tracking-tighter">Awaiting Player <span className="text-bet-accent">Action</span></div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Result is deterministic based on HMAC-SHA256 Seeds</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
