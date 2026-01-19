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
    return { suit: s, value: v, color: s === '♥' || s === '♦' ? 'text-rose-500' : 'text-slate-900' };
  };

  const play = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setGameState('DEALING');
    setMessage('');
    audio.playBet();

    setTimeout(() => {
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
          return { multiplier: 0, outcome: `TeenPatti: Dealer Wins` };
        }
      }, '');
    }, 1500);
  };

  const CardView = ({ card, hidden }: { card: Card, hidden?: boolean }) => (
    <div className={`w-24 h-36 lg:w-32 lg:h-48 bg-white rounded-[1.5rem] border border-slate-300 flex flex-col items-center justify-center relative shadow-3xl transform transition-all hover:-translate-y-4 duration-300 ${hidden ? 'bg-bet-900 border-white/5' : ''}`}>
      {!hidden ? (
        <>
          <span className={`absolute top-4 left-4 text-xl lg:text-2xl font-black ${card.color}`}>{card.value}</span>
          <span className={`text-6xl lg:text-7xl ${card.color}`}>{card.suit}</span>
          <span className={`absolute bottom-4 right-4 text-xl lg:text-2xl font-black rotate-180 ${card.color}`}>{card.value}</span>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-10 bg-bet-950 rounded-[1.5rem] border-4 border-bet-primary shadow-inner">
           <span className="text-6xl font-black text-bet-primary bazar-font">KING</span>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 pb-32">
        <div className="bg-bet-900 p-10 rounded-[3rem] border border-white/10 h-fit shadow-3xl space-y-12 order-2 lg:order-1">
          <div className="space-y-6">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Royal Stake (₹)</label>
            <div className="relative">
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={gameState === 'DEALING'} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-white font-mono font-black text-2xl outline-none focus:border-bet-primary transition-all" />
              <div className="absolute right-3 top-3 flex gap-2">
                 <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10">1/2</button>
                 <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10">2x</button>
              </div>
            </div>
          </div>
          <button onClick={play} disabled={gameState === 'DEALING'} className="w-full py-7 bg-bet-primary text-bet-950 font-black text-2xl rounded-[2.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] bazar-font cyan-glow">
            {gameState === 'DEALING' ? 'Dealing...' : 'Bet Lagao'}
          </button>
          
          <div className="p-8 bg-black/40 rounded-3xl border border-white/5 text-[10px] font-black text-slate-600 space-y-4 uppercase tracking-[0.25em]">
             <div className="flex justify-between border-b border-white/5 pb-2"><span>Win Odds</span><span className="text-bet-primary">1.95x</span></div>
             <div className="flex justify-between"><span>House Advantage</span><span className="text-bet-danger">2.5%</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-b from-[#064e3b] to-bet-950 p-12 lg:p-16 rounded-[4rem] border-[12px] border-bet-900 min-h-[650px] flex flex-col justify-between items-center relative shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] order-1 lg:order-2 overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] rounded-[3rem] pointer-events-none"></div>
           
           <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="text-[11px] font-black text-emerald-200/40 uppercase tracking-[0.8em] mb-4 italic bazar-font">Dealer's Board</div>
              <div className="flex -space-x-12 lg:-space-x-16">
                 {dealerHand.length > 0 ? (
                   dealerHand.map((c, i) => <CardView key={i} card={c} hidden={gameState === 'DEALING'} />)
                 ) : (
                   Array(3).fill(null).map((_, i) => <CardView key={i} card={{} as Card} hidden />)
                 )}
              </div>
           </div>

           <div className="flex flex-col items-center relative z-10 py-12">
              {message && (
                <div className={`text-6xl lg:text-9xl font-black italic -skew-x-12 uppercase animate-bounce drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] bazar-font ${payout > 0 ? 'text-bet-primary cyan-glow' : 'text-bet-danger'}`}>
                   {message}
                </div>
              )}
              {payout > 0 && <div className="text-3xl lg:text-5xl font-black text-white mt-6 font-mono tracking-tighter drop-shadow-lg">₹{payout.toLocaleString()}</div>}
              {!message && gameState === 'IDLE' && <div className="text-3xl font-black text-white/5 uppercase tracking-[0.5em] border-2 border-white/5 px-16 py-6 rounded-full bazar-font">Ready To Play</div>}
           </div>

           <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="flex -space-x-12 lg:-space-x-16 mb-8">
                 {playerHand.length > 0 ? (
                   playerHand.map((c, i) => <CardView key={i} card={c} />)
                 ) : (
                   Array(3).fill(null).map((_, i) => <CardView key={i} card={{} as Card} hidden />)
                 )}
              </div>
              <div className="text-[11px] font-black text-emerald-200/40 uppercase tracking-[0.8em] italic bazar-font">Punter's Fortune</div>
           </div>
        </div>
      </div>
    </Layout>
  );
}