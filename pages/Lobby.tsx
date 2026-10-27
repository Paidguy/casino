import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';
import { engine, formatINR, LIVE_BAZAR_MARKETS } from '../services/engine';
import { Leaderboard } from '../components/Leaderboard';
import { GameArtwork } from '../components/GameArtwork';
import { GameType } from '../types';
import {
  Search,
  ShieldCheck,
  BarChart2,
  QrCode,
  Gift,
  Flame,
  Crown,
} from 'lucide-react';

interface GameCatalogItem {
  id: string;
  title: string;
  to: string;
  category: 'ORIGINALS' | 'INDIAN' | 'TABLE' | 'JACKPOT';
  rtp: string;
  maxWin: string;
  desc: string;
  playersOnline: number;
  featured?: boolean;
}

const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: 'crash',
    title: 'Aviator Crash',
    to: '/crash',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '10,000× Max',
    desc: 'Cash out before the supersonic jet flies away',
    playersOnline: 642,
    featured: true,
  },
  {
    id: 'mines',
    title: 'Gold Mines',
    to: '/mines',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '24-Mine Grid',
    desc: 'Uncover 24K gold bars across a 5×5 vault grid',
    playersOnline: 418,
    featured: true,
  },
  {
    id: 'plinko',
    title: 'Plinko 1000x',
    to: '/plinko',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '1,000× Max',
    desc: 'Drop golden balls down the 16-row pyramid',
    playersOnline: 389,
    featured: true,
  },
  {
    id: 'roulette',
    title: 'European Roulette',
    to: '/roulette',
    category: 'ORIGINALS',
    rtp: '97.3% RTP',
    maxWin: '36× Straight',
    desc: 'Single-zero European wheel & full table layout',
    playersOnline: 315,
    featured: true,
  },
  {
    id: 'matka',
    title: 'Kalyan Matka',
    to: '/matka',
    category: 'INDIAN',
    rtp: '95.0% RTP',
    maxWin: '600× Max',
    desc: 'Single Digit (9.5×), Double Digit (95×) & 3-Card Combos',
    playersOnline: 530,
  },
  {
    id: 'teenpatti',
    title: 'Teen Patti Poker',
    to: '/teenpatti',
    category: 'INDIAN',
    rtp: '97.5% RTP',
    maxWin: '5× Trail Bonus',
    desc: '3-card Indian poker — play Seen or Blind against the Dealer',
    playersOnline: 476,
  },
  {
    id: 'andarbahar',
    title: 'Andar Bahar',
    to: '/andarbahar',
    category: 'INDIAN',
    rtp: '98.0% RTP',
    maxWin: '3.5× Fast Match',
    desc: 'Classic Indian Inside vs Outside card matching table',
    playersOnline: 364,
  },
  {
    id: 'blackjack',
    title: 'VIP Blackjack 21',
    to: '/blackjack',
    category: 'TABLE',
    rtp: '99.5% RTP',
    maxWin: '3:2 Blackjack',
    desc: '4-deck shoe rules with Double Down & Dealer stands on 17',
    playersOnline: 228,
  },
  {
    id: 'baccarat',
    title: 'Punto Baccarat',
    to: '/baccarat',
    category: 'TABLE',
    rtp: '98.94% RTP',
    maxWin: '9× Tie Payout',
    desc: 'Player, Banker & Tie with official 3rd-card draw rules',
    playersOnline: 194,
  },
  {
    id: 'slots',
    title: 'Diamond Slots',
    to: '/slots',
    category: 'JACKPOT',
    rtp: '97.0% RTP',
    maxWin: '500× Jackpot',
    desc: '5-reel multi-payline slot machine with Diamond Wilds',
    playersOnline: 287,
  },
  {
    id: 'wheel',
    title: 'Fortune Wheel',
    to: '/wheel',
    category: 'JACKPOT',
    rtp: '99.0% RTP',
    maxWin: '29.7× Max',
    desc: '10 to 30 wheel segments with Low, Medium & High risk',
    playersOnline: 165,
  },
  {
    id: 'keno',
    title: 'Keno 40',
    to: '/keno',
    category: 'JACKPOT',
    rtp: '99.0% RTP',
    maxWin: '1,000× Max',
    desc: 'Pick up to 10 lucky numbers on a 40-ball draw board',
    playersOnline: 142,
  },
  {
    id: 'dice',
    title: 'Classic Dice',
    to: '/dice',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '99.0× Max',
    desc: 'Precision 0–100 roll slider with customizable win chance',
    playersOnline: 251,
  },
  {
    id: 'coinflip',
    title: 'Coin Flip',
    to: '/coinflip',
    category: 'INDIAN',
    rtp: '98.0% RTP',
    maxWin: 'Unlimited Streak',
    desc: 'Heads or Tails double-or-nothing multiplier chain',
    playersOnline: 209,
  },
];

