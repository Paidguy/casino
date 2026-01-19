import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border-2 border-bet-accent/10 p-10 lg:p-14 rounded-[3rem] flex flex-col h-full transition-all hover:scale-[1.03] hover:border-bet-accent shadow-2xl active:scale-95"
  >
    <div className={`absolute -top-20 -right-20 w-48 h-48 lg:w-80 lg:h-80 bg-gradient-to-br ${color} opacity-[0.1] group-hover:opacity-30 transition-opacity blur-[80px]`}></div>
    <div className="text-7xl lg:text-9xl mb-12 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">{icon}</div>
    <div className="flex-1">
      <div className="text-3xl lg:text-5xl font-black uppercase text-white mb-4 tracking-tighter italic group-hover:text-bet-accent transition-colors bazar-font leading-none">{title}</div>
      <div className="text-[13px] lg:text-[15px] text-slate-400 font-bold uppercase tracking-widest mb-10 opacity-80 leading-snug">{desc}</div>
    </div>
    <div className="flex items-center gap-5 mt-auto">
       <div className="w-4 h-4 rounded-full bg-bet-success animate-pulse shadow-[0_0_15px_#16a34a]"></div>
       <div className="text-bet-success text-[13px] lg:text-[16px] font-black uppercase tracking-widest">{players} Punters Online</div>
    </div>
  </Link>
);

export default function Lobby() {
  const recentWinners = [
    { market: 'KALYAN OPEN', result: '143-8', type: 'FIXED', color: 'text-bet-accent' },
    { market: 'MILAN DAY', result: '422-8', type: 'LIVE', color: 'text-bet-success' },
    { market: 'MAIN BAZAR', result: '789-4', type: 'PANNA', color: 'text-white' },
  ];

  return (
    <Layout>
      <div className="space-y-24 lg:space-y-36 pb-32">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-[4rem] lg:rounded-[6rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-14 lg:p-40 shadow-[0_40px_100px_rgba(0,0,0,0.9)] border-4 border-bet-accent/20">
           <div className="absolute top-0 right-0 w-[800px] lg:w-[1500px] h-[800px] lg:h-[1500px] bg-bet-accent/10 blur-[200px] pointer-events-none animate-pulse"></div>
           <div className="relative z-10 max-w-7xl space-y-12 lg:space-y-20">
              <div className="inline-flex items-center gap-6 bg-bet-accent/10 px-10 py-4 rounded-full border-2 border-bet-accent/30 backdrop-blur-2xl">
                 <span className="w-5 h-5 bg-bet-accent rounded-full animate-pulse shadow-[0_0_25px_#fbbf24]"></span>
                 <span className="text-[14px] lg:text-[18px] font-black uppercase tracking-[0.4em] text-bet-accent">BHARAT KA NO. 1 TRUSTED KHAIWAL</span>
              </div>
              <h1 className="text-8xl lg:text-[14rem] font-black text-white italic -skew-x-12 uppercase leading-[0.75] tracking-tighter bazar-font drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                 BHAARI <br/> <span className="gold-text">PROFIT</span> <br/> DHAMAKA
              </h1>
              <p className="text-xl lg:text-4xl font-bold text-slate-300 uppercase tracking-[0.1em] max-w-5xl leading-relaxed opacity-95">
                 Kalyan Main Draw • Direct Office Fix • 1 Lakh virtual cash claim for new punters. Ab khelo shaan se!
              </p>
              <div className="flex flex-wrap gap-10 pt-16">
                 <Link to="/matka" className="gold-gradient text-black px-20 py-8 lg:px-32 lg:py-12 rounded-[3rem] font-black uppercase text-xl lg:text-3xl tracking-[0.2em] shadow-[0_20px_60px_rgba(251,191,36,0.3)] hover:scale-110 active:scale-95 transition-all bazar-font">Bet Lagao</Link>
                 <Link to="/fairness" className="bg-white/10 text-white px-20 py-8 lg:px-32 lg:py-12 rounded-[3rem] font-black uppercase text-xl lg:text-3xl tracking-[0.2em] border-2 border-white/20 hover:bg-white/20 transition-all bazar-font">Check Record</Link>
              </div>
           </div>
        </section>

        {/* Live Result Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {recentWinners.map(res => (
             <div key={res.market} className="bg-bet-900 border-2 border-bet-accent/10 p-12 rounded-[3rem] flex justify-between items-center group hover:border-bet-accent transition-all card-bazar shadow-2xl">
                <div>
                   <p className="text-[13px] font-black text-slate-500 uppercase mb-4 tracking-widest leading-none">{res.market}</p>
                   <p className={`text-5xl font-black ${res.color} bazar-font tracking-[0.15em] leading-none`}>{res.result}</p>
                </div>
                <div className="text-right">
                   <p className="text-[13px] font-black text-bet-accent uppercase mb-4 tracking-widest leading-none">{res.type}</p>
                   <div className="w-5 h-5 rounded-full bg-bet-success ml-auto animate-pulse shadow-[0_0_20px_#16a34a]"></div>
                </div>
             </div>
           ))}
        </div>

        {/* Global Bazar Selection */}
        <section className="space-y-20">
           <div className="flex items-end justify-between px-8">
              <div>
                 <h2 className="text-6xl lg:text-9xl font-black text-white italic -skew-x-6 uppercase tracking-tighter bazar-font leading-none">Live <span className="text-bet-accent">Markets</span></h2>
                 <p className="text-[14px] lg:text-[18px] font-black text-slate-500 uppercase tracking-[0.8em] mt-8 leading-none opacity-80">Matka • Udaan • Patti • Slots</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 lg:gap-16">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="82k" color="from-bet-success to-transparent" desc="Direct Office Panna & Single Ank" />
              <GameCard title="Udaan Rocket" to="/crash" icon="🚀" players="142k" color="from-bet-danger to-transparent" desc="High-Speed Multiplier Udaan Game" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="59k" color="from-bet-secondary to-transparent" desc="Bharat's No. 1 3-Card Casino" />
              <GameCard title="Royal Slots" to="/slots" icon="🎰" players="44k" color="from-bet-accent to-transparent" desc="Diamond Jackpot Dhamaka Reels" />
              <GameCard title="Shubh Wheel" to="/wheel" icon="🎡" players="28k" color="from-bet-success to-transparent" desc="Luminous Multiplier Spin" />
              <GameCard title="Kanchas (Mines)" to="/mines" icon="🧨" players="31k" color="from-bet-saffron to-transparent" desc="Strategic Grid Satta Logic" />
              <GameCard title="Coin Flip" to="/coinflip" icon="🪙" players="14k" color="from-slate-400 to-transparent" desc="Instant 50/50 Head or Tail" />
              <GameCard title="Ball Plinko" to="/plinko" icon="🎱" players="22k" color="from-bet-danger to-transparent" desc="Neon Drop Gravity Satta" />
           </div>
        </section>
      </div>
    </Layout>
  );
}