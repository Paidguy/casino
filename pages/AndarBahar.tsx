import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type ABCard = { suit: '♠' | '♥' | '♦' | '♣'; rank: string };

const CardMini: React.FC<{ card?: ABCard; highlight?: boolean }> = ({ card, highlight }) => {
  if (!card) {
    return (
      <div className="w-14 h-20 sm:w-20 sm:h-28 rounded-xl bg-[#070b14]/60 border border-white/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white/40">HUKUM</span>
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div
      className={`w-14 h-20 sm:w-20 sm:h-28 rounded-xl bg-white shadow-lg flex flex-col justify-between p-2 select-none transition-transform ${
        highlight ? 'ring-4 ring-[#fbbf24] scale-105' : ''
      }`}
    >
      <div className={`text-xs font-extrabold font-mono leading-none ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>
      <div className={`text-xl sm:text-2xl self-center ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.suit}
      </div>
      <div className={`text-xs font-extrabold font-mono leading-none self-end rotate-180 ${isRed ? 'text-[#e11d48]' : 'text-[#070b14]'}`}>
        {card.rank}
      </div>
    </div>
  );
};

export default function AndarBahar() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [selectedSide, setSelectedSide] = useState<'ANDAR' | 'BAHAR' | 'SUPER_5'>('ANDAR');
  const [dealing, setDealing] = useState(false);
  const [joker, setJoker] = useState<ABCard>({ suit: '♠', rank: 'A' });
  const [andarPile, setAndarPile] = useState<ABCard[]>([]);
  const [baharPile, setBaharPile] = useState<ABCard[]>([]);
  const [result, setResult] = useState<{
    winningSide: 'ANDAR' | 'BAHAR';
    cardsDealt: number;
    won: boolean;
    payout: number;
  } | null>(null);

  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, []);

  const dealRound = () => {
    if (dealing) return;
    const validStake = Math.max(10, betAmount || 100);
    if (betAmount <= 0) setBetAmount(validStake);

    if (engine.getSession().balance < validStake) {
      engine.reloadBalance(Math.max(10000, validStake * 5));
    }

    setDealing(true);
    setResult(null);
    setAndarPile([]);
    setBaharPile([]);
    audio.playBet();

    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const floats = engine.getNextFloats(20);

    const jokerRankIdx = Math.floor((floats[0] ?? Math.random()) * 13);
    const jokerRank = ranks[jokerRankIdx];
    const jokerSuit = suits[Math.floor((floats[1] ?? Math.random()) * 4)];
    const jokerCard: ABCard = { suit: jokerSuit, rank: jokerRank };
    setJoker(jokerCard);

    const matchStep = 1 + Math.floor((floats[2] ?? Math.random()) * 10);
    const nonMatchingRanks = ranks.filter((r) => r !== jokerRank);

    const aCards: ABCard[] = [];
    const bCards: ABCard[] = [];

    for (let step = 1; step <= matchStep; step++) {
      const isMatch = step === matchStep;
      const r = isMatch
        ? jokerRank
        : nonMatchingRanks[Math.floor(((floats[step + 2] ?? Math.random()) * 17) % nonMatchingRanks.length)];
      const s = suits[(step + jokerRankIdx) % 4];
      const card: ABCard = { suit: s, rank: r };
      if (step % 2 === 1) {
        aCards.push(card);
      } else {
        bCards.push(card);
      }
    }

    const winningSide: 'ANDAR' | 'BAHAR' = matchStep % 2 === 1 ? 'ANDAR' : 'BAHAR';
    const delay = engine.getSession().settings.instantBet ? 150 : 600;

    if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    dealTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.ANDARBAHAR,
        validStake,
        () => {
          let mult = 0;
          if (selectedSide === 'ANDAR' && winningSide === 'ANDAR') mult = 1.95;
          else if (selectedSide === 'BAHAR' && winningSide === 'BAHAR') mult = 2.0;
          else if (selectedSide === 'SUPER_5' && matchStep <= 3) mult = 3.5;

          const won = mult > 0;
          setAndarPile(aCards);
          setBaharPile(bCards);
          setResult({
            winningSide,
            cardsDealt: matchStep,
            won,
            payout: +(validStake * mult).toFixed(2),
          });
          setDealing(false);

          if (won) audio.playWin();
          else audio.playLoss();

          return {
            multiplier: mult,
            outcome: `Andar Bahar: ${winningSide} matched ${jokerRank} on card #${matchStep}`,
          };
        },
        ''
      );
    }, delay);
  };

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col-reverse lg:flex-row lg:min-h-[580px]">
          {/* Left Bookie Controls */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action CTA at Top for Mobile Thumb Reach */}
              <button
                type="button"
                onClick={dealRound}
                disabled={dealing}
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
              >
                {dealing ? 'Dealing Andar Bahar...' : `Deal ${selectedSide} (${formatINR(betAmount, 0)})`}
              </button>

              {/* Select Andar / Bahar / Super 1-3 */}
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                  Select Betting Side
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ANDAR', label: 'Andar', odds: '1.95×' },
                    { id: 'BAHAR', label: 'Bahar', odds: '2.00×' },
                    { id: 'SUPER_5', label: 'Fast 1–3', odds: '3.50×' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSide(s.id as any);
                        audio.playClick();
                      }}
                      disabled={dealing}
                      className={`py-3 rounded-xl border text-center transition-colors ${
                        selectedSide === s.id
                          ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-white'
                          : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{s.label}</div>
                      <div className="text-[11px] font-mono text-[#fbbf24] mt-0.5">{s.odds}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Lagaya Stake (INR)</span>
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

              <div className="p-3.5 bg-[#070b14] rounded-xl border border-[#24324f] text-xs text-[#94a3b8] space-y-1.5">
                <div className="font-bold text-[#fbbf24] mb-1">How Andar Bahar Works</div>
                <p className="leading-relaxed">
                  A central Hukum (Joker) card is cut face up. Cards are dealt alternately to Andar and Bahar until a card matching the Hukum rank appears!
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>98.0% RTP · Andar Bahar Live</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Fairness
              </Link>
            </div>
          </div>

          {/* Right Andar Bahar Felt Table */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-10 felt-surface">
            {/* Center Hukum (Joker) Card */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-extrabold text-[#fbbf24] tracking-wider">
                HUKUM (JOKER CARD TO MATCH)
              </span>
              <CardMini card={joker} highlight />
            </div>

            {/* Andar vs Bahar Dealing Boxes */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 my-4">
              <div
                onClick={() => !dealing && setSelectedSide('ANDAR')}
                className={`p-3 sm:p-5 rounded-2xl border-2 flex flex-col items-center space-y-2.5 cursor-pointer transition-colors ${
                  result?.winningSide === 'ANDAR'
                    ? 'bg-[#070b14]/85 border-[#10b981]'
                    : selectedSide === 'ANDAR'
                    ? 'bg-[#070b14]/75 border-[#fbbf24]'
                    : 'bg-[#070b14]/60 border-white/20'
                }`}
              >
                <div className="text-xs sm:text-sm font-extrabold text-white">ANDAR (1.95×)</div>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 min-h-[84px] sm:min-h-[112px]">
                  {andarPile.length > 0 ? (
                    andarPile.map((c, idx) => (
                      <CardMini
                        key={idx}
                        card={c}
                        highlight={
                          idx === andarPile.length - 1 && result?.winningSide === 'ANDAR'
                        }
                      />
                    ))
                  ) : (
                    <CardMini />
                  )}
                </div>
              </div>

              <div
                onClick={() => !dealing && setSelectedSide('BAHAR')}
                className={`p-3 sm:p-5 rounded-2xl border-2 flex flex-col items-center space-y-2.5 cursor-pointer transition-colors ${
                  result?.winningSide === 'BAHAR'
                    ? 'bg-[#070b14]/85 border-[#10b981]'
                    : selectedSide === 'BAHAR'
                    ? 'bg-[#070b14]/75 border-[#fbbf24]'
                    : 'bg-[#070b14]/60 border-white/20'
                }`}
              >
                <div className="text-xs sm:text-sm font-extrabold text-white">BAHAR (2.00×)</div>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 min-h-[84px] sm:min-h-[112px]">
                  {baharPile.length > 0 ? (
                    baharPile.map((c, idx) => (
                      <CardMini
                        key={idx}
                        card={c}
                        highlight={
                          idx === baharPile.length - 1 && result?.winningSide === 'BAHAR'
                        }
                      />
                    ))
                  ) : (
                    <CardMini />
                  )}
                </div>
              </div>
            </div>

            {/* Outcome Banner */}
            <div className="min-h-[44px] flex items-center justify-center">
              {result && (
                <div
                  className={`px-4 sm:px-6 py-2 rounded-xl font-extrabold text-xs sm:text-sm border shadow-xl text-center ${
                    result.won
                      ? 'bg-[#070b14] border-[#10b981] text-[#10b981]'
                      : 'bg-[#070b14] border-[#24324f] text-white'
                  }`}
                >
                  {result.winningSide} MATCHED {joker.rank} ON CARD #{result.cardsDealt} ·{' '}
                  {result.won ? `WON +${formatINR(result.payout)}` : 'Try Again'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
