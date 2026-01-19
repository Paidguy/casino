import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { GameType } from '../types';

export default function Admin() {
  const [session, setSession] = useState(engine.getSession());

  useEffect(() => {
    const interval = setInterval(() => setSession(engine.getSession()), 1000);
    return () => clearInterval(interval);
  }, []);

  const update = (key: string, val: any) => {
    engine.updateAdminSettings({ [key]: val });
    setSession(engine.getSession());
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-4xl font-black text-white italic transform -skew-x-12 tracking-tighter uppercase leading-none">
              PIT <span className="text-bet-accent">BOSS</span> COMMAND
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Operational Oversight • Reality Manipulation</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => engine.resetBalance()} className="flex-1 md:flex-none bg-bet-800 hover:bg-bet-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white border border-white/5 transition-all">Emergency Reset</button>
            <button onClick={() => engine.toggleAdmin()} className="flex-1 md:flex-none bg-bet-danger text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
           {[
             { label: 'Site Net Profit', val: `₹${Math.floor(session.settings.globalProfit).toLocaleString()}`, color: 'text-bet-success' },
             { label: 'Active Nonce', val: session.nonce, color: 'text-white' },
             { label: 'User Retention', val: '98.2%', color: 'text-bet-accent' },
             { label: 'RNG Entropy', val: 'MAX', color: 'gold-text' }
           ].map((stat, i) => (
             <div key={i} className="bg-bet-900 p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-xl group hover:border-bet-accent transition-colors">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-bet-accent">{stat.label}</div>
                <div className={`text-xl lg:text-3xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.val}</div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <section className="bg-bet-900 rounded-[3rem] border border-white/5 p-8 lg:p-12 space-y-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase italic -skew-x-6 flex items-center gap-4">
              <span className="w-3 h-3 rounded-full bg-bet-accent animate-ping"></span>
              RNG Override Filters
            </h2>

            <div className="flex items-center justify-between p-8 bg-black/40 rounded-3xl border border-white/5 hover:border-bet-accent transition-all group cursor-pointer" onClick={() => update('isRigged', !session.settings.isRigged)}>
               <div>
                 <div className="font-black text-white group-hover:text-bet-accent transition-colors uppercase tracking-tight">ENHANCED VARIANCE</div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Simulates "unlucky" streaks for retention analysis.</div>
               </div>
               <div className={`w-16 h-8 rounded-full transition-all relative ${session.settings.isRigged ? 'bg-bet-danger shadow-[0_0_15px_rgba(255,59,48,0.4)]' : 'bg-bet-950 border border-white/5'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${session.settings.isRigged ? 'left-9' : 'left-1'}`}></div>
               </div>
            </div>

            <div className="space-y-6 bg-black/40 p-8 rounded-3xl border border-white/5">
               <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Payout Limit (RTP)</label>
                  <span className="text-3xl font-black text-white tabular-nums leading-none">{Math.floor(session.settings.forcedRTP * 100)}%</span>
               </div>
               <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={session.settings.forcedRTP} 
                  onChange={(e) => update('forcedRTP', Number(e.target.value))}
                  className="w-full h-3 bg-bet-950 rounded-full appearance-none cursor-pointer accent-bet-accent"
               />
               <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <span>House Wins All</span>
                  <span>Pure Fairness</span>
               </div>
            </div>
          </section>

          <section className="bg-bet-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
             <div className="p-8 bg-bet-800 border-b border-white/5 shrink-0">
                <h2 className="text-2xl font-black text-white uppercase italic transform -skew-x-12 tracking-tighter">Software Module Edges</h2>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead className="bg-black/20 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                     <tr>
                        <th className="px-10 py-5">Module ID</th>
                        <th className="px-10 py-5 text-right">House Edge</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {Object.values(GameType).map(type => (
                       <tr key={type} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-5 font-black text-white group-hover:text-bet-accent uppercase italic text-sm tracking-tight">{type}</td>
                          <td className="px-10 py-5 text-right font-mono font-black text-bet-success text-sm tabular-nums">
                             {(session.settings.houseEdgeOverrides[type] * 100).toFixed(2)}%
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}