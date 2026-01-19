
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
    let m = 0.98; // House cut
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
      // Providing empty string as the 4th argument
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
    engine.updateBalance(betAmount); // Add stake back for the engine.placeBet to deduct and payout correctly
    // Providing empty string as the 4th argument
    engine.placeBet(GameType.MINES, betAmount, () => ({ multiplier: mult, outcome: `Mines: Win @ ${mult.toFixed(2)}x` }), '');
    setIsPlaying(false);
    setGameOver(true);
    setWin(true);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-[#0f1116] p-6 lg:p-8 rounded-[2rem] border border-white/5 h-fit shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Stake (₹)</label>
                <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={isPlaying} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-black" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Number of Mines</label>
                <div className="grid grid-cols-4 gap-2">
                   {[1, 3, 5, 13].map(m => (
                      <button key={m} onClick={() => setMinesCount(m)} disabled={isPlaying} className={`py-3 rounded-xl font-black text-xs ${minesCount === m ? 'bg-casino-accent text-black' : 'bg-black text-slate-500 border border-white/5'}`}>{m}</button>
                   ))}
                </div>
              </div>
              {!isPlaying ? (
                 <button onClick={start} className="w-full py-5 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all uppercase">Start Matka</button>
              ) : (
                 <button onClick={() => cashOut()} className="w-full py-5 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-xl flex flex-col items-center leading-none">
                   <span>Cashout</span>
                   <span className="text-xs mt-1 opacity-60">₹{(betAmount * currentMult).toFixed(2)}</span>
                 </button>
              )}
            </div>
         </div>

         <div className="lg:col-span-2 bg-[#0f1116] p-4 lg:p-10 rounded-[3rem] border border-white/5 flex items-center justify-center relative shadow-inner">
            <div className="grid grid-cols-5 gap-2 lg:gap-4 w-full max-w-md aspect-square">
               {grid.map((isMine, i) => (
                  <button key={i} onClick={() => click(i)} disabled={!isPlaying || revealed[i]} className={`rounded-2xl transition-all duration-300 transform flex items-center justify-center text-3xl ${!revealed[i] ? (isPlaying ? 'bg-[#1a1d23] hover:bg-[#21262d] hover:-translate-y-1' : 'bg-[#1a1d23] opacity-30') : (isMine ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-casino-accent shadow-[0_0_20px_rgba(0,231,1,0.3)] border border-white/20')}`}>
                     {revealed[i] && (isMine ? '💣' : '💎')}
                  </button>
               ))}
            </div>
            {gameOver && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[3rem] animate-fade-in">
                  <div className={`text-4xl lg:text-6xl font-black uppercase italic -skew-x-12 mb-4 ${win ? 'text-casino-accent' : 'text-rose-500'}`}>
                     {win ? 'Draw Won!' : 'Matka Bust!'}
                  </div>
                  {win && <div className="text-2xl font-mono text-white">Payout: ₹{(betAmount * currentMult).toFixed(2)}</div>}
                  <button onClick={() => setGameOver(false)} className="mt-8 px-8 py-3 bg-white/10 text-white rounded-xl font-black uppercase text-xs">Dismiss</button>
               </div>
            )}
         </div>
      </div>
    </Layout>
  );
}
