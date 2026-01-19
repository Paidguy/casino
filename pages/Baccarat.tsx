
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Baccarat() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betSide, setBetSide] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [gameState, setGameState] = useState<'IDLE' | 'DEALING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<any>(null);

  const deal = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setGameState('DEALING');
    setResult(null);
    audio.playBet();

    setTimeout(() => {
      const pScore = Math.floor(Math.random() * 10);
      const bScore = Math.floor(Math.random() * 10);
      let winner = 'TIE';
      let multi = 9; // Tie multiplier
      
      if (pScore > bScore) { winner = 'PLAYER'; multi = 2; }
      else if (bScore > pScore) { winner = 'BANKER'; multi = 1.95; }

      const won = betSide === winner;
      const finalMulti = won ? multi : 0;

      setResult({ pScore, bScore, winner, won });
      setGameState('RESULT');
      
      if (won) audio.playWin(); else audio.playLoss();
      engine.placeBet(GameType.WHEEL, betAmount, finalMulti, `Baccarat: ${winner} won (${pScore} vs ${bScore})`);
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-12">
        <div className="w-full max-w-4xl bg-gradient-to-b from-emerald-800 to-emerald-950 p-12 rounded-[4rem] border-[12px] border-bet-900 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] flex flex-col justify-between items-center min-h-[400px]">
           <div className="flex justify-between w-full">
              <div className="text-center">
                 <div className="text-[10px] font-black uppercase text-emerald-200/50 mb-2">Player Hand</div>
                 <div className="w-24 h-32 bg-white/10 rounded-2xl flex items-center justify-center text-5xl font-black text-white">
                    {gameState === 'RESULT' ? result.pScore : '?'}
                 </div>
              </div>
              <div className="text-center">
                 <div className="text-[10px] font-black uppercase text-emerald-200/50 mb-2">Banker Hand</div>
                 <div className="w-24 h-32 bg-white/10 rounded-2xl flex items-center justify-center text-5xl font-black text-white">
                    {gameState === 'RESULT' ? result.bScore : '?'}
                 </div>
              </div>
           </div>

           <div className="text-center h-20">
              {gameState === 'RESULT' && (
                <div className={`text-4xl font-black italic -skew-x-12 uppercase ${result.won ? 'text-bet-accent' : 'text-white/40'}`}>
                  {result.winner} WINS
                </div>
              )}
           </div>
        </div>

        <div className="bg-bet-900 w-full max-w-2xl p-8 rounded-[3rem] border border-white/5 space-y-8">
           <div className="grid grid-cols-3 gap-3">
              {(['PLAYER', 'TIE', 'BANKER'] as const).map(side => (
                <button 
                  key={side} onClick={() => setBetSide(side)}
                  disabled={gameState === 'DEALING'}
                  className={`py-6 rounded-2xl font-black text-xs tracking-widest border transition-all ${betSide === side ? 'bg-bet-accent text-black border-bet-accent shadow-lg' : 'bg-black/40 border-white/5 text-slate-500'}`}
                >
                  {side}
                </button>
              ))}
           </div>
           
           <div className="flex gap-4">
              <input 
                type="number" value={betAmount} 
                onChange={e => setBetAmount(Number(e.target.value))} 
                disabled={gameState === 'DEALING'}
                className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl outline-none" 
              />
              <button onClick={deal} disabled={gameState === 'DEALING'} className="bg-bet-accent text-black px-12 py-4 rounded-xl font-black uppercase text-sm shadow-xl transition-all">Deal</button>
           </div>
        </div>
      </div>
    </Layout>
  );
}
