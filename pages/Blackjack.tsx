import React, { useState, useEffect, useRef } from 'react';
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
  
  const canDouble = gameState === 'PLAYER_TURN' && playerHand.length === 2;
  const [deck, setDeck] = useState<Card[]>([]);
  const mounted = useRef<boolean>(true);

  useEffect(() => {
      mounted.current = true;
      return () => { mounted.current = false; };
  }, []);

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
     if (betAmount > engine.getSession().balance || betAmount <= 0) return;
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
         setTimeout(() => {
             if (!mounted.current) return;
             if (getHandValue(dealer) === 21) finishGame('PUSH', p, dealer, betAmount);
             else finishGame('BLACKJACK', p, dealer, betAmount);
         }, 500);
     }
  };

  const hit = () => {
     if (gameState !== 'PLAYER_TURN') return;
     audio.playClick();
     const newHand = [...playerHand, deck.pop()!];
     setPlayerHand(newHand);
     if (getHandValue(newHand) > 21) {
         finishGame('BUST', newHand, dealerHand, betAmount);
     }
  };

  const doubleDown = () => {
     if (gameState !== 'PLAYER_TURN') return;
     if (betAmount > engine.getSession().balance) return;
     audio.playBet();
     engine.updateBalance(-betAmount);
     const doubleBet = betAmount * 2;
     
     const newHand = [...playerHand, deck.pop()!];
     setPlayerHand(newHand);
     
     if (getHandValue(newHand) > 21) {
         finishGame('BUST', newHand, dealerHand, doubleBet);
     } else {
         stand(newHand, doubleBet);
     }
  };

  const stand = (finalHand = playerHand, finalBet = betAmount) => {
     if (gameState !== 'PLAYER_TURN') return;
     audio.playClick();
     setGameState('DEALER_TURN');
     
     let dHand = [...dealerHand];
     // Async loop for dealer draw
     const playDealer = async () => {
         await new Promise(r => setTimeout(r, 800)); 
         
         while (getHandValue(dHand) < 17) {
             if (!mounted.current) return;
             dHand.push(deck.pop()!);
             setDealerHand([...dHand]);
             audio.playSpin(); 
             await new Promise(r => setTimeout(r, 800)); 
         }
         if (mounted.current) determineWinner(finalHand, dHand, finalBet);
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
      
      if (result === 'BLACKJACK') { mult = 2.5; txt = 'BLACKJACK!'; }
      else if (result === 'WIN' || result === 'DEALER_BUST') { mult = 2; txt = 'WIN!'; }
      else if (result === 'PUSH') { mult = 1; txt = 'PUSH'; }
      else { mult = 0; txt = 'HOUSE WINS'; }
      
      setMessage(txt);
      if (mult >= 1) audio.playWin(); else audio.playLoss();
      if (mult > 0) engine.updateBalance(finalBet * mult);
      engine.placeBet(GameType.BLACKJACK, finalBet, mult, `BJ: ${txt}`);
  };

  const CardView: React.FC<{ card: Card, hidden?: boolean }> = ({ card, hidden }) => (
     <div className={`w-16 h-24 sm:w-20 sm:h-32 lg:w-28 lg:h-44 bg-white rounded-lg sm:rounded-2xl shadow-2xl border border-slate-300 flex flex-col items-center justify-center relative select-none transform transition-transform hover:-translate-y-4 duration-300 ${hidden ? 'bg-bet-800 border-bet-700' : ''}`}>
        {!hidden ? (
            <>
                <div className="absolute top-1 left-2 sm:top-2 sm:left-3 flex flex-col items-center leading-none">
                    <span className={`text-lg sm:text-xl lg:text-2xl font-black ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.value}</span>
                    <span className={`text-lg sm:text-xl lg:text-2xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
                </div>
                <div className={`text-4xl sm:text-6xl lg:text-8xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                    {card.suit}
                </div>
                <div className="absolute bottom-1 right-2 sm:bottom-2 sm:right-3 flex flex-col items-center leading-none rotate-180">
                    <span className={`text-lg sm:text-xl lg:text-2xl font-black ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.value}</span>
                    <span className={`text-lg sm:text-xl lg:text-2xl ${['♥','♦'].includes(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>{card.suit}</span>
                </div>
            </>
        ) : (
            <div className="w-full h-full bg-bet-950 rounded-lg sm:rounded-2xl flex items-center justify-center border-4 border-bet-primary shadow-inner">
               <span className="text-2xl sm:text-4xl lg:text-6xl text-bet-primary font-black bazar-font opacity-40">K</span>
            </div>
        )}
     </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
         <div className="bg-bet-900 p-6 lg:p-8 rounded-[2.5rem] border border-white/10 h-fit shadow-3xl order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Bet Amount (₹)</label>
              <input 
                 type="number" 
                 value={betAmount} 
                 onChange={(e) => setBetAmount(Number(e.target.value))}
                 disabled={gameState !== 'IDLE' && gameState !== 'FINISHED'}
                 className="w-full bg-black border border-white/10 rounded-2xl p-4 lg:p-5 text-white font-mono font-black text-xl lg:text-2xl outline-none"
              />
            </div>
            
            {gameState === 'IDLE' || gameState === 'FINISHED' ? (
                <button 
                   onClick={startGame}
                   disabled={betAmount <= 0}
                   className="w-full py-6 bg-bet-primary text-bet-950 font-black text-2xl rounded-3xl shadow-xl transition-all active:scale-95 uppercase tracking-[0.2em] bazar-font cyan-glow disabled:opacity-50"
                >
                   Deal Cards
                </button>
            ) : gameState === 'PLAYER_TURN' ? (
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={hit} className="py-5 bg-bet-800 text-white font-black rounded-2xl border border-white/10 hover:bg-bet-700">HIT</button>
                   <button onClick={() => stand()} className="py-5 bg-bet-primary text-bet-950 font-black rounded-2xl border border-white/10 active:scale-95">STAND</button>
                   {canDouble && (
                       <button onClick={doubleDown} className="col-span-2 py-5 bg-bet-secondary text-white font-black rounded-2xl shadow-xl animate-pulse">DOUBLE DOWN</button>
                   )}
                </div>
            ) : (
                <div className="py-6 text-center text-slate-500 font-black uppercase tracking-widest animate-pulse">
                    Dealer's Turn...
                </div>
            )}
            
            {message && (
              <div className={`mt-6 p-6 text-center font-black text-2xl lg:text-3xl italic -skew-x-12 uppercase rounded-[2rem] border-4 animate-bounce bazar-font ${message.includes('WIN') || message.includes('BLACKJACK') ? 'bg-bet-primary/20 border-bet-primary text-bet-primary' : message.includes('PUSH') ? 'bg-bet-accent/20 border-bet-accent text-bet-accent' : 'bg-bet-danger/20 border-bet-danger text-bet-danger'}`}>
                {message}
              </div>
            )}
         </div>

         <div className="lg:col-span-2 bg-gradient-to-b from-[#064e3b] to-bet-950 rounded-[2.5rem] lg:rounded-[4rem] border-[8px] lg:border-[12px] border-bet-900 p-6 lg:p-16 min-h-[500px] lg:min-h-[600px] flex flex-col justify-between items-center relative shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] order-1 lg:order-2 overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none"></div>

             <div className="flex flex-col items-center relative z-10">
                 <div className="mb-4 lg:mb-6 bg-black/40 px-4 lg:px-6 py-1.5 rounded-full text-emerald-200/50 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] lg:tracking-[0.5em] backdrop-blur-md">
                    Dealer Hand {gameState === 'FINISHED' ? getHandValue(dealerHand) : '?'}
                 </div>
                 <div className="flex -space-x-8 sm:-space-x-12 lg:-space-x-16">
                    {dealerHand.length > 0 ? dealerHand.map((c, i) => (
                        <div key={i} className="transform transition-transform hover:-translate-y-4">
                           <CardView card={c} hidden={i === 0 && gameState === 'PLAYER_TURN'} />
                        </div>
                    )) : Array(2).fill(null).map((_, i) => <CardView key={i} card={{} as Card} hidden />)}
                 </div>
             </div>

             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                 <div className="w-60 h-30 lg:w-80 lg:h-40 border-4 border-white rounded-full flex items-center justify-center transform -rotate-12">
                     <span className="text-4xl lg:text-6xl font-black text-white uppercase bazar-font">SATTA KING</span>
                 </div>
             </div>

             <div className="flex flex-col items-center relative z-10 mt-12">
                 <div className="flex -space-x-8 sm:-space-x-12 lg:-space-x-16 mb-6 lg:mb-8">
                    {playerHand.length > 0 ? playerHand.map((c, i) => (
                        <div key={i} className="transform transition-transform hover:-translate-y-4">
                           <CardView card={c} />
                        </div>
                    )) : Array(2).fill(null).map((_, i) => <CardView key={i} card={{} as Card} hidden />)}
                 </div>
                 {playerHand.length > 0 && (
                   <div className="bg-bet-primary text-bet-950 px-6 lg:px-8 py-2 lg:py-3 rounded-full font-black text-xl lg:text-3xl shadow-xl border-4 border-white/20 bazar-font">
                      {getHandValue(playerHand)}
                   </div>
                 )}
             </div>
         </div>
      </div>
    </Layout>
  );
}