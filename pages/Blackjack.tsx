
import React, { useState } from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

type Card = { suit: string, value: string, numeric: number };

export default function Blackjack() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYER_TURN' | 'DEALER_TURN' | 'FINISHED'>('IDLE');
  const [message, setMessage] = useState('');
  
  // Can Double?
  const canDouble = gameState === 'PLAYER_TURN' && playerHand.length === 2;
  
  // Internal deck
  const [deck, setDeck] = useState<Card[]>([]);

  const generateDeck = () => {
     const suits = ['♠', '♥', '♦', '♣'];
     const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
     const d: Card[] = [];
     for(const s of suits) {
        for(const v of values) {
           let n = parseInt(v);
           if (v === 'J' || v === 'Q' || v === 'K') n = 10;
           if (v === 'A') n = 11;
           d.push({ suit: s, value: v, numeric: n });
        }
     }
     return d.sort(() => Math.random() - 0.5); 
  };

  const getHandValue = (hand: Card[]) => {
      let val = hand.reduce((a, b) => a + b.numeric, 0);
      let aces = hand.filter(c => c.value === 'A').length;
      while (val > 21 && aces > 0) {
          val -= 10;
          aces--;
      }
      return val;
  };

  const startGame = () => {
     if (betAmount > engine.getSession().balance) return;
     audio.playBet();
     engine.updateBalance(-betAmount);
     
     const d = generateDeck();
     const p = [d.pop()!, d.pop()!];
     const dealer = [d.pop()!, d.pop()!];
     
     setDeck(d);
     setPlayerHand(p);
     setDealerHand(dealer);
     setGameState('PLAYER_TURN');
     setMessage('');

     if (getHandValue(p) === 21) {
         if (getHandValue(dealer) === 21) finishGame('PUSH', p, dealer, betAmount);
         else finishGame('BLACKJACK', p, dealer, betAmount);
     }
  };

  const hit = () => {
     audio.playClick();
     const newHand = [...playerHand, deck.pop()!];
     setPlayerHand(newHand);
     if (getHandValue(newHand) > 21) {
         finishGame('BUST', newHand, dealerHand, betAmount);
     }
  };

  const doubleDown = () => {
     if (betAmount > engine.getSession().balance) return; // check balance for double
     audio.playBet();
     engine.updateBalance(-betAmount); // deduct another bet
     const doubleBet = betAmount * 2;
     
     const newHand = [...playerHand, deck.pop()!];
     setPlayerHand(newHand);
     
     if (getHandValue(newHand) > 21) {
         finishGame('BUST', newHand, dealerHand, doubleBet);
     } else {
         stand(newHand, doubleBet); // Auto stand after double
     }
  };

  const stand = (finalHand = playerHand, finalBet = betAmount) => {
     audio.playClick();
     setGameState('DEALER_TURN');
     
     let dHand = [...dealerHand];
     const playDealer = async () => {
         await new Promise(r => setTimeout(r, 600));
         // Rule: Dealer stands on 17 (Hard and Soft for simplicity in this version)
         while (getHandValue(dHand) < 17) {
             dHand.push(deck.pop()!);
             setDealerHand([...dHand]);
             audio.playSpin(); 
             await new Promise(r => setTimeout(r, 600));
         }
         determineWinner(finalHand, dHand, finalBet);
     };
     playDealer();
  };

  const determineWinner = (p: Card[], d: Card[], finalBet: number) => {
     const pVal = getHandValue(p);
     const dVal = getHandValue(d);
     
     if (dVal > 21) finishGame('DEALER_BUST', p, d, finalBet);
     else if (pVal > dVal) finishGame('WIN', p, d, finalBet);
     else if (pVal < dVal) finishGame('LOSE', p, d, finalBet);
     else finishGame('PUSH', p, d, finalBet);
  };

  const finishGame = (result: string, p: Card[], d: Card[], finalBet: number) => {
      setGameState('FINISHED');
      let mult = 0;
      let txt = '';
      
      if (result === 'BLACKJACK') { mult = 2.5; txt = 'Blackjack! 2.5x'; }
      else if (result === 'WIN' || result === 'DEALER_BUST') { mult = 2; txt = 'You Win!'; }
      else if (result === 'PUSH') { mult = 1; txt = 'Push'; }
      else { mult = 0; txt = 'Dealer Wins'; }
      
      setMessage(txt);
      if (mult >= 1) audio.playWin(); else audio.playLoss();
      
      if (mult > 0) engine.updateBalance(finalBet); // Refund stake
      engine.placeBet(GameType.BLACKJACK, finalBet, () => ({
          multiplier: mult,
          outcome: `BJ: ${txt} (${getHandValue(p)} vs ${getHandValue(d)})`
      }));
  };

  const CardView = ({ card, hidden }: { card: Card, hidden?: boolean }) => (
     <div className={`w-24 h-36 bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col items-center justify-center relative select-none transform transition-transform hover:-translate-y-2 duration-300 ${hidden ? 'bg-casino-700 border-casino-600' : ''}`}>
        {!hidden ? (
            <>
                <div className="absolute top-2 left-2 flex flex-col items-center leading-none">
                    <span className={`text-xl font-black ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.value}</span>
                    <span className={`text-xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
                </div>
                <div className={`text-6xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                    {card.suit}
                </div>
                <div className="absolute bottom-2 right-2 flex flex-col items-center leading-none rotate-180">
                    <span className={`text-xl font-black ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.value}</span>
                    <span className={`text-xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
                </div>
            </>
        ) : (
            <div className="w-full h-full bg-casino-800 rounded-xl flex items-center justify-center border-4 border-casino-700">
               <span className="text-4xl text-casino-700 font-black">LL</span>
            </div>
        )}
     </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-casino-800 p-6 rounded-xl border border-casino-700 h-fit shadow-2xl">
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Bet Amount</label>
              <input 
                 type="number" 
                 value={betAmount} 
                 onChange={(e) => setBetAmount(Number(e.target.value))}
                 disabled={gameState !== 'IDLE'}
                 className="w-full bg-casino-900 border border-casino-600 rounded p-3 text-white font-mono font-bold"
              />
            </div>
            
            {gameState === 'IDLE' || gameState === 'FINISHED' ? (
                <button 
                   onClick={startGame}
                   className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-casino-900 font-black text-xl rounded shadow-lg transition-transform active:scale-95 uppercase tracking-widest"
                >
                   Deal Cards
                </button>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={hit} className="py-4 bg-casino-700 hover:bg-casino-600 text-white font-bold rounded border border-casino-600">HIT</button>
                   <button onClick={() => stand()} className="py-4 bg-emerald-500 hover:bg-emerald-400 text-casino-900 font-bold rounded">STAND</button>
                   {canDouble && (
                       <button onClick={doubleDown} className="col-span-2 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded shadow-lg">DOUBLE (2x)</button>
                   )}
                </div>
            )}
            
            {message && <div className={`mt-4 p-4 text-center font-black text-white rounded border-2 animate-bounce-short ${message.includes('Win') || message.includes('Blackjack') ? 'bg-emerald-500/20 border-emerald-500' : 'bg-rose-500/20 border-rose-500'}`}>{message}</div>}
         </div>

         <div className="md:col-span-2 bg-[#064e3b] rounded-[2rem] border-[12px] border-[#374151] p-8 min-h-[600px] flex flex-col justify-between relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
             {/* Table Felt Texture */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none rounded-[1.5rem]"></div>

             {/* Dealer Area */}
             <div className="flex flex-col items-center relative z-10">
                 <div className="mb-4 bg-black/30 px-4 py-1 rounded-full text-emerald-100 font-bold text-xs uppercase tracking-widest backdrop-blur-sm">
                    Dealer {gameState === 'FINISHED' ? getHandValue(dealerHand) : '?'}
                 </div>
                 <div className="flex -space-x-12">
                    {dealerHand.map((c, i) => (
                        <div key={i} className="transform transition-transform hover:-translate-y-4">
                           <CardView card={c} hidden={i === 0 && gameState === 'PLAYER_TURN'} />
                        </div>
                    ))}
                 </div>
             </div>

             {/* Center Logo */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-32 border-2 border-white/10 rounded-full flex items-center justify-center transform -rotate-6">
                     <span className="text-4xl font-black text-white/10 uppercase">Blackjack</span>
                 </div>
                 <div className="absolute mt-20 text-xs text-white/20 font-bold uppercase tracking-[0.3em]">
                     Pays 3 to 2
                 </div>
             </div>

             {/* Player Area */}
             <div className="flex flex-col items-center relative z-10">
                 <div className="flex -space-x-12 mb-6">
                    {playerHand.map((c, i) => (
                        <div key={i} className="transform transition-transform hover:-translate-y-4">
                           <CardView card={c} />
                        </div>
                    ))}
                 </div>
                 <div className="bg-emerald-500 text-casino-900 px-6 py-2 rounded-full font-black text-xl shadow-lg border-2 border-emerald-300">
                    {getHandValue(playerHand)}
                 </div>
             </div>
         </div>
      </div>
    </Layout>
  );
}
