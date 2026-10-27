import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Hand, Plus, ChevronsUp, ShieldAlert } from 'lucide-react';

interface Card {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const RANKS = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 },
];

function handScore(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + c.value, 0);
  let aces = hand.filter((c) => c.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export const Blackjack: React.FC = () => {
  const [bet, setBet] = useState<number>(200);
  const [lockedStake, setLockedStake] = useState<number>(200);
  const [status, setStatus] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([
    { rank: 'A', suit: '♠', value: 11 },
    { rank: 'K', suit: '♦', value: 10 },
  ]);
  const [dealerHand, setDealerHand] = useState<Card[]>([
    { rank: '10', suit: '♥', value: 10 },
    { rank: '9', suit: '♣', value: 9 },
  ]);
  const [insuranceTaken, setInsuranceTaken] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [payout, setPayout] = useState<number>(0);

  /**
   * Deterministic 52-card Fisher-Yates shoe shuffle driven by HMAC-SHA256 floats
   */
  const buildDeterministicShoe = (): Card[] => {
    const d: Card[] = [];
    SUITS.forEach((suit) => {
      RANKS.forEach((rk) => d.push({ ...rk, suit }));
    });
    const floats = gameEngine.getNextFloats(52);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(floats[i] * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  };

  const deal = () => {
    if (!gameEngine.deductStake(bet)) return;

    sound.card();
    const shoe = buildDeterministicShoe();
    const p = [shoe[0], shoe[2]];
    const d = [shoe[1], shoe[3]];
    const rest = shoe.slice(4);

    setLockedStake(bet);
    setInsuranceTaken(false);
    setPlayerHand(p);
    setDealerHand(d);
    setDeck(rest);
    setPayout(0);
    setMessage('');

    const pTotal = handScore(p);
    const dTotal = handScore(d);

    if (pTotal === 21) {
      setStatus('ENDED');
      if (dTotal === 21) {
        gameEngine.settleDeductedBet('Blackjack 21', bet, 1.0, 'Push — Both Blackjack (21)');
        setMessage('Push — Both Blackjack (21)');
        setPayout(bet);
      } else {
        sound.win();
        gameEngine.settleDeductedBet('Blackjack 21', bet, 2.5, 'Natural Blackjack (3:2)');
        setMessage('Natural Blackjack! Pays 3:2 (2.5×)');
        setPayout(Math.floor(bet * 2.5));
      }
    } else {
      setStatus('PLAYING');
    }
  };

  const buyInsurance = () => {
    if (status !== 'PLAYING' || insuranceTaken || dealerHand[0]?.rank !== 'A') return;
    const insCost = Math.floor(lockedStake / 2);
    if (!gameEngine.deductStake(insCost)) return;
    sound.click();
    setInsuranceTaken(true);
  };

  const hit = () => {
    if (status !== 'PLAYING' || deck.length === 0) return;
    sound.card();
    const nextCard = deck[0];
    const nextHand = [...playerHand, nextCard];
    setPlayerHand(nextHand);
    setDeck(deck.slice(1));

    const score = handScore(nextHand);
    if (score > 21) {
      sound.lose();
      setStatus('ENDED');
      setMessage(`Bust! Hand Total ${score}`);
      gameEngine.settleDeductedBet('Blackjack 21', lockedStake, 0, `Player Bust (${score})`);
    } else if (score === 21) {
      standWithHand(nextHand, deck.slice(1), lockedStake);
    }
  };

  const standWithHand = (pHand: Card[], currentDeck: Card[], activeBet: number) => {
    sound.card();
    let dHand = [...dealerHand];
    let idx = 0;
    while (handScore(dHand) < 17 && idx < currentDeck.length) {
      dHand.push(currentDeck[idx]);
      idx++;
    }
    setDealerHand(dHand);
    setStatus('ENDED');

    const pScore = handScore(pHand);
    const dScore = handScore(dHand);
    const dealerHasNaturalBJ = dHand.length === 2 && dScore === 21;

    if (insuranceTaken && dealerHasNaturalBJ) {
      // Insurance 2:1 pays back full original stake
      sound.win();
      setPayout(activeBet * 1.5);
      setMessage('Dealer Blackjack — Insurance Paid 2:1!');
      gameEngine.settleDeductedBet('Blackjack 21', activeBet, 1.5, 'Insurance Paid 2:1');
      return;
    }

    if (dScore > 21 || pScore > dScore) {
      sound.win();
      const winAmt = activeBet * 2;
      setPayout(winAmt);
      setMessage(
        dScore > 21
          ? `Dealer Busts (${dScore}) — You Win!`
          : `You Win (${pScore} vs ${dScore})!`
      );
      gameEngine.settleDeductedBet('Blackjack 21', activeBet, 2.0, `Player Won (${pScore} vs ${dScore})`);
    } else if (pScore === dScore) {
      setPayout(activeBet);
      setMessage(`Push (${pScore} Tie) — Stake Returned`);
      gameEngine.settleDeductedBet('Blackjack 21', activeBet, 1.0, `Push (${pScore})`);
    } else {
      sound.lose();
      setPayout(0);
      setMessage(`Dealer Wins (${dScore} vs ${pScore})`);
      gameEngine.settleDeductedBet('Blackjack 21', activeBet, 0, `Dealer Won (${dScore} vs ${pScore})`);
    }
  };

  const doubleDown = () => {
    if (status !== 'PLAYING' || playerHand.length !== 2) return;
    if (!gameEngine.deductStake(lockedStake)) return;

    const doubledStake = lockedStake * 2;
    setLockedStake(doubledStake);
    const nextCard = deck[0];
    const nextHand = [...playerHand, nextCard];
    setPlayerHand(nextHand);

    const score = handScore(nextHand);
    if (score > 21) {
      sound.lose();
      setStatus('ENDED');
      setMessage(`Bust on Double Down (${score})!`);
      gameEngine.settleDeductedBet('Blackjack 21', doubledStake, 0, `Double Down Bust (${score})`);
    } else {
      standWithHand(nextHand, deck.slice(1), doubledStake);
    }
  };

  const renderCard = (c: Card, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-amber-500/60 shadow-xl flex items-center justify-center">
          <span className="text-2xl">♠</span>
        </div>
      );
    }
    const isRed = c.suit === '♥' || c.suit === '♦';
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white border-2 border-slate-200 shadow-xl p-2.5 flex flex-col justify-between select-none">
        <div className={`text-sm sm:text-base font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          <div>{c.rank}</div>
          <div>{c.suit}</div>
        </div>
        <div className={`text-2xl sm:text-3xl self-center ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.suit}
        </div>
        <div className={`text-xs font-bold self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.rank}
        </div>
      </div>
    );
  };

  const pTotal = handScore(playerHand);
  const dTotal = status === 'PLAYING' ? dealerHand[0]?.value || 0 : handScore(dealerHand);
  const canBuyInsurance =
    status === 'PLAYING' && playerHand.length === 2 && dealerHand[0]?.rank === 'A' && !insuranceTaken;

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-slate-300">
              {status === 'PLAYING'
                ? `Active Stake: ₹${lockedStake.toLocaleString('en-IN')}`
                : `₹${bet.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={status === 'PLAYING'}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                disabled={status === 'PLAYING'}
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50"
              >
                ½
              </button>
              <button
                disabled={status === 'PLAYING'}
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                disabled={status === 'PLAYING'}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300 disabled:opacity-40"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-first lg:order-none space-y-2.5">
          {status !== 'PLAYING' ? (
            <button
              onClick={deal}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
            >
              Deal Hand (₹{bet.toLocaleString('en-IN')})
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={hit}
                className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-lg"
              >
                <Plus className="w-4 h-4" /> Hit
              </button>
              <button
                onClick={() => standWithHand(playerHand, deck, lockedStake)}
                className="py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-lg"
              >
                <Hand className="w-4 h-4" /> Stand
              </button>
              <button
                onClick={doubleDown}
                disabled={playerHand.length !== 2}
                className="col-span-2 py-3 bg-[#1e2b42] hover:bg-[#283956] disabled:opacity-40 text-white font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 text-xs border border-white/10"
              >
                <ChevronsUp className="w-4 h-4 text-amber-400" /> Double Down (+₹{lockedStake.toLocaleString('en-IN')})
              </button>
              {canBuyInsurance && (
                <button
                  onClick={buyInsurance}
                  className="col-span-2 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 text-xs border border-amber-500/40"
                >
                  <ShieldAlert className="w-4 h-4" /> Buy 2:1 Insurance (₹{Math.floor(lockedStake / 2).toLocaleString('en-IN')})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table Rules */}
        <div className="bg-[#151f30] rounded-xl border border-white/10 p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            VIP Table Rules
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Blackjack Pays</span>
            <span className="font-mono font-bold text-white">3 to 2 (2.5×)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dealer Stands On</span>
            <span className="font-mono font-bold text-white">All 17s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Insurance Pays</span>
            <span className="font-mono font-bold text-white">2 to 1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Theoretical RTP</span>
            <span className="font-mono font-bold text-emerald-400">99.5%</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HMAC-SHA256 Fisher-Yates Shoe
          </span>
        </div>
      </div>

      {/* Main Blackjack Table Stage */}
      <div className="flex-1 felt-surface p-6 sm:p-8 flex flex-col items-center justify-between relative">
        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dealer Hand
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10 font-mono font-bold text-xs text-white">
              {dTotal}
            </span>
          </div>
          <div className="flex gap-3">
            {dealerHand.map((c, idx) => (
              <div key={idx}>{renderCard(c, status === 'PLAYING' && idx === 1)}</div>
            ))}
          </div>
        </div>

        {/* Center Status Pill */}
        <div className="my-4 h-16 flex items-center justify-center">
          {message ? (
            <div
              className={`px-6 py-3 rounded-2xl border-2 text-center shadow-xl ${
                payout > lockedStake
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                  : payout === lockedStake
                  ? 'bg-slate-900/90 border-amber-400 text-amber-300'
                  : 'bg-rose-950/90 border-rose-500/80 text-rose-200'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">{message}</div>
              {payout > 0 && (
                <div className="text-lg font-mono font-black text-white">
                  Payout: ₹{payout.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-2 rounded-full bg-black/35 border border-white/10 text-xs font-semibold text-slate-300">
              BLACKJACK PAYS 3 TO 2 · DEALER MUST STAND ON 17 · INSURANCE PAYS 2 TO 1
            </div>
          )}
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            {playerHand.map((c, idx) => (
              <div key={idx}>{renderCard(c)}</div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Your Hand
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 font-mono font-bold text-xs text-amber-300">
              {pTotal}
            </span>
            {insuranceTaken && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                Insured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};