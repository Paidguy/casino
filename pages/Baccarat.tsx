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
      engine.placeBet(GameType.BACCARAT, betAmount, finalMulti, `Baccarat: ${winner} won (${pScore} vs ${bScore})`);
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8 lg:gap-12 pb-20 max-w-6xl mx-auto">
        <div className="w-full bg-gradient-to-b from-emerald-800 to-emerald-950 p-8 lg:p-16 rounded-[4rem] border-[12px] border-bet-900 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center min-h-[450px] lg:min-h-[550px] relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none"></div>
           
           <div className="flex justify-between w-full relative z-10">
              <div className="text-center group transition-transform hover:scale-110">
                 <div className="text-[10px] font-black uppercase text-emerald-200/50 mb-3 tracking-[0.4em]">Player Hand</div>
                 <div className="w-28 h-40 lg:w-40 lg:h-56 bg-white/5 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-6xl lg:text-9xl font-black text-white shadow-2xl border border-white/10">
                    {gameState === 'RESULT' ? result.pScore : '?'}
                 </div>
              </div>
              <div className="text-center group transition-transform hover:scale-110">
                 <div className="text-[10px] font-black uppercase text-emerald-200/50 mb-3 tracking-[0.4em]">Banker Hand</div>
                 <div className="w-28 h-40 lg:w-40 lg:h-56 bg-white/5 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-6xl lg:text-9xl font-black text-white shadow-2xl border border-white/10">
                    {gameState === 'RESULT' ? result.bScore : '?'}
                 </div>
              </div>
           </div>

           <div className="text-center h-24 flex items-center justify-center relative z-10">
              {gameState === 'RESULT' ? (
                <div className={`text-5xl lg:text-8xl font-black italic -skew-x-12 uppercase animate-bounce bazar-font ${result.won ? 'text-bet-primary drop-shadow-[0_0_20px_#22d3ee]' : 'text-white/40'}`}>
                  {result.winner} WINS
                </div>
              ) : gameState === 'DEALING' ? (
                <div className="text-2xl font-black text-white uppercase italic animate-pulse tracking-widest bazar-font">Dealing Satta Cards...</div>
              ) : null}
           </div>
        </div>

        <div className="bg-bet-900 w-full max-w-3xl p-8 lg:p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-3xl">
           <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {(['PLAYER', 'TIE', 'BANKER'] as const).map(side => (
                <button 
                  key={side} onClick={() => { setBetSide(side); audio.playClick(); }}
                  disabled={gameState === 'DEALING'}
                  className={`py-6 lg:py-8 rounded-3xl font-black text-xs lg:text-sm tracking-widest border-2 transition-all transform active:scale-95 ${betSide === side ? 'bg-bet-primary text-bet-950 border-bet-primary shadow-2xl scale-105' : 'bg-black/40 border-white/5 text-slate-600 hover:text-white'}`}
                >
                  {side} <span className="block text-[9px] mt-1 opacity-60">({side === 'TIE' ? '9x' : side === 'BANKER' ? '1.95x' : '2x'})</span>
                </button>
              ))}
           </div>
           
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-2">Investment Amount (₹)</label>
                 <input 
                   type="number" value={betAmount} 
                   onChange={e => setBetAmount(Number(e.target.value))} 
                   disabled={gameState === 'DEALING'}
                   className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-black text-3xl outline-none focus:border-bet-primary transition-all text-center" 
                 />
              </div>
              <button 
                onClick={deal} 
                disabled={gameState === 'DEALING' || betAmount <= 0} 
                className="md:w-64 py-8 bg-bet-primary text-bet-950 font-black text-2xl rounded-3xl shadow-xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font leading-none"
              >
                {gameState === 'DEALING' ? 'DEALING...' : 'PLACE BET'}
              </button>
           </div>
        </div>
      </div>
    </Layout>
  );
}