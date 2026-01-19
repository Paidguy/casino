import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Mines() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const getMultiplier = (count: number) => {
    let m = 0.98; // 2% House cut
    for (let i = 0; i < count; i++) m *= (25 - i) / (25 - i - minesCount);
    return m;
  };

  const revealedCount = revealed.filter(r => r).length;
  const currentMult = getMultiplier(revealedCount);

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    engine.updateBalance(-betAmount);
    setGrid(engine.generateMinesGrid(engine.peekNextRandom(), minesCount));
    setRevealed(Array(25).fill(false));
    setIsPlaying(true);
    setGameOver(false);
    setWin(false);
  };

  const click = (i: number) => {
    if (!isPlaying || revealed[i] || gameOver) return;
    const newRevealed = [...revealed];
    newRevealed[i] = true;
    setRevealed(newRevealed);
    if (grid[i]) {
      setGameOver(true);
      setWin(false);
      setIsPlaying(false);
      audio.playLoss();
      engine.placeBet(GameType.MINES, 0, () => ({ multiplier: 0, outcome: `Mines: Hit mine on step ${revealedCount + 1}` }), '');
    } else {
      audio.playClick();
      if (revealedCount + 1 === 25 - minesCount) cashOut(newRevealed);
    }
  };

  const cashOut = (finalRev = revealed) => {
    const count = finalRev.filter(r => r).length;
    const mult = getMultiplier(count);
    audio.playWin();
    engine.updateBalance(betAmount); 
    engine.placeBet(GameType.MINES, betAmount, () => ({ multiplier: mult, outcome: `Mines: Win @ ${mult.toFixed(2)}x` }), '');
    setIsPlaying(false);
    setGameOver(true);
    setWin(true);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
         <div className="bg-bet-900 p-8 rounded-[2.5rem] border border-white/10 h-fit shadow-3xl space-y-10 order-2 lg:order-1">
            <div className="space-y-8">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Bazar Stake (₹)</label>
                <div className="relative">
                  <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={isPlaying} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-black text-xl outline-none focus:border-bet-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Danger Mines</label>
                <div className="grid grid-cols-4 gap-3">
                   {[1, 3, 5, 13].map(m => (
                      <button key={m} onClick={() => setMinesCount(m)} disabled={isPlaying} className={`py-4 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all ${minesCount === m ? 'bg-bet-primary text-bet-950 shadow-xl cyan-glow' : 'bg-black text-slate-600 border border-white/5'}`}>{m}</button>
                   ))}
                </div>
              </div>
              {!isPlaying ? (
                 <button onClick={start} className="w-full py-6 bg-bet-primary text-bet-950 font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest bazar-font">Start Game</button>
              ) : (
                 <button onClick={() => cashOut()} className="w-full py-6 bg-bet-success text-bet-950 font-black text-xl rounded-2xl shadow-xl flex flex-col items-center leading-none active:scale-95 transition-all">
                   <span className="bazar-font uppercase text-lg tracking-widest">Cashout</span>
                   <span className="text-[10px] mt-1 font-bold tabular-nums">₹{(betAmount * currentMult).toFixed(2)}</span>
                 </button>
              )}
            </div>
         </div>

         <div className="lg:col-span-2 bg-bet-900 p-6 lg:p-14 rounded-[3.5rem] border border-white/5 flex items-center justify-center relative shadow-inner order-1 lg:order-2">
            <div className="grid grid-cols-5 gap-3 lg:gap-5 w-full max-w-lg aspect-square">
               {grid.map((isMine, i) => (
                  <button key={i} onClick={() => click(i)} disabled={!isPlaying || revealed[i]} className={`rounded-2xl lg:rounded-3xl transition-all duration-300 transform flex items-center justify-center text-4xl lg:text-5xl ${!revealed[i] ? (isPlaying ? 'bg-bet-950/80 hover:bg-bet-800 hover:-translate-y-1.5 shadow-xl border border-white/5' : 'bg-bet-950/40 opacity-30') : (isMine ? 'bg-bet-danger shadow-[0_0_40px_rgba(244,63,94,0.6)]' : 'bg-bet-primary text-bet-950 shadow-[0_0_40px_rgba(34,211,238,0.4)]')}`}>
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
                  <button onClick={() => setGameOver(false)} className="mt-12 px-12 py-5 bg-white/10 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white/20 transition-all">Dismiss Board</button>
               </div>
            )}
         </div>
      </div>
    </Layout>
  );
}