import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { sound } from '../services/sound';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Coinflip: React.FC = () => {
  const [bet, setBet] = useState<number>(100);
  const [lockedStake, setLockedStake] = useState<number>(100);
  const [choice, setChoice] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [flipping, setFlipping] = useState(false);
  const [outcome, setOutcome] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [streak, setStreak] = useState<number>(0);
  const [inStreakSession, setInStreakSession] = useState<boolean>(false);

  const getStreakMultiplier = (s: number) => {
    if (s <= 0) return 1.0;
    return Number((0.99 * Math.pow(2, s)).toFixed(2));
  };

  const currentMult = getStreakMultiplier(streak);
  const nextMult = getStreakMultiplier(streak + 1);
  const currentPayout = Math.floor(lockedStake * currentMult);

  const flipCoin = () => {
    if (flipping) return;

    if (!inStreakSession) {
      if (!gameEngine.deductStake(bet)) return;
      setLockedStake(bet);
      setInStreakSession(true);
    }

    sound.click();
    setFlipping(true);

    const floats = gameEngine.getNextFloats(streak + 1);
    const r = floats[streak] ?? floats[0];

    setTimeout(() => {
      const res: 'HEADS' | 'TAILS' = r >= 0.5 ? 'HEADS' : 'TAILS';
      setOutcome(res);
      const won = res === choice;

      if (won) {
        sound.win();
        setStreak((s) => s + 1);
      } else {
        sound.lose();
        gameEngine.settleDeductedBet('Coin Flip', inStreakSession ? lockedStake : bet, 0, `Flipped ${res} (Streak Lost)`);
        setStreak(0);
        setInStreakSession(false);
      }
      setFlipping(false);
    }, 450);
  };

  const cashOutStreak = () => {
    if (!inStreakSession || streak === 0 || flipping) return;
    sound.win();
    gameEngine.settleDeductedBet(
      'Coin Flip',
      lockedStake,
      currentMult,
      `Cashed Out ${streak}-Flip Streak (${currentMult}×)`
    );
    setStreak(0);
    setInStreakSession(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-[#111927] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col-reverse lg:flex-row min-h-[600px]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[340px] bg-[#0b101b] p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-r border-white/10 shrink-0">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Coin Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['HEADS', 'TAILS'] as const).map((side) => (
              <button
                key={side}
                disabled={flipping}
                onClick={() => setChoice(side)}
                className={`py-3 rounded-xl font-black text-xs uppercase border transition-all ${
                  choice === side
                    ? 'bg-amber-500 text-slate-950 border-white shadow'
                    : 'bg-[#151f30] text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                {side === 'HEADS' ? '👑 Heads (Sun)' : '💎 Tails (Moon)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Bet Amount (₹)</span>
            <span className="font-mono text-emerald-400">Next Flip: {nextMult}×</span>
          </div>
          <div className="flex bg-[#151f30] rounded-xl border border-white/10 focus-within:border-amber-500/60 overflow-hidden">
            <div className="flex items-center pl-3.5 text-amber-400 font-mono font-bold">₹</div>
            <input
              type="number"
              value={bet}
              disabled={flipping || inStreakSession}
              onChange={(e) => setBet(Math.max(10, Number(e.target.value)))}
              className="w-full bg-transparent px-2.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-1 pr-1.5">
              <button
                disabled={flipping || inStreakSession}
                onClick={() => setBet(Math.max(10, Math.floor(bet / 2)))}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50"
              >
                ½
              </button>
              <button
                disabled={flipping || inStreakSession}
                onClick={() => setBet(bet * 2)}
                className="px-2.5 py-1.5 bg-[#1e2b42] hover:bg-[#2a3b59] rounded-lg text-xs font-bold text-slate-300 disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* Streak Multiplier Ladder */}
        <div className="bg-[#151f30] p-3.5 rounded-xl border border-white/10 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Compounding Streak Ladder
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`p-1.5 rounded-lg border text-center ${
                  streak === s
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[#0b101b] border-white/10 text-slate-400'
                }`}
              >
                <div className="text-[9px] font-bold">{s}× Hit</div>
                <div className="text-[11px] font-mono font-black text-white">
                  {getStreakMultiplier(s)}×
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="order-first lg:order-none space-y-2">
          <button
            onClick={flipCoin}
            disabled={flipping}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(245,158,11,0.3)] active:scale-[0.99] text-sm"
          >
            {flipping
              ? 'Flipping Coin...'
              : inStreakSession
              ? `Flip Again for ${nextMult}×`
              : `Start Flip (₹${bet.toLocaleString('en-IN')})`}
          </button>

          {inStreakSession && streak > 0 && (
            <button
              onClick={cashOutStreak}
              disabled={flipping}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] text-sm"
            >
              Cash Out ₹{currentPayout.toLocaleString('en-IN')} ({currentMult}×)
            </button>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HMAC-SHA256 Streak Engine
          </span>
          <span className="font-mono text-amber-400">Streak: {streak}</span>
        </div>
      </div>

      {/* Main Coinflip Stage */}
      <div className="flex-1 bg-[#0d1422] p-8 flex flex-col items-center justify-center gap-6">
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] transition-transform duration-500 ${
            flipping ? 'rotate-y-180 scale-110 animate-spin' : ''
          } ${
            outcome === 'HEADS'
              ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-amber-200 text-slate-950'
              : 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-white text-slate-950'
          }`}
        >
          <span className="text-5xl sm:text-6xl">{outcome === 'HEADS' ? '👑' : '💎'}</span>
          <span className="text-base font-black uppercase tracking-widest mt-2">{outcome}</span>
        </div>

        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected: <span className="text-amber-400">{choice}</span> · Next Flip Pays:{' '}
            <span className="text-emerald-400 font-mono">
              ₹{Math.floor((inStreakSession ? lockedStake : bet) * nextMult).toLocaleString('en-IN')} ({nextMult}×)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};