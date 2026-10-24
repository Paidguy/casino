import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR, LIVE_BAZAR_MARKETS } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Matka() {
  const [selectedBazar, setSelectedBazar] = useState(LIVE_BAZAR_MARKETS[0].name);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [betMode, setBetMode] = useState<'ANK' | 'JODI' | 'PANNA' | 'EVEN_ODD'>('ANK');
  const [selectedAnk, setSelectedAnk] = useState<number>(7);
  const [selectedJodi, setSelectedJodi] = useState<string>('37');
  const [selectedPannaType, setSelectedPannaType] = useState<'SINGLE' | 'DOUBLE' | 'TRIPLE'>('SINGLE');
  const [selectedParity, setSelectedParity] = useState<'EVEN' | 'ODD'>('ODD');
  const [isDrawing, setIsDrawing] = useState(false);

  const drawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    };
  }, []);

  const [result, setResult] = useState<{
    cards: string;
    closeCards: string;
    single: number;
    jodi: string;
    pannaType: string;
    won: boolean;
    payout: number;
  } | null>(null);

  const [history, setHistory] = useState<
    { bazar: string; openPanna: string; jodi: string; closePanna: string }[]
  >([
    { bazar: 'KALYAN', openPanna: '148', jodi: '37', closePanna: '250' },
    { bazar: 'WORLI', openPanna: '369', jodi: '81', closePanna: '146' },
    { bazar: 'MILAN', openPanna: '279', jodi: '84', closePanna: '130' },
    { bazar: 'RAJDHANI', openPanna: '458', jodi: '72', closePanna: '246' },
  ]);

  const getActiveMultiplier = () => {
    if (betMode === 'ANK') return 9.5;
    if (betMode === 'JODI') return 95.0;
    if (betMode === 'PANNA') {
      return selectedPannaType === 'TRIPLE' ? 600 : selectedPannaType === 'DOUBLE' ? 300 : 150;
    }
    return 1.95;
  };

  const play = () => {
    if (isDrawing) return;
    const validStake = Math.max(10, betAmount || 100);
    if (betAmount <= 0) setBetAmount(validStake);

    if (engine.getSession().balance < validStake) {
      engine.reloadBalance(Math.max(10000, validStake * 5));
    }

    setIsDrawing(true);
    setResult(null);
    audio.playBet();

    const delay = engine.getSession().settings.instantBet ? 150 : 600;

    if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    drawTimerRef.current = setTimeout(() => {
      engine.placeBet(
        GameType.MATKA,
        validStake,
        (r) => {
          const res = engine.getSattaMatkaResult(r);
          let mult = 0;

          if (betMode === 'ANK') {
            if (res.single === selectedAnk) mult = 9.5;
          } else if (betMode === 'JODI') {
            const cleanJodi = (selectedJodi || '00').padStart(2, '0');
            if (res.jodi === cleanJodi) mult = 95.0;
          } else if (betMode === 'PANNA') {
            if (res.pannaType === selectedPannaType) {
              mult = selectedPannaType === 'TRIPLE' ? 600 : selectedPannaType === 'DOUBLE' ? 300 : 150;
            }
          } else {
            const isEven = res.single % 2 === 0;
            if ((selectedParity === 'EVEN' && isEven) || (selectedParity === 'ODD' && !isEven)) {
              mult = 1.95;
            }
          }

          const won = mult > 0;
          setResult({
            cards: res.cards,
            closeCards: res.closeCards,
            single: res.single,
            jodi: res.jodi,
            pannaType: res.pannaType,
            won,
            payout: +(validStake * mult).toFixed(2),
          });
          setHistory((prev) =>
            [
              {
                bazar: selectedBazar.split(' ')[0],
                openPanna: res.cards,
                jodi: res.jodi,
                closePanna: res.closeCards,
              },
              ...prev,
            ].slice(0, 8)
          );
          setIsDrawing(false);

          if (won) audio.playWin();
          else audio.playLoss();

          return {
            multiplier: mult,
            outcome: `${selectedBazar}: ${res.cards}-${res.jodi}-${res.closeCards}`,
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
          {/* Left Bookie Matka Slip Control Panel */}
          <div className="w-full lg:w-[340px] bg-[#131c31] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-[#24324f] shrink-0">
            <div className="space-y-4">
              {/* Primary Action Button at Top for Mobile Thumb Reach */}
              <button
                type="button"
                onClick={play}
                disabled={isDrawing}
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center active:scale-[0.99] transition-transform"
              >
                {isDrawing ? 'Drawing Matka Pot...' : `Lock Matka Parchi (${formatINR(betAmount, 0)})`}
              </button>

              {/* Bazar Market Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                  Select Official Matka Bazar
                </label>
                <select
                  value={selectedBazar}
                  onChange={(e) => setSelectedBazar(e.target.value)}
                  disabled={isDrawing}
                  className="w-full h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 text-xs font-bold text-[#fbbf24] outline-none"
                >
                  {LIVE_BAZAR_MARKETS.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.openTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4 Bet Mode Tabs */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#070b14] p-1.5 rounded-xl border border-[#24324f]">
                {[
                  { id: 'ANK', label: 'Single Ank (9.5×)' },
                  { id: 'JODI', label: 'Jodi (95×)' },
                  { id: 'PANNA', label: 'Panna (150×+)' },
                  { id: 'EVEN_ODD', label: 'Even/Odd (1.95×)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setBetMode(m.id as any)}
                    disabled={isDrawing}
                    className={`py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                      betMode === m.id
                        ? 'bg-[#f59e0b] text-[#070b14]'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Stake Input */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#94a3b8] mb-1.5">
                  <span>Parchi Stake (INR)</span>
                  <span className="font-mono text-[#fbbf24] font-bold tabular-nums">
                    {formatINR(betAmount)}
                  </span>
                </div>
                <div className="flex h-11 bg-[#070b14] border border-[#24324f] rounded-xl overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                    disabled={isDrawing}
                    className="flex-1 bg-transparent px-3 text-sm font-mono font-bold text-white outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(10, +(betAmount / 2).toFixed(0)))}
                    disabled={isDrawing}
                    className="px-3 bg-[#131c31] hover:bg-[#1d2a47] text-xs font-bold text-[#94a3b8] hover:text-white border-l border-[#24324f]"
                  >
                    ½
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetAmount(+(betAmount * 2).toFixed(0))}
                    disabled={isDrawing}
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
                      disabled={isDrawing}
                      className="py-1.5 bg-[#070b14] hover:bg-[#1d2a47] border border-[#24324f] rounded-lg text-[11px] font-mono font-bold text-[#fbbf24] tabular-nums"
                    >
                      ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    </button>
                  ))}
                </div>
              </div>

              {betMode === 'JODI' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#94a3b8]">
                    Enter 2-Digit Jodi (00 to 99) · Pays 95×
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={selectedJodi}
                    onChange={(e) => setSelectedJodi(e.target.value.replace(/\D/g, ''))}
                    disabled={isDrawing}
                    className="w-full h-11 bg-[#070b14] border border-[#f59e0b] rounded-xl px-3.5 text-center text-lg font-mono font-extrabold text-[#fbbf24] outline-none"
                  />
                  <div className="grid grid-cols-6 gap-1.5">
                    {['37', '81', '42', '50', '07', '99'].map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setSelectedJodi(j)}
                        disabled={isDrawing}
                        className={`py-1.5 rounded-lg font-mono text-xs font-bold border ${
                          selectedJodi === j
                            ? 'bg-[#f59e0b] text-[#070b14] border-white'
                            : 'bg-[#070b14] text-[#94a3b8] border-[#24324f]'
                        }`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {betMode === 'PANNA' && (
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Select Panna Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'SINGLE', label: 'Single', odds: '150×' },
                      { id: 'DOUBLE', label: 'Double', odds: '300×' },
                      { id: 'TRIPLE', label: 'Triple', odds: '600×' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPannaType(p.id as any)}
                        disabled={isDrawing}
                        className={`py-2.5 rounded-xl border text-center ${
                          selectedPannaType === p.id
                            ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-white'
                            : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                        }`}
                      >
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className="text-[11px] font-mono text-[#fbbf24]">{p.odds}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {betMode === 'EVEN_ODD' && (
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Select Open Ank Parity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['EVEN', 'ODD'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedParity(p)}
                        disabled={isDrawing}
                        className={`h-11 rounded-xl font-bold text-xs border ${
                          selectedParity === p
                            ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#fbbf24]'
                            : 'bg-[#070b14] border-[#24324f] text-[#94a3b8]'
                        }`}
                      >
                        {p} ANK (1.95×)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                  <span>Potential Bhav Payout</span>
                  <span className="font-mono text-[#fbbf24]">{getActiveMultiplier()}×</span>
                </div>
                <div className="h-11 bg-[#070b14] border border-[#24324f] rounded-xl px-3 flex items-center text-sm font-mono font-extrabold text-[#10b981] tabular-nums">
                  {formatINR(betAmount * getActiveMultiplier())}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#24324f] flex items-center justify-between text-xs text-[#94a3b8] mt-4">
              <span>95.0% RTP · Official Matka</span>
              <Link to="/fairness" className="hover:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Verify
              </Link>
            </div>
          </div>

          {/* Right Kalyan Matka Stage */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-10 space-y-5 royal-surface min-w-0">
            {/* Top Draw Chart History */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-[#fbbf24] flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-4 h-4" /> {selectedBazar}
              </span>
              <div className="flex items-center gap-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="px-3 py-1 rounded-lg bg-[#131c31] border border-[#24324f] font-mono text-xs font-bold text-white tabular-nums shrink-0"
                  >
                    <span className="text-[#94a3b8] mr-1">{h.bazar}:</span>
                    {h.openPanna}-<span className="text-[#fbbf24]">{h.jodi}</span>-{h.closePanna}
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Card Panna & Jodi Draw Display */}
            <div className="my-auto flex flex-col items-center space-y-5">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                {(result ? result.cards.split('') : ['1', '4', '8']).map((digit, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-20 sm:w-20 sm:h-28 rounded-2xl bg-[#131c31] border-2 border-[#f59e0b]/60 flex flex-col items-center justify-center font-mono text-2xl sm:text-4xl font-extrabold text-white shadow-xl"
                  >
                    <span className="text-[9px] sm:text-[10px] text-[#94a3b8] font-sans mb-0.5">
                      PATTI {idx + 1}
                    </span>
                    <span>{isDrawing ? '•' : digit}</span>
                  </div>
                ))}

                <div className="text-lg sm:text-2xl font-bold text-[#fbbf24]">→</div>

                <div
                  className={`w-16 h-20 sm:w-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl ${
                    result?.won
                      ? 'bg-[#10b981] text-[#070b14] border-white'
                      : 'bg-[#f59e0b] text-[#070b14] border-[#fef08a]'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase">ANK / JODI</span>
                  <span className="font-mono text-xl sm:text-4xl font-extrabold">
                    {isDrawing ? '••' : result ? (betMode === 'JODI' ? result.jodi : result.single) : '3 / 37'}
                  </span>
                </div>
              </div>

              {result && (
                <div
                  className={`px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-extrabold border text-center ${
                    result.won
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                      : 'bg-[#131c31] border-[#24324f] text-[#94a3b8]'
                  }`}
                >
                  {result.won
                    ? `PASS! Won +${formatINR(result.payout)} (${result.cards}-${result.jodi}-${result.closeCards})`
                    : `Declared: ${result.cards}-${result.jodi}-${result.closeCards} (${result.pannaType} PANNA)`}
                </div>
              )}

              {/* 0-9 Ank Selection Grid */}
              {betMode === 'ANK' && (
                <div className="w-full max-w-xl space-y-2">
                  <div className="text-xs font-semibold text-[#94a3b8] text-center">
                    Tap Lucky Single Ank (0–9) · Pays 9.50× Bhav
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setSelectedAnk(num);
                          audio.playClick();
                        }}
                        disabled={isDrawing}
                        className={`h-11 sm:h-14 rounded-xl font-mono font-extrabold text-base sm:text-lg border transition-colors ${
                          selectedAnk === num
                            ? 'bg-[#f59e0b] text-[#070b14] border-white shadow-lg'
                            : 'bg-[#131c31] hover:bg-[#1d2a47] text-white border-[#24324f]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-[#94a3b8] flex flex-wrap justify-between gap-2 pt-2 border-t border-[#24324f]">
              <span>Ank: 9.5× · Jodi: 95× · Single Panna: 150× · Double: 300× · Triple: 600×</span>
              <span>SHA-256 Verified Draw</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}