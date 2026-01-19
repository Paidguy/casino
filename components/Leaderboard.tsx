
import React, { useState, useEffect } from 'react';
import { engine } from '../services/engine';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC = () => {
    const [tab, setTab] = useState<'WAGERED' | 'MULTIPLIER'>('WAGERED');
    const [data, setData] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetch = () => {
            const raw = engine.getLeaderboard();
            const sorted = [...raw].sort((a, b) => 
                tab === 'WAGERED' ? b.wagered - a.wagered : b.maxMultiplier - a.maxMultiplier
            );
            setData(sorted.slice(0, 10));
        };
        fetch();
        const interval = setInterval(fetch, 2000);
        return () => clearInterval(interval);
    }, [tab]);

    return (
        <section className="bg-[#0f1116] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#00e701]/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏆</div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter leading-none">Hall of Fame</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">24H High Performance Punter Ranking</p>
                    </div>
                </div>
                
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setTab('WAGERED')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'WAGERED' ? 'bg-[#00e701] text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Top Wagered
                    </button>
                    <button 
                        onClick={() => setTab('MULTIPLIER')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'MULTIPLIER' ? 'bg-[#00e701] text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Top Multiplier
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <tr>
                            <th className="px-10 py-5">Rank</th>
                            <th className="px-6 py-5">Punter</th>
                            <th className="px-6 py-5 text-right">Wagered (₹)</th>
                            <th className="px-10 py-5 text-right">Max Multiplier</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((entry, index) => (
                            <tr key={index} className={`group hover:bg-white/[0.02] transition-colors ${entry.isPlayer ? 'bg-[#00e701]/5' : ''}`}>
                                <td className="px-10 py-5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                                        index === 0 ? 'bg-yellow-500 text-black' :
                                        index === 1 ? 'bg-slate-300 text-black' :
                                        index === 2 ? 'bg-orange-700 text-white' :
                                        'bg-[#1a1d23] text-slate-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10 ${entry.isPlayer ? 'bg-[#00e701] text-black' : 'bg-slate-800 text-white'}`}>
                                            {entry.username[0]}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-black italic transform group-hover:-skew-x-6 transition-transform ${entry.isPlayer ? 'text-[#00e701]' : 'text-white'}`}>
                                                {entry.username}
                                                {entry.isPlayer && <span className="ml-2 text-[9px] bg-[#00e701]/20 px-1.5 py-0.5 rounded uppercase not-italic font-black">YOU</span>}
                                            </div>
                                            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Tier: {index < 3 ? 'Elite' : 'Pro'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="text-sm font-black font-mono text-white tabular-nums">
                                        ₹{entry.wagered.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-10 py-5 text-right">
                                    <div className={`text-sm font-black font-mono tabular-nums ${entry.maxMultiplier >= 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {entry.maxMultiplier.toFixed(2)}x
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-black/10 text-center border-t border-white/5">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] italic">Updated Real-Time via Matka Nodes • Secure & Encrypted</p>
            </div>
        </section>
    );
};
