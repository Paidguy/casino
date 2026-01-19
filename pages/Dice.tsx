import React, { useState } from 'react';
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
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
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
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-10">
        <div className="bg-bet-900 rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/5 p-6 lg:p-12 shadow-2xl">
          <div className="h-24 lg:h-32 bg-black/40 rounded-2xl relative mb-10 flex items-center px-4 overflow-hidden border border-white/5">
            <div 
              className={`h-4 lg:h-6 rounded-full z-10 transition-all duration-300 ${rollOver ? 'bg-bet-success shadow-[0_0_20px_rgba(0,200,5,0.3)]' : 'bg-bet-danger shadow-[0_0_20px_rgba(255,59,48,0.3)]'}`} 
              style={{ width: `${rollOver ? winChance : 100 - winChance}%`, marginLeft: rollOver ? `${100 - winChance}%` : '0%' }}
            ></div>
            <div className="absolute h-full w-1 bg-white z-20 shadow-[0_0_15px_white]" style={{ left: `${target}%` }}></div>
            {lastRoll !== null && (
               <div 
                className={`absolute w-12 h-12 lg:w-16 lg:h-16 -ml-6 lg:-ml-8 rounded-2xl border-4 flex items-center justify-center font-black text-sm lg:text-lg shadow-2xl z-30 transition-all duration-500 ease-out ${lastWin ? 'bg-bet-success border-emerald-300 text-white' : 'bg-bet-danger border-rose-300 text-white'}`} 
                style={{ left: `${lastRoll}%` }}
               >
                 {lastRoll.toFixed(0)}
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 bg-bet-800/40 p-6 lg:p-10 rounded-3xl border border-white/5">
             <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Bet Amount (₹)</label>
                 <div className="relative">
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white font-mono font-black text-xl outline-none focus:border-bet-primary transition-all" />
                    <div className="absolute right-3 top-3 flex gap-2">
                       <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-3 py-1 rounded text-[10px] font-black uppercase">2X</button>
                    </div>
                 </div>
               </div>
               <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Win Chance ({winChance}%)</label>
                    <button onClick={() => setRollOver(!rollOver)} className="text-[10px] font-black text-bet-accent uppercase underline">Mode: {rollOver ? 'Over' : 'Under'}</button>
                  </div>
                  <input type="range" min="2" max="98" step="1" value={winChance} onChange={(e) => setWinChance(Number(e.target.value))} className="w-full h-3 bg-black rounded-full appearance-none cursor-pointer accent-bet-accent" />
               </div>
             </div>
             
             <div className="flex flex-col justify-between space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Multiplier</div>
                      <div className="text-xl font-black text-white tabular-nums">{multiplier.toFixed(4)}x</div>
                   </div>
                   <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Payout</div>
                      <div className="text-xl font-black text-bet-success tabular-nums">₹{(betAmount * multiplier).toFixed(0)}</div>
                   </div>
                </div>
                <button onClick={handleRoll} className="w-full py-6 bg-bet-accent text-black font-black text-2xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Roll Dice</button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}