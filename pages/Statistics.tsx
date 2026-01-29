import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { UserSession, GameType } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22d3ee', '#d946ef', '#facc15', '#22c55e', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#6366f1', '#14b8a6', '#ec4899', '#f43f5e', '#8b5cf6'];

export default function Statistics() {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setSession(engine.getSession());
    setTimeout(() => setAnimate(true), 100);
    const itv = setInterval(() => setSession(engine.getSession()), 3000);
    return () => clearInterval(itv);
  }, []);

  const stats = useMemo(() => {
      const totalBets = session.totalBets || 0;
      const totalWins = session.totalWins || 0;
      const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
      
      // Net Profit from Gameplay (Payout - Wagered)
      // We use totalPayout if available (added in recent engine update), else approximation
      const totalPayout = session.totalPayout || (session.gameStats ? Object.values(session.gameStats).reduce((a, b) => a + b.payout, 0) : 0);
      const totalWagered = session.totalWagered || 0;
      const netProfit = totalPayout - totalWagered;
      const rtp = totalWagered > 0 ? (totalPayout / totalWagered) * 100 : 0;

      // Game Distribution for Pie Chart
      const gameDist = Object.entries(session.gameStats || {}).map(([key, val]) => ({
          name: key,
          value: val.bets
      })).filter(g => g.value > 0);

      // Profit History for Area Chart (based on last 50 bets history for trend)
      const balanceHistory = [...session.history].reverse().map((h, i) => ({
          name: i + 1,
          balance: h.balanceAfter
      }));
      // Add start point if history is empty or short
      if (balanceHistory.length === 0) balanceHistory.push({ name: 0, balance: session.startBalance });

      return { winRate, netProfit, rtp, gameDist, balanceHistory, totalPayout };
  }, [session]);

  const StatCard = ({ label, value, sub, color, delay }: any) => (
      <div className={`bg-bet-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${delay}ms` }}>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</div>
          <div className={`text-3xl lg:text-5xl font-black italic -skew-x-6 tracking-tighter tabular-nums ${color} bazar-font leading-none mb-2`}>
              {value}
          </div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{sub}</div>
      </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
         <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter bazar-font leading-none mb-3">
                    Advance <span className="text-bet-secondary drop-shadow-[0_0_15px_#d946ef]">Analytics</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">Real-Time Performance Matrix</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-bet-success/10 border border-bet-success/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-bet-success animate-pulse"></div>
                <span className="text-[10px] font-black text-bet-success uppercase tracking-widest">Live Sync Active</span>
            </div>
         </header>

         {/* Hero Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Net Profit (P&L)" 
                value={`${stats.netProfit >= 0 ? '+' : ''}₹${Math.floor(stats.netProfit).toLocaleString()}`} 
                sub="Total Payouts - Total Wagers" 
                color={stats.netProfit >= 0 ? 'text-bet-success' : 'text-bet-danger'} 
                delay={0} 
            />
            <StatCard 
                label="True RTP" 
                value={`${stats.rtp.toFixed(2)}%`} 
                sub="Return to Player Ratio" 
                color={stats.rtp > 100 ? 'text-bet-success' : stats.rtp > 95 ? 'text-bet-primary' : 'text-bet-danger'} 
                delay={100} 
            />
            <StatCard 
                label="Total Volume" 
                value={`₹${Math.floor(session.totalWagered).toLocaleString()}`} 
                sub={`${session.totalBets} Total Bets`} 
                color="text-white" 
                delay={200} 
            />
             <StatCard 
                label="Win Rate" 
                value={`${stats.winRate.toFixed(1)}%`} 
                sub={`${session.totalWins} Wins / ${session.totalLosses} Losses`} 
                color="text-bet-accent" 
                delay={300} 
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Balance Trend Chart */}
             <div className="lg:col-span-2 bg-bet-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white uppercase italic -skew-x-6 bazar-font">Balance Trajectory</h3>
                    <div className="px-3 py-1 bg-black/40 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">Recent Trend</div>
                 </div>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.balanceHistory}>
                            <defs>
                                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '12px' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Balance']}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Game Distribution Pie Chart */}
             <div className="bg-bet-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col">
                 <h3 className="text-xl font-black text-white uppercase italic -skew-x-6 mb-2 bazar-font">Portfolio Mix</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Bet Count Distribution</p>
                 <div className="flex-1 min-h-[250px] relative">
                    {stats.gameDist.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.gameDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.gameDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-black text-xs uppercase tracking-widest">No Data Available</div>
                    )}
                 </div>
             </div>
         </div>

         {/* Detailed Game Stats Table */}
         <div className="bg-bet-900 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-white/5 bg-black/20">
                <h3 className="text-xl font-black text-white uppercase italic -skew-x-6 bazar-font">Detailed Performance Matrix</h3>
             </div>
             <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left">
                     <thead className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                         <tr>
                             <th className="px-8 py-5">Game Module</th>
                             <th className="px-6 py-5 text-right">Rounds</th>
                             <th className="px-6 py-5 text-right">Wagered</th>
                             <th className="px-6 py-5 text-right">Payout</th>
                             <th className="px-6 py-5 text-right">Net P&L</th>
                             <th className="px-8 py-5 text-right">RTP %</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-[11px] font-bold">
                         {Object.entries(session.gameStats || {})
                            .filter(([_, s]) => s.bets > 0)
                            .sort((a, b) => b[1].wagered - a[1].wagered)
                            .map(([game, s]) => {
                                const profit = s.payout - s.wagered;
                                const gameRtp = s.wagered > 0 ? (s.payout / s.wagered) * 100 : 0;
                                return (
                                    <tr key={game} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-black text-white uppercase italic tracking-wide group-hover:text-bet-primary transition-colors">{game}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-slate-400">{s.bets}</td>
                                        <td className="px-6 py-5 text-right text-white tabular-nums">₹{s.wagered.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right text-bet-accent tabular-nums">₹{s.payout.toLocaleString()}</td>
                                        <td className={`px-6 py-5 text-right tabular-nums font-black ${profit >= 0 ? 'text-bet-success' : 'text-bet-danger'}`}>
                                            {profit >= 0 ? '+' : ''}₹{Math.floor(profit).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className={`inline-block px-2 py-1 rounded-md text-[9px] font-black ${gameRtp > 100 ? 'bg-bet-success/10 text-bet-success' : 'bg-slate-800 text-slate-400'}`}>
                                                {gameRtp.toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                         {Object.values(session.gameStats || {}).every(s => s.bets === 0) && (
                             <tr>
                                 <td colSpan={6} className="px-8 py-12 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
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