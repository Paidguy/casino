import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/10 p-10 lg:p-14 rounded-[3.5rem] flex flex-col h-full transition-all hover:-translate-y-4 hover:border-bet-primary shadow-2xl active:scale-95"
  >
    <div className={`absolute -top-20 -right-20 w-48 h-48 lg:w-80 lg:h-80 bg-gradient-to-br ${color} opacity-[0.1] group-hover:opacity-30 transition-opacity blur-[80px]`}></div>
    <div className="text-7xl lg:text-8xl mb-10 group-hover:scale-110 transition-transform drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">{icon}</div>
    <div className="flex-1">
      <div className="text-3xl lg:text-4xl font-black uppercase text-white mb-4 tracking-tighter italic group-hover:text-bet-primary transition-colors bazar-font">{title}</div>
      <div className="text-[12px] lg:text-[13px] text-slate-400 font-bold uppercase tracking-widest mb-10 opacity-80 leading-tight">{desc}</div>
    </div>
    <div className="flex items-center gap-5 mt-auto">
       <div className="w-3.5 h-3.5 rounded-full bg-bet-success animate-pulse shadow-[0_0_15px_#22c55e]"></div>
       <div className="text-bet-success text-[12px] lg:text-[14px] font-black uppercase tracking-widest">{players} Punters In</div>
    </div>
  </Link>
);

export default function Lobby() {
  const recentDhamakas = [
    { market: 'MILAN DAY', result: '143-8', type: 'LIVE', color: 'text-bet-primary' },
    { market: 'KALYAN', result: '422-8', type: 'DHAMAKA', color: 'text-bet-saffron' },
    { market: 'MAIN BAZAR', result: '789-4', type: 'RECORD', color: 'text-bet-secondary' },
  ];

  return (
    <Layout>
      <div className="space-y-20 lg:space-y-32 pb-32">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-[4rem] lg:rounded-[7rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-14 lg:p-36 shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10">
           <div className="absolute top-0 right-0 w-[600px] lg:w-[1200px] h-[600px] lg:h-[1200px] bg-bet-primary/30 blur-[180px] lg:blur-[300px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 max-w-6xl space-y-12 lg:space-y-16">
              <div className="inline-flex items-center gap-6 bg-white/[0.08] px-8 py-3 rounded-full border border-white/10 backdrop-blur-2xl">
                 <span className="w-4 h-4 bg-bet-primary rounded-full animate-pulse shadow-[0_0_20px_#22d3ee]"></span>
                 <span className="text-[12px] lg:text-[15px] font-black uppercase tracking-[0.5em] text-bet-primary">BHARAT KA ASLI SATTA KING PORTAL</span>
              </div>
              <h1 className="text-7xl lg:text-[13rem] font-black text-white italic -skew-x-12 uppercase leading-[0.75] tracking-tighter bazar-font drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                 BHAARI <br/> <span className="gold-text">Profit</span> <br/> DHAMAKA
              </h1>
              <p className="text-lg lg:text-3xl font-bold text-slate-300 uppercase tracking-[0.2em] max-w-4xl leading-relaxed opacity-95">
                 Kalyan Main Draw • Direct Office Result • 100% Secure Virtual Payouts. Pure Satta, Pure Passion.
              </p>
              <div className="flex flex-wrap gap-8 pt-12">
                 <Link to="/matka" className="bg-bet-primary text-bet-950 px-16 py-7 lg:px-24 lg:py-10 rounded-[2.5rem] lg:rounded-[3.5rem] font-black uppercase text-sm lg:text-xl tracking-[0.35em] shadow-2xl hover:scale-110 active:scale-95 transition-all bazar-font cyan-glow">Satta Lagao</Link>
                 <Link to="/fairness" className="bg-white/[0.06] text-white px-16 py-7 lg:px-24 lg:py-10 rounded-[2.5rem] lg:rounded-[3.5rem] font-black uppercase text-sm lg:text-xl tracking-[0.35em] border border-white/10 hover:bg-white/10 transition-all bazar-font">Check Record</Link>
              </div>
           </div>
        </section>

        {/* Recent Panna/Jodi Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {recentDhamakas.map(res => (
             <div key={res.market} className="bg-bet-900 border border-white/10 p-10 rounded-[3rem] flex justify-between items-center group hover:border-bet-primary transition-all card-bazar shadow-2xl">
                <div>
                   <p className="text-[12px] font-black text-slate-500 uppercase mb-4 tracking-widest leading-none">{res.market}</p>
                   <p className={`text-4xl font-black ${res.color} bazar-font tracking-[0.2em] drop-shadow-[0_0_12px_currentColor] leading-none`}>{res.result}</p>
                </div>
                <div className="text-right">
                   <p className="text-[12px] font-black text-bet-accent uppercase mb-4 tracking-widest leading-none">{res.type}</p>
                   <div className="w-4 h-4 rounded-full bg-bet-success ml-auto animate-pulse shadow-[0_0_18px_#22c55e]"></div>
                </div>
             </div>
           ))}
        </div>

        {/* All Bazars */}
        <section className="space-y-16">
           <div className="flex items-end justify-between px-6">
              <div>
                 <h2 className="text-5xl lg:text-7xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font">Live <span className="text-bet-primary">Markets</span></h2>
                 <p className="text-[12px] lg:text-[14px] font-black text-slate-500 uppercase tracking-[0.7em] mt-5 leading-none opacity-70">Pure Matka • Udaan Game • 3-Patti Royale</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 lg:gap-14">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="44k" color="from-bet-success to-transparent" desc="Direct Panna & Single Ank" />
              <GameCard title="Udaan (Aviator)" to="/crash" icon="✈️" players="82k" color="from-bet-danger to-transparent" desc="High-Speed Multiplier Udaan" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="51k" color="from-bet-secondary to-transparent" desc="Bharat's 3-Card Legend" />
              <GameCard title="Maha Slots" to="/slots" icon="🎰" players="29k" color="from-bet-accent to-transparent" desc="Diamond Jackpot Dhamaka" />
              <GameCard title="Shubh Wheel" to="/wheel" icon="🎡" players="18k" color="from-bet-primary to-transparent" desc="Bhaari Multiplier Spin" />
              <GameCard title="Kanchas (Mines)" to="/mines" icon="🧨" players="22k" color="from-bet-saffron to-transparent" desc="Strategic Grid Satta" />
              <GameCard title="Ball Plinko" to="/plinko" icon="🎱" players="14k" color="from-indigo-500 to-transparent" desc="Neon Drop Probability" />
              <GameCard title="Sikka Toss" to="/coinflip" icon="🪙" players="9k" color="from-slate-400 to-transparent" desc="Instant 50/50 Game" />
           </div>
        </section>
      </div>
    </Layout>
  );
}