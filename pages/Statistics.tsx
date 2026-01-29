import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { UserSession } from '../types';
import { Analytics } from '../components/Analytics';

export default function Statistics() {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setSession(engine.getSession());
    setTimeout(() => setAnimate(true), 100);
    const itv = setInterval(() => setSession(engine.getSession()), 5000);
    return () => clearInterval(itv);
  }, []);

  const winRate = session.totalBets > 0 ? (session.totalWins / session.totalBets) * 100 : 0;
  const netProfit = session.balance - session.startBalance;
  
  const StatCard = ({ label, value, sub, color, delay }: any) => (
      <div className={`bg-bet-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${delay}ms` }}>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</div>
          <div className={`text-4xl lg:text-5xl font-black italic -skew-x-6 tracking-tighter tabular-nums ${color} bazar-font leading-none mb-2`}>
              {value}
          </div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{sub}</div>
      </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
         <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter bazar-font leading-none mb-3">
                    Punter <span className="text-bet-secondary drop-shadow-[0_0_15px_#d946ef]">Stats</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">Your Career Performance Analytics</p>
            </div>
            <div className="flex gap-4">
                 <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/10 text-right">
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Age</div>
                     <div className="text-white font-black font-mono">{Math.floor((Date.now() - session.startTime) / 1000 / 60)} Mins</div>
                 </div>
            </div>
         </header>

         {/* Hero Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Total Wagered" 
                value={`₹${Math.floor(session.totalWagered).toLocaleString()}`} 
                sub="Lifetime Volume" 
                color="text-white" 
                delay={0} 
            />
            <StatCard 
                label="Net Profit" 
                value={`${netProfit >= 0 ? '+' : ''}₹${Math.floor(netProfit).toLocaleString()}`} 
                sub="Realized Gains" 
                color={netProfit >= 0 ? 'text-bet-success' : 'text-bet-danger'} 
                delay={100} 
            />
            <StatCard 
                label="Total Bets" 
                value={session.totalBets.toLocaleString()} 
                sub={`Win Rate: ${winRate.toFixed(1)}%`} 
                color="text-bet-primary" 
                delay={200} 
            />
             <StatCard 
                label="Best Multiplier" 
                value={`${session.maxMultiplier.toFixed(2)}x`} 
                sub="Highest Single Win" 
                color="text-bet-accent" 
                delay={300} 
            />
         </div>

         {/* Visual Analytics */}
         <div className={`transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <Analytics session={session} />
         </div>

         {/* Detailed Breakdown */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-bet-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-bet-primary/5 blur-[100px] pointer-events-none"></div>
                 <h3 className="text-2xl font-black text-white uppercase italic -skew-x-6 mb-8 bazar-font">Win / Loss Ratio</h3>
                 
                 <div className="flex items-center gap-4 mb-4">
                     <div className="flex-1 h-4 bg-bet-950 rounded-full overflow-hidden flex">
                         <div style={{ width: `${winRate}%` }} className="bg-bet-success shadow-[0_0_15px_#22c55e] transition-all duration-1000"></div>
                         <div className="flex-1 bg-bet-danger shadow-[0_0_15px_#f43f5e]"></div>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center text-sm font-black">
                     <div className="text-bet-success uppercase tracking-widest">{session.totalWins} Wins</div>
                     <div className="text-bet-danger uppercase tracking-widest">{session.totalLosses} Losses</div>
                 </div>
             </div>

             <div className="bg-bet-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                 <h3 className="text-2xl font-black text-white uppercase italic -skew-x-6 mb-6 bazar-font">Rakeback Status</h3>
                 
                 <div className="flex items-center justify-between mb-8">
                     <div>
                         <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Available to Claim</div>
                         <div className="text-4xl font-black text-bet-primary tabular-nums tracking-tighter bazar-font">₹{session.rakebackBalance.toFixed(2)}</div>
                     </div>
                     <button 
                        onClick={() => { engine.claimRakeback(); setSession(engine.getSession()); }}
                        disabled={session.rakebackBalance < 1}
                        className="bg-bet-primary text-bet-950 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                     >
                         Claim
                     </button>
                 </div>
                 
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide leading-relaxed">
                     You earn 0.5% of every bet placed back as instant cash, regardless of the outcome.
                 </p>
             </div>
         </div>
      </div>
    </Layout>
  );
}