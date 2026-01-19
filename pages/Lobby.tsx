import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';
import { Leaderboard } from '../components/Leaderboard';

const GameCard = ({ title, to, icon, color, tag }: any) => (
  <Link to={to} onClick={() => audio.playClick()} className="matka-card group relative bg-[#0f1116] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl flex flex-col">
    <div className={`aspect-square flex items-center justify-center text-5xl lg:text-7xl relative overflow-hidden bg-gradient-to-br ${color}`}>
       <div className="absolute inset-0 bg-black/40 group-hover:bg-black/5 transition-colors duration-500"></div>
       <span className="transform group-hover:scale-110 transition-transform duration-700 drop-shadow-lg">{icon}</span>
       {tag && <div className="absolute top-4 left-4 px-2 py-0.5 bg-casino-accent text-[8px] font-black text-black rounded uppercase tracking-widest z-10 shadow-md">{tag}</div>}
    </div>
    <div className="p-4 lg:p-5 bg-gradient-to-b from-[#1a1d23] to-[#0f1116] border-t border-white/5">
       <div className="text-white font-black text-sm lg:text-base group-hover:text-casino-accent transition-colors uppercase italic transform group-hover:skew-x-[-8deg] tracking-tight">{title}</div>
       <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Pro Original</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-12 lg:space-y-20 max-w-7xl mx-auto pb-24 animate-fade-in">
        {/* Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[350px] lg:min-h-[420px]">
           <div className="lg:col-span-8 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-emerald-950 rounded-[2.5rem] p-8 lg:p-14 flex flex-col justify-center relative overflow-hidden group border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              <div className="relative z-10 max-w-lg">
                 <div className="bg-casino-accent/20 border border-casino-accent/30 text-casino-accent px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-6 shadow-xl backdrop-blur-md">Festival Jackpot Live</div>
                 <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-[0.9] italic uppercase -skew-x-12 transform group-hover:scale-105 transition-transform origin-left tracking-tighter">BHARAT KA <br/><span className="text-casino-accent">SABSE BADA</span></h2>
                 <p className="text-emerald-100/60 text-xs lg:text-base mb-8 font-bold uppercase tracking-[0.2em] italic leading-tight">Virtual matka draws starting every 60 seconds. <br/> Win virtual Lakhs instantly.</p>
                 <Link to="/teenpatti" className="bg-casino-accent text-black px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] inline-block hover:scale-110 hover:bg-white transition-all shadow-xl active:scale-95">Play Now</Link>
              </div>
              <div className="absolute -right-10 top-0 bottom-0 w-1/2 flex items-center justify-center text-[12rem] lg:text-[20rem] opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]">🏺</div>
           </div>
           
           <div className="lg:col-span-4 bg-[#1a1d23] rounded-[2.5rem] p-10 border border-white/10 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-casino-accent/5 to-transparent pointer-events-none"></div>
              <div className="text-6xl mb-6 transform group-hover:rotate-12 transition-transform drop-shadow-[0_0_30px_rgba(0,231,1,0.2)]">💎</div>
              <h3 className="text-2xl font-black text-white mb-2 italic uppercase transform -skew-x-12 tracking-tight">VIP Elite Pass</h3>
              <p className="text-slate-500 text-[9px] font-black uppercase mb-8 tracking-[0.3em]">Wager Lakhs to Unlock</p>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner p-0.5">
                <div className="h-full bg-casino-accent animate-pulse rounded-full shadow-[0_0_10px_rgba(0,231,1,0.5)]" style={{ width: '74%' }}></div>
              </div>
              <button className="mt-8 text-[9px] font-black text-casino-accent hover:text-white transition-colors uppercase tracking-[0.4em] italic">Details</button>
           </div>
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
             <div className="flex items-center gap-6">
                <div className="w-2.5 h-12 bg-casino-accent rounded-full shadow-[0_0_20px_rgba(0,231,1,0.6)]"></div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white uppercase italic transform -skew-x-12 tracking-tighter">MATKA <span className="text-casino-accent">PREMIUM</span></h2>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5 italic">Mathematically Perfect Indian Simulation</p>
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8">
             <GameCard title="Teen Patti" to="/teenpatti" icon="🎴" color="from-emerald-600/20 to-emerald-950/40" tag="New" />
             <GameCard title="Matka Crash" to="/crash" icon="🚀" color="from-rose-600/20 to-rose-950/20" tag="Hot" />
             <GameCard title="Ball Plinko" to="/plinko" icon="🟢" color="from-emerald-600/20 to-casino-accent/10" />
             <GameCard title="Gold Mines" to="/mines" icon="💣" color="from-yellow-600/20 to-orange-900/20" tag="Popular" />
             <GameCard title="Blackjack" to="/blackjack" icon="🃏" color="from-blue-600/20 to-indigo-900/20" />
             <GameCard title="High Dice" to="/dice" icon="🎲" color="from-indigo-600/20 to-violet-900/20" />
          </div>
        </section>

        <Leaderboard />
      </div>
    </Layout>
  );
}