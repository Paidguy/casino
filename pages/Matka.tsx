
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
    if (betAmount > engine.getSession().balance || betAmount <= 0 || selectedNum === null) return;
    
    setIsDrawing(true);
    setResult(null);
    setMessage('');
    audio.playBet();

    setTimeout(() => {
      engine.placeBet(GameType.ROULETTE, betAmount, (r) => { // Using Roulette house edge
        const res = engine.getSattaMatkaResult(r);
        setResult(res);
        setIsDrawing(false);

        if (res.single === selectedNum) {
          audio.playWin();
          setMessage('JACKPOT! 9x WIN');
          return { multiplier: 9, outcome: `Satta Matka: Single ${res.single} (Pana ${res.cards})` };
        } else {
          audio.playLoss();
          setMessage('Better luck next draw');
          return { multiplier: 0, outcome: `Satta Matka: Single ${res.single}` };
        }
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in">
        <div className="bg-[#0f1116] p-10 rounded-[3rem] border border-white/5 h-fit shadow-2xl space-y-10 order-2 lg:order-1">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white italic -skew-x-12 uppercase tracking-tighter">Matka Terminal</h2>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Wager Amount (₹)</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Number(e.target.value))} 
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl" 
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Select Single Number (0-9)</label>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedNum(i)}
                    className={`py-4 rounded-xl font-black text-lg transition-all ${selectedNum === i ? 'bg-casino-accent text-black shadow-lg scale-105' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={play} 
              disabled={isDrawing || selectedNum === null}
              className="w-full py-6 bg-casino-accent text-black font-black text-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,231,1,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {isDrawing ? 'Drawing...' : 'Place Bet'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1d23] rounded-[4rem] p-12 lg:p-20 border border-white/5 flex flex-col items-center justify-center relative shadow-inner overflow-hidden order-1 lg:order-2">
           <div className="absolute inset-0 bg-gradient-to-br from-casino-accent/5 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="text-center space-y-12 relative z-10">
              <div className="flex flex-col items-center">
                 <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.8em] mb-10 italic">Diamond Matka Results</div>
                 <div className="flex gap-4">
                    {isDrawing ? (
                       [0,1,2].map(i => (
                         <div key={i} className="w-20 h-28 bg-black rounded-3xl border-2 border-white/10 flex items-center justify-center text-5xl animate-pulse">?</div>
                       ))
                    ) : result ? (
                       result.cards.split('').map((c, i) => (
                         <div key={i} className="w-20 h-28 bg-white text-black rounded-3xl flex items-center justify-center text-5xl font-black shadow-2xl animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>{c}</div>
                       ))
                    ) : (
                       [0,1,2].map(i => (
                         <div key={i} className="w-20 h-28 bg-black/40 rounded-3xl border-2 border-white/5 flex items-center justify-center text-4xl text-slate-800">0</div>
                       ))
                    )}
                 </div>
              </div>

              <div className="py-10">
                 {isDrawing ? (
                   <div className="w-32 h-32 rounded-full border-4 border-dashed border-casino-accent animate-spin mx-auto opacity-30"></div>
                 ) : result ? (
                   <div className="space-y-4">
                      <div className="text-8xl font-black text-white italic transform -skew-x-12 animate-bounce">{result.single}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Single Draw Result</div>
                   </div>
                 ) : (
                   <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center text-white/5 text-5xl font-black italic -skew-x-12">?</div>
                 )}
              </div>

              {message && (
                <div className={`text-4xl lg:text-5xl font-black uppercase italic -skew-x-12 animate-fade-in-up ${result?.single === selectedNum ? 'text-casino-accent' : 'text-rose-500'}`}>
                   {message}
                </div>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
}
