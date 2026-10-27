import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';

interface Card {
  rank: number;
  label: string;
  suit: '♠' | '♥' | '♦' | '♣';
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const RANKS = [
  { rank: 2, label: '2' },
  { rank: 3, label: '3' },
  { rank: 4, label: '4' },
  { rank: 5, label: '5' },
  { rank: 6, label: '6' },
  { rank: 7, label: '7' },
  { rank: 8, label: '8' },
  { rank: 9, label: '9' },
  { rank: 10, label: '10' },
  { rank: 11, label: 'J' },
  { rank: 12, label: 'Q' },
  { rank: 13, label: 'K' },
  { rank: 14, label: 'A' },
];

function evaluateHand(hand: Card[]): { score: number; name: string; bonusMult: number } {
  const sorted = [...hand].sort((a, b) => b.rank - a.rank);
  const r = sorted.map((c) => c.rank);
  const isFlush = hand[0].suit === hand[1].suit && hand[1].suit === hand[2].suit;
  const isStraight =
    (r[0] - r[1] === 1 && r[1] - r[2] === 1) ||
    (r[0] === 14 && r[1] === 3 && r[2] === 2);

  if (r[0] === r[1] && r[1] === r[2]) {
    return { score: 600 + r[0], name: 'Three of a Kind (Trail)', bonusMult: 5.0 };
  }
  if (isFlush && isStraight) {
    return { score: 500 + r[0], name: 'Straight Flush (Pure Sequence)', bonusMult: 4.0 };
  }
  if (isStraight) {
    return { score: 400 + r[0], name: 'Straight (Sequence)', bonusMult: 3.0 };
  }
  if (isFlush) {
    return { score: 300 + r[0], name: 'Flush (Same Suit)', bonusMult: 2.2 };
  }
  if (r[0] === r[1] || r[1] === r[2]) {
    const pairRank = r[1];
    return { score: 200 + pairRank, name: 'Pair', bonusMult: 1.95 };
  }
  return { score: 100 + r[0] + r[1] * 0.1, name: `${sorted[0].label} High Card`, bonusMult: 1.95 };
}

export const TeenPatti: React.FC = () => {
  const [bet, setBet] = useState<number>(200);
  const [playStyle, setPlayStyle] = useState<'SEEN' | 'BLIND'>('SEEN');
  const [dealing, setDealing] = useState(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([
    { rank: 14, label: 'A', suit: '♠' },
    { rank: 13, label: 'K', suit: '♠' },
    { rank: 12, label: 'Q', suit: '♠' },
  ]);
  const [dealerHand, setDealerHand] = useState<Card[]>([
    { rank: 11, label: 'J', suit: '♥' },
    { rank: 11, label: 'J', suit: '♦' },
    { rank: 9, label: '9', suit: '♣' },
  ]);
  const [outcome, setOutcome] = useState<{
    won: boolean;
    payout: number;
    mult: number;
    playerTitle: string;
    dealerTitle: string;
  } | null>(null);

  const dealHand = () => {
    const state = gameEngine.getState();
    if (dealing || bet <= 0 || bet > state.balance) return;

    sound.card();
    setDealing(true);
    setOutcome(null);

    const deck: Card[] = [];
    SUITS.forEach((s) => {
      RANKS.forEach((rk) => deck.push({ ...rk, suit: s }));
    });

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const pHand = [deck[0], deck[1], deck[2]];
    const dHand = [deck[3], deck[4], deck[5]];

    setTimeout(() => {
      setPlayerHand(pHand);
      setDealerHand(dHand);

      const pEval = evaluateHand(pHand);
      const dEval = evaluateHand(dHand);
      const won = pEval.score >= dEval.score;

      let baseMult = playStyle === 'BLIND' ? 2.1 : 1.95;
      const finalMult = won ? Math.max(baseMult, pEval.bonusMult) : 0;
      const payout = Math.floor(bet * finalMult);

      gameEngine.placeBet('Teen Patti Royal', bet, finalMult);
      if (won) sound.win();
      else sound.lose();

      setOutcome({
        won,
        payout,
        mult: finalMult,
        playerTitle: pEval.name,
        dealerTitle: dEval.name,
      });
      setDealing(false);
    }, 550);
  };

  const renderCard = (c: Card, hidden = false) => {
    const isRed = c.suit === '♥' || c.suit === '♦';
    if (hidden) {
      return (
        <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 border-2 border-amber-400/80 shadow-xl flex items-center justify-center">
          <div className="w-12 h-16 rounded-lg border border-amber-300/40 flex items-center justify-center text-amber-300 font-black text-lg">
            👑
          </div>
        </div>
      );
    }
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white border-2 border-slate-200 shadow-xl p-2.5 flex flex-col justify-between select-none">
        <div className={`text-sm sm:text-base font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          <div>{c.label}</div>
          <div>{c.suit}</div>
        </div>
        <div className={`text-2xl sm:text-3xl self-center ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.suit}
        </div>
        <div className={`text-xs font-bold self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.label}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Seen vs Blind Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Hand Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#151f30] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setPlayStyle('SEEN')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                playStyle === 'SEEN'
                  ? 'bg-[#22304a] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" /> Seen (1.95×)
            </button>
            <button
              onClick={() => setPlayStyle('BLIND')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                playStyle === 'BLIND'
                  ? 'bg-[#22304a] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> Blind (2.10×)
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-slate-300">₹{bet.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={dealing}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300"
              >
                ½
              </button>
              <button
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300"
              >
                2×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Bonus Payout Table */}
        <div className="bg-[#151f30] rounded-xl border border-white/10 p-3.5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Winning Hand Multipliers
          </div>
          {[
            { name: 'Three of a Kind (Trail)', mult: '5.00×' },
            { name: 'Straight Flush', mult: '4.00×' },
            { name: 'Straight (Sequence)', mult: '3.00×' },
            { name: 'Flush (Same Suit)', mult: '2.20×' },
            { name: 'Pair / High Card (Blind)', mult: '2.10×' },
            { name: 'Pair / High Card (Seen)', mult: '1.95×' },
          ].map((row) => (
            <div key={row.name} className="flex justify-between text-xs">
              <span className="text-slate-300">{row.name}</span>
              <span className="font-mono font-bold text-emerald-400">{row.mult}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={dealHand}
            disabled={dealing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {dealing
              ? 'Dealing 3 Cards...'
              : `Deal ${playStyle === 'BLIND' ? 'Blind' : 'Seen'} Hand (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Standard 52-Card Deck
          </span>
          <span className="font-mono text-slate-500">3-Card Poker</span>
        </div>
      </div>

      {/* Main Teen Patti Table Stage */}
      <div className="flex-1 felt-surface p-6 sm:p-8 flex flex-col items-center justify-between relative">
        {/* Dealer Hand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dealer Hand
            </span>
            {outcome && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black/40 text-slate-200 border border-white/10">
                {outcome.dealerTitle}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {dealerHand.map((card, i) => (
              <div key={i}>{renderCard(card, dealing)}</div>
            ))}
          </div>
        </div>

        {/* Center Result Banner */}
        <div className="my-4 h-16 flex items-center justify-center">
          {outcome ? (
            <div
              className={`px-6 py-3 rounded-2xl border-2 text-center shadow-2xl ${
                outcome.won
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                  : 'bg-rose-950/90 border-rose-500/70 text-rose-200'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-widest">
                {outcome.won ? `You Win (${outcome.mult.toFixed(2)}×)` : 'Dealer Wins Hand'}
              </div>
              <div className="text-xl font-mono font-black text-white">
                {outcome.won
                  ? `+₹${outcome.payout.toLocaleString('en-IN')}`
                  : `-₹${bet.toLocaleString('en-IN')}`}
              </div>
            </div>
          ) : (
            <div className="px-5 py-2 rounded-full bg-black/35 border border-white/10 text-xs font-semibold text-slate-300">
              Beat the Dealer's 3-card hand to win up to 5× your bet
            </div>
          )}
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            {playerHand.map((card, i) => (
              <div key={i}>{renderCard(card, dealing && playStyle === 'BLIND')}</div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Your Hand ({playStyle})
            </span>
            {outcome && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {outcome.playerTitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};