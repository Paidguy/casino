
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

type Card = { suit: string, value: string, color: string };

export default function TeenPatti() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'DEALING' | 'RESULT'>('IDLE');
  const [message, setMessage] = useState('');
  const [payout, setPayout] = useState(0);

  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

  const getRandomCard = (): Card => {
    const s = suits[Math.floor(Math.random() * 4)];
    const v = values[Math.floor(Math.random() * 13)];
    return { suit: s, value: v, color: s === '♥' || s === '♦' ? 'text-rose-500' : 'text-white' };
  };

  const play = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setGameState('DEALING');
    setMessage('');
    audio.playBet();

    setTimeout(() => {
      // Providing empty string as the 4th argument
      engine.placeBet(GameType.TEENPATTI, betAmount, (r) => {
        const { won, hand } = engine.calculateTeenPatti(r);
        const pHand = [getRandomCard(), getRandomCard(), getRandomCard()];
        const dHand = [getRandomCard(), getRandomCard(), getRandomCard()];
        
        setPlayerHand(pHand);
        setDealerHand(dHand);
        setGameState('RESULT');
        
        if (won) {
          audio.playWin();
          setMessage(`WIN! ${hand}`);
          setPayout(betAmount * 1.95);
          return { multiplier: 1.95, outcome: `TeenPatti: ${hand} (Win)` };
        } else {
          audio.playLoss();
          setMessage('DEALER WINS');
          setPayout(0);
          return { multiplier: 0, outcome: `TeenPatti: Dealer Stronger` };
        }
      }, '');
    }, 1200);
  };

  const CardView = ({ card, hidden }: { card: Card, hidden?: boolean }) => (
    <div className={`w-20 h-28 lg:w-28 lg:h-40 bg-[#1a1d23] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative shadow-2xl transform transition-all hover:-translate-y-3 ${hidden ? 'bg-gradient-to-br from-[#0f1116] to-[#1a1d23]' : ''}`}>
      {!hidden ? (
        <>
          <span className={`absolute top-3 left-3 text-base font-black ${card.color}`}>{card.value}</span>
          <span className={`text-5xl ${card.color}`}>{card.suit}</span>
          <span className={`absolute bottom-3 right-3 text-base font-black rotate-180 ${card.color}`}>{card.value}</span>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-10">
           <span className="text-6xl font-black text-casino-accent">S</span>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-[#0f1116] p-10 rounded-[3rem] border border-white/5 h-fit shadow-2xl space-y-10 order-2 lg:order-1">
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Bet Amount (₹)</label>
            <div className="relative">
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={gameState === 'DEALING'} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl outline-none focus:border-casino-accent transition-all" />
              <div className="absolute right-3 top-3 flex gap-2">
                 <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-colors">1/2</button>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-colors">2x</button>
              </div>
            </div>
          </div>
          <button onClick={play} disabled={gameState === 'DEALING'} className="w-full py-6 bg-casino-accent text-black font-black text-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,231,1,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50">
            {gameState === 'DEALING' ? 'Dealing...' : 'Play Matka'}
          </button>
          
          <div className="p-6 bg-black/30 rounded-2xl border border-white/5 text-[10px] font-black text-slate-600 space-y-3 uppercase tracking-widest">
             <div className="flex justify-between"><span>Payout Odds</span><span className="text-white">1.95x</span></div>
             <div className="flex justify-between"><span>House Advantage</span><span className="text-rose-500">2.5%</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-b from-[#064e3b] to-[#0f1116] p-12 rounded-[4rem] border-[12px] border-[#1a1d23] min-h-[600px] flex flex-col justify-between items-center relative shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] order-1 lg:order-2">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] rounded-[3rem] pointer-events-none"></div>
           
           {/* Dealer */}
           <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="text-[11px] font-black text-emerald-200/30 uppercase tracking-[0.6em] mb-2 italic">Dealer's Domain</div>
              <div className="flex -space-x-8">
                 {dealerHand.length > 0 ? (
                   dealerHand.map((c, i) => <CardView key={i} card={c} hidden={gameState === 'DEALING'} />)
                 ) : (
                   Array(3).fill(null).map((_, i) => <CardView key={i} card={getRandomCard()} hidden />)
                 )}
              </div>
           </div>

           {/* Result Area */}
           <div className="flex flex-col items-center relative z-10 py-10">
              {message && (
                <div className={`text-5xl lg:text-7xl font-black italic -skew-x-12 uppercase animate-bounce drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${payout > 0 ? 'text-casino-accent' : 'text-rose-600'}`}>
                   {message}
                </div>
              )}
              {payout > 0 && <div className="text-3xl font-black text-white mt-4 font-mono tracking-tighter">Win ₹{payout.toLocaleString()}</div>}
              {!message && gameState === 'IDLE' && <div className="text-2xl font-black text-white/5 uppercase tracking-[1em] border-2 border-white/5 px-12 py-4 rounded-full">Place Your Bets</div>}
           </div>

           {/* Player */}
           <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="flex -space-x-8 mb-6">
                 {playerHand.length > 0 ? (
                   playerHand.map((c, i) => <CardView key={i} card={c} />)
                 ) : (
                   Array(3).fill(null).map((_, i) => <CardView key={i} card={getRandomCard()} hidden />)
                 )}
              </div>
              <div className="text-[11px] font-black text-emerald-200/30 uppercase tracking-[0.6em] italic">Your Fortune</div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
