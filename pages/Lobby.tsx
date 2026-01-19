
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, players, color, desc }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col h-full transition-all hover:-translate-y-3 hover:border-bet-primary shadow-2xl"
  >
    <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity blur-3xl`}></div>
    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{icon}</div>
    <div className="flex-1">
      <div className="text-xl font-black uppercase text-white mb-2 tracking-tighter italic group-hover:text-bet-accent transition-colors">{title}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 opacity-60">{desc}</div>
    </div>
    <div className="flex items-center gap-2">
       <div className="w-2 h-2 rounded-full bg-bet-success animate-pulse"></div>
       <div className="text-bet-success text-[10px] font-black uppercase tracking-widest">{players} Online</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-16 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3rem] lg:rounded-[4rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-10 lg:p-24 shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bet-primary/10 blur-[150px] pointer-events-none"></div>
           <div className="relative z-10 max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                 <span className="w-2 h-2 bg-bet-accent rounded-full animate-pulse"></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bet-accent">Live Matka Draw #44182</span>
              </div>
              <h1 className="text-6xl lg:text-9xl font-black text-white italic -skew-x-12 uppercase leading-[0.8] tracking-tighter">
                 BHARAT <br/> <span className="gold-text">Satta King</span> <br/> PORTAL
              </h1>
              <p className="text-sm lg:text-xl font-bold text-slate-500 uppercase tracking-widest max-w-2xl leading-relaxed">
                 High-fidelity deterministic draws powered by HMAC-SHA256 Cryptography. 100% Secure Instant Payouts.
              </p>
              <div className="flex flex-wrap gap-4 pt-6">
                 <Link to="/matka" className="bg-bet-accent text-black px-12 py-5 lg:px-16 lg:py-7 rounded-[2rem] font-black uppercase text-xs lg:text-sm tracking-[0.3em] shadow-[0_20px_60px_rgba(250,204,21,0.2)] hover:scale-105 active:scale-95 transition-all">Start Betting</Link>
                 <Link to="/fairness" className="bg-white/5 text-white px-10 py-5 lg:px-14 lg:py-7 rounded-[2rem] font-black uppercase text-xs lg:text-sm tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all">Fairness</Link>
              </div>
           </div>
        </section>

        {/* Game Grid */}
        <section className="space-y-10">
           <div className="flex items-end justify-between px-4">
              <div>
                 <h2 className="text-3xl lg:text-5xl font-black text-white italic -skew-x-6 uppercase tracking-tighter">Live <span className="text-bet-accent">Suites</span></h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2">Professional Tier Game Modules</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              <GameCard title="Kalyan Bazar" to="/matka" icon="🏺" players="8.4k" color="from-emerald-500 to-transparent" desc="The Original Matka Experience" />
              <GameCard title="Aviator" to="/crash" icon="✈️" players="4.2k" color="from-rose-500 to-transparent" desc="Exponential Growth Multipliers" />
              <GameCard title="Mega Slots" to="/slots" icon="🎰" players="2.1k" color="from-yellow-500 to-transparent" desc="High Variance Symbol Matching" />
              <GameCard title="Royal Wheel" to="/wheel" icon="🎡" players="1.5k" color="from-blue-500 to-transparent" desc="Predictive Segment Rotation" />
              <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" players="3.1k" color="from-indigo-500 to-transparent" desc="Indian 3-Card Poker Suite" />
              <GameCard title="Plinko" to="/plinko" icon="🎱" players="900" color="from-purple-500 to-transparent" desc="Normal Distribution Odds" />
              <GameCard title="Mines" to="/mines" icon="🧨" players="1.1k" color="from-orange-500 to-transparent" desc="Grid Based Risk Management" />
              <GameCard title="Coinflip" to="/coinflip" icon="🪙" players="400" color="from-slate-500 to-transparent" desc="Instant 50/50 Probabilities" />
           </div>
        </section>
      </div>
    </Layout>
  );
}
