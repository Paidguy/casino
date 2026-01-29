import React, { useState, useEffect, useRef } from 'react';
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
  const [rolling, setRolling] = useState(false);

  // Auto Bet State
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);
  
  const autoRef = useRef({ active: false, count: 0, remaining: 0 });

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  const multiplier = (100 - (HOUSE_EDGES.DICE * 100)) / winChance;
  const target = rollOver ? (100 - winChance) : winChance;

  const handleRoll = () => {
    if (rolling || betAmount > engine.getSession().balance || betAmount <= 0) {
        if (autoRef.current.active) setAutoActive(false);
        return;
    }
    
    setRolling(true);
    audio.playBet();

    // Small artificial delay for visual feedback
    setTimeout(() => {
        engine.placeBet(GameType.DICE, betAmount, (r) => {
            const { roll, won } = engine.calculateDiceResult(r, target, rollOver ? 'over' : 'under');
            setLastRoll(roll);
            setLastWin(won);
            if (won) audio.playWin();
            else audio.playLoss();
            return { multiplier: won ? multiplier : 0, outcome: `Rolled ${roll.toFixed(2)}` };
        }, '');
        setRolling(false);
    }, 150); 
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      
      if (autoActive) {
          setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
          
          interval = setInterval(() => {
              const { active, count, remaining } = autoRef.current;
              
              if (!active) {
                  clearInterval(interval);
                  return;
              }

              if (engine.getSession().balance < betAmount) {
                  setAutoActive(false);
                  clearInterval(interval);
                  return;
              }

              if (count === 0 || remaining > 0) {
                  // Bypass rolling state check for auto to be fast, but ensure logic executes
                  handleRoll();
                  if (count > 0) {
                      setAutoBetsRemaining(prev => prev - 1);
                  }
              } else {
                  setAutoActive(false);
                  clearInterval(interval);
              }
          }, 400); // Throttled slightly to allow state updates
      }
      
      return () => clearInterval(interval);
  }, [autoActive]);

  const toggleAuto = () => {
      if (autoActive) {
          setAutoActive(false);
      } else {
          setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
          setAutoActive(true);
      }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-10 pb-32">
        <div className="bg-bet-900 rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/5 p-6 lg:p-12 shadow-2xl">
          <div className="h-24 lg:h-32 bg-black/40 rounded-2xl relative mb-10 flex items-center px-4 overflow-hidden border border-white/5">
            <div 
              className={`h-4 lg:h-6 rounded-full z-10 transition-all duration-300 ${rollOver ? 'bg-bet-success shadow-[0_0_20px_rgba(0,200,5,0.3)]' : 'bg-bet-danger shadow-[0_0_20px_rgba(255,59,48,0.3)]'}`} 
              style={{ width: `${rollOver ? winChance : 100 - winChance}%`, marginLeft: rollOver ? `${100 - winChance}%` : '0%' }}
            ></div>
            <div className="absolute h-full w-1 bg-white z-20 shadow-[0_0_15px_white]" style={{ left: `${target}%` }}></div>
            {lastRoll !== null && (
               <div 
                className={`absolute w-12 h-12 lg:w-16 lg:h-16 -ml-6 lg:-ml-8 rounded-2xl border-4 flex items-center justify-center font-black text-sm lg:text-lg shadow-2xl z-30 transition-all duration-200 ease-out ${lastWin ? 'bg-bet-success border-emerald-300 text-white' : 'bg-bet-danger border-rose-300 text-white'}`} 
                style={{ left: `${lastRoll}%` }}
               >
                 {lastRoll.toFixed(0)}
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 bg-bet-800/40 p-6 lg:p-10 rounded-3xl border border-white/5">
             <div className="space-y-6">
               <div className="flex bg-black/40 p-1 rounded-xl">
                  <button onClick={() => setMode('MANUAL')} disabled={autoActive || rolling} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'MANUAL' ? 'bg-bet-800 text-white shadow' : 'text-slate-500'}`}>Manual</button>
                  <button onClick={() => setMode('AUTO')} disabled={autoActive || rolling} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'AUTO' ? 'bg-bet-primary text-bet-950 shadow' : 'text-slate-500'}`}>Auto</button>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Bet Amount (₹)</label>
                 <div className="relative">
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={autoActive || rolling} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white font-mono font-black text-xl outline-none focus:border-bet-primary transition-all" />
                    <div className="absolute right-3 top-3 flex gap-2">
                       <button onClick={() => setBetAmount(betAmount * 2)} disabled={autoActive || rolling} className="bg-white/5 px-3 py-1 rounded text-[10px] font-black uppercase">2X</button>
                       <button onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))} disabled={autoActive || rolling} className="bg-white/5 px-3 py-1 rounded text-[10px] font-black uppercase">1/2</button>
                    </div>
                 </div>
               </div>
               
               {mode === 'AUTO' && (
                  <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Number of Bets (0 = ∞)</label>
                      <input type="number" value={autoBetCount} onChange={(e) => setAutoBetCount(Number(e.target.value))} disabled={autoActive} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-black text-lg outline-none" />
                  </div>
               )}

               <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Win Chance ({winChance}%)</label>
                    <button onClick={() => setRollOver(!rollOver)} disabled={autoActive || rolling} className="text-[10px] font-black text-bet-accent uppercase underline">Mode: {rollOver ? 'Over' : 'Under'}</button>
                  </div>
                  <input type="range" min="2" max="98" step="1" value={winChance} onChange={(e) => setWinChance(Number(e.target.value))} disabled={autoActive || rolling} className="w-full h-3 bg-black rounded-full appearance-none cursor-pointer accent-bet-accent" />
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
                
                {mode === 'MANUAL' ? (
                    <button 
                        onClick={handleRoll} 
                        disabled={rolling || betAmount <= 0}
                        className="w-full py-6 bg-bet-accent text-black font-black text-2xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:scale-100"
                    >
                        {rolling ? 'Rolling...' : 'Roll Dice'}
                    </button>
                ) : (
                    <button onClick={toggleAuto} className={`w-full py-6 font-black text-2xl rounded-2xl shadow-xl transition-all uppercase tracking-widest ${autoActive ? 'bg-bet-danger text-white' : 'bg-bet-primary text-bet-950'}`}>
                        {autoActive ? `Stop Auto (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})` : 'Start Auto'}
                    </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}