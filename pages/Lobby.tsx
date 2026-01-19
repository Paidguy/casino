import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/10 p-8 rounded-[2.5rem] flex flex-col h-full transition-all hover:-translate-y-2 hover:border-bet-primary shadow-2xl active:scale-95"
  >
    <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-15 transition-opacity blur-[50px]`}></div>
    <div className="text-6xl mb-8 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">{icon}</div>
    <div className="flex-1">
      <div className="text-2xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-bet-primary transition-colors bazar-font leading-none">{title}</div>
      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-6 opacity-80 leading-relaxed">{desc}</div>
    </div>
    <div className="flex items-center gap-3 mt-auto">
       <div className="w-2.5 h-2.5 rounded-full bg-bet-success animate-pulse shadow-[0_0_10px_#22c55e]"></div>
       <div className="text-bet-success text-[10px] font-black uppercase tracking-widest">{players} Punters In</div>
    </div>
  </Link>
);

export default function Lobby() {
  const markets = [
    { name: 'KALYAN OPEN', result: '143-8', type: 'FIXED', color: 'text-bet-primary' },
    { name: 'MILAN DAY', result: '422-8', type: 'LIVE', color: 'text-bet-success' },
    { name: 'MAIN BAZAR', result: '789-4', type: 'OFFICE', color: 'text-bet-accent' },
  ];

  return (
    <Layout>
      <div className="space-y-16 pb-20">
        {/* Compact Hero for De-cluttering */}
        <section className="relative overflow-hidden rounded-[3rem] lg:rounded-[4rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-10 lg:p-20 shadow-3xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bet-primary/10 blur-[120px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl">
                 <span className="w-2 h-2 bg-bet-primary rounded-full animate-pulse"></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-bet-primary">MADE BY @PAIDGUY • VERIFIED</span>
              </div>
              <h1 className="text-5xl lg:text-[8rem] font-black text-white italic -skew-x-12 uppercase leading-[0.8] tracking-tighter bazar-font drop-shadow-3xl">
                 BHAARI <br/> <span className="gold-text">PROFIT</span>
              </h1>
              <p className="text-base lg:text-xl font-bold text-slate-400 uppercase tracking-[0.1em] max-w-2xl leading-relaxed opacity-90">
                 Kalyan Draw & Aviator Engine Node. Secure, Provably Fair, and Pure Satta energy.
              </p>
              <div className="flex flex-wrap gap-6 pt-6">
                 <Link to="/matka" className="bg-bet-primary text-bet-950 px-16 py-6 rounded-2xl font-black uppercase text-lg tracking-[0.2em] shadow-xl hover:scale-105 transition-all bazar-font cyan-glow">Bet Lagao</Link>
                 <Link to="/fairness" className="bg-white/10 text-white px-16 py-6 rounded-2xl font-black uppercase text-lg tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all bazar-font">Audit Draw</Link>
              </div>
           </div>
        </section>

        {/* Live Market Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {markets.map(res => (
             <div key={res.name} className="bg-bet-900/40 border border-white/5 p-8 rounded-[2rem] flex justify-between items-center group hover:border-bet-primary transition-all shadow-xl backdrop-blur-md">
                <div>
                   <p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">{res.name}</p>
                   <p className={`text-5xl font-black ${res.color} bazar-font tracking-[0.1em]`}>{res.result}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-bet-accent uppercase mb-2 tracking-widest">{res.type}</p>
                   <div className="w-3 h-3 rounded-full bg-bet-success ml-auto animate-pulse"></div>
                </div>
             </div>
           ))}
        </div>

        {/* Bazar Grid */}
        <section className="space-y-10">
           <h2 className="text-4xl lg:text-6xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font px-4 leading-none">Live <span className="text-bet-primary">Bazar</span></h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="82k" color="from-bet-success to-transparent" desc="Direct Panna & Ank Fix" />
              <GameCard title="Udaan Rocket" to="/crash" icon="🚀" players="142k" color="from-bet-danger to-transparent" desc="High-Speed Multiplier Udaan" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="59k" color="from-bet-secondary to-transparent" desc="3-Card Legend Royale" />
              <GameCard title="Jackpot Slots" to="/slots" icon="🎰" players="44k" color="from-bet-accent to-transparent" desc="Diamond Jackpot Reels" />
              <GameCard title="Shubh Wheel" to="/wheel" icon="🎡" players="28k" color="from-bet-primary to-transparent" desc="Neon Multiplier Wheel" />
              <GameCard title="Kanchas (Mines)" to="/mines" icon="🧨" players="31k" color="from-bet-danger to-transparent" desc="Strategic Grid Satta" />
           </div>
        </section>
      </div>
    </Layout>
  );
}