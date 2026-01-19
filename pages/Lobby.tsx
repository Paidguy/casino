import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/5 p-6 lg:p-8 rounded-[2rem] flex flex-col h-full transition-all hover:-translate-y-2 hover:border-bet-primary shadow-xl"
  >
    <div className={`absolute -top-12 -right-12 w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity blur-3xl`}></div>
    <div className="text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-xl">{icon}</div>
    <div className="flex-1">
      <div className="text-lg lg:text-xl font-black uppercase text-white mb-1 tracking-tighter italic group-hover:text-bet-accent transition-colors">{title}</div>
      <div className="text-[8px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 opacity-60 leading-tight">{desc}</div>
    </div>
    <div className="flex items-center gap-2 mt-auto">
       <div className="w-1.5 h-1.5 rounded-full bg-bet-success animate-pulse"></div>
       <div className="text-bet-success text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{players} Online</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-12 lg:space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-8 lg:p-20 shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-bet-primary/10 blur-[100px] lg:blur-[150px] pointer-events-none"></div>
           <div className="relative z-10 max-w-4xl space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                 <span className="w-1.5 h-1.5 bg-bet-accent rounded-full animate-pulse"></span>
                 <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-bet-accent">Live Matka #44182</span>
              </div>
              <h1 className="text-4xl lg:text-8xl font-black text-white italic -skew-x-12 uppercase leading-[0.9] tracking-tighter">
                 BHARAT <br/> <span className="gold-text">Satta King</span> <br/> PORTAL
              </h1>
              <p className="text-xs lg:text-lg font-bold text-slate-500 uppercase tracking-widest max-w-2xl leading-relaxed">
                 High-fidelity deterministic draws powered by HMAC-SHA256 Cryptography. 100% Secure Virtual Settlement Engine.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                 <Link to="/matka" className="bg-bet-accent text-black px-8 py-4 lg:px-14 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] shadow-lg hover:scale-105 transition-all">Start Betting</Link>
                 <Link to="/fairness" className="bg-white/5 text-white px-8 py-4 lg:px-12 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all">Fairness</Link>
              </div>
           </div>
        </section>

        {/* Game Grid */}
        <section className="space-y-8">
           <div className="flex items-end justify-between px-2">
              <div>
                 <h2 className="text-2xl lg:text-4xl font-black text-white italic -skew-x-6 uppercase tracking-tighter">Live <span className="text-bet-accent">Games</span></h2>
                 <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 leading-none">Professional Tier Matka & Casino Suite</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="8.4k" color="from-emerald-500 to-transparent" desc="The Original Matka Experience" />
              <GameCard title="Aviator" to="/crash" icon="✈️" players="4.2k" color="from-rose-500 to-transparent" desc="Exponential Multipliers" />
              <GameCard title="Mega Slots" to="/slots" icon="🎰" players="2.1k" color="from-yellow-500 to-transparent" desc="High Variance Reel Play" />
              <GameCard title="Royal Wheel" to="/wheel" icon="🎡" players="1.5k" color="from-blue-500 to-transparent" desc="Segment Odds Predictor" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="3.1k" color="from-indigo-500 to-transparent" desc="Indian 3-Card Poker" />
              <GameCard title="Plinko" to="/plinko" icon="🎱" players="900" color="from-purple-500 to-transparent" desc="Ball Drop Physics" />
              <GameCard title="Mines" to="/mines" icon="🧨" players="1.1k" color="from-orange-500 to-transparent" desc="Grid-Based Risk Play" />
              <GameCard title="Coinflip" to="/coinflip" icon="🪙" players="400" color="from-slate-500 to-transparent" desc="50/50 Probabilities" />
           </div>
        </section>
      </div>
    </Layout>
  );
}