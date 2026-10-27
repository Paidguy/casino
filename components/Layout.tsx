import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { engine, formatINR, generateUTR } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { GameStudioBar } from './GameStudioBar';
import {
  TrendingUp,
  Grid,
  Disc,
  Dices,
  Hash,
  CircleDot,
  Coins,
  Spade,
  Award,
  Sparkles,
  Layers,
  Vault,
  BarChart2,
  Receipt,
  ShieldCheck,
  Sliders,
  Volume2,
  VolumeX,
  Wallet,
  MessageSquare,
  Menu,
  X,
  RotateCcw,
  Zap,
  CheckCircle2,
  QrCode,
  Building2,
  Smartphone,
  Crown,
} from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Casino Lobby',
  '/crash': 'Aviator Crash',
  '/mines': 'Gold Mines',
  '/plinko': 'Plinko 1000x',
  '/roulette': 'European Roulette',
  '/matka': 'Kalyan Matka Draw',
  '/teenpatti': 'Teen Patti (3-Card Poker)',
  '/andarbahar': 'Andar Bahar',
  '/blackjack': 'VIP Blackjack 21',
  '/baccarat': 'Punto Baccarat',
  '/slots': 'Diamond Slots',
  '/wheel': 'Fortune Wheel',
  '/keno': 'Keno 40',
  '/dice': 'Classic Dice',
  '/coinflip': 'Coin Flip',
  '/statistics': 'Statistics & P&L',
  '/transactions': 'Transactions & Receipts',
  '/fairness': 'Provably Fair Verifier',
  '/admin': 'Risk & RTP Console',
};

