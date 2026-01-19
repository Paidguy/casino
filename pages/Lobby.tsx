import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/10 p-8 lg:p-12 rounded-[3rem] flex flex-col h-full transition-all hover:-translate-y-3 hover:border-bet-primary shadow-[0_10px_40px_rgba(0,0,0,0.5)] active:scale-95"
  >
    <div className={`absolute -top-16 -right-16 w-40 h-40 lg:w-64 lg:h-64 bg-gradient-to-br ${color} opacity-[0.08] group-hover:opacity-25 transition-opacity blur-3xl`}></div>
    <div className="text-6xl lg:text-7xl mb-8 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{icon}</div>
    <div className="flex-1">
      <div className="text-2xl lg:text-3xl font-black uppercase text-white mb-3 tracking-tighter italic group-hover:text-bet-accent transition-colors bazar-font">{title}</div>
      <div className="text-[11px] lg:text-[12px] text-slate-400 font-bold uppercase tracking-widest mb-8 opacity-80 leading-tight">{desc}</div>
    </div>
    <div className="flex items-center gap-4 mt-auto">
       <div className="w-3 h-3 rounded-full bg-bet-success animate-pulse shadow-[0_0_12px_#22c55e]"></div>
       <div className="text-bet-success text-[11px] lg:text-[12px] font-black uppercase tracking-widest">{players} Punter Live</div>
    </div>
  </Link>
);

export default function Lobby() {
  const recentResults = [
    { market: 'MILAN DAY', result: '123-6', type: 'LIVE', color: 'text-bet-primary' },
    { market: 'KALYAN', result: '456-5', type: 'DHAMAKA', color: 'text-bet-saffron' },
    { market: 'SRIDEVI', result: '789-4', type: 'LATEST', color: 'text-bet-secondary' },
  ];

  return (
    <Layout>
      <div className="space-y-16 lg:space-y-24 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3.5rem] lg:rounded-[6rem] bg-gradient-to-br from-bet-800 via-bet-950 to-black p-12 lg:p-32 shadow-[0_20px_100px_rgba(0,0,0,0.8)] border border-white/10">
           <div className="absolute top-0 right-0 w-[500px] lg:w-[1000px] h-[500px] lg:h-[1000px] bg-bet-primary/20 blur-[150px] lg:blur-[250px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 max-w-6xl space-y-10 lg:space-y-14">
              <div className="inline-flex items-center gap-5 bg-white/[0.08] px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl">
                 <span className="w-3 h-3 bg-bet-accent rounded-full animate-pulse shadow-[0_0_15px_#fbbf24]"></span>
                 <span className="text-[11px] lg:text-[13px] font-black uppercase tracking-[0.4em] text-bet-accent">BHARAT'S SUPREME SATTA EXCHANGE</span>
              </div>
              <h1 className="text-6xl lg:text-[11rem] font-black text-white italic -skew-x-12 uppercase leading-[0.8] tracking-tighter bazar-font drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                 VIBRANT <br/> <span className="gold-text">Satta Bazar</span> <br/> SUPREMACY
              </h1>
              <p className="text-base lg:text-2xl font-bold text-slate-300 uppercase tracking-[0.15em] max-w-4xl leading-relaxed opacity-90">
                 Elite Matka Draws • Instant Virtual Payouts • HMAC-SHA256 Certified Fairness. Start your winning streak in India's most luminous bazar.
              </p>
              <div className="flex flex-wrap gap-6 pt-10">
                 <Link to="/matka" className="saffron-gradient text-white px-12 py-6 lg:px-20 lg:py-9 rounded-[2rem] lg:rounded-[3rem] font-black uppercase text-[12px] lg:text-base tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all bazar-font">Bet Lagao</Link>
                 <Link to="/fairness" className="bg-bet-primary text-white px-12 py-6 lg:px-20 lg:py-9 rounded-[2rem] lg:rounded-[3rem] font-black uppercase text-[12px] lg:text-base tracking-[0.3em] border border-bet-primary/30 hover:bg-bet-primary/80 transition-all bazar-font">Audit Draw</Link>
              </div>
           </div>
        </section>

        {/* Market Feed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {recentResults.map(res => (
             <div key={res.market} className="bg-bet-900 border border-white/10 p-8 rounded-[2.5rem] flex justify-between items-center group hover:border-bet-primary transition-all card-glass shadow-xl">
                <div>
                   <p className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">{res.market}</p>
                   <p className={`text-3xl font-black ${res.color} bazar-font tracking-widest drop-shadow-[0_0_10px_currentColor]`}>{res.result}</p>
                </div>
                <div className="text-right">
                   <p className="text-[11px] font-black text-bet-accent uppercase mb-3 tracking-widest">{res.type}</p>
                   <div className="w-3.5 h-3.5 rounded-full bg-bet-success ml-auto animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                </div>
             </div>
           ))}
        </div>

        {/* Global Bazar Grid */}
        <section className="space-y-12">
           <div className="flex items-end justify-between px-5">
              <div>
                 <h2 className="text-4xl lg:text-6xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font">Vibrant <span className="text-bet-primary">Exchanges</span></h2>
                 <p className="text-[11px] lg:text-[13px] font-black text-slate-400 uppercase tracking-[0.6em] mt-4 leading-none opacity-80">Quantum Matka • Casino Royale • VIP Modules</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="24.2k" color="from-bet-success to-transparent" desc="Original Bharat Matka" />
              <GameCard title="Udaan (Aviator)" to="/crash" icon="✈️" players="42.1k" color="from-bet-danger to-transparent" desc="Neon Flight Challenge" />
              <GameCard title="Royal Slots" to="/slots" icon="🎰" players="18.4k" color="from-bet-accent to-transparent" desc="Gold Jackpot Reels" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="32.9k" color="from-bet-secondary to-transparent" desc="Bazar 3-Card Legend" />
              <GameCard title="Shubh Wheel" to="/wheel" icon="🎡" players="15.2k" color="from-bet-primary to-transparent" desc="Luminous Multiplier" />
              <GameCard title="Gully Mines" to="/mines" icon="🧨" players="16.7k" color="from-bet-saffron to-transparent" desc="Strategic Grid Satta" />
              <GameCard title="Sikka (Coin)" to="/coinflip" icon="🪙" players="8.4k" color="from-slate-300 to-transparent" desc="Instant 50/50 Satta" />
              <GameCard title="Ball Plinko" to="/plinko" icon="🎱" players="14.1k" color="from-purple-500 to-transparent" desc="Neon Ball Drops" />
           </div>
        </section>
      </div>
    </Layout>
  );
}