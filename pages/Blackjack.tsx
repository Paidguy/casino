import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

type Card = { suit: '♠' | '♥' | '♦' | '♣'; value: string; numeric: number };

const CardComponent: React.FC<{ card?: Card; hidden?: boolean }> = ({ card, hidden }) => {
  if (hidden || !card) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-gradient-to-br from-[#92400e] via-[#451a03] to-[#1e1b4b] border-2 border-[#f59e0b]/70 shadow-xl flex items-center justify-center select-none">
        <div className="w-14 h-20 sm:w-16 sm:h-28 rounded-lg border border-[#f59e0b]/40 bg-[#0d1322]/90 flex flex-col items-center justify-center">
          <Crown className="w-4 h-4 text-[#fbbf24] mb-1" />
          <span className="text-[9px] font-black text-[#fbbf24] tracking-widest">ROYAL</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white border-2 border-[#f59e0b]/40 shadow-xl flex flex-col justify-between p-2.5 select-none">
      <div className={`flex flex-col items-start leading-none ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        <span className="text-base sm:text-lg font-extrabold font-mono">{card.value}</span>
        <span className="text-sm sm:text-base">{card.suit}</span>
      </div>
      <div className={`text-3xl sm:text-4xl self-center ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        {card.suit}
      </div>
      <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-[#f43f5e]' : 'text-[#070b14]'}`}>
        <span className="text-base sm:text-lg font-extrabold font-mono">{card.value}</span>
        <span className="text-sm sm:text-base">{card.suit}</span>
      </div>
    </div>
  );
};

export default function Blackjack() {
  const [betAmount, setBetAmount] = useState<number>(500);
  const [activeStake, setActiveStake] = useState<number>(500);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYER_TURN' | 'DEALER_TURN' | 'FINISHED'>('IDLE');
  const [outcomeBanner, setOutcomeBanner] = useState<{ text: string; mult: number } | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const mounted = useRef<boolean>(true);
  const bjTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (bjTimerRef.current) clearTimeout(bjTimerRef.current);
    };
  }, []);

  const generateDeck = (): Card[] => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const d: Card[] = [];
    for (let shoe = 0; shoe < 4; shoe++) {
      for (const s of suits) {
        for (const v of values) {
          let n = parseInt(v);
          if (v === 'J' || v === 'Q' || v === 'K') n = 10;
          if (v === 'A') n = 11;
          d.push({ suit: s, value: v, numeric: n });
        }
      }
    }
    const floats = engine.getNextFloats(64);
    for (let i = d.length - 1; i > 0; i--) {
      const f = floats[i % floats.length] ?? Math.random();
      const j = Math.floor(((f + Math.random()) % 1) * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  };

  const getHandValue = (hand: Card[]) => {
    let val = hand.reduce((a, b) => a + b.numeric, 0);
    let aces = hand.filter((c) => c.value === 'A').length;
    while (val > 21 && aces > 0) {
      val -= 10;
      aces--;
    }
    return val;
  };

  const startGame = () => {
    if (gameState === 'PLAYER_TURN' || gameState === 'DEALER_TURN') return;
    if (betAmount <= 0 || !engine.deductStake(betAmount)) return;

    audio.playBet();
    setActiveStake(betAmount);
    const d = generateDeck();
    const p = [d.pop()!, d.pop()!];
    const dealer = [d.pop()!, d.pop()!];

    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dealer);
    setGameState('PLAYER_TURN');
    setOutcomeBanner(null);

    if (getHandValue(p) === 21) {
      if (bjTimerRef.current) clearTimeout(bjTimerRef.current);
      bjTimerRef.current = setTimeout(() => {
        if (!mounted.current) return;
        if (getHandValue(dealer) === 21) finishGame('PUSH', p, dealer, betAmount);
        else finishGame('BLACKJACK', p, dealer, betAmount);
      }, 450);
    }
  };

  const hit = () => {
    if (gameState !== 'PLAYER_TURN') return;
    audio.playClick();
    const nextDeck = [...deck];
    const drawn = nextDeck.pop()!;
    const newHand = [...playerHand, drawn];
    setDeck(nextDeck);
    setPlayerHand(newHand);

    const val = getHandValue(newHand);
    if (val > 21) {
      finishGame('BUST', newHand, dealerHand, activeStake);
    } else if (val === 21) {
      stand(newHand, activeStake, nextDeck);
    }
  };

  const doubleDown = () => {
    if (gameState !== 'PLAYER_TURN' || playerHand.length !== 2) return;
    if (!engine.deductStake(activeStake)) return;

    audio.playBet();
    const doubledStake = activeStake * 2;
    setActiveStake(doubledStake);

    const nextDeck = [...deck];
    const newHand = [...playerHand, nextDeck.pop()!];
    setDeck(nextDeck);
    setPlayerHand(newHand);

    if (getHandValue(newHand) > 21) {
      finishGame('BUST', newHand, dealerHand, doubledStake);
    } else {
      stand(newHand, doubledStake, nextDeck);
    }
  };

  const stand = (finalHand = playerHand, finalBet = activeStake, currentDeck = deck) => {
    if (gameState !== 'PLAYER_TURN') return;
    audio.playClick();
    setGameState('DEALER_TURN');

    let dHand = [...dealerHand];
    const nextDeck = [...currentDeck];

    const playDealer = async () => {
      const delay = engine.getSession().settings.instantBet ? 150 : 450;
      await new Promise((r) => setTimeout(r, delay));

      while (getHandValue(dHand) < 17) {
        if (!mounted.current) return;
        dHand.push(nextDeck.pop()!);
        setDealerHand([...dHand]);
        audio.playSpin();
        await new Promise((r) => setTimeout(r, delay));
      }

      if (!mounted.current) return;
      const pVal = getHandValue(finalHand);
      const dVal = getHandValue(dHand);
      if (dVal > 21) finishGame('DEALER_BUST', finalHand, dHand, finalBet);
      else if (pVal > dVal) finishGame('WIN', finalHand, dHand, finalBet);
      else if (pVal < dVal) finishGame('LOSE', finalHand, dHand, finalBet);
      else finishGame('PUSH', finalHand, dHand, finalBet);
    };

    playDealer();
  };

  const finishGame = (result: string, p: Card[], d: Card[], finalBet: number) => {
    setGameState('FINISHED');
    let mult = 0;
    let text = '';

    if (result === 'BLACKJACK') {
      mult = 2.5;
      text = 'Blackjack! (2.50×)';
    } else if (result === 'WIN' || result === 'DEALER_BUST') {
      mult = 2.0;
      text = result === 'DEALER_BUST' ? 'Dealer Bust · You Win (2.00×)' : 'You Win (2.00×)';
    } else if (result === 'PUSH') {
      mult = 1.0;
      text = 'Push · Stake Returned (1.00×)';
    } else if (result === 'BUST') {
      mult = 0;
      text = 'Player Bust';
    } else {
      mult = 0;
      text = 'Dealer Wins';
    }

    setOutcomeBanner({ text, mult });
    if (mult > 1) audio.playWin();
    else if (mult === 1) audio.playClick();
    else audio.playLoss();

    engine.settleDeductedBet(
      GameType.BLACKJACK,
      finalBet,
      mult,
      `Blackjack: ${text} (${getHandValue(p)} vs ${getHandValue(d)})`
    );
  };

  const canDouble =
    gameState === 'PLAYER_TURN' &&
    playerHand.length === 2 &&
    engine.getSession().balance >= activeStake;

  const isRoundActive = gameState === 'PLAYER_TURN' || gameState === 'DEALER_TURN';

  return (
    <Layout>
      <div className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          {/* Left Stake Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#fbbf24]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    BLACKJACK VIP
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-2 py-0.5 rounded">
                  99.5% RTP
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Bet Amount (₹)</span>
                  <span className="font-mono text-[#fbbf24] tabular-nums">{formatINR(activeStake)}</span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] focus-within:border-[#f59e0b]/60 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value));
                      setBetAmount(v);
                      if (!isRoundActive) setActiveStake(v);
                    }}
                    disabled={isRoundActive}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = Math.max(10, Math.floor(betAmount / 2));
                      setBetAmount(v);
                      if (!isRoundActive) setActiveStake(v);
                    }}
                    disabled={isRoundActive}
                    className="px-3 bg-[#131c31] hover:bg-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const v = betAmount * 2;
                      setBetAmount(v);
                      if (!isRoundActive) setActiveStake(v);
                    }}
                    disabled={isRoundActive}
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
                      onClick={() => {
                        setBetAmount(chip);
                        if (!isRoundActive) setActiveStake(chip);
                      }}
                      disabled={isRoundActive}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={hit}
                  disabled={gameState !== 'PLAYER_TURN'}
                  className="h-11 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] text-white font-extrabold text-xs rounded-xl"
                >
                  Hit
                </button>
                <button
                  type="button"
                  onClick={() => stand()}
                  disabled={gameState !== 'PLAYER_TURN'}
                  className="h-11 bg-[#070b14] hover:bg-[#1e293b] border border-[#24324f] text-white font-extrabold text-xs rounded-xl"
                >
                  Stand
                </button>
                <button
                  type="button"
                  onClick={doubleDown}
                  disabled={!canDouble}
                  className="col-span-2 h-11 bg-[#070b14] hover:bg-[#1e293b] border border-[#f59e0b]/40 text-[#fbbf24] font-extrabold text-xs rounded-xl"
                >
                  Double Down (2×)
                </button>
              </div>

              <button
                type="button"
                onClick={startGame}
                disabled={isRoundActive || betAmount <= 0}
                className="w-full h-14 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center"
              >
                {isRoundActive ? 'Hand in Progress...' : `Deal Hand (${formatINR(betAmount, 0)})`}
              </button>

              <div className="p-3.5 bg-[#070b14] rounded-xl border border-[#24324f] text-xs text-[#94a3b8] space-y-1.5">
                <div className="flex justify-between">
                  <span>Blackjack Pays</span>
                  <span className="font-mono font-bold text-[#fbbf24]">3 to 2 (2.50×)</span>
                </div>
                <div className="flex justify-between">
                  <span>Dealer Rule</span>
                  <span className="font-mono text-white">Stands on all 17</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8]">
              <span>4-Deck Provably Fair Shoe</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Blackjack Table Stage */}
          <div className="flex-1 flex flex-col justify-between items-center p-5 sm:p-10 relative felt-surface">
            {/* Dealer Zone */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                  Maharaja Dealer
                </span>
                {dealerHand.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#070b14]/80 border border-[#f59e0b]/40 text-[#fbbf24] font-mono text-xs font-bold tabular-nums">
                    {gameState === 'PLAYER_TURN'
                      ? dealerHand[0].numeric
                      : getHandValue(dealerHand)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center -space-x-5 sm:-space-x-8 min-h-[144px]">
                {dealerHand.length > 0
                  ? dealerHand.map((card, i) => (
                      <CardComponent
                        key={i}
                        card={card}
                        hidden={i === 1 && gameState === 'PLAYER_TURN'}
                      />
                    ))
                  : [0, 1].map((i) => <CardComponent key={i} hidden />)}
              </div>
            </div>

            {/* Center Banner / Rules Ribbon */}
            <div className="my-4 min-h-[48px] flex items-center justify-center">
              {outcomeBanner ? (
                <div
                  className={`px-5 py-2 rounded-xl font-extrabold text-xs sm:text-sm border shadow-xl text-center ${
                    outcomeBanner.mult > 1
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                      : outcomeBanner.mult === 1
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#fbbf24]'
                      : 'bg-[#f43f5e]/20 border-[#f43f5e] text-[#f43f5e]'
                  }`}
                >
                  {outcomeBanner.text}{' '}
                  {outcomeBanner.mult > 0 && `· ${formatINR(activeStake * outcomeBanner.mult)}`}
                </div>
              ) : (
                <div className="text-xs font-extrabold text-[#fbbf24]/80 tracking-widest uppercase text-center">
                  BLACKJACK PAYS 3 TO 2 · DEALER STANDS ON 17
                </div>
              )}
            </div>

            {/* Player Zone */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center -space-x-5 sm:-space-x-8 min-h-[144px]">
                {playerHand.length > 0
                  ? playerHand.map((card, i) => <CardComponent key={i} card={card} />)
                  : [0, 1].map((i) => <CardComponent key={i} hidden />)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                  Your Hand
                </span>
                {playerHand.length > 0 && (
                  <span
                    className={`px-3 py-0.5 rounded-full font-mono text-xs font-bold tabular-nums ${
                      getHandValue(playerHand) > 21
                        ? 'bg-[#f43f5e] text-white'
                        : getHandValue(playerHand) === 21
                        ? 'bg-[#10b981] text-[#070b14]'
                        : 'bg-[#070b14]/80 border border-[#f59e0b]/40 text-white'
                    }`}
                  >
                    {getHandValue(playerHand)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}