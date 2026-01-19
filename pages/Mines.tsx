
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Mines() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false)); // true = mine
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  
  const getMultiplier = (revealedCount: number) => {
     let m = 1;
     for(let i=0; i<revealedCount; i++) {
         m = m * ((25 - i) / (25 - i - minesCount));
     }
     return m * 0.97; 
  };

  const revealedCount = revealed.filter(r => r).length;
  const currentMultiplier = getMultiplier(revealedCount);
  const potentialProfit = betAmount * currentMultiplier;

  const startGame = () => {
    if (betAmount > engine.getSession().balance) return;
    audio.playBet();
    
    engine.updateBalance(-betAmount); 
    const r = engine.peekNextRandom();
    const newGrid = engine.generateMinesGrid(r, minesCount);
    
    setGrid(newGrid);
    setRevealed(Array(25).fill(false));
    setIsPlaying(true);
    setGameOver(false);
    setWin(false);
  };

  const clickTile = (index: number) => {
    if (!isPlaying || revealed[index] || gameOver) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index]) {
       setGameOver(true);
       setWin(false);
       setIsPlaying(false);
       audio.playLoss();
       engine.placeBet(GameType.MINES, 0, () => ({ multiplier: 0, outcome: `Mines: Bust on ${revealedCount+1}` }));
    } else {
       audio.playClick(); // Safe click sound
       if (revealedCount + 1 === 25 - minesCount) {
          cashOut(newRevealed);
       }
    }
  };

  const cashOut = (finalRevealed = revealed) => {
     const count = finalRevealed.filter(r => r).length;
     const mult = getMultiplier(count);
     
     audio.playWin();
     engine.updateBalance(betAmount); // Refund stake for calculation
     engine.placeBet(GameType.MINES, betAmount, () => ({ multiplier: mult, outcome: `Mines: Cashout @ ${mult.toFixed(2)}x` }));

     setIsPlaying(false);
     setGameOver(true);
     setWin(true);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-casino-800 p-6 rounded-xl border border-casino-700 h-fit">
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Bet Amount</label>
              <input 
                 type="number" 
                 value={betAmount} 
                 onChange={(e) => setBetAmount(Number(e.target.value))}
                 disabled={isPlaying}
                 className="w-full bg-casino-900 border border-casino-600 rounded p-3 text-white font-mono"
              />
            </div>
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mines</label>
              <div className="grid grid-cols-4 gap-2">
                 {[1, 3, 5, 10].map(m => (
                    <button 
                       key={m}
                       onClick={() => setMinesCount(m)}
                       disabled={isPlaying}
                       className={`py-2 rounded font-bold text-sm ${minesCount === m ? 'bg-casino-accent text-white' : 'bg-casino-900 text-slate-400'}`}
                    >
                       {m}
                    </button>
                 ))}
              </div>
            </div>
            
            {!isPlaying ? (
               <button 
                  onClick={startGame}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-casino-900 font-black text-xl rounded shadow-lg transition-transform active:scale-95"
               >
                  BET
               </button>
            ) : (
               <button 
                  onClick={() => cashOut()}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-casino-900 font-black text-xl rounded shadow-lg transition-transform active:scale-95 flex flex-col items-center leading-none"
               >
                  <span>CASHOUT</span>
                  <span className="text-xs mt-1 font-mono opacity-80">${potentialProfit.toFixed(2)}</span>
               </button>
            )}
         </div>

         <div className="md:col-span-2 bg-casino-900 p-8 rounded-xl border border-casino-800 flex items-center justify-center relative">
            <div className="grid grid-cols-5 gap-3 w-full max-w-md aspect-square">
               {grid.map((isMine, i) => (
                  <button
                     key={i}
                     onClick={() => clickTile(i)}
                     disabled={!isPlaying || revealed[i]}
                     className={`rounded-lg relative transition-all duration-300 transform 
                        ${!revealed[i] 
                           ? (isPlaying ? 'bg-casino-700 hover:bg-casino-600 cursor-pointer hover:-translate-y-1 shadow-[0_4px_0_rgba(15,23,42,0.5)]' : 'bg-casino-800 opacity-50') 
                           : (isMine ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-casino-800 border-2 border-emerald-500/30')
                        }
                     `}
                  >
                     {revealed[i] && (
                        <span className="absolute inset-0 flex items-center justify-center text-2xl">
                           {isMine ? '💣' : '💎'}
                        </span>
                     )}
                  </button>
               ))}
            </div>
            
            {gameOver && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                  <div className={`text-4xl font-black ${win ? 'text-emerald-400' : 'text-rose-500'} animate-bounce-short`}>
                     {win ? `WON ${(betAmount * currentMultiplier).toFixed(2)}` : 'BUSTED'}
                  </div>
               </div>
            )}
         </div>
      </div>
    </Layout>
  );
}
