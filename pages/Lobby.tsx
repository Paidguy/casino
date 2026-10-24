import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';
import { engine, formatINR, LIVE_BAZAR_MARKETS } from '../services/engine';
import { Leaderboard } from '../components/Leaderboard';
import {
  TrendingUp,
  Disc,
  Grid,
  Dices,
  Hash,
  CircleDot,
  Coins,
  Spade,
  Award,
  Layers,
  Sparkles,
  Vault,
  Search,
  ShieldCheck,
  BarChart2,
  QrCode,
} from 'lucide-react';

interface GameCatalogItem {
  id: string;
  title: string;
  to: string;
  category: 'ORIGINALS' | 'DESI' | 'TABLE' | 'JACKPOT';
  rtp: string;
  maxWin: string;
  desc: string;
  accent: string;
  icon: any;
  featured?: boolean;
}

const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: 'crash',
    title: 'Aviator Crash',
    to: '/crash',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '10,000x Bhav',
    desc: 'Cash out before the supersonic jet flies away',
    accent: 'from-[#f43f5e]/30 via-[#9f1239]/20 to-[#0d1322]',
    icon: TrendingUp,
    featured: true,
  },
  {
    id: 'mines',
    title: 'Mines Gold Tijori',
    to: '/mines',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '24-Bomb Vault',
    desc: 'Uncover 24K gold bars across a 5×5 vault grid',
    accent: 'from-[#f59e0b]/30 via-[#b45309]/20 to-[#0d1322]',
    icon: Grid,
    featured: true,
  },
  {
    id: 'plinko',
    title: 'Plinko 1000x',
    to: '/plinko',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '1,000x Max',
    desc: 'Drop golden balls down the 16-row pyramid',
    accent: 'from-[#10b981]/30 via-[#047857]/20 to-[#0d1322]',
    icon: Disc,
    featured: true,
  },
  {
    id: 'roulette',
    title: 'Maharaja Roulette',
    to: '/roulette',
    category: 'ORIGINALS',
    rtp: '97.3% RTP',
    maxWin: '36x Straight',
    desc: 'European single-zero felt board & golden wheel',
    accent: 'from-[#e11d48]/30 via-[#881337]/20 to-[#0d1322]',
    icon: Award,
    featured: true,
  },
  {
    id: 'matka',
    title: 'Kalyan Matka Bazar',
    to: '/matka',
    category: 'DESI',
    rtp: '95.0% RTP',
    maxWin: '600x Panna',
    desc: 'Official Single Ank (9.5x), Jodi (95x) & Panna draw',
    accent: 'from-[#f59e0b]/35 via-[#78350f]/25 to-[#0d1322]',
    icon: Vault,
  },
  {
    id: 'teenpatti',
    title: 'Teen Patti Royal',
    to: '/teenpatti',
    category: 'DESI',
    rtp: '97.5% RTP',
    maxWin: '5x Trail Bonus',
    desc: 'Play Blind or Chaal against the Royal Dealer',
    accent: 'from-[#ec4899]/30 via-[#831843]/20 to-[#0d1322]',
    icon: Spade,
  },
  {
    id: 'andarbahar',
    title: 'Andar Bahar Live',
    to: '/andarbahar',
    category: 'DESI',
    rtp: '98.0% RTP',
    maxWin: '3.5x Super Bahar',
    desc: 'Classic Indian Hukum Joker card matching table',
    accent: 'from-[#10b981]/30 via-[#065f46]/25 to-[#0d1322]',
    icon: Layers,
  },
  {
    id: 'blackjack',
    title: 'VIP Blackjack 21',
    to: '/blackjack',
    category: 'TABLE',
    rtp: '99.5% RTP',
    maxWin: '3:2 Natural',
    desc: '4-shoe Vegas rules with Double Down & Stand on 17',
    accent: 'from-[#38bdf8]/25 via-[#0369a1]/20 to-[#0d1322]',
    icon: Spade,
  },
  {
    id: 'baccarat',
    title: 'Punto Baccarat',
    to: '/baccarat',
    category: 'TABLE',
    rtp: '98.94% RTP',
    maxWin: '9x Tie Bhav',
    desc: 'Player, Banker & Tie with 3rd-card squeeze',
    accent: 'from-[#14b8a6]/25 via-[#0f766e]/20 to-[#0d1322]',
    icon: Layers,
  },
  {
    id: 'slots',
    title: 'Kohinoor Reels',
    to: '/slots',
    category: 'JACKPOT',
    rtp: '97.0% RTP',
    maxWin: '500x Jackpot',
    desc: '5-reel multi-payline diamond wild slot machine',
    accent: 'from-[#a855f7]/30 via-[#581c87]/20 to-[#0d1322]',
    icon: Sparkles,
  },
  {
    id: 'wheel',
    title: 'Navratna Wheel',
    to: '/wheel',
    category: 'JACKPOT',
    rtp: '99.0% RTP',
    maxWin: '30x Multiplier',
    desc: '10 to 30 segments with customizable risk tiers',
    accent: 'from-[#fbbf24]/25 via-[#92400e]/20 to-[#0d1322]',
    icon: CircleDot,
  },
  {
    id: 'keno',
    title: 'Satta Keno 40',
    to: '/keno',
    category: 'JACKPOT',
    rtp: '99.0% RTP',
    maxWin: '1,000x Max',
    desc: 'Pick up to 10 lucky numbers on a 40-ball board',
    accent: 'from-[#6366f1]/30 via-[#312e81]/20 to-[#0d1322]',
    icon: Hash,
  },
  {
    id: 'dice',
    title: 'Bookie Roll Dice',
    to: '/dice',
    category: 'ORIGINALS',
    rtp: '99.0% RTP',
    maxWin: '99.0x Max',
    desc: 'Precision 0–100 probability slider with instant roll',
    accent: 'from-[#06b6d4]/25 via-[#155e75]/20 to-[#0d1322]',
    icon: Dices,
  },
  {
    id: 'coinflip',
    title: 'Sikka Toss Streak',
    to: '/coinflip',
    category: 'DESI',
    rtp: '98.0% RTP',
    maxWin: 'Chain Bhav',
    desc: 'Heads or Tails double-or-nothing multiplier chain',
    accent: 'from-[#eab308]/30 via-[#713f12]/20 to-[#0d1322]',
    icon: Coins,
  },
];

