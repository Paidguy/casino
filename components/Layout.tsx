import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { engine, formatINR, generateUTR, LIVE_BAZAR_MARKETS } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
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
} from 'lucide-react';

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
  const [upiIdInput, setUpiIdInput] = useState('punter@okaxis');
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
    return 'IMPS / NEFT Instant Transfer';
  };

  const handleDeposit = (amt: number) => {
    if (amt <= 0 || isNaN(amt)) return;
    const usedUtr = utrInput.trim() || generateUTR();
    const refUtr = engine.deposit(amt, getMethodLabel(), usedUtr);
    setUtrInput('');
    audio.playWin();
    showNotice(`Credited ${formatINR(amt)} via ${getMethodLabel()} · UTR #${refUtr}`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;
    const targetMethod = `${getMethodLabel()} (${upiIdInput || 'Verified A/C'})`;
    const res = engine.withdraw(amt, targetMethod);
    if (res.ok) {
      audio.playClick();
      showNotice(`Payout of ${formatINR(amt)} sent to ${upiIdInput} · IMPS UTR #${res.utr}`);
    } else {
      showNotice('Insufficient active wallet balance for withdrawal');
    }
  };

  const handleVaultTransfer = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;
    if (vaultDirection === 'TO_VAULT') {
      if (engine.transferToVault(amt)) {
        audio.playClick();
        showNotice(`Locked ${formatINR(amt)} in Tijori Safe Vault`);
      } else {
        showNotice('Insufficient active balance');
      }
    } else {
      if (engine.withdrawFromVault(amt)) {
        audio.playClick();
        showNotice(`Unlocked ${formatINR(amt)} from Tijori Safe to Wallet`);
      } else {
        showNotice('Insufficient Tijori Vault balance');
      }
    }
  };

  const handleClaimRakeback = () => {
    const claimed = engine.claimRakeback();
    if (claimed > 0) {
      audio.playWin();
      showNotice(`Claimed ${formatINR(claimed)} VIP Chhoot / Rebate`);
    } else {
      showNotice('Place bets on any game to accumulate instant VIP Chhoot');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1322] border border-[#24324f] rounded-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3.5 bg-[#070b14] border-b border-[#24324f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#f59e0b]" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Instant INR Cashier & Tijori Safe
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Zero-Fee UPI QR · Paytm · IMPS 24×7 Express Settlement
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

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 bg-[#070b14] p-3.5 rounded-xl border border-[#24324f]">
            <div>
              <span className="text-xs text-[#94a3b8] block mb-0.5">Active Peti Balance</span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-[#fbbf24] tabular-nums">
                {formatINR(session.balance)}
              </span>
            </div>
            <div className="border-l border-[#24324f] pl-3.5">
              <span className="text-xs text-[#94a3b8] block mb-0.5">Tijori Safe Lock</span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-[#10b981] tabular-nums">
                {formatINR(session.vaultBalance)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
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
                  ? 'Add INR'
                  : t === 'WITHDRAW'
                  ? 'Nikasi'
                  : t === 'VAULT'
                  ? 'Tijori'
                  : 'VIP Chhoot'}
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
                          : 'bg-[#070b14] border-[#24324f] text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#f59e0b]' : 'text-[#64748b]'}`} />
                      <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#070b14] border border-[#24324f] rounded-xl p-3.5 flex items-center gap-3.5">
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
                    Merchant VPA: <span className="font-mono text-[#fbbf24]">maharaja.exch@icici</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-snug">
                    Tap any quick INR Peti chip below or enter a custom amount for instant simulated UPI credit.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-2">
                  1-Tap Express INR Peti Top-Up
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[500, 2000, 10000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleDeposit(amt)}
                      className="py-2.5 bg-[#131c31] hover:bg-[#1d2a47] border border-[#24324f] hover:border-[#f59e0b] rounded-xl text-xs font-mono font-bold text-[#fbbf24] transition-colors whitespace-nowrap"
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
                    className="w-full h-11 bg-[#070b14] border border-[#24324f] focus:border-[#f59e0b] rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    12-Digit UTR (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Auto-detected if blank"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="w-full h-11 bg-[#070b14] border border-[#24324f] focus:border-[#f59e0b] rounded-xl px-3.5 text-xs font-mono text-white placeholder:text-[#64748b] outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeposit(parseFloat(amountInput))}
                className="w-full h-12 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg whitespace-nowrap"
              >
                Verify & Add {formatINR(parseFloat(amountInput) || 0)} Instantly
              </button>
            </div>
          )}

          {tab === 'WITHDRAW' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                  Receiving UPI ID / Bank A/C & IFSC
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="yourname@okhdfcbank"
                  className="w-full h-11 bg-[#070b14] border border-[#24324f] focus:border-[#f59e0b] rounded-xl px-3.5 text-sm font-mono text-white outline-none"
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
                    className="flex-1 h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    className="h-11 px-6 bg-[#10b981] hover:bg-[#059669] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                  >
                    Instant IMPS Payout
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'VAULT' && (
            <div className="space-y-4">
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Lock your winning Peti in the Tijori Safe to protect profits from high-volatility sessions. Unlock back to your active wallet anytime with zero fee.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
                <button
                  type="button"
                  onClick={() => setVaultDirection('TO_VAULT')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    vaultDirection === 'TO_VAULT' ? 'bg-[#131c31] text-[#fbbf24]' : 'text-[#94a3b8]'
                  }`}
                >
                  Lock in Tijori
                </button>
                <button
                  type="button"
                  onClick={() => setVaultDirection('FROM_VAULT')}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    vaultDirection === 'FROM_VAULT' ? 'bg-[#131c31] text-[#10b981]' : 'text-[#94a3b8]'
                  }`}
                >
                  Unlock to Wallet
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="flex-1 h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3.5 text-sm font-mono font-bold text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleVaultTransfer}
                  className="h-11 px-5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                >
                  Transfer INR
                </button>
              </div>
            </div>
          )}

          {tab === 'VIP' && (
            <div className="space-y-4">
              <div className="bg-[#070b14] p-4 rounded-xl border border-[#24324f] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#fbbf24]">Maharaja Club Tier: {vip.name}</span>
                  <span className="text-[#94a3b8]">Next: {vip.next} ({vip.progress.toFixed(1)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#131c31] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b] transition-all duration-300"
                    style={{ width: `${Math.min(100, vip.progress)}%` }}
                  />
                </div>
                <div className="text-xs text-[#94a3b8]">
                  Instant Chhoot (Rebate):{' '}
                  <span className="text-white font-mono font-bold">{(vip.rakebackRate * 100).toFixed(2)}%</span> on every wager
                </div>
              </div>

              <div className="bg-[#070b14] p-4 rounded-xl border border-[#24324f] flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-[#94a3b8] block">Unclaimed VIP Chhoot</span>
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
      { to: '/mines', label: 'Mines Gold Tijori', icon: Grid, badge: '99%' },
      { to: '/plinko', label: 'Plinko 1000x', icon: Disc, badge: '1000x' },
      { to: '/roulette', label: 'Royal Roulette', icon: Award, badge: '36x' },
    ];

    const desiSatta = [
      { to: '/matka', label: 'Kalyan Satta Matka', icon: Vault, badge: '95x' },
      { to: '/teenpatti', label: 'Teen Patti Royal', icon: Spade, badge: 'DESI' },
      { to: '/andarbahar', label: 'Andar Bahar Live', icon: Layers, badge: 'LIVE' },
    ];

    const casinoSuite = [
      { to: '/blackjack', label: 'VIP Blackjack', icon: Spade },
      { to: '/baccarat', label: 'Punto Baccarat', icon: Layers },
      { to: '/slots', label: 'Kohinoor Slots', icon: Sparkles },
      { to: '/wheel', label: 'Navratna Wheel', icon: CircleDot },
      { to: '/keno', label: 'Satta Keno 40', icon: Hash },
      { to: '/dice', label: 'Bookie Dice', icon: Dices },
      { to: '/coinflip', label: 'Sikka Toss', icon: Coins },
    ];

    const platformLinks = [
      { to: '/statistics', label: 'Session P&L Khata', icon: BarChart2 },
      { to: '/transactions', label: 'UPI & UTR Passbook', icon: Receipt },
      { to: '/fairness', label: 'SHA-256 Verifier', icon: ShieldCheck },
      { to: '/admin', label: 'Bookie Risk Lab', icon: Sliders },
    ];

    return (
      <>
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-[1200] w-64 lg:w-60 bg-[#0d1322] border-r border-[#24324f] flex flex-col transition-transform duration-200 ease-out shrink-0 ${
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="lg:hidden h-14 px-4 border-b border-[#24324f] flex items-center justify-between bg-[#070b14] shrink-0">
            <span className="text-base font-extrabold font-display text-[#fbbf24]">
              MaharajaExch Menu
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
                label="Casino & Satta Lobby"
                icon={Sparkles}
                active={pathname === '/'}
                onClick={() => {
                  audio.playClick();
                  setOpen(false);
                }}
              />
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[11px] font-bold text-[#fbbf24]">
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
              <div className="px-3 mb-1.5 text-[11px] font-bold text-[#10b981]">
                Desi & Satta Bazar
              </div>
              <div className="space-y-1">
                {desiSatta.map((item) => (
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
              <div className="px-3 mb-1.5 text-[11px] font-semibold text-[#64748b]">
                Casino & Arcade
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

            <div className="pt-2 border-t border-[#1e293b]">
              <div className="px-3 mb-1.5 text-[11px] font-semibold text-[#64748b]">
                Khata & Fairness
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

          <div className="p-3 border-t border-[#1e293b] bg-[#070b14] shrink-0">
            <button
              type="button"
              onClick={() => {
                engine.resetBalance();
                audio.playWin();
              }}
              className="w-full h-10 px-3 bg-[#131c31] hover:bg-[#1d2a47] border border-[#24324f] rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Refill ₹25,000 Demo Peti</span>
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
  const location = useLocation();

  useEffect(() => {
    return engine.subscribe((s) => {
      setBalance(s.balance);
      setInstantBet(s.settings.instantBet);
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

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] lg:h-[100dvh] w-full bg-[#070b14] text-white lg:overflow-hidden">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 h-14 sm:h-16 bg-[#0d1322]/95 backdrop-blur-md border-b border-[#24324f] flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 px-3 sm:px-6 lg:px-8 shrink-0 z-[100]">
        {/* Zone 1: Single wordmark */}
        <Link
          to="/"
          className="text-base sm:text-xl font-extrabold font-display tracking-tight text-[#fbbf24] whitespace-nowrap shrink-0"
        >
          MaharajaExch
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-semibold text-[#94a3b8]">
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
            to="/matka"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              location.pathname === '/matka' ? 'text-[#fbbf24]' : ''
            }`}
          >
            Satta Matka
          </Link>
          <Link
            to="/teenpatti"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              ['/teenpatti', '/andarbahar', '/blackjack', '/baccarat'].includes(location.pathname)
                ? 'text-[#fbbf24]'
                : ''
            }`}
          >
            Desi Cards
          </Link>
          <Link
            to="/fairness"
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              location.pathname === '/fairness' ? 'text-[#fbbf24]' : ''
            }`}
          >
            Fairness
          </Link>
        </nav>

        {/* Zone 3: 1 Primary Action (INR Wallet & Instant UPI Button) */}
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
              <span>Cashier</span>
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={location.pathname} />

        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#070b14] relative">
          {/* Sub-header Live Satta Bazar Ticker & Controls */}
          <div className="sticky top-14 sm:top-16 lg:static z-[90] h-10 bg-[#0d1322]/95 backdrop-blur-md border-b border-[#1e293b] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#131c31] border border-[#24324f] text-xs font-bold text-[#fbbf24] hover:text-white whitespace-nowrap shrink-0"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Games</span>
              </button>

              {/* Live Bazar Ticker Strip */}
              <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
                {LIVE_BAZAR_MARKETS.slice(0, 4).map((mkt, idx) => (
                  <React.Fragment key={mkt.id}>
                    {idx > 0 && <span className="text-[#334155]">·</span>}
                    <Link
                      to="/matka"
                      className="flex items-center gap-1.5 text-[#94a3b8] hover:text-white"
                    >
                      <span className="font-bold text-white">{mkt.name}:</span>
                      <span className="font-mono font-bold text-[#fbbf24] tabular-nums">
                        {mkt.openPanna}-{mkt.jodi}-{mkt.closePanna}
                      </span>
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleInstant}
                title="Toggle Turbo / Instant Settlement"
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                  instantBet
                    ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40'
                    : 'bg-[#131c31] text-[#94a3b8] hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Turbo</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                title="Toggle Casino Sound FX"
                className="p-1.5 rounded-lg bg-[#131c31] text-[#94a3b8] hover:text-white"
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
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  feedOpen
                    ? 'bg-[#f59e0b] text-[#070b14]'
                    : 'bg-[#131c31] text-[#94a3b8] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live Punters</span>
              </button>
            </div>
          </div>

          <main className="flex-1 lg:overflow-y-auto custom-scrollbar">
            <div className="max-w-[1360px] mx-auto p-2.5 sm:p-5 lg:p-7 pb-20 md:pb-10">
              {children}
            </div>
          </main>

          {/* Mobile Quick Navigation Bar */}
          <div className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#0d1322]/95 backdrop-blur-md border-t border-[#24324f] grid grid-cols-5 items-center px-1 z-[100]">
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
              to="/matka"
              onClick={() => audio.playClick()}
              className={`flex flex-col items-center justify-center py-1 text-[10px] font-bold ${
                location.pathname === '/matka' ? 'text-[#fbbf24]' : 'text-[#94a3b8]'
              }`}
            >
              <Vault className="w-4 h-4 mb-0.5" />
              <span>Matka</span>
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
              <span>Cashier</span>
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

        {/* Right Collapsible Live Bets & Punter Chat Drawer */}
        {feedOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[1150] lg:hidden"
              onClick={() => setFeedOpen(false)}
            />
            <div className="fixed lg:static inset-y-0 right-0 w-80 max-w-[90vw] bg-[#0d1322] border-l border-[#24324f] z-[1200] flex flex-col shrink-0">
              <div className="h-10 px-4 border-b border-[#24324f] flex items-center justify-between">
                <span className="text-xs font-bold text-[#fbbf24]">Live Indian Punters & Chat</span>
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