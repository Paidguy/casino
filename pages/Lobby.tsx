
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, color }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()}
    className="glass-card group relative h-64 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center border-white/5 transition-all hover:scale-105 hover:border-casino-accent/30 shadow-xl"
  >
    <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${color} group-hover:opacity-20 transition-opacity`}></div>
    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{icon}</div>
    <h3 className="text-white font-black uppercase italic -skew-x-12 tracking-tighter text-lg">{title}</h3>
    <div className="mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] italic">Original Game</div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-20 pb-40">
        {/* Hero Section */}
        <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white/5">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-110"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-casino-950 via-casino-950/80 to-transparent"></div>
           
           <div className="relative z-10 h-full p-12 lg:p-20 flex flex-col justify-center max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-casino-accent/10 border border-casino-accent/30 px-4 py-1.5 rounded-full text-casino-accent text-[10px] font-black uppercase tracking-widest mb-8">
                 <span className="w-1.5 h-1.5 rounded-full bg-casino-accent animate-pulse"></span>
                 Lakhpati League Active
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white italic -skew-x-12 uppercase leading-[0.85] tracking-tighter mb-8">
                 BHARAT <br/> <span className="text-casino-accent">KA KING</span>
              </h1>
              <p className="text-slate-400 text-lg font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-80 italic">
                 The most precise Indian Satta simulation. <br/> Provably fair. Maximum payouts.
              </p>
              <div className="flex gap-4">
                 <Link to="/matka" className="bg-casino-accent text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-neon-green hover:scale-105 active:scale-95 transition-all">Start Draw</Link>
                 <button className="bg-white/5 border border-white/10 text-white px-10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">VIP Details</button>
              </div>
           </div>
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center gap-8 mb-12">
             <div className="w-1 h-12 bg-casino-accent shadow-neon-green"></div>
             <div>
                <h2 className="text-3xl font-black text-white italic -skew-x-12 uppercase tracking-tighter">Original <span className="text-casino-accent">Suites</span></h2>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-1">Mathematically Perfect Indian Games</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
             <GameCard title="Matka Draw" to="/matka" icon="🏺" color="from-orange-600 to-transparent" />
             <GameCard title="Cyber Crash" to="/crash" icon="⚡" color="from-rose-600 to-transparent" />
             <GameCard title="Ball Plinko" to="/plinko" icon="💎" color="from-indigo-600 to-transparent" />
             <GameCard title="Gold Mines" to="/mines" icon="🧨" color="from-yellow-600 to-transparent" />
             <GameCard title="Teen Patti" to="/teenpatti" icon="🃏" color="from-emerald-600 to-transparent" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
