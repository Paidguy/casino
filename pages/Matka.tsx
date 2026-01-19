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
          setMessage('TRY AGAIN BHAI');
          return { multiplier: 0, outcome: `Kalyan Result: ${res.single} (Loss)` };
        }
      }, '');
    }, 3500);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-20 lg:space-y-28 pb-32">
        <div className="bg-bet-900 border-4 border-bet-accent/20 rounded-[4rem] lg:rounded-[6rem] p-12 lg:p-28 shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[800px] lg:w-[1000px] h-[800px] lg:h-[1000px] bg-bet-accent/10 blur-[200px] pointer-events-none animate-pulse"></div>
           
           <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24 lg:mb-36">
              <div>
                 <h1 className="text-6xl lg:text-[8rem] font-black text-white uppercase italic tracking-tighter leading-none mb-8 bazar-font">Kalyan <span className="text-bet-accent drop-shadow-[0_0_20px_#fbbf24]">Main Fix</span></h1>
                 <p className="text-[14px] lg:text-[18px] font-bold text-slate-400 uppercase tracking-[0.8em] leading-none">Bharat's Most Trusted Office Result Engine</p>
              </div>
              <div className="flex gap-8">
                 <div className="bg-bet-accent/10 px-10 py-6 rounded-3xl border-2 border-bet-accent/40 text-bet-accent font-black text-2xl lg:text-4xl shadow-xl whitespace-nowrap bazar-font">ANK: 9x</div>
                 <div className="hidden sm:block bg-bet-secondary/10 px-10 py-6 rounded-3xl border-2 border-bet-secondary/40 text-bet-secondary font-black text-2xl lg:text-4xl shadow-xl whitespace-nowrap bazar-font">PANNA: 100x</div>
              </div>
           </header>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-36">
              <div className="lg:col-span-2 space-y-16 lg:space-y-24">
                 <div className="flex justify-between items-center px-6">
                    <label className="text-[15px] font-black text-slate-200 uppercase tracking-widest">Select Your Luck Number (Ank)</label>
                    <div className="flex items-center gap-5">
                       <span className="w-4 h-4 rounded-full bg-bet-success animate-pulse shadow-[0_0_20px_#16a34a]"></span>
                       <span className="text-[14px] font-bold text-bet-success uppercase tracking-widest">Market Open</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-6 lg:gap-10">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => { setSelectedNum(i); audio.playClick(); }}
                        disabled={isDrawing}
                        className={`aspect-square rounded-[2.5rem] lg:rounded-[4rem] font-black text-4xl lg:text-8xl transition-all border-4 ${selectedNum === i ? 'bg-bet-accent text-black border-bet-accent shadow-[0_0_80px_rgba(251,191,36,0.5)] scale-110' : 'bg-bet-800 text-slate-500 border-white/5 hover:border-bet-accent hover:text-white active:scale-90'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-12 bg-black/40 p-14 lg:p-20 rounded-[4rem] border-4 border-bet-accent/20 h-fit shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                 <div className="space-y-8 lg:space-y-10">
                    <label className="text-[15px] font-black text-bet-accent uppercase tracking-widest block px-4">Stake Amount (₹)</label>
                    <input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Number(e.target.value))} 
                      disabled={isDrawing}
                      className="w-full bg-black border-2 border-bet-accent/30 p-10 lg:p-14 rounded-[3rem] text-white font-black text-5xl lg:text-8xl outline-none focus:border-bet-accent transition-all shadow-inner text-center tabular-nums" 
                    />
                    <div className="grid grid-cols-3 gap-5 lg:gap-6">
                       {[500, 1000, 5000].map(a => (
                         <button key={a} onClick={() => setBetAmount(a)} className="bg-bet-800 py-6 rounded-3xl text-[14px] lg:text-[18px] font-black uppercase text-white hover:bg-bet-accent hover:text-black transition-all">₹{a.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={play} 
                  disabled={isDrawing || selectedNum === null || betAmount <= 0} 
                  className="w-full py-12 lg:py-16 gold-gradient text-black font-black text-3xl lg:text-5xl rounded-[3rem] lg:rounded-[4.5rem] shadow-[0_30px_80px_rgba(251,191,36,0.3)] active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font hover:brightness-110"
                 >
                    {isDrawing ? 'Pot Hil Raha Hai...' : 'Bet Lagao'}
                 </button>
              </div>
           </div>
        </div>

        {/* The Result Box */}
        <div className="bg-black border-4 border-bet-accent/10 rounded-[5rem] lg:rounded-[8rem] p-20 lg:p-40 flex flex-col items-center justify-center min-h-[700px] lg:min-h-[1000px] relative shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-bet-accent/5 via-transparent to-bet-secondary/5 opacity-40"></div>
           {isDrawing ? (
              <div className="flex flex-col items-center gap-20 lg:gap-28 animate-fade-in relative z-10">
                 <div className="w-48 h-48 lg:w-80 lg:h-80 rounded-full border-[20px] lg:border-[30px] border-bet-accent border-t-transparent animate-spin shadow-[0_0_100px_rgba(251,191,36,0.3)]"></div>
                 <div className="text-4xl lg:text-7xl font-black text-bet-accent animate-pulse uppercase tracking-[0.8em] lg:tracking-[1.5em] text-center bazar-font">Draw Chalu Hai...</div>
              </div>
           ) : result ? (
              <div className="text-center space-y-24 lg:space-y-36 animate-fade-in w-full relative z-10">
                 <div className="space-y-12">
                    <div className="text-[16px] lg:text-[20px] font-black text-slate-500 uppercase tracking-[0.7em] italic leading-none">Matka Panna Result</div>
                    <div className="flex gap-8 lg:gap-14 justify-center">
                       {result.cards.split('').map((c, i) => (
                         <div key={i} className="w-28 h-48 lg:w-56 lg:h-80 bg-white text-black flex items-center justify-center text-7xl lg:text-[14rem] font-black rounded-[3rem] lg:rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-b-[20px] lg:border-b-[40px] border-slate-300 transform hover:-translate-y-8 transition-transform">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-10">
                    <div className="text-[12rem] lg:text-[28rem] font-black gold-text drop-shadow-[0_50px_120px_rgba(251,191,36,0.7)] leading-none bazar-font">
                       {result.single}
                    </div>
                    <div className="text-[18px] lg:text-[24px] font-black text-bet-accent uppercase tracking-[1.5em] lg:tracking-[4em] mr-[-1.5em] lg:mr-[-4em]">Single Ank Out</div>
                 </div>

                 <div className={`text-6xl lg:text-[12rem] font-black uppercase italic -skew-x-12 tracking-tighter bazar-font ${result.single === selectedNum ? 'text-bet-success animate-bounce' : 'text-bet-danger opacity-80'}`}>
                    {message}
                 </div>
              </div>
           ) : (
              <div className="text-center space-y-16 lg:space-y-28 opacity-20 group cursor-default select-none relative z-10">
                 <div className="text-[20rem] lg:text-[35rem] leading-none transition-all duration-1000 group-hover:scale-110 drop-shadow-[0_0_100px_rgba(251,191,36,0.2)]">🏺</div>
                 <h2 className="text-6xl lg:text-[12rem] font-black text-white uppercase italic -skew-x-12 tracking-tighter leading-none bazar-font">Kalyan Matka</h2>
                 <p className="text-[16px] lg:text-[20px] font-bold text-slate-400 uppercase tracking-[0.8em] lg:tracking-[2.5em] max-w-6xl mx-auto leading-none">Nodes Waiting For Bhaari Bet</p>
              </div>
           )}
        </div>
      </div>
    </Layout>
  );
}