import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const MarketCard = ({ name, time, result, status }: any) => (
  <div className="bg-bet-800 p-5 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-bet-accent/40 transition-all cursor-pointer shadow-xl relative overflow-hidden">
    <div className="relative z-10 min-w-0">
      <div className="flex items-center gap-2 mb-1">
         <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${status === 'LIVE' ? 'bg-bet-success animate-pulse' : 'bg-slate-600'}`}></span>
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{time}</span>
      </div>
      <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-bet-accent transition-colors truncate">{name}</div>
    </div>
    <div className="text-right shrink-0 ml-4 relative z-10">
      <div className="text-xl font-mono font-black gold-text leading-none">{result || '---'}</div>
      <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Today's Draw</div>
    </div>
  </div>
);

const GameTile = ({ title, to, icon, players, color }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/5 p-6 lg:p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:border-bet-primary shadow-2xl"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.05] group-hover:opacity-20 transition-opacity blur-3xl`}></div>
    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{icon}</div>
    <div className="text-[10px] lg:text-xs font-black uppercase text-white mb-2 tracking-tight group-hover:text-bet-accent transition-colors">{title}</div>
    <div className="bg-bet-success/10 text-bet-success text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-bet-success/20">{players} Playing</div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-10 lg:space-y-16 pb-20">
        
        {/* Responsive Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-8 lg:p-20 shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-full h-full pointer-events-none select-none overflow-hidden">
              <span className="text-[25rem] lg:text-[45rem] font-black text-white italic -skew-x-12 absolute -top-20 -right-20 lg:-top-60 lg:-right-60 opacity-[0.03]">SK</span>
           </div>
           
           <div className="relative z-10 max-w-4xl space-y-6 lg:space-y-10">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-bet-accent text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em]">
                 <span className="w-2 h-2 rounded-full bg-bet-accent animate-ping"></span>
                 Nodes-8: Active & Stable
              </div>
              <h1 className="text-5xl lg:text-9xl font-black text-white italic -skew-x-12 uppercase leading-[0.85] tracking-tighter">
                 BHARAT <br/> <span className="gold-text">KA NO. 1</span> <br/> SATTA PORTAL
              </h1>
              <p className="text-xs lg:text-xl font-bold text-slate-400 uppercase tracking-[0.1em] leading-relaxed max-w-2xl opacity-80">
                 Experience high-fidelity Matka draws and professional casino suites powered by HMAC-SHA256 Deterministic Fairness.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                 <Link to="/matka" className="bg-bet-accent text-black px-10 py-4 lg:px-14 lg:py-6 rounded-2xl font-black uppercase text-[10px] lg:text-sm tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Betting</Link>
                 <button className="bg-white/5 text-white px-10 py-4 lg:px-14 lg:py-6 rounded-2xl font-black uppercase text-[10px] lg:text-sm tracking-widest hover:bg-white/10 border border-white/10 transition-all">VIP Group</button>
              </div>
           </div>
        </section>

        {/* Live Market Section */}
        <section className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl lg:text-4xl font-black text-white italic -skew-x-6 uppercase tracking-tighter">Market <span className="text-bet-accent">Board</span></h2>
                <p className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.5em] mt-2 italic">Real-time Satta Draw Synchronizer</p>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <MarketCard name="Kalyan Morning" time="11:00 AM" result="144-9" status="DONE" />
              <MarketCard name="Sridevi Night" time="08:00 PM" result="112-4" status="DONE" />
              <MarketCard name="Milan Day" time="03:00 PM" result="460-0" status="DONE" />
              <MarketCard name="Main Bazar" time="09:30 PM" result="---" status="LIVE" />
              <MarketCard name="Kalyan Night" time="10:00 PM" result="---" status="LIVE" />
              <MarketCard name="Rajdhani Night" time="09:00 PM" result="---" status="LIVE" />
           </div>
        </section>

        {/* Game Grid */}
        <section className="space-y-6">
           <h2 className="text-2xl lg:text-4xl font-black text-white italic -skew-x-6 uppercase tracking-tighter">Pro <span className="text-bet-accent">Suites</span></h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-8">
              <GameTile title="Aviator" to="/crash" icon="✈️" players="4.2k" color="from-rose-500 to-transparent" />
              <GameTile title="Matka Draw" to="/matka" icon="🏺" players="8.1k" color="from-emerald-500 to-transparent" />
              <GameTile title="Teen Patti" to="/teenpatti" icon="🃏" players="2.3k" color="from-indigo-500 to-transparent" />
              <GameTile title="Gold Digger" to="/mines" icon="🧨" players="1.1k" color="from-yellow-500 to-transparent" />
              <GameTile title="Roulette" to="/roulette" icon="🎡" players="900" color="from-red-500 to-transparent" />
              <GameTile title="Fairness" to="/fairness" icon="⚖️" players="Audit" color="from-slate-500 to-transparent" />
           </div>
        </section>

        {/* Trust Footer */}
        <section className="pt-20 pb-10 border-t border-white/5 text-center lg:text-left">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-10 opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-8">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 lg:h-6 invert" />
                 <span className="w-px h-8 bg-white/10 hidden lg:block"></span>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Deterministic Seed Generation via Nodes</p>
              </div>
              <div className="flex gap-10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Lat: 12ms</span>
                 <span>SSL: Encrypted</span>
                 <span>Build: V12.4.9</span>
              </div>
           </div>
        </section>
      </div>
    </Layout>
  );
}