export default function Lobby() {
  const [session, setSession] = useState(engine.getSession());
  const [filter, setFilter] = useState<'ALL' | 'ORIGINALS' | 'DESI' | 'TABLE' | 'JACKPOT'>('ALL');
  const [search, setSearch] = useState('');
  const [topupNotice, setTopupNotice] = useState<string | null>(null);
  const topupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = engine.subscribe((s) => setSession(s));
    return () => {
      unsub();
      if (topupTimerRef.current) clearTimeout(topupTimerRef.current);
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

  const handleQuickUpiDeposit = () => {
    const utr = engine.deposit(5000, 'Instant UPI Quick Credit');
    audio.playWin();
    if (topupTimerRef.current) clearTimeout(topupTimerRef.current);
    setTopupNotice(`+₹5,000 credited via Instant UPI · UTR #${utr}`);
    topupTimerRef.current = setTimeout(() => setTopupNotice(null), 3500);
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 royal-surface border border-[#f59e0b]/35 rounded-2xl p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Decorative Custom SVG Casino Backdrop */}
            <svg
              viewBox="0 0 420 260"
              className="hidden sm:block absolute right-0 bottom-0 w-80 h-64 opacity-25 pointer-events-none"
              fill="none"
            >
              <circle cx="310" cy="140" r="95" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" />
              <circle cx="310" cy="140" r="65" stroke="#10b981" strokeWidth="2" />
              <path
                d="M20 230 Q 150 200, 240 120 T 390 25"
                stroke="#f43f5e"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="390" cy="25" r="8" fill="#fbbf24" />
              <rect x="260" y="70" width="55" height="80" rx="8" fill="#0d1322" stroke="#fbbf24" strokeWidth="2" transform="rotate(-12 260 70)" />
              <rect x="300" y="65" width="55" height="80" rx="8" fill="#0d1322" stroke="#10b981" strokeWidth="2" transform="rotate(8 300 65)" />
            </svg>

            <div className="space-y-3 max-w-xl relative z-10">
              <div className="text-xs font-bold text-[#fbbf24]">
                Official Indian Bookie Exchange · Instant UPI & IMPS · SHA-256 Verified
              </div>
              <h1
                className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                High-Voltage Casino Originals & Live Satta Bazar
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Play Aviator Crash, Mines Gold Tijori, Plinko 1000x, Royal Roulette, Kalyan Matka, Teen Patti, and Andar Bahar with instant INR payouts and transparent bookie odds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-6 relative z-10">
              <Link
                to="/crash"
                onClick={() => audio.playClick()}
                className="px-4 sm:px-5 py-2.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg whitespace-nowrap"
              >
                Play Aviator Crash
              </Link>
              <Link
                to="/mines"
                onClick={() => audio.playClick()}
                className="px-4 sm:px-5 py-2.5 bg-[#131c31] hover:bg-[#1d2a47] border border-[#24324f] text-white font-bold text-xs sm:text-sm rounded-xl whitespace-nowrap"
              >
                Mines Tijori
              </Link>
              <Link
                to="/matka"
                onClick={() => audio.playClick()}
                className="px-4 sm:px-5 py-2.5 bg-[#064e3b] hover:bg-[#065f46] border border-[#10b981]/40 text-[#10b981] font-bold text-xs sm:text-sm rounded-xl whitespace-nowrap"
              >
                Kalyan Matka (95×)
              </Link>
              <button
                type="button"
                onClick={handleQuickUpiDeposit}
                className="px-3.5 py-2.5 text-xs font-bold text-[#fbbf24] hover:text-white flex items-center gap-1.5 whitespace-nowrap"
              >
                <QrCode className="w-4 h-4 text-[#f59e0b]" />
                <span>+₹5,000 Instant UPI</span>
              </button>
            </div>

            {topupNotice && (
              <div className="mt-3 text-xs font-mono font-bold text-[#10b981] relative z-10">
                {topupNotice}
              </div>
            )}
          </div>

          {/* Right Maharaja VIP Khata Card */}
          <div className="lg:col-span-4 bg-[#0d1322] border border-[#24324f] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white">{session.username}</span>
                <span className="text-[#fbbf24] font-bold">Maharaja {vip.name}</span>
              </div>
              <div className="w-full h-2.5 bg-[#131c31] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(6, vip.progress))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#94a3b8]">
                <span>Next Tier: {vip.next}</span>
                <span className="font-mono tabular-nums">{vip.progress.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1e293b]">
              <div>
                <div className="text-[11px] text-[#94a3b8]">Total Lagaya (Wagered)</div>
                <div className="text-sm font-extrabold font-mono text-white tabular-nums mt-0.5">
                  {formatINR(session.totalWagered)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#94a3b8]">Session Khata P&L</div>
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

            <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
              <div className="text-xs text-[#94a3b8]">
                VIP Chhoot:{' '}
                <span className="text-[#10b981] font-mono font-bold">
                  {formatINR(session.rakebackBalance)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (engine.claimRakeback() > 0) audio.playWin();
                }}
                disabled={session.rakebackBalance <= 0}
                className="px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-xs font-extrabold text-[#070b14] rounded-lg whitespace-nowrap"
              >
                Claim Chhoot
              </button>
            </div>
          </div>
        </section>

        {/* Featured Spotlight: Aviator Crash, Mines, Plinko, Roulette */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold font-display text-white">
              Featured High-Roller Originals
            </h2>
            <span className="text-xs text-[#94a3b8]">
              Instant Multiplier Verification · Zero Lag
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGames.map((game) => {
              const IconComponent = game.icon;
              return (
                <Link
                  key={game.id}
                  to={game.to}
                  onClick={() => audio.playClick()}
                  className="group bg-[#0d1322] border border-[#24324f] hover:border-[#f59e0b] rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl"
                >
                  <div className={`h-36 bg-gradient-to-br ${game.accent} p-5 flex flex-col justify-between border-b border-[#24324f]/70 relative overflow-hidden`}>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-xs font-bold text-[#fbbf24]">
                        {game.rtp} · {game.maxWin}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#070b14]/80 border border-[#f59e0b]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5 text-[#fbbf24]" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="text-xl font-extrabold font-display text-white group-hover:text-[#fbbf24] transition-colors">
                        {game.title}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-[#0d1322]">
                    <p className="text-xs text-[#94a3b8] truncate pr-2">{game.desc}</p>
                    <span className="text-xs font-extrabold text-[#fbbf24] whitespace-nowrap shrink-0">
                      Play Now →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Live Satta Matka Bazar Results Strip */}
        <section className="bg-[#0d1322] border border-[#24324f] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold font-display text-white">
                Live Satta Matka Bazar Board
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Official Open Panna · Jodi · Close Panna results with 9.5× Ank and 95× Jodi bhav
              </p>
            </div>
            <Link
              to="/matka"
              onClick={() => audio.playClick()}
              className="px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap w-fit"
            >
              Open Matka Betting Board →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {LIVE_BAZAR_MARKETS.map((mkt) => (
              <Link
                key={mkt.id}
                to="/matka"
                onClick={() => audio.playClick()}
                className="bg-[#070b14] hover:bg-[#131c31] border border-[#24324f] hover:border-[#f59e0b]/50 rounded-xl p-3.5 text-center transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{mkt.name}</div>
                <div className="text-lg font-extrabold font-mono text-[#fbbf24] my-1.5 tracking-wider tabular-nums">
                  {mkt.openPanna}-{mkt.jodi}-{mkt.closePanna}
                </div>
                <div className="text-[11px] text-[#94a3b8] font-mono">
                  {mkt.openTime} · {mkt.status}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Filter Bar & Search for All 14 Games */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#0d1322] border border-[#24324f] rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Games (14)' },
              { id: 'ORIGINALS', label: 'Featured Originals' },
              { id: 'DESI', label: 'Desi & Satta Bazar' },
              { id: 'TABLE', label: 'VIP Table Games' },
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
              placeholder="Search Aviator, Matka, Teen Patti..."
              className="w-full h-10 bg-[#0d1322] border border-[#24324f] focus:border-[#f59e0b] rounded-xl pl-9 pr-3.5 text-xs text-white placeholder:text-[#64748b] outline-none"
            />
          </div>
        </section>

        {/* Full 14-Game Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => {
            const IconComponent = game.icon;
            return (
              <Link
                key={game.id}
                to={game.to}
                onClick={() => audio.playClick()}
                className="group bg-[#0d1322] border border-[#24324f] hover:border-[#f59e0b]/70 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-0.5"
              >
                <div className={`h-28 bg-gradient-to-br ${game.accent} p-5 flex items-center justify-between border-b border-[#24324f]/60`}>
                  <div>
                    <div className="text-base font-extrabold font-display text-white group-hover:text-[#fbbf24] transition-colors">
                      {game.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mt-1 font-mono tabular-nums">
                      <span>{game.rtp}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#10b981] font-bold">{game.maxWin}</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#070b14]/90 border border-[#24324f] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5 text-[#fbbf24]" />
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <p className="text-xs text-[#94a3b8] truncate pr-2">{game.desc}</p>
                  <span className="text-xs font-bold text-[#fbbf24] whitespace-nowrap shrink-0">
                    Play →
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Platform Feature Callout Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/transactions"
            className="bg-[#0d1322] border border-[#24324f] hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5"
          >
            <QrCode className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">UPI, Paytm & IMPS Passbook</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Inspect all instant INR deposits, 12-digit UTR references, and Tijori Safe transfers.
              </p>
            </div>
          </Link>

          <Link
            to="/fairness"
            className="bg-[#0d1322] border border-[#24324f] hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5"
          >
            <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">SHA-256 Seed Verifier</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Rotate client and server seeds anytime and verify every Aviator, Matka, and Roulette nonce.
              </p>
            </div>
          </Link>

          <Link
            to="/statistics"
            className="bg-[#0d1322] border border-[#24324f] hover:border-[#f59e0b]/50 p-5 rounded-2xl flex items-start gap-3.5"
          >
            <BarChart2 className="w-5 h-5 text-[#fbbf24] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Khata & RTP Telemetry</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Track realized vs. theoretical RTP, bankroll curves, and session P&L across all 14 games.
              </p>
            </div>
          </Link>
        </section>

        {/* Live Exchange Bets & Maharaja Leaderboard */}
        <Leaderboard />
      </div>
    </Layout>
  );
}