export default function Lobby() {
  const [session, setSession] = useState(engine.getSession());
  const [filter, setFilter] = useState<'ALL' | 'ORIGINALS' | 'INDIAN' | 'TABLE' | 'JACKPOT'>('ALL');
  const [search, setSearch] = useState('');
  const [topupNotice, setTopupNotice] = useState<string | null>(null);
  const [jackpotPool, setJackpotPool] = useState<number>(4892450);
  const [quickDigit, setQuickDigit] = useState<number>(7);
  const [quickMatkaResult, setQuickMatkaResult] = useState<{
    panna: string;
    digit: number;
    pair: string;
    won: boolean;
    payout: number;
  } | null>(null);
  const [drawingQuickMatka, setDrawingQuickMatka] = useState(false);

  const topupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matkaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = engine.subscribe((s) => setSession(s));
    const jpInterval = setInterval(() => {
      setJackpotPool((prev) => prev + Math.floor(150 + Math.random() * 680));
    }, 1800);

    return () => {
      unsub();
      clearInterval(jpInterval);
      if (topupTimerRef.current) clearTimeout(topupTimerRef.current);
      if (matkaTimerRef.current) clearTimeout(matkaTimerRef.current);
    };
  }, []);

  const vip = engine.getVipTier(session.totalWagered);
  const netProfit = session.totalPayout - session.totalWagered;

  const featuredGames = GAMES_CATALOG.filter((g) => g.featured);

  const filteredGames = GAMES_CATALOG.filter((g) => {
    const matchesCategory = filter === 'ALL' || g.category === filter;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showNotice = (msg: string) => {
    if (topupTimerRef.current) clearTimeout(topupTimerRef.current);
    setTopupNotice(msg);
    topupTimerRef.current = setTimeout(() => setTopupNotice(null), 4000);
  };

  const handleQuickUpiDeposit = () => {
    const utr = engine.deposit(5000, 'Instant UPI Quick Credit');
    audio.playWin();
    showNotice(`+₹5,000 credited via Instant UPI · Ref #${utr}`);
  };

  const handleClaimBonus = () => {
    const amounts = [1000, 2500, 5000];
    const bonus = amounts[Math.floor(Math.random() * amounts.length)];
    const utr = engine.deposit(bonus, 'Daily VIP Bonus Reward');
    audio.playWin();
    showNotice(`Daily Bonus Claimed! +${formatINR(bonus, 0)} added to Wallet · #${utr}`);
  };

  const handleQuickMatkaPlay = () => {
    if (drawingQuickMatka) return;
    const stake = 500;
    if (engine.getSession().balance < stake) {
      engine.reloadBalance(10000);
    }
    setDrawingQuickMatka(true);
    setQuickMatkaResult(null);
    audio.playBet();

    if (matkaTimerRef.current) clearTimeout(matkaTimerRef.current);
    matkaTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.MATKA,
        stake,
        (r) => {
          const res = engine.getSattaMatkaResult(r);
          const won = res.single === quickDigit;
          const mult = won ? 9.5 : 0;
          const payout = +(stake * mult).toFixed(2);
          setQuickMatkaResult({
            panna: res.cards,
            digit: res.single,
            pair: res.jodi,
            won,
            payout,
          });
          setDrawingQuickMatka(false);
          if (won) audio.playWin();
          else audio.playLoss();
          return {
            multiplier: mult,
            outcome: `Quick Number #${quickDigit}: ${res.cards}-${res.single} (Pair ${res.jodi})`,
          };
        },
        ''
      );
    }, 380);
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 royal-surface border border-[#f59e0b]/35 rounded-2xl p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Bespoke Casino & Jet Backdrop Illustration */}
            <svg
              viewBox="0 0 540 320"
              className="hidden sm:block absolute right-0 bottom-0 w-[420px] h-[270px] opacity-40 pointer-events-none"
              fill="none"
            >
              <defs>
                <radialGradient id="heroGlow" cx="70%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="55%" stopColor="#e11d48" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="540" height="320" fill="url(#heroGlow)" />
              <circle cx="395" cy="165" r="115" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="10 6" />
              <circle cx="395" cy="165" r="82" stroke="#10b981" strokeWidth="1.8" />
              <circle cx="395" cy="165" r="46" fill="#0d1322" stroke="#fbbf24" strokeWidth="2" />
              <g transform="translate(325, 78) rotate(-15)">
                <rect width="62" height="88" rx="9" fill="#131c31" stroke="#fbbf24" strokeWidth="2.2" />
                <text x="12" y="26" fill="#f43f5e" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="16">
                  A♥
                </text>
              </g>
              <g transform="translate(372, 68) rotate(6)">
                <rect width="62" height="88" rx="9" fill="#131c31" stroke="#10b981" strokeWidth="2.2" />
                <text x="12" y="26" fill="#fbbf24" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="16">
                  A♠
                </text>
              </g>
              <path
                d="M 40 285 Q 230 250, 345 140 T 505 32"
                stroke="#f43f5e"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="505" cy="32" r="9" fill="#fbbf24" />
            </svg>

            <div className="space-y-3.5 max-w-xl relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#fbbf24]">
                <span>Premier Indian Online Casino</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#10b981]">Instant UPI & IMPS</span>
                <span aria-hidden="true">·</span>
                <span className="text-white/85 font-mono tabular-nums">
                  Live Jackpot Pool: {formatINR(jackpotPool, 0)}
                </span>
              </div>

              <h1
                className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Modern Casino Originals & Live Indian Classics
              </h1>

              <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                Play provably fair high-multiplier originals and classic Indian table games with instant INR settlement. Fly Aviator Crash up to 10,000×, uncover 24K Gold Mines, or play Teen Patti, Andar Bahar, and Kalyan Matka.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-6 relative z-10">
              <Link
                to="/crash"
                onClick={() => audio.playClick()}
                className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg whitespace-nowrap"
              >
                Play Aviator Crash
              </Link>
              <Link
                to="/teenpatti"
                onClick={() => audio.playClick()}
                className="px-4 sm:px-5 py-2.5 bg-[#064e3b] hover:bg-[#065f46] border border-[#10b981]/50 text-[#10b981] font-bold text-xs sm:text-sm rounded-xl whitespace-nowrap"
              >
                Teen Patti Poker
              </Link>
              <button
                type="button"
                onClick={handleClaimBonus}
                className="px-3.5 sm:px-4 py-2.5 bg-[#131c31] hover:bg-[#1d2a47] border border-[#f59e0b]/40 text-[#fbbf24] font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 whitespace-nowrap"
              >
                <Gift className="w-4 h-4 text-[#f43f5e]" />
                <span>Claim Daily Bonus</span>
              </button>
              <button
                type="button"
                onClick={handleQuickUpiDeposit}
                className="px-3 py-2.5 text-xs font-bold text-[#94a3b8] hover:text-white flex items-center gap-1.5 whitespace-nowrap"
              >
                <QrCode className="w-4 h-4 text-[#f59e0b]" />
                <span>+₹5,000 Quick UPI</span>
              </button>
            </div>

            {topupNotice && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-xs font-mono font-bold text-[#10b981] relative z-10 w-fit">
                {topupNotice}
              </div>
            )}
          </div>

          {/* Right VIP Account Summary Card */}
          <div className="lg:col-span-4 bg-[#0d1322] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#fbbf24]" />
                  <span>{session.username}</span>
                </span>
                <span className="text-[#fbbf24] font-bold">VIP {vip.name}</span>
              </div>
              <div className="w-full h-2.5 bg-[#131c31] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(6, vip.progress))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#94a3b8]">
                <span>Next Tier: {vip.next} ({(vip.rakebackRate * 100).toFixed(2)}% Rakeback)</span>
                <span className="font-mono tabular-nums">{vip.progress.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <div className="text-[11px] text-[#94a3b8]">Total Wagered</div>
                <div className="text-sm font-extrabold font-mono text-white tabular-nums mt-0.5">
                  {formatINR(session.totalWagered)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#94a3b8]">Session Net Profit</div>
                <div
                  className={`text-sm font-extrabold font-mono tabular-nums mt-0.5 ${
                    netProfit >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                  }`}
                >
                  {netProfit >= 0 ? '+' : ''}
                  {formatINR(netProfit)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="text-xs text-[#94a3b8]">
                Available Rakeback:{' '}
                <span className="text-[#10b981] font-mono font-bold tabular-nums">
                  {formatINR(session.rakebackBalance)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const claimed = engine.claimRakeback();
                  if (claimed > 0) {
                    audio.playWin();
                    showNotice(`Claimed ${formatINR(claimed)} VIP Rakeback to Wallet!`);
                  }
                }}
                disabled={session.rakebackBalance <= 0}
                className="px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-xs font-extrabold text-[#070b14] rounded-lg whitespace-nowrap"
              >
                Claim Rakeback
              </button>
            </div>
          </div>
        </section>

        {/* Featured Spotlight: Aviator Crash, Mines, Plinko, Roulette */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
              <span>Featured Casino Originals</span>
            </h2>
            <span className="text-xs text-[#94a3b8]">
              Provably Fair SHA-256 · Instant INR Cashout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGames.map((game) => (
              <Link
                key={game.id}
                to={game.to}
                onClick={() => audio.playClick()}
                className="group bg-[#0d1322] border border-white/10 hover:border-[#f59e0b] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl"
              >
                <div className="h-44 relative overflow-hidden border-b border-white/10">
                  <GameArtwork
                    gameId={game.id}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/35 to-transparent" />

                  <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-mono font-bold text-[#fbbf24]">
                    <span>{game.rtp}</span>
                    <span className="text-white/90">{game.playersOnline} Playing</span>
                  </div>

                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <div className="text-xl font-extrabold font-display text-white group-hover:text-[#fbbf24] transition-colors">
                      {game.title}
                    </div>
                    <div className="text-xs text-[#cbd5e1] mt-0.5 truncate">{game.desc}</div>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center justify-between bg-[#0d1322]">
                  <span className="text-xs font-mono font-bold text-[#10b981]">
                    {game.maxWin}
                  </span>
                  <span className="text-xs font-extrabold text-[#fbbf24] group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                    Play Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Filter Bar & Search for All 14 Games */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#0d1322] border border-white/10 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Games (14)' },
              { id: 'ORIGINALS', label: 'Originals' },
              { id: 'INDIAN', label: 'Indian Classics' },
              { id: 'TABLE', label: 'Table Games' },
              { id: 'JACKPOT', label: 'Slots & Draws' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id as any);
                  audio.playClick();
                }}
                className={`px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-[#f59e0b] text-[#070b14] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Aviator, Mines, Teen Patti..."
              className="w-full h-10 bg-[#0d1322] border border-white/10 focus:border-[#f59e0b] rounded-xl pl-9 pr-3.5 text-xs text-white placeholder:text-[#64748b] outline-none"
            />
          </div>
        </section>

        {/* Full 14-Game Illustrated Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              to={game.to}
              onClick={() => audio.playClick()}
              className="group bg-[#0d1322] border border-white/10 hover:border-[#f59e0b]/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <div className="h-36 relative overflow-hidden border-b border-white/10">
                <GameArtwork
                  gameId={game.id}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/30 to-transparent" />

                <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#fbbf24]">
                  <span>{game.rtp}</span>
                  <span className="text-white/80">{game.playersOnline} Online</span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <div className="text-base font-extrabold font-display text-white group-hover:text-[#fbbf24] transition-colors">
                    {game.title}
                  </div>
                  <div className="text-[11px] text-[#cbd5e1] truncate">{game.desc}</div>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#10b981]">{game.maxWin}</span>
                <span className="text-xs font-bold text-[#fbbf24] whitespace-nowrap shrink-0">
                  Play Now →
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* Live Indian Matka Markets & Instant Single-Digit Draw */}
        <section className="bg-[#0d1322] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-display text-white">
                Live Indian Matka Markets & Instant Number Draw
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Official Kalyan, Worli & Milan draw results · Pick any digit (0–9) below for an instant ₹500 draw (9.5× payout)
              </p>
            </div>
            <Link
              to="/matka"
              onClick={() => audio.playClick()}
              className="px-4 py-2 bg-[#131c31] hover:bg-[#1d2a47] border border-[#f59e0b]/40 text-[#fbbf24] font-extrabold text-xs rounded-xl whitespace-nowrap w-fit"
            >
              Open Full Matka Game →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {LIVE_BAZAR_MARKETS.map((mkt) => (
              <Link
                key={mkt.id}
                to="/matka"
                onClick={() => audio.playClick()}
                className="bg-[#070b14] hover:bg-[#131c31] border border-white/10 hover:border-[#f59e0b]/50 rounded-xl p-3 text-center transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{mkt.name}</div>
                <div className="text-base sm:text-lg font-extrabold font-mono text-[#fbbf24] my-1 tracking-wider tabular-nums">
                  {mkt.openPanna}-{mkt.jodi}-{mkt.closePanna}
                </div>
                <div className="text-[11px] text-[#94a3b8] font-mono">
                  {mkt.openTime} · <span className="text-[#10b981]">{mkt.status}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Interactive 1-Tap Single Digit Draw */}
          <div className="bg-[#070b14] border border-white/10 rounded-xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  Instant Single Digit Draw (0–9) · Pays 9.50× (₹500 → ₹4,750)
                </span>
                <span className="font-mono text-[#fbbf24]">Selected Digit: #{quickDigit}</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuickDigit(num);
                      audio.playClick();
                    }}
                    className={`h-10 rounded-lg font-mono font-extrabold text-sm border transition-colors ${
                      quickDigit === num
                        ? 'bg-[#f59e0b] text-[#070b14] border-white'
                        : 'bg-[#131c31] hover:bg-[#1d2a47] text-white border-white/10'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {quickMatkaResult && (
                <div
                  className={`px-3.5 py-2 rounded-xl border font-mono text-xs font-extrabold text-center ${
                    quickMatkaResult.won
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                      : 'bg-[#131c31] border-white/10 text-[#94a3b8]'
                  }`}
                >
                  {quickMatkaResult.won
                    ? `WIN! Drawn #${quickMatkaResult.digit} · +${formatINR(quickMatkaResult.payout, 0)}`
                    : `Drawn Digit: #${quickMatkaResult.digit} (${quickMatkaResult.panna}-${quickMatkaResult.pair})`}
                </div>
              )}
              <button
                type="button"
                onClick={handleQuickMatkaPlay}
                disabled={drawingQuickMatka}
                className="h-11 px-5 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg whitespace-nowrap"
              >
                {drawingQuickMatka ? 'Drawing...' : `Play Digit #${quickDigit} (₹500)`}
              </button>
            </div>
          </div>
        </section>

        {/* Platform Feature Callout Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/transactions"
            className="bg-[#0d1322] border border-white/10 hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5 transition-colors"
          >
            <QrCode className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">UPI, Paytm & IMPS Cashier</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                View all instant INR deposits, 12-digit UTR references, and personal Vault transfers.
              </p>
            </div>
          </Link>

          <Link
            to="/fairness"
            className="bg-[#0d1322] border border-white/10 hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">SHA-256 Provably Fair</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Rotate client and server seeds anytime and verify every Aviator, Mines, and Roulette round.
              </p>
            </div>
          </Link>

          <Link
            to="/statistics"
            className="bg-[#0d1322] border border-white/10 hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5 transition-colors"
          >
            <BarChart2 className="w-5 h-5 text-[#fbbf24] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Statistics & RTP Analytics</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Track realized vs. theoretical RTP, bankroll curves, and net profit across all 14 games.
              </p>
            </div>
          </Link>
        </section>

        {/* Live Bets & VIP Leaderboard */}
        <Leaderboard />
      </div>
    </Layout>
  );
}