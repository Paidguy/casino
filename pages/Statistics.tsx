import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { UserSession, GameStats } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RotateCcw, TrendingUp, Activity } from 'lucide-react';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#f43f5e', '#06b6d4', '#eab308'];

export default function Statistics() {
  const [session, setSession] = useState<UserSession>(engine.getSession());

  useEffect(() => {
    return engine.subscribe((s) => setSession(s));
  }, []);

  const stats = useMemo(() => {
    const totalBets = session.totalBets || 0;
    const totalWins = session.totalWins || 0;
    const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

    const totalPayout = session.totalPayout || 0;
    const totalWagered = session.totalWagered || 0;
    const netProfit = totalPayout - totalWagered;
    const rtp = totalWagered > 0 ? (totalPayout / totalWagered) * 100 : 0;

    const historyChronological = [...(session.history || [])].reverse();
    let postLossBets = 0;
    let escalatedAfterLoss = 0;
    for (let i = 1; i < historyChronological.length; i++) {
      const prev = historyChronological[i - 1];
      const curr = historyChronological[i];
      if (prev.payoutAmount < prev.betAmount) {
        postLossBets++;
        if (curr.betAmount > prev.betAmount * 1.15) {
          escalatedAfterLoss++;
        }
      }
    }
    const lossChasingRatio = postLossBets > 0 ? (escalatedAfterLoss / postLossBets) * 100 : 0;

    const gameDist = Object.entries(session.gameStats || {})
      .map(([key, val]) => ({
        name: key,
        value: (val as GameStats).bets,
      }))
      .filter((g) => g.value > 0);

    const balanceHistory = historyChronological.map((h, i) => ({
      name: i + 1,
      balance: h.balanceAfter,
    }));
    if (balanceHistory.length === 0) {
      balanceHistory.push({ name: 0, balance: session.startBalance });
    }

    return { winRate, netProfit, rtp, gameDist, balanceHistory, totalPayout, lossChasingRatio };
  }, [session]);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#fbbf24] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Khata Performance & Behavioral Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Session P&L & Risk Telemetry (₹ INR)
            </h1>
          </div>
          <button
            onClick={() => engine.clearSessionStats()}
            className="px-4 py-2 bg-[#131c31] hover:bg-[#1e293b] border border-[#1e293b] text-xs font-bold text-[#94a3b8] hover:text-white rounded-xl flex items-center gap-2 w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session Stats</span>
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs font-semibold text-[#94a3b8] mb-1">Net Session Profit (P&L)</div>
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums ${
                stats.netProfit >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
              }`}
            >
              {stats.netProfit >= 0 ? '+' : ''}
              {formatINR(stats.netProfit)}
            </div>
            <div className="text-[11px] text-[#64748b] mt-1">Total Payouts minus Total Wagered</div>
          </div>

          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs font-semibold text-[#94a3b8] mb-1">Realized RTP</div>
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums ${
                stats.rtp >= 100 ? 'text-[#10b981]' : 'text-white'
              }`}
            >
              {stats.rtp.toFixed(2)}%
            </div>
            <div className="text-[11px] text-[#64748b] mt-1">Theoretical Baseline: ~99.00%</div>
          </div>

          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs font-semibold text-[#94a3b8] mb-1">Total Volume Wagered</div>
            <div className="text-2xl font-extrabold font-mono text-[#fbbf24] tabular-nums">
              {formatINR(session.totalWagered)}
            </div>
            <div className="text-[11px] text-[#64748b] mt-1">
              {session.totalBets} Bets · {stats.winRate.toFixed(1)}% Win Rate
            </div>
          </div>

          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs font-semibold text-[#94a3b8] mb-1">Loss-Chasing Index</div>
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums ${
                stats.lossChasingRatio > 35 ? 'text-[#f43f5e]' : 'text-[#10b981]'
              }`}
            >
              {stats.lossChasingRatio.toFixed(1)}%
            </div>
            <div className="text-[11px] text-[#64748b] mt-1">
              {stats.lossChasingRatio > 35
                ? 'Elevated Martingale / escalation detected'
                : 'Disciplined flat / proportional sizing'}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0d1322] p-6 rounded-2xl border border-[#1e293b] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#fbbf24]" />
                <span>Khata Bankroll Trajectory</span>
              </h3>
              <span className="text-xs text-[#94a3b8]">Last {stats.balanceHistory.length} bets</span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.balanceHistory}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131c31',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [formatINR(value), 'Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0d1322] p-6 rounded-2xl border border-[#1e293b] flex flex-col">
            <h3 className="text-sm font-extrabold text-white mb-1">Game Distribution</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Share of rounds by game module</p>
            <div className="h-[240px] w-full relative">
              {stats.gameDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.gameDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.gameDist.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#0d1322"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#131c31',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                      }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#64748b] text-xs font-medium">
                  Place bets to populate game mix
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Per-Game Breakdown Table */}
        <div className="bg-[#0d1322] rounded-2xl border border-[#1e293b] overflow-hidden">
          <div className="px-6 py-4 bg-[#131c31] border-b border-[#1e293b]">
            <h3 className="text-sm font-extrabold text-white">Module Performance Matrix</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#1e293b]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Game</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Bets</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Wagered (₹)</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Payout (₹)</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Net P&L</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Realized RTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/70">
                {Object.entries((session.gameStats || {}) as Record<string, GameStats>)
                  .filter(([_, s]) => s.bets > 0)
                  .sort((a, b) => b[1].wagered - a[1].wagered)
                  .map(([game, s]) => {
                    const profit = s.payout - s.wagered;
                    const gameRtp = s.wagered > 0 ? (s.payout / s.wagered) * 100 : 0;
                    return (
                      <tr key={game} className="hover:bg-[#131c31]/60">
                        <td className="px-6 py-3.5 font-bold text-white">{game}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#94a3b8] tabular-nums">
                          {s.bets}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-white tabular-nums">
                          {formatINR(s.wagered)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#94a3b8] tabular-nums">
                          {formatINR(s.payout)}
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-mono font-bold tabular-nums ${
                            profit >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                          }`}
                        >
                          {profit >= 0 ? '+' : ''}
                          {formatINR(profit)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-[#fbbf24] tabular-nums">
                          {gameRtp.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                {Object.values(session.gameStats || {}).every((s: any) => s.bets === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#64748b]">
                      No gameplay data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}