import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

type BCard = { suit: '♠' | '♥' | '♦' | '♣'; rank: string; val: number };

const CardTile: React.FC<{ card?: BCard }> = ({ card }) => {
  if (!card) {
    return (
      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-[#92400e] via-[#451a03] to-[#1e1b4b] border border-[#f59e0b]/60 flex flex-col items-center justify-center shadow-lg">
        <Crown className="w-3.5 h-3.5 text-[#fbbf24] mb-1" />
        <span className="text-[9px] font-black text-[#fbbf24] tracking-widest">ROYAL</span>
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-[#f59e0b]/40 shadow-lg flex flex-col justify-between p-2 select-none">
      <div className={`text-xs font-extrabold font-mono leading-none ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>
      <div className={`text-2xl self-center ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        {card.suit}
      </div>
      <div className={`text-xs font-extrabold font-mono leading-none self-end rotate-180 ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        {card.rank}
      </div>
    </div>
  );
};

export default function Baccarat() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [betSide, setBetSide] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [dealing, setDealing] = useState(false);
  const [playerCards, setPlayerCards] = useState<BCard[]>([]);
  const [bankerCards, setBankerCards] = useState<BCard[]>([]);
  const [outcome, setOutcome] = useState<{
    pTotal: number;
    bTotal: number;
    winner: 'PLAYER' | 'BANKER' | 'TIE';
    won: boolean;
    payout: number;
  } | null>(null);

  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, []);

  const drawShoe = (): BCard[] => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const floats = engine.getNextFloats(6);
    return floats.map((f, idx) => {
      const s = suits[Math.floor(((f * 13 + idx) % 1) * 4)];
      const rIdx = Math.floor(f * 13);
      const rank = ranks[rIdx];
      const val = rIdx === 0 ? 1 : rIdx >= 9 ? 0 : rIdx + 1;
      return { suit: s, rank, val };
    });
  };

  const deal = () => {
    if (dealing) return;
    const validStake = Math.max(10, betAmount || 100);
    if (betAmount <= 0) setBetAmount(validStake);

    if (engine.getSession().balance < validStake) {
      engine.reloadBalance(Math.max(10000, validStake * 5));
    }

    setDealing(true);
    setOutcome(null);
    audio.playBet();

    const delay = engine.getSession().settings.instantBet ? 150 : 600;

    if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    dealTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.BACCARAT,
        validStake,
        () => {
          const cards = drawShoe();
          const pHand = [cards[0], cards[2]];
          const bHand = [cards[1], cards[3]];

          let pTotal = (pHand[0].val + pHand[1].val) % 10;
          let bTotal = (bHand[0].val + bHand[1].val) % 10;

          const isNatural = pTotal >= 8 || bTotal >= 8;
          if (!isNatural) {
            let playerThirdVal: number | null = null;
            if (pTotal <= 5) {
              const p3 = cards[4];
              pHand.push(p3);
              playerThirdVal = p3.val;
              pTotal = (pTotal + p3.val) % 10;
            }

            if (playerThirdVal === null) {
              if (bTotal <= 5) {
                const b3 = cards[5];
                bHand.push(b3);
                bTotal = (bTotal + b3.val) % 10;
              }
            } else {
              let bankerDraws = false;
              if (bTotal <= 2) bankerDraws = true;
              else if (bTotal === 3 && playerThirdVal !== 8) bankerDraws = true;
              else if (bTotal === 4 && playerThirdVal >= 2 && playerThirdVal <= 7) bankerDraws = true;
              else if (bTotal === 5 && playerThirdVal >= 4 && playerThirdVal <= 7) bankerDraws = true;
              else if (bTotal === 6 && (playerThirdVal === 6 || playerThirdVal === 7)) bankerDraws = true;

              if (bankerDraws) {
                const b3 = cards[5];
                bHand.push(b3);
                bTotal = (bTotal + b3.val) % 10;
              }
            }
          }

          let winner: 'PLAYER' | 'BANKER' | 'TIE' = 'TIE';
          if (pTotal > bTotal) winner = 'PLAYER';
          else if (bTotal > pTotal) winner = 'BANKER';

          let mult = 0;
          if (betSide === winner) {
            mult = winner === 'TIE' ? 9.0 : winner === 'BANKER' ? 1.95 : 2.0;
          } else if (winner === 'TIE' && (betSide === 'PLAYER' || betSide === 'BANKER')) {
            mult = 1.0;
          }

          setPlayerCards(pHand);
          setBankerCards(bHand);
          setOutcome({
            pTotal,
            bTotal,
            winner,
            won: mult > 1,
            payout: +(validStake * mult).toFixed(2),
          });
          setDealing(false);

          if (mult > 1) audio.playWin();
          else if (mult === 1) audio.playClick();
          else audio.playLoss();

          return {
            multiplier: mult,
            outcome: `Baccarat: ${winner} (${pTotal} vs ${bTotal})`,
          };
        },
        ''
      );
    }, delay);
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[560px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action CTA at Top for Mobile Thumb Reach */}
              <button
                type="button"
                onClick={deal}
                disabled={dealing}
                className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
              >
                {dealing ? 'Dealing Shoe...' : `Deal ${betSide} (${formatINR(betAmount, 0)})`}
              </button>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Select Bet Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PLAYER', label: 'Player', odds: '2.00×' },
                    { id: 'TIE', label: 'Tie', odds: '9.00×' },
                    { id: 'BANKER', label: 'Banker', odds: '1.95×' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        setBetSide(pos.id as any);
                        audio.playClick();
                      }}
                      disabled={dealing}
                      className={`py-3 rounded-xl border text-center transition-colors ${
                        betSide === pos.id
                          ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-white'
                          : 'bg-[#070b14] border-[#24324f] text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{pos.label}</div>
                      <div className="text-[11px] font-mono text-[#fbbf24] mt-0.5">{pos.odds}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Bet Amount (₹)</span>
                  <span className="font-mono text-[#fbbf24] tabular-nums">{formatINR(betAmount)}</span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b]/60 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={dealing}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                    disabled={dealing}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={dealing}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
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
                      className="py-1.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#070b14] rounded-xl border border-[#24324f] text-xs text-[#94a3b8] space-y-1.5">
                <div className="flex justify-between">
                  <span>Player / Banker Push on Tie</span>
                  <span className="font-mono font-bold text-[#10b981]">1.00× Refund</span>
                </div>
                <div className="flex justify-between">
                  <span>Third Card Tableau</span>
                  <span className="font-mono text-white">Punto Banco (98.94% RTP)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>Punto Banco VIP</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Baccarat Table Stage */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-10 felt-surface">
            <div className="grid grid-cols-2 gap-3 sm:gap-8 my-auto">
              {/* Player Hand Box */}
              <div
                onClick={() => !dealing && setBetSide('PLAYER')}
                className={`p-3 sm:p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 cursor-pointer transition-colors ${
                  outcome?.winner === 'PLAYER'
                    ? 'bg-[#070b14]/85 border-[#10b981] shadow-xl'
                    : betSide === 'PLAYER'
                    ? 'bg-[#070b14]/70 border-[#fbbf24]'
                    : 'bg-[#070b14]/45 border-[#24324f]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">PLAYER</span>
                  {outcome && (
                    <span className="px-2 py-0.5 rounded-full bg-[#131c31] font-mono text-xs sm:text-sm font-extrabold text-[#10b981]">
                      {outcome.pTotal}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 min-h-[96px] sm:min-h-[112px]">
                  {playerCards.length > 0
                    ? playerCards.map((c, idx) => <CardTile key={idx} card={c} />)
                    : [0, 1].map((i) => <CardTile key={i} />)}
                </div>
              </div>

              {/* Banker Hand Box */}
              <div
                onClick={() => !dealing && setBetSide('BANKER')}
                className={`p-3 sm:p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 cursor-pointer transition-colors ${
                  outcome?.winner === 'BANKER'
                    ? 'bg-[#070b14]/85 border-[#fbbf24] shadow-xl'
                    : betSide === 'BANKER'
                    ? 'bg-[#070b14]/70 border-[#fbbf24]'
                    : 'bg-[#070b14]/45 border-[#24324f]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">BANKER</span>
                  {outcome && (
                    <span className="px-2 py-0.5 rounded-full bg-[#131c31] font-mono text-xs sm:text-sm font-extrabold text-[#fbbf24]">
                      {outcome.bTotal}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 min-h-[96px] sm:min-h-[112px]">
                  {bankerCards.length > 0
                    ? bankerCards.map((c, idx) => <CardTile key={idx} card={c} />)
                    : [0, 1].map((i) => <CardTile key={i} />)}
                </div>
              </div>
            </div>

            {/* Result Banner */}
            <div className="min-h-[44px] flex items-center justify-center mt-3">
              {outcome && (
                <div
                  className={`px-4 sm:px-6 py-2 rounded-xl border font-extrabold text-xs sm:text-sm text-center ${
                    outcome.won
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                      : outcome.payout === betAmount
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#fbbf24]'
                      : 'bg-[#070b14]/80 border-[#24324f] text-[#94a3b8]'
                  }`}
                >
                  {outcome.winner} WINS ({outcome.pTotal} to {outcome.bTotal}) ·{' '}
                  {outcome.payout > 0 ? `Payout ${formatINR(outcome.payout)}` : 'No Payout'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}