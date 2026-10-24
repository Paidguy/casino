import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

type TCard = { suit: '♠' | '♥' | '♦' | '♣'; label: string; rank: number };

const evaluateTeenPattiHand = (cards: TCard[]): { name: string; score: number } => {
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const r0 = sorted[0].rank;
  const r1 = sorted[1].rank;
  const r2 = sorted[2].rank;

  const isFlush = sorted[0].suit === sorted[1].suit && sorted[1].suit === sorted[2].suit;
  const isStraight =
    (r0 - r1 === 1 && r1 - r2 === 1) || (r0 === 14 && r1 === 3 && r2 === 2);

  if (r0 === r1 && r1 === r2) {
    return { name: 'Trail (Three of a Kind)', score: 60000 + r0 };
  }
  if (isFlush && isStraight) {
    return { name: 'Pure Sequence (Pakki Rung)', score: 50000 + r0 };
  }
  if (isStraight) {
    return { name: 'Sequence (Rung)', score: 40000 + r0 };
  }
  if (isFlush) {
    return { name: 'Color (Flush)', score: 30000 + r0 * 100 + r1 * 10 + r2 };
  }
  if (r0 === r1 || r1 === r2) {
    const pairRank = r1;
    const kicker = r0 === r1 ? r2 : r0;
    return { name: 'Joot (Pair)', score: 20000 + pairRank * 20 + kicker };
  }
  return { name: `${sorted[0].label} High`, score: 10000 + r0 * 200 + r1 * 15 + r2 };
};

