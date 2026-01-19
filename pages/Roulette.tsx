
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
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
    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin(); // Short spin sound start
    setTimeout(() => {
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
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-casino-800 p-8 rounded-xl border border-casino-700 flex flex-col items-center justify-center min-h-[400px]">
          <div className={`w-64 h-64 rounded-full border-8 border-casino-900 relative shadow-2xl overflow-hidden transition-transform duration-[1500ms] ease-out ${spinning ? 'rotate-[720deg]' : ''}`} style={{ background: 'conic-gradient( #10b981 0deg 9.7deg, #f43f5e 9.7deg 180deg, #1e293b 180deg 360deg)' }}>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-48 h-48 bg-casino-800 rounded-full flex items-center justify-center z-10">
                 {result !== null ? <span className={`text-6xl font-black ${result === 0 ? 'text-emerald-500' : REDS.includes(result) ? 'text-rose-500' : 'text-slate-200'}`}>{result}</span> : <span className="text-sm text-slate-500 font-bold uppercase">SPIN</span>}
               </div>
             </div>
          </div>
        </div>
        <div className="bg-casino-800 p-8 rounded-xl border border-casino-700 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Roulette</h2>
            <div className="space-y-4">
              <label className="text-xs text-slate-400 font-bold uppercase">Bet Amount</label>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-casino-900 border border-casino-600 rounded p-3 text-white font-mono" disabled={spinning} />
              <label className="text-xs text-slate-400 font-bold uppercase mt-4 block">Bet On</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setBetType('RED')} className={`p-4 rounded font-bold border-2 ${betType === 'RED' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-casino-900 border-rose-900 text-rose-700'}`}>RED (2x)</button>
                <button onClick={() => setBetType('GREEN')} className={`p-4 rounded font-bold border-2 ${betType === 'GREEN' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-casino-900 border-emerald-900 text-emerald-700'}`}>ZERO (36x)</button>
                <button onClick={() => setBetType('BLACK')} className={`p-4 rounded font-bold border-2 ${betType === 'BLACK' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-casino-900 border-slate-800 text-slate-500'}`}>BLACK (2x)</button>
              </div>
            </div>
          </div>
          <button onClick={spin} disabled={spinning} className={`w-full py-4 mt-8 font-black text-xl rounded-lg shadow-lg transition-all ${spinning ? 'bg-casino-700 text-slate-500 cursor-not-allowed' : 'bg-casino-accent hover:bg-indigo-500 text-white'}`}>PLACE BET</button>
        </div>
      </div>
    </Layout>
  );
}
