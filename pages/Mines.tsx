import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Mines() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false); // New lock state
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Auto Bet State
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);
  
  const autoRef = useRef({ active: false, count: 0, remaining: 0 });

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  const getMultiplier = (count: number) => {
    let m = 0.98; // 2% House cut
    for (let i = 0; i < count; i++) m *= (25 - i) / (25 - i - minesCount);
    return m;
  };

  const revealedCount = revealed.filter(r => r).length;
  const currentMult = getMultiplier(revealedCount);

  // Auto Loop
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      if (autoActive && !isPlaying && !gameOver) {
          const { count, remaining } = autoRef.current;
          
          if (engine.getSession().balance < betAmount) {
              setAutoActive(false);
              return;
          }

          if (count === 0 || remaining > 0) {
              timeout = setTimeout(() => {
                  startAutoRound();
                  if (count > 0) setAutoBetsRemaining(prev => prev - 1);
              }, 1000);
          } else {
              setAutoActive(false);
          }
      }
      return () => clearTimeout(timeout);
  }, [autoActive, isPlaying, gameOver]);

  // Restart delay after game over in Auto mode
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      if (autoActive && gameOver) {
          timeout = setTimeout(() => {
              setGameOver(false); // This triggers the main loop above
          }, 1500);
      }
      return () => clearTimeout(timeout);
  }, [gameOver, autoActive]);

  const startAutoRound = () => {
      // 1. Start Game
      if (betAmount > engine.getSession().balance) return;
      engine.updateBalance(-betAmount);
      const newGrid = engine.generateMinesGrid(Math.random(), minesCount);
      
      // 2. Pick 3 random safe spots (simulated for simplicity in auto)
      const picks: number[] = [];
      while (picks.length < 3) {
          const r = Math.floor(Math.random() * 25);
          if (!picks.includes(r)) picks.push(r);
      }

      // Check for mines
      let hitMine = false;
      for (const p of picks) {
          if (newGrid[p]) hitMine = true;
      }

      setGrid(newGrid);
      const rev = Array(25).fill(false);
      picks.forEach(p => rev[p] = true);
      setRevealed(rev);
      
      // 3. Resolve
      if (hitMine) {
          setGameOver(true);
          setWin(false);
          audio.playLoss();
          engine.placeBet(GameType.MINES, 0, 0, 'Mines: Hit Mine (Auto)');
      } else {
          const mult = getMultiplier(3);
          engine.updateBalance(betAmount * mult);
          engine.placeBet(GameType.MINES, betAmount, mult, `Mines: Auto Won @ ${mult.toFixed(2)}x`);
          setGameOver(true);
          setWin(true);
          audio.playWin();
      }
  };

  const start = () => {
    if (processing || betAmount > engine.getSession().balance || betAmount <= 0) return;
    setProcessing(true);
    audio.playBet();
    engine.updateBalance(-betAmount);
    setGrid(engine.generateMinesGrid(engine.peekNextRandom(), minesCount));
    setRevealed(Array(25).fill(false));
    setIsPlaying(true);
    setGameOver(false);
    setWin(false);
    setTimeout(() => setProcessing(false), 200);
  };

  const click = (i: number) => {
    if (!isPlaying || revealed[i] || gameOver || processing) return;
    
    // Lock immediately to prevent double clicking
    setProcessing(true);
    
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);
    
    if (grid[i]) {
      setGameOver(true);
      setWin(false);
      setIsPlaying(false);
      audio.playLoss();
      engine.placeBet(GameType.MINES, 0, 0, `Mines: Hit mine on step ${revealedCount + 1}`);
      setProcessing(false);
    } else {
      audio.playClick();
      // Auto cashout on last safe tile
      if (revealedCount + 1 === 25 - minesCount) {
          cashOut(newRevealed);
      } else {
          setProcessing(false);
      }
    }
  };

  const cashOut = (finalRev = revealed) => {
    const count = finalRev.filter(r => r).length;
    const mult = getMultiplier(count);
    audio.playWin();
    engine.updateBalance(betAmount * mult); 
    engine.placeBet(GameType.MINES, betAmount, mult, `Mines: Win @ ${mult.toFixed(2)}x`);
    setIsPlaying(false);
    setGameOver(true);
    setWin(true);
    setProcessing(false);
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
         <div className="bg-bet-900 p-8 rounded-[2.5rem] border border-white/10 h-fit shadow-3xl space-y-10 order-2 lg:order-1">
            <div className="flex bg-black/40 p-1 rounded-xl">
                <button onClick={() => setMode('MANUAL')} disabled={autoActive || isPlaying} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'MANUAL' ? 'bg-bet-800 text-white shadow' : 'text-slate-500'}`}>Manual</button>
                <button onClick={() => setMode('AUTO')} disabled={autoActive || isPlaying} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'AUTO' ? 'bg-bet-primary text-bet-950 shadow' : 'text-slate-500'}`}>Auto</button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Bazar Stake (₹)</label>
                <div className="relative">
                  <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={isPlaying || autoActive} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-bet-primary transition-all" />
                </div>
              </div>
              
              {mode === 'AUTO' && (
                  <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Auto Bets (0 = Inf)</label>
                      <input type="number" value={autoBetCount} onChange={(e) => setAutoBetCount(Number(e.target.value))} disabled={autoActive} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none" />
                      <p className="text-[9px] text-slate-500 mt-2">Auto plays 3 random tiles then cashes out.</p>
                  </div>
              )}

              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Danger Mines</label>
                <div className="grid grid-cols-4 gap-3">
                   {[1, 3, 5, 13].map(m => (
                      <button key={m} onClick={() => setMinesCount(m)} disabled={isPlaying || autoActive} className={`py-4 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all ${minesCount === m ? 'bg-bet-primary text-bet-950 shadow-xl cyan-glow' : 'bg-black text-slate-600 border border-white/5'}`}>{m}</button>
                   ))}
                </div>
              </div>
              
              {mode === 'MANUAL' ? (
                  !isPlaying ? (
                     <button onClick={start} disabled={betAmount <= 0} className="w-full py-6 bg-bet-primary text-bet-950 font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest bazar-font disabled:opacity-50">Start Game</button>
                  ) : (
                     <button onClick={() => cashOut()} disabled={processing} className="w-full py-6 bg-bet-success text-bet-950 font-black text-xl rounded-2xl shadow-xl flex flex-col items-center leading-none active:scale-95 transition-all">
                       <span className="bazar-font uppercase text-lg tracking-widest">Cashout</span>
                       <span className="text-[10px] mt-1 font-bold tabular-nums">₹{(betAmount * currentMult).toFixed(2)}</span>
                     </button>
                  )
              ) : (
                  <button onClick={toggleAuto} className={`w-full py-6 font-black text-xl rounded-2xl shadow-xl transition-all uppercase tracking-widest ${autoActive ? 'bg-bet-danger text-white' : 'bg-bet-primary text-bet-950'}`}>
                      {autoActive ? `Stop Auto (${autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})` : 'Start Auto Play'}
                  </button>
              )}
            </div>
         </div>

         <div className="lg:col-span-2 bg-bet-900 p-6 lg:p-14 rounded-[3.5rem] border border-white/5 flex items-center justify-center relative shadow-inner order-1 lg:order-2">
            <div className="grid grid-cols-5 gap-3 lg:gap-5 w-full max-w-lg aspect-square">
               {grid.map((isMine, i) => (
                  <button key={i} onClick={() => click(i)} disabled={!isPlaying || revealed[i] || autoActive || processing} className={`rounded-2xl lg:rounded-3xl transition-all duration-300 transform flex items-center justify-center text-4xl lg:text-5xl ${!revealed[i] ? (isPlaying ? 'bg-bet-950/80 hover:bg-bet-800 hover:-translate-y-1.5 shadow-xl border border-white/5 cursor-pointer' : 'bg-bet-950/40 opacity-30 cursor-default') : (isMine ? 'bg-bet-danger shadow-[0_0_40px_rgba(244,63,94,0.6)]' : 'bg-bet-primary text-bet-950 shadow-[0_0_40px_rgba(34,211,238,0.4)]')}`}>
                     {revealed[i] && (isMine ? '🧨' : '💎')}
                  </button>
               ))}
            </div>
            {gameOver && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bet-950/95 backdrop-blur-3xl rounded-[3.5rem] animate-fade-in border-4 border-white/5">
                  <div className={`text-5xl lg:text-9xl font-black uppercase italic -skew-x-12 mb-8 bazar-font drop-shadow-3xl ${win ? 'text-bet-primary cyan-glow' : 'text-bet-danger'}`}>
                     {win ? 'BHAARI WIN!' : 'GAME OVER'}
                  </div>
                  {win && <div className="text-2xl lg:text-4xl font-black text-white tabular-nums tracking-tighter">PAYOUT: ₹{(betAmount * currentMult).toFixed(2)}</div>}
                  {!autoActive && <button onClick={() => setGameOver(false)} className="mt-12 px-12 py-5 bg-white/10 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white/20 transition-all">Dismiss Board</button>}
               </div>
            )}
         </div>
      </div>
    </Layout>
  );
}