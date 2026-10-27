import React, { useEffect, useState } from 'react';
import { gameEngine } from '../services/engine';
import { TrendingUp, Award, BarChart3, Percent, RotateCcw } from 'lucide-react';
import { GameStats } from '../types';

export const Statistics: React.FC = () => {
  const [state, setState] = useState(gameEngine.getState());

  useEffect(() => {
    return gameEngine.subscribe(() => setState({ ...gameEngine.getState() }));
  }, []);

  const totalBets = state.history.length;
  const wins = state.history.filter((h) => h.payout > h.wager).length;
  const winRate = totalBets > 0 ? ((wins / totalBets) * 100).toFixed(1) : '0.0';

  const activeGames = (Object.entries(state.gameStats || {}) as [string, GameStats][]).filter(
    ([, stats]) => stats.bets > 0
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Player Analytics & Performance</h1>
          <p className="text-sm text-slate-400">
            Real-time breakdown of your total wagers, win rate, realized RTP, and net session profit.
          </p>
        </div>
        <button
          onClick={() => gameEngine.clearSessionStats()}
          className="px-4 py-2 rounded-xl bg-[#151f30] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Session Stats
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111927] p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Wagered</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">
            ₹{Math.floor(state.stats.totalWagered).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[#111927] p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Net Session Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl font-mono font-black ${
              state.stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {state.stats.netProfit >= 0 ? '+' : ''}₹
            {Math.floor(state.stats.netProfit).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[#111927] p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Highest Multiplier Hit</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-400">
            {state.stats.highestMultiplier.toFixed(2)}×
          </div>
        </div>

        <div className="bg-[#111927] p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Session Win Rate</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-black text-white">
            {winRate}% <span className="text-xs font-normal text-slate-400">({wins}/{totalBets})</span>
          </div>
        </div>
      </div>

      {/* Per-Game Breakdown */}
      {activeGames.length > 0 && (
        <div className="bg-[#111927] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Performance by Game
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0b101b] text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-5">Game</th>
                  <th className="py-3 px-5">Rounds</th>
                  <th className="py-3 px-5">Total Wagered</th>
                  <th className="py-3 px-5">Realized RTP</th>
                  <th className="py-3 px-5 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeGames.map(([gameName, gs]) => {
                  const net = gs.payout - gs.wagered;
                  const rtp = gs.wagered > 0 ? ((gs.payout / gs.wagered) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={gameName} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-5 font-bold text-white">{gameName}</td>
                      <td className="py-3 px-5 font-mono text-slate-300">{gs.bets}</td>
                      <td className="py-3 px-5 font-mono text-slate-300">
                        ₹{Math.floor(gs.wagered).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-5 font-mono text-amber-400">{rtp}%</td>
                      <td
                        className={`py-3 px-5 font-mono font-bold text-right ${
                          net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}₹{Math.floor(net).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Bets Table */}
      <div className="bg-[#111927] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Recent Bet History
          </h2>
          <span className="text-xs text-slate-400 font-mono">{state.history.length} Rounds</span>
        </div>
        {state.history.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No bets recorded in this session yet. Play any game to see live statistics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0b101b] text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-5">Game</th>
                  <th className="py-3 px-5">Bet Amount</th>
                  <th className="py-3 px-5">Multiplier</th>
                  <th className="py-3 px-5 text-right">Payout (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {state.history.slice(0, 20).map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-5 font-bold text-white">{b.game}</td>
                    <td className="py-3 px-5 font-mono text-slate-300">
                      ₹{b.wager.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-amber-400">
                      {b.multiplier.toFixed(2)}×
                    </td>
                    <td
                      className={`py-3 px-5 font-mono font-bold text-right ${
                        b.payout > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {b.payout > 0 ? `+₹${Math.floor(b.payout).toLocaleString('en-IN')}` : '₹0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};