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
      engine.placeBet(GameType.ROULETTE, betAmount, (r) => {
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
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-bet-900 border border-white/5 rounded p-6">
           <h1 className="text-xl font-black text-white uppercase italic mb-6">Kalyan Main <span className="text-bet-accent">Bazar</span></h1>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Number Grid */}
              <div className="md:col-span-2">
                 <div className="text-[10px] font-bold text-slate-500 uppercase mb-4">Select Single Digits (0-9)</div>
                 <div className="grid grid-cols-5 gap-2">
                    {[...Array(10)].map((_, i) => (
                      <button 
                        key={i} onClick={() => setSelectedNum(i)}
                        className={`p-6 rounded font-black text-xl transition-all ${selectedNum === i ? 'bg-bet-accent text-black' : 'bg-bet-800 text-white border border-white/5'}`}
                      >
                        {i}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Right Column: Bet Controls */}
              <div className="space-y-4">
                 <div className="bg-bet-800 p-4 rounded border border-white/5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Bet Amount (₹)</label>
                    <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="w-full bg-bet-950 border border-white/10 p-2 text-white font-black" />
                    <div className="text-[10px] text-success mt-2 font-bold">Estimated Payout: ₹{betAmount * 9}</div>
                 </div>
                 <button onClick={play} disabled={isDrawing || selectedNum === null} className="w-full py-4 btn-primary rounded disabled:opacity-50">
                    {isDrawing ? 'Drawing...' : 'Place Bet'}
                 </button>
              </div>
           </div>
        </div>

        {/* Draw Display */}
        <div className="bg-bet-900 border border-white/5 rounded-lg p-10 flex flex-col items-center justify-center min-h-[300px]">
           {isDrawing ? (
              <div className="text-4xl animate-bounce">🏺</div>
           ) : result ? (
              <div className="text-center">
                 <div className="text-xs font-bold text-slate-500 uppercase mb-2">Draw Outcome</div>
                 <div className="flex gap-2 justify-center mb-4">
                    {result.cards.split('').map((c, i) => (
                      <span key={i} className="w-12 h-16 bg-white text-black flex items-center justify-center text-3xl font-black rounded">{c}</span>
                    ))}
                 </div>
                 <div className="text-6xl font-black text-bet-accent">{result.single}</div>
                 <div className={`mt-4 font-black uppercase text-xl ${result.single === selectedNum ? 'text-success' : 'text-danger'}`}>{message}</div>
              </div>
           ) : (
              <div className="text-slate-700 font-black text-4xl uppercase opacity-20 italic">Place your bet to start draw</div>
           )}
        </div>
      </div>
    </Layout>
  );
}