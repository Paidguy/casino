import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface Card {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];

type CardRangeSideBet = 'NONE' | '1_5' | '6_15' | '16_25' | '26_PLUS';

const RANGE_OPTIONS: { id: CardRangeSideBet; label: string; mult: number }[] = [
  { id: 'NONE', label: 'Off', mult: 0 },
  { id: '1_5', label: '1–5 Cards (3.5×)', mult: 3.5 },
  { id: '6_15', label: '6–15 Cards (2.5×)', mult: 2.5 },
  { id: '16_25', label: '16–25 Cards (4.5×)', mult: 4.5 },
  { id: '26_PLUS', label: '26+ Cards (8.0×)', mult: 8.0 },
];

export const AndarBahar: React.FC = () => {
  const [bet, setBet] = useState<number>(200);
  const [side, setSide] = useState<'ANDAR' | 'BAHAR'>('ANDAR');
  const [rangeBet, setRangeBet] = useState<CardRangeSideBet>('NONE');
  const [dealing, setDealing] = useState<boolean>(false);
  const [joker, setJoker] = useState<Card>({ rank: 'K', suit: '♠' });
  const [andarPile, setAndarPile] = useState<Card[]>([
    { rank: '7', suit: '♥' },
    { rank: 'K', suit: '♦' },
  ]);
  const [baharPile, setBaharPile] = useState<Card[]>([{ rank: '10', suit: '♣' }]);
  const [resultInfo, setResultInfo] = useState<{
    winningSide: 'ANDAR' | 'BAHAR';
    cardsDealt: number;
    payout: number;
    rangeWon: boolean;
  } | null>(null);

  const sideStake = rangeBet !== 'NONE' ? Math.floor(bet * 0.25) : 0;
  const totalWager = bet + sideStake;

  const startDeal = () => {
    const state = gameEngine.getState();
    if (dealing || totalWager <= 0 || totalWager > state.balance) return;

    sound.card();
    setDealing(true);
    setResultInfo(null);
    setAndarPile([]);
    setBaharPile([]);

    // Build and shuffle a real 52-card deck deterministically using HMAC-SHA256 floats
    const deck: Card[] = [];
    SUITS.forEach((s) => {
      RANKS.forEach((r) => deck.push({ rank: r, suit: s }));
    });
    const floats = gameEngine.getNextFloats(52);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(floats[i] * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const jokerCard = deck[0];
    setJoker(jokerCard);

    const sequence: { side: 'ANDAR' | 'BAHAR'; card: Card }[] = [];
    let turn: 'ANDAR' | 'BAHAR' = 'ANDAR';
    for (let i = 1; i < deck.length; i++) {
      const c = deck[i];
      sequence.push({ side: turn, card: c });
      if (c.rank === jokerCard.rank) {
        break;
      }
      turn = turn === 'ANDAR' ? 'BAHAR' : 'ANDAR';
    }

    const stepDelay = Math.max(55, Math.min(140, Math.floor(900 / sequence.length)));

    sequence.forEach((step, idx) => {
      setTimeout(() => {
        sound.card();
        if (step.side === 'ANDAR') {
          setAndarPile((prev) => [...prev, step.card]);
        } else {
          setBaharPile((prev) => [...prev, step.card]);
        }

        if (idx === sequence.length - 1) {
          const winningSide = step.side;
          const cardsDealt = sequence.length;
          const mainWin = winningSide === side;
          const baseMult = winningSide === 'ANDAR' ? 1.9 : 2.0;
          let totalReturn = mainWin ? Math.floor(bet * baseMult) : 0;

          let rangeWon = false;
          if (rangeBet !== 'NONE') {
            const matchedRange =
              (rangeBet === '1_5' && cardsDealt <= 5) ||
              (rangeBet === '6_15' && cardsDealt >= 6 && cardsDealt <= 15) ||
              (rangeBet === '16_25' && cardsDealt >= 16 && cardsDealt <= 25) ||
              (rangeBet === '26_PLUS' && cardsDealt >= 26);

            if (matchedRange) {
              const rOpt = RANGE_OPTIONS.find((o) => o.id === rangeBet);
              totalReturn += Math.floor(sideStake * (rOpt?.mult || 0));
              rangeWon = true;
            }
          }

          const effectiveMult = Number((totalReturn / totalWager).toFixed(2));
          gameEngine.placeBet(
            'Andar Bahar Live',
            totalWager,
            effectiveMult,
            `${winningSide} on Card #${cardsDealt}`
          );

          if (totalReturn > 0) sound.win();
          else sound.lose();

          setResultInfo({
            winningSide,
            cardsDealt,
            payout: totalReturn,
            rangeWon,
          });
          setDealing(false);
        }
      }, (idx + 1) * stepDelay);
    });
  };

  const renderCard = (c: Card, highlight = false) => {
    const isRed = c.suit === '♥' || c.suit === '♦';
    return (
      <div
        className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 p-2 flex flex-col justify-between shadow-lg shrink-0 ${
          highlight ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-200'
        }`}
      >
        <div className={`text-xs sm:text-sm font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          <div>{c.rank}</div>
          <div>{c.suit}</div>
        </div>
        <div className={`text-xl sm:text-2xl self-center ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.suit}
        </div>
        <div className={`text-[10px] font-bold self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {c.rank}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Side Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Choose Winning Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide('ANDAR')}
              disabled={dealing}
              className={`p-3 rounded-xl border text-left transition-all ${
                side === 'ANDAR'
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow'
                  : 'bg-[#151f30] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider text-sky-400">
                Inside (Andar)
              </div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">1.90× Payout</div>
            </button>
            <button
              onClick={() => setSide('BAHAR')}
              disabled={dealing}
              className={`p-3 rounded-xl border text-left transition-all ${
                side === 'BAHAR'
                  ? 'bg-rose-500/20 border-rose-400 text-white shadow'
                  : 'bg-[#151f30] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider text-rose-400">
                Outside (Bahar)
              </div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">2.00× Payout</div>
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Main Bet (₹)</span>
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
        </div>

        {/* Total Cards Dealt Range Side Bet */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cards Dealt Side Bet (+25% Stake)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRangeBet(opt.id)}
                disabled={dealing}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                  rangeBet === opt.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-[#151f30] border-white/10 text-slate-400 hover:text-white'
                } ${opt.id === 'NONE' ? 'col-span-2' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="order-first lg:order-none">
          <button
            onClick={startDeal}
            disabled={dealing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-[0.99] text-sm"
          >
            {dealing
              ? 'Dealing 52-Card Shoe...'
              : `Deal Cards (₹${totalWager.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HMAC-SHA256 52-Card Shoe
          </span>
        </div>
      </div>

      {/* Main Andar Bahar Table Stage */}
      <div className="flex-1 felt-surface p-6 sm:p-8 flex flex-col justify-between gap-6">
        {/* Top Target Card (Joker) Showcase */}
        <div className="bg-[#0b111e]/85 border border-white/10 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {renderCard(joker, true)}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Target Card (Joker Rank: {joker.rank})
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                First side dealt a <span className="text-amber-400">"{joker.rank}"</span> wins the round
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Cards alternate starting with Inside (Andar), then Outside (Bahar)
              </div>
            </div>
          </div>

          {resultInfo && (
            <div
              className={`px-5 py-3 rounded-xl border text-center ${
                resultInfo.payout > 0
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <div className="text-xs font-bold uppercase">
                {resultInfo.winningSide} Matched on Card #{resultInfo.cardsDealt}
                {resultInfo.rangeWon ? ' · Range Bonus Hit!' : ''}
              </div>
              <div className="text-xl font-mono font-black">
                {resultInfo.payout > 0
                  ? `Won +₹${resultInfo.payout.toLocaleString('en-IN')}`
                  : 'No Win'}
              </div>
            </div>
          )}
        </div>

        {/* Two Dealing Lanes: Inside (Andar) & Outside (Bahar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
          {/* Andar Lane */}
          <div
            className={`p-5 rounded-2xl border-2 transition-all min-h-[210px] flex flex-col justify-between ${
              side === 'ANDAR'
                ? 'bg-sky-950/35 border-sky-400/70 shadow-[0_0_25px_rgba(56,189,248,0.15)]'
                : 'bg-[#0b111e]/75 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-black uppercase tracking-wider text-sky-400">
                  Inside — Andar ({andarPile.length})
                </span>
                <span className="ml-2 text-xs font-mono text-slate-400">1.90×</span>
              </div>
              {side === 'ANDAR' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                  Your Pick
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              {andarPile.length === 0 ? (
                <div className="text-xs text-slate-500 italic">Waiting for deal...</div>
              ) : (
                andarPile.slice(-6).map((c, idx) => (
                  <div key={idx}>{renderCard(c, c.rank === joker.rank)}</div>
                ))
              )}
            </div>
          </div>

          {/* Bahar Lane */}
          <div
            className={`p-5 rounded-2xl border-2 transition-all min-h-[210px] flex flex-col justify-between ${
              side === 'BAHAR'
                ? 'bg-rose-950/35 border-rose-400/70 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                : 'bg-[#0b111e]/75 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-black uppercase tracking-wider text-rose-400">
                  Outside — Bahar ({baharPile.length})
                </span>
                <span className="ml-2 text-xs font-mono text-slate-400">2.00×</span>
              </div>
              {side === 'BAHAR' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40">
                  Your Pick
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              {baharPile.length === 0 ? (
                <div className="text-xs text-slate-500 italic">Waiting for deal...</div>
              ) : (
                baharPile.slice(-6).map((c, idx) => (
                  <div key={idx}>{renderCard(c, c.rank === joker.rank)}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
