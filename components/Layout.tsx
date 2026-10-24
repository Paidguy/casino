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
        showNotice(`Locked ${formatINR(amt)} in Tijori Safe`);
      } else {
        showNotice('Insufficient active balance');
      }
    } else {
      if (engine.withdrawFromVault(amt)) {
        audio.playClick();
        showNotice(`Unlocked ${formatINR(amt)} to Active Wallet`);
      } else {
        showNotice('Insufficient Tijori Safe balance');
      }
    }
  };

  const handleClaimRakeback = () => {
    const claimed = engine.claimRakeback();
    if (claimed > 0) {
      audio.playWin();
      showNotice(`Claimed ${formatINR(claimed)} VIP Chhoot Rebate`);
    } else {
      showNotice('Place bets to accumulate VIP Chhoot Rebate');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1322] w-full max-w-xl rounded-2xl border border-[#24324f] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-4 bg-[#070b14] border-b border-[#24324f] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Wallet className="w-5 h-5 text-[#f59e0b] shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-white font-display truncate">
              Instant INR Cashier · UPI / Paytm / IMPS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#131c31] text-[#94a3b8] hover:text-white flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Balances Overview */}
          <div className="grid grid-cols-2 gap-3 bg-[#070b14] p-3.5 sm:p-4 rounded-xl border border-[#24324f]">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-[#94a3b8] mb-1 truncate">Active Play Wallet (INR)</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-[#fbbf24] tabular-nums truncate">
                {formatINR(session.balance)}
              </div>
            </div>
            <div className="border-l border-[#24324f] pl-3 sm:pl-4 min-w-0">
              <div className="text-[11px] sm:text-xs text-[#94a3b8] mb-1 truncate">Tijori Safe Lock</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-[#10b981] tabular-nums truncate">
                {formatINR(session.vaultBalance)}
              </div>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="grid grid-cols-4 gap-1 bg-[#070b14] p-1 rounded-xl border border-[#24324f]">
            {(['DEPOSIT', 'WITHDRAW', 'VAULT', 'VIP'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setFeedback(null);
                }}
                className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg whitespace-nowrap ${
                  tab === t
                    ? 'bg-[#f59e0b] text-[#070b14] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {t === 'DEPOSIT'
                  ? 'Deposit'
                  : t === 'WITHDRAW'
                  ? 'Withdraw'
                  : t === 'VAULT'
                  ? 'Tijori'
                  : 'VIP Chhoot'}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="px-4 py-3 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {tab === 'DEPOSIT' && (
            <div className="space-y-4">
              {/* Payment Rail Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-2">
                  Select Indian Payment Gateway (0% Fee · Instant Settlement)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('UPI_QR')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      payMethod === 'UPI_QR'
                        ? 'bg-[#131c31] border-[#f59e0b] text-white'
                        : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className="w-4 h-4 text-[#f59e0b]" />
                      <span className="text-[10px] font-mono text-[#10b981]">INSTANT</span>
                    </div>
                    <div className="text-xs font-bold">UPI / GPay</div>
                    <div className="text-[10px] text-[#64748b] truncate">PhonePe · BHIM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('PAYTM')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      payMethod === 'PAYTM'
                        ? 'bg-[#131c31] border-[#f59e0b] text-white'
                        : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Smartphone className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-[10px] font-mono text-[#10b981]">FAST</span>
                    </div>
                    <div className="text-xs font-bold">Paytm UPI</div>
                    <div className="text-[10px] text-[#64748b] truncate">Wallet & VPA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('IMPS')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      payMethod === 'IMPS'
                        ? 'bg-[#131c31] border-[#f59e0b] text-white'
                        : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className="w-4 h-4 text-[#10b981]" />
                      <span className="text-[10px] font-mono text-[#f59e0b]">24×7</span>
                    </div>
                    <div className="text-xs font-bold">IMPS / NEFT</div>
                    <div className="text-[10px] text-[#64748b] truncate">High Roller A/C</div>
                  </button>
                </div>
              </div>

              {/* Simulated Merchant VPA / Bank Details */}
              <div className="bg-[#070b14] border border-[#24324f] rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="text-[11px] text-[#94a3b8]">
                    {payMethod === 'IMPS' ? 'Bookie Nodal Bank Account' : 'Verified Merchant UPI VPA'}
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white truncate">
                    {payMethod === 'IMPS'
                      ? 'A/C: 92402008491022 · IFSC: UTIB0000124'
                      : 'maharaja.exchange@okaxis'}
                  </div>
                  <div className="text-[11px] text-[#10b981]">
                    Auto-UTR verification enabled · Instant Khata credit
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white p-1.5 shrink-0 flex items-center justify-center">
                  <QrCode className="w-9 h-9 sm:w-10 sm:h-10 text-[#070b14]" />
                </div>
              </div>

              {/* Quick INR Top-Up Chips */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-2">
                  1-Click Instant INR Top-Up
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[500, 2000, 10000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleDeposit(amt)}
                      className="h-10 bg-[#131c31] hover:bg-[#1d2a47] border border-[#24324f] hover:border-[#f59e0b] rounded-xl text-xs font-extrabold font-mono text-[#fbbf24] tabular-nums"
                    >
                      +{formatINR(amt, 0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount & Optional UTR */}
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

              <div className="flex items-center justify-between gap-3 bg-[#070b14] p-4 rounded-xl border border-[#24324f]">
                <div>
                  <div className="text-xs text-[#94a3b8]">Unclaimed VIP Chhoot</div>
                  <div className="text-lg font-extrabold font-mono text-[#10b981] tabular-nums">
                    {formatINR(session.rakebackBalance)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClaimRakeback}
                  disabled={session.rakebackBalance <= 0}
                  className="h-10 px-5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                >
                  Claim Rebate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarLink = memo(
  ({
    to,
    label,
    badge,
    icon: Icon,
    active,
    onClick,
  }: {
    to: string;
    label: string;
    badge?: string;
    icon: any;
    active: boolean;
    onClick: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
        active
          ? 'bg-[#131c31] text-[#fbbf24] border border-[#f59e0b]/40'
          : 'text-[#94a3b8] hover:bg-[#131c31]/70 hover:text-white border border-transparent'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#f59e0b]' : 'text-[#94a3b8]'}`} />
        <span className="truncate">{label}</span>
      </span>
      {badge && (
        <span className="text-[10px] font-mono font-bold text-[#10b981] shrink-0">{badge}</span>
      )}
    </Link>
  )
);

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
      { label: 'Aviator Crash', to: '/crash', icon: TrendingUp, badge: '10,000x' },
      { label: 'Mines Tijori', to: '/mines', icon: Grid, badge: '99% RTP' },
      { label: 'Plinko 1000x', to: '/plinko', icon: Disc, badge: 'HOT' },
      { label: 'Royal Roulette', to: '/roulette', icon: Award, badge: '36x' },
    ];

    const desiSatta = [
      { label: 'Kalyan Matka', to: '/matka', icon: Vault, badge: '95x Jodi' },
      { label: 'Teen Patti Royal', to: '/teenpatti', icon: Spade, badge: '5x Trail' },
      { label: 'Andar Bahar Live', to: '/andarbahar', icon: Layers, badge: 'NEW' },
    ];

    const casinoSuite = [
      { label: 'Blackjack 21', to: '/blackjack', icon: Spade },
      { label: 'Punto Baccarat', to: '/baccarat', icon: Layers },
      { label: 'Maharaja Slots', to: '/slots', icon: Sparkles },
      { label: 'Matka Wheel', to: '/wheel', icon: CircleDot },
      { label: 'Keno 40', to: '/keno', icon: Hash },
      { label: 'Pro Dice', to: '/dice', icon: Dices },
      { label: 'Sikka Coinflip', to: '/coinflip', icon: Coins },
    ];

    const platformLinks = [
      { label: 'Khata Analytics', to: '/statistics', icon: BarChart2 },
      { label: 'UPI Passbook', to: '/transactions', icon: Receipt },
      { label: 'Provably Fair', to: '/fairness', icon: ShieldCheck },
      { label: 'Bookie Math Lab', to: '/admin', icon: Sliders },
    ];

    return (
      <>
        <aside
          className={`${
            open ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 lg:w-60 bg-[#070b14] border-r border-[#1e293b] transition-transform duration-200 z-[1200] flex flex-col shrink-0`}
        >
          {/* Mobile Drawer Header */}
          <div className="lg:hidden h-14 px-4 border-b border-[#1e293b] flex items-center justify-between shrink-0">
            <span className="text-sm font-extrabold font-display text-[#fbbf24]">
              MaharajaExch Games
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#131c31] text-[#94a3b8] hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
            <div>
              <SidebarLink
                to="/"
                label="Exchange Lobby"
                icon={Sparkles}
                active={pathname === '/'}
                onClick={() => {
                  audio.playClick();
                  setOpen(false);
                }}
              />
            </div>

            <div>
              <div className="px-3 mb-1.5 text-[11px] font-bold text-[#f59e0b]">
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

          <div className="p-3 border-t border-[#1e293b] bg-[#070b14]">
            <button
              type="button"
              onClick={() => {
                engine.resetBalance();
                audio.playClick();
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
    <div className="flex flex-col h-full w-full bg-[#070b14] text-white overflow-hidden">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="h-14 sm:h-16 bg-[#0d1322] border-b border-[#24324f] flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 px-3 sm:px-6 lg:px-8 shrink-0 z-[100]">
        {/* Zone 1: Single wordmark */}
        <Link
          to="/"
          className="text-lg sm:text-xl font-extrabold font-display tracking-tight text-[#fbbf24] whitespace-nowrap shrink-0"
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
              <span className="hidden xs:inline">UPI</span>
              <span>Cashier</span>
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={location.pathname} />

        <div className="flex-1 flex flex-col min-w-0 bg-[#070b14] relative h-full">
          {/* Sub-header Live Satta Bazar Ticker & Controls */}
          <div className="h-10 bg-[#0d1322]/90 border-b border-[#1e293b] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-[#fbbf24] hover:text-white whitespace-nowrap shrink-0"
              >
                <Menu className="w-4 h-4" />
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
                <span className="hidden xs:inline">Turbo</span>
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

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-[1360px] mx-auto p-3 sm:p-5 lg:p-7 pb-20 md:pb-10">
              {children}
            </div>
          </main>

          {/* Mobile Quick Navigation Bar */}
          <div className="md:hidden h-14 bg-[#0d1322] border-t border-[#24324f] grid grid-cols-5 items-center px-1 shrink-0 z-[100]">
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