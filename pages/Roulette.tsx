
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Roulette() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [betType, setBetType] = useState<'RED' | 'BLACK' | 'GREEN'>('RED');

  const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const spin = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin();
    
    setTimeout(() => {
      // Providing empty string as the 4th argument (outcome) which is ignored when a resolver is used
      engine.placeBet(GameType.ROULETTE, betAmount, (r) => {
          const num = engine.calculateRouletteResult(r);
          setResult(num);
          setSpinning(false);
          let multiplier = 0;
          const isRed = REDS.includes(num);
          const isGreen = num === 0;
          const isBlack = !isRed && !isGreen;
          
          if (betType === 'RED' && isRed) multiplier = 2;
          else if (betType === 'BLACK' && isBlack) multiplier = 2;
          else if (betType === 'GREEN' && isGreen) multiplier = 36;
          
          if (multiplier > 0) audio.playWin();
          else audio.playLoss();
          
          return { multiplier, outcome: `Roulette: ${num}` };
      }, '');
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-bet-900 p-8 lg:p-12 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-bet-accent/5 to-transparent pointer-events-none"></div>
          <div 
            className={`w-56 h-56 lg:w-72 lg:h-72 rounded-full border-8 border-black relative shadow-2xl overflow-hidden transition-transform duration-[1500ms] ease-out ${spinning ? 'rotate-[1080deg]' : ''}`} 
            style={{ background: 'conic-gradient( #10b981 0deg 9.7deg, #f43f5e 9.7deg 180deg, #1e293b 180deg 360deg)' }}
          >
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-40 h-40 lg:w-56 lg:h-56 bg-bet-900 rounded-full flex items-center justify-center z-10 border-4 border-black/50">
                 {result !== null ? (
                    <span className={`text-6xl lg:text-8xl font-black tabular-nums drop-shadow-lg ${result === 0 ? 'text-bet-success' : REDS.includes(result) ? 'text-bet-danger' : 'text-white'}`}>
                      {result}
                    </span>
                 ) : (
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Wait Spin</span>
                 )}
               </div>
             </div>
          </div>
        </div>

        <div className="bg-bet-900 p-8 lg:p-12 rounded-[3rem] border border-white/5 flex flex-col justify-between shadow-2xl">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-black text-white italic -skew-x-12 uppercase tracking-tighter mb-2">Live <span className="text-bet-accent">Roulette</span></h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Standard European Odds 2.7% House Edge</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Stake Amount (₹)</label>
                <div className="relative">
                  <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none" disabled={spinning} />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-3 py-1 rounded text-[10px] font-black uppercase">2X</button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Select Your Bet</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setBetType('RED')} className={`py-6 rounded-2xl font-black border-2 transition-all ${betType === 'RED' ? 'bg-bet-danger border-rose-300 text-white shadow-lg' : 'bg-black border-white/5 text-slate-700 hover:text-rose-500'}`}>RED (2x)</button>
                  <button onClick={() => setBetType('GREEN')} className={`py-6 rounded-2xl font-black border-2 transition-all ${betType === 'GREEN' ? 'bg-bet-success border-emerald-300 text-white shadow-lg' : 'bg-black border-white/5 text-slate-700 hover:text-emerald-500'}`}>ZERO (36x)</button>
                  <button onClick={() => setBetType('BLACK')} className={`py-6 rounded-2xl font-black border-2 transition-all ${betType === 'BLACK' ? 'bg-slate-700 border-slate-500 text-white shadow-lg' : 'bg-black border-white/5 text-slate-700 hover:text-slate-300'}`}>BLACK (2x)</button>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={spin} 
            disabled={spinning || betAmount <= 0} 
            className={`w-full py-8 mt-12 font-black text-2xl rounded-3xl shadow-xl transition-all uppercase tracking-widest ${spinning ? 'bg-bet-800 text-slate-600' : 'bg-bet-accent text-black hover:scale-[1.02] active:scale-95'}`}
          >
            {spinning ? 'Spinning Nodes...' : 'Place Bet'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
