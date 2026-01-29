import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/5 p-6 rounded-[2rem] flex flex-col h-full transition-all hover:-translate-y-2 hover:border-bet-primary shadow-2xl active:scale-95"
  >
    <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-15 transition-opacity blur-[50px]`}></div>
    <div className="text-5xl lg:text-5xl mb-6 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">{icon}</div>
    <div className="flex-1">
      <div className="text-xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-bet-primary transition-colors bazar-font leading-none">{title}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 opacity-80 leading-relaxed">{desc}</div>
    </div>
    <div className="flex items-center gap-2 mt-auto">
       <div className="w-2 h-2 rounded-full bg-bet-success animate-pulse shadow-[0_0_10px_#22c55e]"></div>
       <div className="text-bet-success text-[9px] font-black uppercase tracking-widest">{players} Punters</div>
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
      <div className="space-y-10 lg:space-y-12 pb-20">
        {/* Compact Hero for De-cluttering */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-6 lg:p-12 shadow-3xl border border-white/5">
           <div className="absolute top-0 right-0 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-bet-primary/10 blur-[100px] lg:blur-[150px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-xl">
                 <span className="w-1.5 h-1.5 bg-bet-primary rounded-full animate-pulse"></span>
                 <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-bet-primary">DEVELOPED BY @PAIDGUY</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white italic -skew-x-12 uppercase leading-[0.9] tracking-tighter bazar-font drop-shadow-3xl">
                 BHAARI <br/> <span className="gold-text">PROFIT</span>
              </h1>
              <p className="text-sm lg:text-base font-bold text-slate-400 uppercase tracking-[0.1em] max-w-2xl leading-relaxed opacity-90">
                 Final Edition Satta Engine with Provably Fair Baccarat, Matka, and high-speed Aviator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Link to="/matka" className="bg-bet-primary text-bet-950 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:scale-105 transition-all bazar-font cyan-glow text-center">Kalyan Matka</Link>
                 <Link to="/crash" className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all bazar-font text-center">Aviator</Link>
              </div>
           </div>
        </section>

        {/* Live Market Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {markets.map(res => (
             <div key={res.name} className="bg-bet-900/60 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-bet-primary transition-all shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-bet-primary/10 transition-colors"></div>
                <div className="relative z-10">
                   <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">{res.name}</p>
                   <p className={`text-4xl font-black ${res.color} bazar-font tracking-[0.1em]`}>{res.result}</p>
                </div>
                <div className="text-right relative z-10">
                   <p className="text-[9px] font-black text-bet-accent uppercase mb-2 tracking-widest">{res.type}</p>
                   <div className="w-3 h-3 rounded-full bg-bet-success ml-auto animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                </div>
             </div>
           ))}
        </div>

        {/* All Games Grid */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-3xl lg:text-5xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font leading-none">Global <span className="text-bet-primary">Bazar</span></h2>
              <div className="hidden sm:block h-px flex-1 bg-white/5 mx-10"></div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <GameCard title="Kalyan Matka" to="/matka" icon="🏺" players="94k" color="from-bet-success to-transparent" desc="Direct Panna & Ank Fix" />
              <GameCard title="Aviator" to="/crash" icon="🚀" players="158k" color="from-bet-danger to-transparent" desc="High-Speed Multiplier Flight" />
              <GameCard title="Baccarat" to="/baccarat" icon="🤵" players="42k" color="from-bet-primary to-transparent" desc="Elite Banker vs Player" />
              <GameCard title="Keno" to="/keno" icon="🔢" players="31k" color="from-bet-secondary to-transparent" desc="40-Ball High Odds Draw" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="68k" color="from-bet-accent to-transparent" desc="Classic 3-Card Legend" />
              <GameCard title="Slots" to="/slots" icon="🎰" players="55k" color="from-bet-success to-transparent" desc="Diamond 777 Reels" />
              <GameCard title="Wheel" to="/wheel" icon="🎡" players="29k" color="from-bet-primary to-transparent" desc="Big Multiplier Spin" />
              <GameCard title="Mines" to="/mines" icon="🧨" players="34k" color="from-bet-danger to-transparent" desc="Strategic Mines Grid" />
           </div>
        </section>

        {/* Final Branding Footer */}
        <footer className="pt-10 border-t border-white/5 text-center">
            <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] mb-4">Masterfully Crafted By</div>
            <div className="text-3xl lg:text-5xl font-black text-white italic -skew-x-12 uppercase bazar-font drop-shadow-2xl">@PAID<span className="text-bet-primary">GUY</span></div>
            <div className="text-[9px] text-slate-800 font-bold uppercase tracking-widest mt-6">SattaKing.IND Pro v8.0 Final Build • Hyper-Silk Logic Engine</div>
        </footer>
      </div>
    </Layout>
  );
}