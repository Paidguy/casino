import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles, History } from 'lucide-react';

type MatkaMode = 'SINGLE' | 'DOUBLE' | 'COMBO' | 'PARITY';

interface DrawResult {
  cards: [number, number, number];
  single: number;
  closeSingle: number;
  doubleDigit: string;
  panna: string;
}

const PANNA_PRESETS = [
  '128', '137', '146', '236', '245', '290', '380', '470', '489', '560',
  '119', '155', '227', '335', '344', '399', '588', '669', '777', '000',
];

export const Matka: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [mode, setMode] = useState<MatkaMode>('SINGLE');
  const [selectedSingle, setSelectedSingle] = useState<number>(7);
  const [selectedDouble, setSelectedDouble] = useState<string>('47');
  const [selectedCombo, setSelectedCombo] = useState<string>('128');
  const [selectedParity, setSelectedParity] = useState<'EVEN' | 'ODD'>('ODD');
  const [drawing, setDrawing] = useState<boolean>(false);
  const [lastDraw, setLastDraw] = useState<DrawResult>({
    cards: [2, 4, 8],
    single: 4,
    closeSingle: 7,
    doubleDigit: '47',
    panna: '248',
  });
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [history, setHistory] = useState<DrawResult[]>([
    { cards: [2, 4, 8], single: 4, closeSingle: 7, doubleDigit: '47', panna: '248' },
    { cards: [1, 3, 5], single: 9, closeSingle: 2, doubleDigit: '92', panna: '135' },
    { cards: [7, 7, 7], single: 1, closeSingle: 8, doubleDigit: '18', panna: '777' },
    { cards: [2, 5, 9], single: 6, closeSingle: 0, doubleDigit: '60', panna: '259' },
  ]);

  const getMultiplier = () => {
    if (mode === 'SINGLE') return 9.5;
    if (mode === 'DOUBLE') return 95;
    if (mode === 'PARITY') return 1.95;
    if (selectedCombo === '777' || selectedCombo === '000') return 600;
    return 150;
  };

  const runDraw = () => {
    const state = gameEngine.getState();
    if (drawing || bet <= 0 || bet > state.balance) return;

    sound.click();
    setDrawing(true);
    setWinAmount(null);

    const rng = gameEngine.getProvablyFairRNG ? gameEngine.getProvablyFairRNG() : Math.random;

    setTimeout(() => {
      const c1 = Math.floor(rng() * 10);
      const c2 = Math.floor(rng() * 10);
      const c3 = Math.floor(rng() * 10);
      const sorted = [c1, c2, c3].sort((a, b) => {
        const va = a === 0 ? 10 : a;
        const vb = b === 0 ? 10 : b;
        return va - vb;
      }) as [number, number, number];

      const single = (c1 + c2 + c3) % 10;
      const closeSingle = Math.floor(rng() * 10);
      const doubleDigit = `${single}${closeSingle}`;
      const panna = sorted.join('');

      const result: DrawResult = {
        cards: sorted,
        single,
        closeSingle,
        doubleDigit,
        panna,
      };

      setLastDraw(result);
      setHistory((prev) => [result, ...prev.slice(0, 7)]);

      let won = false;
      let mult = 0;

      if (mode === 'SINGLE' && single === selectedSingle) {
        won = true;
        mult = 9.5;
      } else if (mode === 'DOUBLE' && doubleDigit === selectedDouble.padStart(2, '0')) {
        won = true;
        mult = 95;
      } else if (mode === 'COMBO' && panna === selectedCombo) {
        won = true;
        mult = selectedCombo === '777' || selectedCombo === '000' ? 600 : 150;
      } else if (mode === 'PARITY') {
        const isEven = single % 2 === 0;
        if ((selectedParity === 'EVEN' && isEven) || (selectedParity === 'ODD' && !isEven)) {
          won = true;
          mult = 1.95;
        }
      }

      gameEngine.placeBet('Kalyan Matka', bet, won ? mult : 0);

      if (won) {
        sound.win();
        setWinAmount(Math.floor(bet * mult));
      } else {
        sound.lose();
        setWinAmount(0);
      }

      setDrawing(false);
    }, 650);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        {/* Game Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Draw Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#151f30] p-1.5 rounded-xl border border-white/10">
            {[
              { id: 'SINGLE', label: 'Single Digit', sub: '9.5× Payout' },
              { id: 'DOUBLE', label: 'Double Digit', sub: '95× Payout' },
              { id: 'COMBO', label: '3-Card Combo', sub: '150×–600×' },
              { id: 'PARITY', label: 'Even / Odd', sub: '1.95× Payout' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as MatkaMode)}
                className={`p-2 rounded-lg text-left transition-all ${
                  mode === m.id
                    ? 'bg-[#22304a] text-white border border-amber-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[10px] font-mono text-amber-400">{m.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-emerald-400">
              Potential Win: ₹{Math.floor(bet * getMultiplier()).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={drawing}
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
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[100, 500, 1000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBet(amt)}
                className="py-1.5 bg-[#151f30] hover:bg-[#1e2b42] border border-white/5 rounded-lg text-[11px] font-mono font-bold text-slate-300"
              >
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>

        {/* Active Pick Summary */}
        <div className="bg-[#151f30] p-3.5 rounded-xl border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Selected Pick</div>
            <div className="text-lg font-mono font-black text-amber-400">
              {mode === 'SINGLE' && `Digit #${selectedSingle}`}
              {mode === 'DOUBLE' && `Pair #${selectedDouble}`}
              {mode === 'COMBO' && `Combo #${selectedCombo}`}
              {mode === 'PARITY' && `${selectedParity} Digit`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold">Multiplier</div>
            <div className="text-lg font-mono font-black text-white">{getMultiplier()}×</div>
          </div>
        </div>

        {/* Primary CTA Button (Top on mobile via order-first, natural bottom on desktop via lg:order-none) */}
        <div className="order-first lg:order-none">
          <button
            onClick={runDraw}
            disabled={drawing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {drawing ? 'Drawing 3 Cards...' : `Draw Now (₹${bet.toLocaleString('en-IN')})`}
          </button>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant 3-Card Number Draw
          </span>
          <span className="font-mono text-slate-500">Kalyan Format</span>
        </div>
      </div>

      {/* Main Matka Stage */}
      <div className="flex-1 royal-surface p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6">
        {/* Top Live Draw Pot Showcase */}
        <div className="bg-[#0b111e]/90 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* 3 Drawn Cards */}
            <div className="flex gap-2">
              {lastDraw.cards.map((c, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-gradient-to-b from-white to-slate-200 border-2 border-amber-400 shadow-lg flex flex-col items-center justify-between p-2 text-slate-900 ${
                    drawing ? 'animate-pulse scale-95' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 self-start">C{idx + 1}</span>
                  <span className="text-2xl sm:text-3xl font-mono font-black">{c}</span>
                  <span className="text-[10px] font-bold text-amber-600 self-end">♠</span>
                </div>
              ))}
            </div>

            <div className="pl-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Official Draw Result
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                {lastDraw.panna} — <span className="text-amber-400">{lastDraw.single}</span> (Pair {lastDraw.doubleDigit})
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Sum of 3 cards ({lastDraw.cards.join(' + ')}) last digit ={' '}
                <span className="text-white font-bold">#{lastDraw.single}</span>
              </div>
            </div>
          </div>

          {winAmount !== null && (
            <div
              className={`px-5 py-3 rounded-xl border text-center shrink-0 ${
                winAmount > 0
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">
                {winAmount > 0 ? 'Winning Ticket!' : 'Result'}
              </div>
              <div className="text-xl font-mono font-black">
                {winAmount > 0 ? `+₹${winAmount.toLocaleString('en-IN')}` : 'No Match'}
              </div>
            </div>
          )}
        </div>

        {/* Selection Grid Based on Active Mode */}
        <div className="my-auto bg-[#0b111e]/80 border border-white/10 rounded-2xl p-5">
          {mode === 'SINGLE' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white">
                  Pick a Single Digit (0–9) — Pays 9.5×
                </span>
                <span className="text-xs text-slate-400">
                  Matches the last digit of the 3-card sum
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {Array.from({ length: 10 }, (_, n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedSingle(n)}
                    className={`h-16 rounded-xl font-mono font-black text-xl border transition-all flex flex-col items-center justify-center ${
                      selectedSingle === n
                        ? 'bg-amber-500 text-slate-950 border-white shadow-[0_0_20px_rgba(245,158,11,0.45)] scale-105'
                        : 'bg-[#151f30] hover:bg-[#1e2b42] text-white border-white/10'
                    }`}
                  >
                    <span>{n}</span>
                    <span className="text-[9px] font-bold opacity-75">9.5×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'DOUBLE' && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <span className="text-sm font-bold text-white">
                  Pick a Double Digit Pair (00–99) — Pays 95×
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Custom Pair:</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={selectedDouble}
                    onChange={(e) => setSelectedDouble(e.target.value.replace(/\D/g, ''))}
                    className="w-16 bg-[#151f30] border border-amber-500/50 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[
                  '07', '12', '18', '24', '29', '36', '42', '47', '53', '58',
                  '64', '69', '71', '77', '82', '88', '91', '95', '99', '00',
                ].map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedDouble(pair)}
                    className={`py-3 rounded-xl font-mono font-bold text-sm border transition-all ${
                      selectedDouble === pair
                        ? 'bg-amber-500 text-slate-950 border-white shadow-lg'
                        : 'bg-[#151f30] hover:bg-[#1e2b42] text-slate-200 border-white/10'
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'COMBO' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white">
                  Pick a 3-Card Combo — Pays 150× (Triple pays 600×)
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-10 gap-2">
                {PANNA_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedCombo(p)}
                    className={`py-3 rounded-xl font-mono font-bold text-sm border transition-all ${
                      selectedCombo === p
                        ? 'bg-amber-500 text-slate-950 border-white shadow-lg'
                        : 'bg-[#151f30] hover:bg-[#1e2b42] text-slate-200 border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'PARITY' && (
            <div className="grid grid-cols-2 gap-4">
              {(['ODD', 'EVEN'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedParity(p)}
                  className={`py-6 rounded-2xl border-2 font-black text-lg transition-all ${
                    selectedParity === p
                      ? 'bg-amber-500 text-slate-950 border-white shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                      : 'bg-[#151f30] text-white border-white/10 hover:bg-[#1e2b42]'
                  }`}
                >
                  <div>{p === 'ODD' ? 'ODD DIGIT (1, 3, 5, 7, 9)' : 'EVEN DIGIT (0, 2, 4, 6, 8)'}</div>
                  <div className="text-xs font-mono mt-1 opacity-80">1.95× Instant Payout</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Draw History */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-[#0b111e]/70 border border-white/10 px-4 py-3 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-amber-400" /> Recent Draws
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {history.map((h, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-lg bg-[#151f30] border border-white/10 text-xs font-mono flex items-center gap-1.5"
              >
                <span className="text-slate-400">{h.panna}</span>
                <span className="text-amber-400 font-black">#{h.single}</span>
                <span className="text-slate-500">({h.doubleDigit})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};