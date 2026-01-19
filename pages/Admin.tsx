
import React, { useState, useEffect } from 'react';
// Fix: Layout is a named export, not a default export.
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
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <header className="flex justify-between items-center border-b border-casino-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white italic transform -skew-x-6 tracking-tighter">
              PIT <span className="text-casino-accent">BOSS</span> COMMAND
            </h1>
            <p className="text-casino-600 font-bold uppercase text-[10px] tracking-[0.3em]">Operational Oversight • Reality Manipulation</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => engine.resetBalance()} className="bg-casino-800 hover:bg-casino-700 px-4 py-2 rounded-lg font-bold text-xs text-white border border-casino-700 transition-all">Emergency Reset</button>
            <button onClick={() => engine.toggleAdmin()} className="bg-casino-loss text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Site Net Profit', val: `$${session.settings.globalProfit.toLocaleString()}`, color: 'text-casino-win' },
             { label: 'Active Nonce', val: session.nonce, color: 'text-white' },
             { label: 'User Retention', val: '98.2%', color: 'text-casino-accent' },
             { label: 'RNG Entropy', val: 'MAX', color: 'text-casino-gold' }
           ].map((stat, i) => (
             <div key={i} className="bg-casino-900 p-6 rounded-2xl border border-casino-800 shadow-xl group hover:border-casino-accent transition-colors">
                <div className="text-[10px] font-bold text-casino-600 uppercase tracking-widest mb-2 group-hover:text-casino-accent">{stat.label}</div>
                <div className={`text-3xl font-black tabular-nums ${stat.color}`}>{stat.val}</div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-casino-900 rounded-3xl border border-casino-800 p-8 space-y-8 shadow-2xl">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-casino-accent animate-ping"></span>
              RNG Override Filters
            </h2>

            <div className="flex items-center justify-between p-6 bg-casino-800 rounded-2xl border border-casino-700 hover:border-casino-accent transition-all group">
               <div>
                 <div className="font-black text-white group-hover:text-casino-accent transition-colors">ENHANCED VARIANCE</div>
                 <div className="text-[10px] text-casino-600 font-bold uppercase tracking-widest mt-1">Simulates "unlucky" streaks to preserve house profit.</div>
               </div>
               <button 
                  onClick={() => update('isRigged', !session.settings.isRigged)}
                  className={`w-16 h-8 rounded-full transition-all relative ${session.settings.isRigged ? 'bg-casino-loss shadow-[0_0_15px_rgba(255,0,51,0.4)]' : 'bg-casino-950 border border-casino-700'}`}
               >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${session.settings.isRigged ? 'left-9' : 'left-1'}`}></div>
               </button>
            </div>

            <div className="space-y-4 bg-casino-800 p-6 rounded-2xl border border-casino-700">
               <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-casino-600 uppercase tracking-widest">Global Payout Limit (RTP)</label>
                  <span className="text-2xl font-black text-white">{Math.floor(session.settings.forcedRTP * 100)}%</span>
               </div>
               <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={session.settings.forcedRTP} 
                  onChange={(e) => update('forcedRTP', Number(e.target.value))}
                  className="w-full h-2 bg-casino-950 rounded-lg appearance-none cursor-pointer accent-casino-accent"
               />
               <div className="flex justify-between text-[10px] font-bold text-casino-600 uppercase">
                  <span>House Wins All</span>
                  <span>Pure Fairness</span>
               </div>
            </div>
          </section>

          <section className="bg-casino-900 rounded-3xl border border-casino-800 overflow-hidden shadow-2xl">
             <div className="p-6 bg-casino-800 border-b border-casino-700">
                <h2 className="text-xl font-black text-white uppercase italic transform -skew-x-6">Game Edge Table</h2>
             </div>
             <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
               <table className="w-full text-left">
                  <thead className="bg-casino-950/50 text-[10px] font-bold text-casino-600 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Software Module</th>
                        <th className="px-6 py-4 text-right">Edge Config</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-casino-800">
                     {Object.values(GameType).map(type => (
                       <tr key={type} className="hover:bg-casino-800/50 transition-colors group">
                          <td className="px-6 py-4 font-black text-white group-hover:text-casino-accent">{type}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-casino-win">
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