export const WalletModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [session, setSession] = useState(engine.getSession());
  const [tab, setTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'VAULT' | 'VIP'>('DEPOSIT');
  const [payMethod, setPayMethod] = useState<'UPI_QR' | 'PAYTM' | 'IMPS'>('UPI_QR');
  const [amountInput, setAmountInput] = useState('2000');
  const [upiIdInput, setUpiIdInput] = useState('player@okaxis');
  const [utrInput, setUtrInput] = useState('');
  const [vaultDirection, setVaultDirection] = useState<'TO_VAULT' | 'FROM_VAULT'>('TO_VAULT');
  const [feedback, setFeedback] = useState<string | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = engine.subscribe((s) => setSession(s));
    return () => {
      unsub();
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const vip = engine.getVipTier(session.totalWagered);

  const showNotice = (msg: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setFeedback(msg);
    noticeTimerRef.current = setTimeout(() => setFeedback(null), 4000);
  };

  const getMethodLabel = () => {
    if (payMethod === 'UPI_QR') return 'UPI Instant (GPay / PhonePe)';
    if (payMethod === 'PAYTM') return 'Paytm Wallet / UPI';
    return 'IMPS / NEFT Bank Transfer';
  };

  const handleDeposit = (amt: number) => {
    if (amt <= 0 || isNaN(amt)) return;
    const usedUtr = utrInput.trim() || generateUTR();
    const refUtr = engine.deposit(amt, getMethodLabel(), usedUtr);
    setUtrInput('');
    audio.playWin();
    showNotice(`Credited ${formatINR(amt)} via ${getMethodLabel()} · Ref #${refUtr}`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;
    const targetMethod = `${getMethodLabel()} (${upiIdInput || 'Verified Account'})`;
    const res = engine.withdraw(amt, targetMethod);
    if (res.ok) {
      audio.playClick();
      showNotice(`Withdrawal of ${formatINR(amt)} sent to ${upiIdInput} · Ref #${res.utr}`);
    } else {
      showNotice('Insufficient wallet balance for withdrawal');
    }
  };

  const handleVaultTransfer = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;
    if (vaultDirection === 'TO_VAULT') {
      if (engine.transferToVault(amt)) {
        audio.playClick();
        showNotice(`Moved ${formatINR(amt)} to Vault`);
      } else {
        showNotice('Insufficient active wallet balance');
      }
    } else {
      if (engine.withdrawFromVault(amt)) {
        audio.playClick();
        showNotice(`Transferred ${formatINR(amt)} from Vault to Wallet`);
      } else {
        showNotice('Insufficient Vault balance');
      }
    }
  };

  const handleClaimRakeback = () => {
    const claimed = engine.claimRakeback();
    if (claimed > 0) {
      audio.playWin();
      showNotice(`Claimed ${formatINR(claimed)} VIP Rakeback to Wallet`);
    } else {
      showNotice('Place bets on any game to earn instant VIP Rakeback');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1322] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#070b14] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#f59e0b]" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Wallet & Instant INR Cashier
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Instant UPI · Paytm · IMPS 24/7 Express Settlement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-lg hover:bg-[#131c31]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 bg-[#070b14] p-3.5 rounded-xl border border-white/10">
            <div>
              <span className="text-xs text-[#94a3b8] block mb-0.5">Wallet Balance</span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-[#fbbf24] tabular-nums">
                {formatINR(session.balance)}
              </span>
            </div>
            <div className="border-l border-white/10 pl-3.5">
              <span className="text-xs text-[#94a3b8] block mb-0.5">Vault Balance</span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-[#10b981] tabular-nums">
                {formatINR(session.vaultBalance)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-[#070b14] p-1 rounded-xl border border-white/10">
            {(['DEPOSIT', 'WITHDRAW', 'VAULT', 'VIP'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setFeedback(null);
                  audio.playClick();
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'bg-[#f59e0b] text-[#070b14] shadow'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {t === 'DEPOSIT'
                  ? 'Deposit'
                  : t === 'WITHDRAW'
                  ? 'Withdraw'
                  : t === 'VAULT'
                  ? 'Vault'
                  : 'VIP Rewards'}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {tab === 'DEPOSIT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI_QR', label: 'UPI / GPay / PhonePe', icon: QrCode },
                  { id: 'PAYTM', label: 'Paytm Wallet', icon: Smartphone },
                  { id: 'IMPS', label: 'IMPS Bank', icon: Building2 },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = payMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPayMethod(m.id as any);
                        audio.playClick();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col gap-1 ${
                        active
                          ? 'bg-[#131c31] border-[#f59e0b] text-white'
                          : 'bg-[#070b14] border-white/10 text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#f59e0b]' : 'text-[#64748b]'}`} />
                      <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#070b14] border border-white/10 rounded-xl p-3.5 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-lg bg-white p-1.5 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-full h-full fill-[#070b14]">
                    <rect x="4" y="4" width="18" height="18" rx="2" />
                    <rect x="8" y="8" width="10" height="10" fill="#fff" />
                    <rect x="10" y="10" width="6" height="6" />
                    <rect x="42" y="4" width="18" height="18" rx="2" />
                    <rect x="46" y="8" width="10" height="10" fill="#fff" />
                    <rect x="48" y="10" width="6" height="6" />
                    <rect x="4" y="42" width="18" height="18" rx="2" />
                    <rect x="8" y="46" width="10" height="10" fill="#fff" />
                    <rect x="10" y="48" width="6" height="6" />
                    <rect x="26" y="6" width="6" height="6" />
                    <rect x="26" y="18" width="10" height="6" />
                    <rect x="12" y="28" width="14" height="6" />
                    <rect x="32" y="28" width="12" height="12" />
                    <rect x="48" y="28" width="10" height="6" />
                    <rect x="28" y="46" width="8" height="14" />
                    <rect x="42" y="44" width="16" height="8" />
                    <rect x="46" y="54" width="14" height="6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-xs font-bold text-white truncate">
                    Merchant UPI ID: <span className="font-mono text-[#fbbf24]">maharajaclub@icici</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-snug">
                    Select any quick deposit chip below or enter a custom INR amount for instant credit.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-2">
                  Quick Deposit Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[500, 2000, 10000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleDeposit(amt)}
                      className="py-2.5 bg-[#131c31] hover:bg-[#1d2a47] border border-white/10 hover:border-[#f59e0b] rounded-xl text-xs font-mono font-bold text-[#fbbf24] transition-colors whitespace-nowrap"
                    >
                      +{formatINR(amt, 0)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full h-11 bg-[#070b14] border border-white/10 focus:border-[#f59e0b] rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    12-Digit UTR Reference (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Auto-generated if blank"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="w-full h-11 bg-[#070b14] border border-white/10 focus:border-[#f59e0b] rounded-xl px-3.5 text-xs font-mono text-white placeholder:text-[#64748b] outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeposit(parseFloat(amountInput))}
                className="w-full h-12 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg whitespace-nowrap"
              >
                Deposit {formatINR(parseFloat(amountInput) || 0)} Instantly
              </button>
            </div>
          )}

          {tab === 'WITHDRAW' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                  Receiving UPI ID or Bank Account
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="yourname@okhdfcbank"
                  className="w-full h-11 bg-[#070b14] border border-white/10 focus:border-[#f59e0b] rounded-xl px-3.5 text-sm font-mono text-white outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#94a3b8] mb-1.5">
                  <span>Withdrawal Amount (₹)</span>
                  <button
                    type="button"
                    onClick={() => setAmountInput(String(session.balance))}
                    className="text-[#f59e0b] hover:underline font-bold"
                  >
                    Max: {formatINR(session.balance)}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="flex-1 h-11 bg-[#070b14] border border-white/10 rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    className="h-11 px-6 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                  >
                    Withdraw Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'VAULT' && (
            <div className="space-y-4">
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Store winnings in your personal Vault to set aside profits during gameplay. Transfer back to your active Wallet anytime with zero fees.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setVaultDirection('TO_VAULT')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    vaultDirection === 'TO_VAULT' ? 'bg-[#131c31] text-[#fbbf24]' : 'text-[#94a3b8]'
                  }`}
                >
                  Deposit to Vault
                </button>
                <button
                  type="button"
                  onClick={() => setVaultDirection('FROM_VAULT')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    vaultDirection === 'FROM_VAULT' ? 'bg-[#131c31] text-[#10b981]' : 'text-[#94a3b8]'
                  }`}
                >
                  Withdraw to Wallet
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="flex-1 h-11 bg-[#070b14] border border-white/10 rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleVaultTransfer}
                  className="h-11 px-5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                >
                  Transfer Funds
                </button>
              </div>
            </div>
          )}

          {tab === 'VIP' && (
            <div className="space-y-4">
              <div className="bg-[#070b14] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#fbbf24]">VIP Tier: {vip.name}</span>
                  <span className="text-[#94a3b8]">Next: {vip.next} ({vip.progress.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#131c31] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b] transition-all duration-300"
                    style={{ width: `${Math.min(100, vip.progress)}%` }}
                  />
                </div>
                <div className="text-xs text-[#94a3b8]">
                  Instant Rakeback Rate:{' '}
                  <span className="text-white font-mono font-bold">{(vip.rakebackRate * 100).toFixed(2)}%</span> on every bet
                </div>
              </div>

              <div className="bg-[#070b14] p-4 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-[#94a3b8] block">Available VIP Rakeback</span>
                  <span className="text-lg font-extrabold font-mono text-[#10b981] tabular-nums">
                    {formatINR(session.rakebackBalance)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClaimRakeback}
                  className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                >
                  Claim to Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: any;
  active: boolean;
  badge?: string;
  onClick: () => void;
}

const SidebarLink = memo(({ to, label, icon: Icon, active, badge, onClick }: SidebarLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
      active
        ? 'bg-[#131c31] text-[#fbbf24] border border-[#f59e0b]/40 shadow-sm'
        : 'text-[#94a3b8] hover:bg-[#131c31]/60 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#f59e0b]' : 'text-[#64748b]'}`} />
      <span className="truncate">{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] font-mono font-bold text-[#10b981] shrink-0 ml-1">{badge}</span>
    )}
  </Link>
));

const Sidebar = memo(
  ({
    open,
    setOpen,
    pathname,
  }: {
    open: boolean;
    setOpen: (o: boolean) => void;
    pathname: string;
  }) => {
    const featuredOriginals = [
      { to: '/crash', label: 'Aviator Crash', icon: TrendingUp, badge: 'HOT' },
      { to: '/mines', label: 'Gold Mines', icon: Grid, badge: '99%' },
      { to: '/plinko', label: 'Plinko 1000x', icon: Disc, badge: '1000x' },
      { to: '/roulette', label: 'European Roulette', icon: Award, badge: '36x' },
    ];

    const indianClassics = [
      { to: '/matka', label: 'Kalyan Matka', icon: Vault, badge: '95x' },
      { to: '/teenpatti', label: 'Teen Patti Poker', icon: Spade, badge: '5x' },
      { to: '/andarbahar', label: 'Andar Bahar', icon: Layers, badge: 'LIVE' },
    ];

    const casinoSuite = [
      { to: '/blackjack', label: 'VIP Blackjack 21', icon: Spade },
      { to: '/baccarat', label: 'Punto Baccarat', icon: Layers },
      { to: '/slots', label: 'Diamond Slots', icon: Sparkles },
      { to: '/wheel', label: 'Fortune Wheel', icon: CircleDot },
      { to: '/keno', label: 'Keno 40', icon: Hash },
      { to: '/dice', label: 'Classic Dice', icon: Dices },
      { to: '/coinflip', label: 'Coin Flip', icon: Coins },
    ];

    const platformLinks = [
      { to: '/statistics', label: 'Statistics & P&L', icon: BarChart2 },
      { to: '/transactions', label: 'Transactions', icon: Receipt },
      { to: '/fairness', label: 'Provably Fair', icon: ShieldCheck },
      { to: '/admin', label: 'Risk & RTP Lab', icon: Sliders },
    ];

    return (
      <>
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-[1200] w-64 lg:w-60 bg-[#0d1322] border-r border-white/10 flex flex-col transition-transform duration-200 ease-out shrink-0 ${
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="lg:hidden h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#070b14] shrink-0">
            <span className="text-base font-extrabold font-display text-[#fbbf24]">
              Maharaja Club
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white bg-[#131c31]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
            <div>
              <SidebarLink
                to="/"
                label="Casino Lobby"
                icon={Sparkles}
                active={pathname === '/'}
                onClick={() => {
                  audio.playClick();
                  setOpen(false);
                }}
              />
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#fbbf24]">
                Featured Originals
              </div>
              <div className="space-y-1">
                {featuredOriginals.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    badge={item.badge}
                    icon={item.icon}
                    active={pathname === item.to}
                    onClick={() => {
                      audio.playClick();
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#10b981]">
                Indian Classics
              </div>
              <div className="space-y-1">
                {indianClassics.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    badge={item.badge}
                    icon={item.icon}
                    active={pathname === item.to}
                    onClick={() => {
                      audio.playClick();
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                Table & Arcade
              </div>
              <div className="space-y-0.5">
                {casinoSuite.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    active={pathname === item.to}
                    onClick={() => {
                      audio.playClick();
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                Account & Fairness
              </div>
              <div className="space-y-0.5">
                {platformLinks.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    active={pathname === item.to}
                    onClick={() => {
                      audio.playClick();
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-white/10 bg-[#070b14] shrink-0">
            <button
              type="button"
              onClick={() => {
                engine.resetBalance();
                audio.playWin();
              }}
              className="w-full h-10 px-3 bg-[#131c31] hover:bg-[#1d2a47] border border-white/10 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Reset ₹25,000 Demo</span>
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 bg-black/65 z-[1150] lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </>
    );
  }
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(audio.isEnabled);
  const [balance, setBalance] = useState(engine.getSession().balance);
  const [instantBet, setInstantBet] = useState(engine.getSession().settings.instantBet);
  const [winToast, setWinToast] = useState<{
    game: string;
    mult: number;
    payout: number;
  } | null>(null);
  const lastBetIdRef = useRef<string | undefined>(engine.getSession().history[0]?.id);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    return engine.subscribe((s) => {
      setBalance(s.balance);
      setInstantBet(s.settings.instantBet);
      const latest = s.history[0];
      if (latest && latest.id !== lastBetIdRef.current) {
        lastBetIdRef.current = latest.id;
        if (latest.payoutAmount > latest.betAmount && latest.payoutMultiplier >= 1.9) {
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setWinToast({
            game: latest.gameType,
            mult: latest.payoutMultiplier,
            payout: latest.payoutAmount,
          });
          toastTimerRef.current = setTimeout(() => setWinToast(null), 3200);
        }
      }
    });
  }, []);

  const toggleSound = () => {
    const next = audio.toggle();
    setSoundOn(next);
  };

  const toggleInstant = () => {
    engine.updateAdminSettings({ instantBet: !instantBet });
    audio.playClick();
  };

  const currentPageTitle = PAGE_TITLES[location.pathname] || 'Casino';

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] lg:h-[100dvh] w-full bg-[#070b14] text-white lg:overflow-hidden">
      {winToast && (
        <div className="fixed top-16 right-4 z-[1250] bg-[#0d1322]/95 border-2 border-[#10b981] rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 pointer-events-none">
          <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center text-[#10b981] font-extrabold font-mono text-xs">
            {winToast.mult.toFixed(1)}×
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#fbbf24] uppercase tracking-wider">
              Big Win · {winToast.game}
            </div>
            <div className="text-sm font-extrabold font-mono text-[#10b981] tabular-nums">
              +{formatINR(winToast.payout)} Credited
            </div>
          </div>
        </div>
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 h-14 sm:h-16 bg-[#0d1322]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 px-3 sm:px-6 lg:px-8 shrink-0 z-[100]">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 text-base sm:text-xl font-extrabold font-display tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <Crown className="w-5 h-5 text-[#f59e0b]" />
          <span>
            Maharaja<span className="text-[#fbbf24]">Club</span>
          </span>
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[#94a3b8]">
          <Link
            to="/"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              location.pathname === '/' ? 'text-[#fbbf24]' : ''
            }`}
          >
            Lobby
          </Link>
          <Link
            to="/crash"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              ['/crash', '/plinko', '/mines', '/roulette'].includes(location.pathname)
                ? 'text-[#fbbf24]'
                : ''
            }`}
          >
            Originals
          </Link>
          <Link
            to="/teenpatti"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              ['/teenpatti', '/andarbahar', '/matka'].includes(location.pathname)
                ? 'text-[#fbbf24]'
                : ''
            }`}
          >
            Indian Classics
          </Link>
          <Link
            to="/blackjack"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              ['/blackjack', '/baccarat', '/slots', '/wheel', '/keno', '/dice', '/coinflip'].includes(
                location.pathname
              )
                ? 'text-[#fbbf24]'
                : ''
            }`}
          >
            Table & Slots
          </Link>
          <Link
            to="/fairness"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              location.pathname === '/fairness' ? 'text-[#fbbf24]' : ''
            }`}
          >
            Provably Fair
          </Link>
        </nav>

        {/* Zone 3: 1 Primary Action (INR Wallet & Instant Deposit Button) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setWalletOpen(true);
              audio.playClick();
            }}
            className="flex items-center bg-[#070b14] border border-[#f59e0b]/50 hover:border-[#fbbf24] rounded-xl overflow-hidden whitespace-nowrap shrink-0 shadow-md"
          >
            <span className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold font-mono text-[#fbbf24] tabular-nums">
              {formatINR(balance)}
            </span>
            <span className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-extrabold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>Wallet</span>
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={location.pathname} />

        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#070b14] relative">
          {/* Clean Utility & Context Bar */}
          <div className="sticky top-14 sm:top-16 lg:static z-[90] h-10 bg-[#0d1322]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#131c31] border border-white/10 text-xs font-bold text-[#fbbf24] hover:text-white whitespace-nowrap shrink-0"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Games</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[#94a3b8] truncate">
                <span className="font-bold text-white truncate">{currentPageTitle}</span>
                <span className="hidden sm:inline text-[#334155]">·</span>
                <span className="hidden sm:inline text-[#10b981] font-medium">
                  99.0% RTP Verified
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleInstant}
                title="Toggle Turbo Settlement"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                  instantBet
                    ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40'
                    : 'bg-[#131c31] text-[#94a3b8] hover:text-white border border-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Turbo</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                title="Toggle Sound Effects"
                className="p-1.5 rounded-lg bg-[#131c31] border border-white/5 text-[#94a3b8] hover:text-white"
              >
                {soundOn ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#fbbf24]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFeedOpen(!feedOpen)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  feedOpen
                    ? 'bg-[#f59e0b] text-[#070b14]'
                    : 'bg-[#131c31] border border-white/5 text-[#94a3b8] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Feed</span>
              </button>
            </div>
          </div>

          <main className="flex-1 lg:overflow-y-auto custom-scrollbar">
            <div className="max-w-[1360px] mx-auto p-2.5 sm:p-5 lg:p-7 pb-20 md:pb-10">
              {children}
              <GameStudioBar pathname={location.pathname} />
            </div>
          </main>

          {/* Mobile Quick Navigation Bar */}
          <div className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#0d1322]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 items-center px-1 z-[100]">
            <Link
              to="/"
              onClick={() => audio.playClick()}
              className={`flex flex-col items-center justify-center py-1 text-[10px] font-bold ${
                location.pathname === '/' ? 'text-[#fbbf24]' : 'text-[#94a3b8]'
              }`}
            >
              <Sparkles className="w-4 h-4 mb-0.5" />
              <span>Lobby</span>
            </Link>
            <Link
              to="/crash"
              onClick={() => audio.playClick()}
              className={`flex flex-col items-center justify-center py-1 text-[10px] font-bold ${
                location.pathname === '/crash' ? 'text-[#fbbf24]' : 'text-[#94a3b8]'
              }`}
            >
              <TrendingUp className="w-4 h-4 mb-0.5" />
              <span>Aviator</span>
            </Link>
            <Link
              to="/mines"
              onClick={() => audio.playClick()}
              className={`flex flex-col items-center justify-center py-1 text-[10px] font-bold ${
                location.pathname === '/mines' ? 'text-[#fbbf24]' : 'text-[#94a3b8]'
              }`}
            >
              <Grid className="w-4 h-4 mb-0.5" />
              <span>Mines</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setWalletOpen(true);
                audio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1 text-[10px] font-bold text-[#10b981]"
            >
              <Wallet className="w-4 h-4 mb-0.5" />
              <span>Wallet</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(true);
                audio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1 text-[10px] font-bold text-[#94a3b8]"
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span>All Games</span>
            </button>
          </div>
        </div>

        {/* Right Collapsible Live Bets & Chat Drawer */}
        {feedOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[1150] lg:hidden"
              onClick={() => setFeedOpen(false)}
            />
            <div className="fixed lg:static inset-y-0 right-0 w-80 max-w-[90vw] bg-[#0d1322] border-l border-white/10 z-[1200] flex flex-col shrink-0">
              <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-[#fbbf24]">Live Bets & Players Chat</span>
                <button
                  type="button"
                  onClick={() => setFeedOpen(false)}
                  className="text-[#94a3b8] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LiveFeed />
              </div>
            </div>
          </>
        )}
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
};