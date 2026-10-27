import React, { useState } from 'react';
import { gameEngine } from '../services/engine';
import { Settings, Wallet, RefreshCw } from 'lucide-react';

export const Admin: React.FC = () => {
  const [state, setState] = useState(gameEngine.getState());
  const [creditAmt, setCreditAmt] = useState<number>(50000);

  const addDemoFunds = () => {
    gameEngine.deposit(creditAmt, 'VIP House Credit');
    setState({ ...gameEngine.getState() });
  };

  const resetDemo = () => {
    gameEngine.resetAccount();
    setState({ ...gameEngine.getState() });
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> House Controls & Demo Sandbox
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your test bankroll, credit instant INR balance, or reset session statistics.
        </p>
      </div>

      <div className="bg-[#111927] p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10">
            <div className="text-xs font-semibold text-slate-400">Current Wallet Balance</div>
            <div className="text-2xl font-mono font-black text-white mt-1">
              ₹{Math.floor(state.balance).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10">
            <div className="text-xs font-semibold text-slate-400">VIP Wager Volume</div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-1">
              ₹{Math.floor(state.vipPoints).toLocaleString('en-IN')}
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
            onClick={resetDemo}
            className="px-6 py-3 bg-[#151f30] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset to ₹25,000
          </button>
        </div>
      </div>
    </div>
  );
};