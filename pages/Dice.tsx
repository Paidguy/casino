
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType, HOUSE_EDGES } from '../types';

export default function Dice() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [winChance, setWinChance] = useState<number>(50);
  const [rollOver, setRollOver] = useState<boolean>(true);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);

  const multiplier = (100 - (HOUSE_EDGES.DICE * 100)) / winChance;
  const target = rollOver ? (100 - winChance) : winChance;

  const handleRoll = () => {
    audio.playBet();
    engine.placeBet(GameType.DICE, betAmount, (r) => {
        const { roll, won } = engine.calculateDiceResult(r, target, rollOver ? 'over' : 'under');
        setLastRoll(roll);
        setLastWin(won);
        if (won) audio.playWin();
        else audio.playLoss();
        return { multiplier: won ? multiplier : 0, outcome: `Rolled ${roll.toFixed(2)}` };
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-casino-800 rounded-xl overflow-hidden border border-casino-700 p-8">
          <div className="h-32 bg-casino-900 rounded-lg relative mb-8 flex items-center px-4 overflow-hidden">
            <div className={`h-4 rounded-full z-10 transition-all duration-300 ${rollOver ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${rollOver ? winChance : 100 - winChance}%`, marginLeft: rollOver ? `${100 - winChance}%` : '0%' }}></div>
            <div className="absolute h-full w-1 bg-white z-20 shadow-[0_0_10px_white]" style={{ left: `${target}%` }}></div>
            {lastRoll !== null && (
               <div className={`absolute w-12 h-12 -ml-6 rounded-xl border-4 flex items-center justify-center font-bold text-sm shadow-xl z-30 transition-all duration-500 ease-out ${lastWin ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-rose-500 border-rose-300 text-white'}`} style={{ left: `${lastRoll}%` }}>
                 {lastRoll.toFixed(0)}
               </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-casino-900/50 p-6 rounded-xl">
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Bet Amount</label>
                 <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-casino-800 border border-casino-600 rounded p-3 text-white font-mono mt-1" />
               </div>
               <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Win Chance ({winChance}%)</label>
                  <input type="range" min="2" max="98" step="1" value={winChance} onChange={(e) => setWinChance(Number(e.target.value))} className="w-full mt-2 h-2 bg-casino-700 rounded-lg appearance-none cursor-pointer accent-casino-accent" />
               </div>
             </div>
             <div className="flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-casino-800 p-3 rounded border border-casino-600 text-center">
                      <div className="text-xs text-slate-500 uppercase">Multiplier</div>
                      <div className="text-xl font-bold text-white">{multiplier.toFixed(4)}x</div>
                   </div>
                   <div className="bg-casino-800 p-3 rounded border border-casino-600 text-center">
                      <div className="text-xs text-slate-500 uppercase">Payout</div>
                      <div className="text-xl font-bold text-emerald-400">{(betAmount * multiplier).toFixed(2)}</div>
                   </div>
                </div>
                <button onClick={handleRoll} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-casino-900 font-black text-xl rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform active:scale-95">ROLL DICE</button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
