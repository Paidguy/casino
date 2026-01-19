import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/10 p-10 rounded-[3rem] flex flex-col h-full transition-all hover:-translate-y-4 hover:border-bet-primary shadow-2xl active:scale-95"
  >
    <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${color} opacity-[0.05] group-hover:opacity-20 transition-opacity blur-[60px]`}></div>
    <div className="text-7xl mb-10 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">{icon}</div>
    <div className="flex-1">
      <div className="text-3xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-bet-primary transition-colors bazar-font leading-none">{title}</div>
      <div className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mb-8 opacity-80 leading-relaxed">{desc}</div>
    </div>
    <div className="flex items-center gap-4 mt-auto">
       <div className="w-3 h-3 rounded-full bg-bet-success animate-pulse shadow-[0_0_12px_#22c55e]"></div>
       <div className="text-bet-success text-[12px] font-black uppercase tracking-widest">{players} Punters Online</div>
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
      <div className="space-y-24 pb-20">
        {/* Mega Hero */}
        <section className="relative overflow-hidden rounded-[4rem] lg:rounded-[6rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-12 lg:p-32 shadow-3xl border border-white/10">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bet-primary/15 blur-[150px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 space-y-12">
              <div className="inline-flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-xl">
                 <span className="w-3 h-3 bg-bet-primary rounded-full animate-pulse shadow-[0_0_15px_#22d3ee]"></span>
                 <span className="text-[12px] lg:text-[14px] font-black uppercase tracking-[0.4em] text-bet-primary">BHARAT KA NO. 1 TRUSTED KHAIWAL</span>
              </div>
              <h1 className="text-6xl lg:text-[12rem] font-black text-white italic -skew-x-12 uppercase leading-[0.75] tracking-tighter bazar-font drop-shadow-3xl">
                 BHAARI <br/> <span className="gold-text">PROFIT</span> <br/> DHAMAKA
              </h1>
              <p className="text-lg lg:text-3xl font-bold text-slate-300 uppercase tracking-[0.1em] max-w-4xl leading-relaxed opacity-95">
                 Kalyan Main Draw • 100% Direct Result • High-Speed Virtual Payouts. Pure Satta, Pure Passion.
              </p>
              <div className="flex flex-wrap gap-8 pt-12">
                 <Link to="/matka" className="bg-bet-primary text-bet-950 px-20 py-8 lg:px-32 lg:py-10 rounded-[3rem] font-black uppercase text-xl lg:text-2xl tracking-[0.2em] shadow-2xl hover:scale-110 active:scale-95 transition-all bazar-font cyan-glow">Bet Lagao</Link>
                 <Link to="/fairness" className="bg-white/10 text-white px-20 py-8 lg:px-32 lg:py-10 rounded-[3rem] font-black uppercase text-xl lg:text-2xl tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all bazar-font">Check Record</Link>
              </div>
           </div>
        </section>

        {/* Live Market Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {markets.map(res => (
             <div key={res.name} className="bg-bet-900/60 border border-white/10 p-12 rounded-[3rem] flex justify-between items-center group hover:border-bet-primary transition-all shadow-2xl backdrop-blur-3xl card-glass">
                <div>
                   <p className="text-[12px] font-black text-slate-500 uppercase mb-4 tracking-widest">{res.name}</p>
                   <p className={`text-6xl font-black ${res.color} bazar-font tracking-[0.15em] drop-shadow-[0_0_10px_currentColor]`}>{res.result}</p>
                </div>
                <div className="text-right">
                   <p className="text-[12px] font-black text-bet-accent uppercase mb-4 tracking-widest">{res.type}</p>
                   <div className="w-5 h-5 rounded-full bg-bet-success ml-auto animate-pulse shadow-[0_0_20px_#22c55e]"></div>
                </div>
             </div>
           ))}
        </div>

        {/* Bazar Selection */}
        <section className="space-y-16">
           <div className="flex items-end justify-between px-6">
              <div>
                 <h2 className="text-5xl lg:text-8xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font leading-none">Live <span className="text-bet-primary">Markets</span></h2>
                 <p className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] mt-6 leading-none">Matka • Udaan • Patti • Slots</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="82k" color="from-bet-success to-transparent" desc="Direct Office Panna & Single Ank Fix" />
              <GameCard title="Udaan Rocket" to="/crash" icon="🚀" players="142k" color="from-bet-danger to-transparent" desc="High-Speed Multiplier Udaan Game" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="59k" color="from-bet-secondary to-transparent" desc="Bharat's No. 1 3-Card Legend Royale" />
              <GameCard title="Jackpot Slots" to="/slots" icon="🎰" players="44k" color="from-bet-accent to-transparent" desc="Diamond Jackpot Dhamaka Reels" />
              <GameCard title="Shubh Wheel" to="/wheel" icon="🎡" players="28k" color="from-bet-primary to-transparent" desc="Neon Multiplier Wheel Spin" />
              <GameCard title="Kanchas (Mines)" to="/mines" icon="🧨" players="31k" color="from-bet-danger to-transparent" desc="Strategic Grid Satta Logic" />
              <GameCard title="Coin Flip" to="/coinflip" icon="🪙" players="14k" color="from-slate-400 to-transparent" desc="Instant 50/50 Sikka Toss" />
              <GameCard title="Ball Plinko" to="/plinko" icon="🎱" players="22k" color="from-indigo-500 to-transparent" desc="Gravity Probability Neon Drop" />
           </div>
        </section>
      </div>
    </Layout>
  );
}