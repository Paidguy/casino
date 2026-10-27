import React, { useState, useEffect } from 'react';
import { gameEngine } from '../services/engine';
import { HOUSE_EDGES, GameType } from '../types';
import { Settings, Wallet, RefreshCw, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const Admin: React.FC = () => {
  const [state, setState] = useState(gameEngine.getState());
  const [creditAmt, setCreditAmt] = useState<number>(50000);

  useEffect(() => {
    const unsub = gameEngine.subscribe(() => setState(gameEngine.getState()));
    return unsub;
  }, []);

  const addDemoFunds = () => {
    gameEngine.deposit(creditAmt, 'VIP House Credit');
    setState(gameEngine.getState());
  };

  const resetDemo = () => {
    gameEngine.resetAccount();
    setState(gameEngine.getState());
  };

  const toggleTurbo = () => {
    gameEngine.updateAdminSettings({ instantBet: !state.settings.instantBet });
    setState(gameEngine.getState());
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" /> House Controls & Math Engine Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspect the 100% client-side HMAC-SHA256 cryptographic engine, theoretical game RTP configuration, and test bankroll controls.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-300">
          <Cpu className="w-4 h-4" />
          <span>CLIENT-SIDE HMAC-SHA256 ENGINE · ACTIVE</span>
        </div>
      </div>

      {/* Bankroll & Engine Telemetry Cards */}
      <div className="bg-[#111927] p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10">
            <div className="text-xs font-semibold text-slate-400">Current Wallet Balance</div>
            <div className="text-2xl font-mono font-black text-white mt-1">
              ₹{Math.floor(state.balance).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10">
            <div className="text-xs font-semibold text-slate-400">Session Wager Volume</div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-1">
              ₹{Math.floor(state.vipPoints).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10">
            <div className="text-xs font-semibold text-slate-400">Active Nonce & Total Rounds</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
              #{state.seeds.nonce} ({state.totalBets} Bets)
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 flex bg-[#0b101b] border border-white/10 rounded-xl overflow-hidden">
            <span className="px-4 flex items-center text-amber-400 font-mono font-bold">₹</span>
            <input
              type="number"
              value={creditAmt}
              onChange={(e) => setCreditAmt(Math.max(100, Number(e.target.value)))}
              className="w-full bg-transparent py-3 pr-4 text-white font-mono font-bold focus:outline-none"
            />
          </div>
          <button
            onClick={addDemoFunds}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" /> Credit INR Balance
          </button>
          <button
            onClick={toggleTurbo}
            className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border ${
              state.settings.instantBet
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#151f30] border-white/10 text-slate-300'
            }`}
          >
            <Zap className="w-4 h-4" /> {state.settings.instantBet ? 'Turbo Mode: ON' : 'Turbo Mode: OFF'}
          </button>
          <button
            onClick={resetDemo}
            className="px-6 py-3 bg-[#151f30] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset to ₹25,000
          </button>
        </div>
      </div>

      {/* 14-Game RTP & House Edge Matrix */}
      <div className="bg-[#111927] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official 14-Game RTP & House Edge Configuration
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-5">
          {(Object.entries(HOUSE_EDGES) as [GameType, number][]).map(([game, edge]) => {
            const rtp = ((1 - edge) * 100).toFixed(2);
            return (
              <div key={game} className="bg-[#0b101b] p-3.5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white">{game}</div>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-[11px] text-slate-400">RTP:</span>
                  <span className="text-sm font-mono font-black text-emerald-400">{rtp}%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-slate-500">Edge:</span>
                  <span className="text-xs font-mono text-amber-400">{(edge * 100).toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};