const CardView: React.FC<{ card?: TCard; blind?: boolean }> = ({ card, blind }) => {
  if (!card || blind) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-[#131c31] border-2 border-[#f59e0b]/50 flex flex-col items-center justify-center shadow-xl">
        <span className="text-xs font-extrabold text-[#fbbf24]">TEEN PATTI</span>
        {blind && <span className="text-[10px] text-[#10b981] font-mono mt-1">BLIND</span>}
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col justify-between p-2.5 select-none">
      <div className={`text-sm sm:text-base font-extrabold font-mono leading-none ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.label}
        <div>{card.suit}</div>
      </div>
      <div className={`text-3xl sm:text-4xl self-center ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.suit}
      </div>
      <div className={`text-sm sm:text-base font-extrabold font-mono leading-none self-end rotate-180 ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.label}
      </div>
    </div>
  );
};

export default function TeenPatti() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [playStyle, setPlayStyle] = useState<'CHAAL' | 'BLIND'>('CHAAL');
  const [dealing, setDealing] = useState(false);
  const [cardsSeen, setCardsSeen] = useState(true);
  const [playerHand, setPlayerHand] = useState<TCard[]>([]);
  const [dealerHand, setDealerHand] = useState<TCard[]>([]);
  const [result, setResult] = useState<{
    pEval: string;
    dEval: string;
    won: boolean;
    mult: number;
    payout: number;
  } | null>(null);

  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, []);

  const deal = () => {
    if (dealing || betAmount <= 0 || betAmount > engine.getSession().balance) return;
    setDealing(true);
    setResult(null);
    setCardsSeen(playStyle === 'CHAAL');
    audio.playBet();

    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: TCard[] = [];
    for (const s of suits) {
      labels.forEach((l, idx) => {
        deck.push({ suit: s, label: l, rank: idx + 2 });
      });
    }

    const floats = engine.getNextFloats(12);
    for (let i = 0; i < 6; i++) {
      const f = floats[i] ?? Math.random();
      const swapIdx = i + Math.floor(f * (deck.length - i));
      [deck[i], deck[swapIdx]] = [deck[swapIdx], deck[i]];
    }

    const pCards = [deck[0], deck[2], deck[4]];
    const dCards = [deck[1], deck[3], deck[5]];

    const delay = engine.getSession().settings.instantBet ? 150 : 550;

    if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    dealTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.TEENPATTI,
        betAmount,
        () => {
          const pEval = evaluateTeenPattiHand(pCards);
          const dEval = evaluateTeenPattiHand(dCards);
          const won = pEval.score > dEval.score;
          const isTie = pEval.score === dEval.score;

          let mult = 0;
          if (isTie) {
            mult = 1.0;
          } else if (won) {
            if (pEval.score >= 60000) mult = 5.0;
            else if (pEval.score >= 50000) mult = 3.5;
            else mult = playStyle === 'BLIND' ? 2.1 : 1.95;
          }

          setPlayerHand(pCards);
          setDealerHand(dCards);
          setResult({
            pEval: pEval.name,
            dEval: dEval.name,
            won,
            mult,
            payout: +(betAmount * mult).toFixed(2),
          });
          setDealing(false);

          if (won) audio.playWin();
          else audio.playLoss();

          return {
            multiplier: mult,
            outcome: `Teen Patti (${playStyle}): ${pEval.name} vs ${dEval.name}`,
          };
        },
        ''
      );
    }, delay);
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          {/* Left Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Seen Chaal vs Blind Mode */}
              <div className="grid grid-cols-2 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => setPlayStyle('CHAAL')}
                  disabled={dealing}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    playStyle === 'CHAAL' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Seen Chaal (1.95×)
                </button>
                <button
                  type="button"
                  onClick={() => setPlayStyle('BLIND')}
                  disabled={dealing}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    playStyle === 'BLIND' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Blind Show (2.10×)
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Boot / Chaal Stake (INR)</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(betAmount)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={dealing}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, +(betAmount / 2).toFixed(0)))}
                    disabled={dealing}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(+(betAmount * 2).toFixed(0))}
                    disabled={dealing}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    2×
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[100, 500, 1000, 5000].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setBetAmount(chip)}
                      disabled={dealing}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1d2a47] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={deal}
                disabled={dealing || betAmount <= 0}
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center"
              >
                {dealing
                  ? 'Dealing 3 Cards...'
                  : `${playStyle === 'BLIND' ? 'Play Blind Show' : 'Deal Chaal Hand'} (${formatINR(betAmount, 0)})`}
              </button>

              <div className="p-3.5 bg-[#070b14] rounded-xl border border-[#24324f] text-xs text-[#94a3b8] space-y-1.5">
                <div className="font-bold text-[#fbbf24] mb-1">Teen Patti Royal Bhav</div>
                <div className="flex justify-between">
                  <span>Seen Chaal Win</span>
                  <span className="font-mono text-white">1.95×</span>
                </div>
                <div className="flex justify-between">
                  <span>Blind Show Win</span>
                  <span className="font-mono text-[#10b981] font-bold">2.10×</span>
                </div>
                <div className="flex justify-between">
                  <span>Pakki Rung (Pure Sequence)</span>
                  <span className="font-mono text-[#fbbf24] font-bold">3.50×</span>
                </div>
                <div className="flex justify-between">
                  <span>Trail (Three of a Kind)</span>
                  <span className="font-mono text-[#fbbf24] font-bold">5.00×</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>97.5% RTP · Desi Cards</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Fairness
              </Link>
            </div>
          </div>

          {/* Right Teen Patti Royal Felt Stage */}
          <div className="flex-1 flex flex-col justify-between items-center p-5 sm:p-10 felt-surface">
            {/* Dealer Hand */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/80">Maharaja Dealer</span>
                {result && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#070b14]/80 border border-white/20 text-xs font-bold text-white">
                    {result.dEval}
                  </span>
                )}
              </div>
              <div className="flex gap-2.5 sm:gap-3">
                {dealerHand.length > 0
                  ? dealerHand.map((c, idx) => <CardView key={idx} card={c} />)
                  : [0, 1, 2].map((i) => <CardView key={i} />)}
              </div>
            </div>

            {/* Result Banner */}
            <div className="my-4 min-h-[48px] flex items-center justify-center">
              {result && (
                <div
                  className={`px-4 sm:px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm border shadow-xl text-center ${
                    result.won
                      ? 'bg-[#070b14]/90 border-[#10b981] text-[#10b981]'
                      : 'bg-[#070b14]/90 border-[#f43f5e] text-[#f43f5e]'
                  }`}
                >
                  {result.won
                    ? `YOU WIN WITH ${result.pEval.toUpperCase()}! (+${formatINR(result.payout)})`
                    : `Dealer Wins with ${result.dEval}`}
                </div>
              )}
            </div>

            {/* Player Hand */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex gap-2.5 sm:gap-3">
                {playerHand.length > 0
                  ? playerHand.map((c, idx) => (
                      <CardView key={idx} card={c} blind={!cardsSeen && dealing} />
                    ))
                  : [0, 1, 2].map((i) => <CardView key={i} />)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Your Patti Hand</span>
                {result && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#fbbf24] text-xs font-extrabold text-[#070b14]">
                    {result.pEval}
                  </span>
                )}
                {!cardsSeen && playerHand.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCardsSeen(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#070b14] text-[#fbbf24] text-xs font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> See Cards
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}