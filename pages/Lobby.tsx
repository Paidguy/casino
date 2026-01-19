import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';
import { Leaderboard } from '../components/Leaderboard';

const GameCard = ({ title, to, icon, color, tag }: any) => (
  <Link to={to} onClick={() => audio.playClick()} className="matka-card group relative bg-[#0f1116] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col">
    <div className={`aspect-square flex items-center justify-center text-7xl lg:text-9xl relative overflow-hidden bg-gradient-to-br ${color}`}>
       <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500"></div>
       <span className="transform group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">{icon}</span>
       {tag && <div className="absolute top-6 left-6 px-3 py-1 bg-casino-accent text-[10px] font-black text-black rounded uppercase tracking-widest z-10 shadow-lg">{tag}</div>}
    </div>
    <div className="p-6 lg:p-8 bg-gradient-to-b from-[#1a1d23] to-[#0f1116] border-t border-white/5">
       <div className="text-white font-black text-lg lg:text-xl group-hover:text-casino-accent transition-colors uppercase italic transform group-hover:skew-x-[-12deg] tracking-tight">{title}</div>
       <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Pro Stake Original</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-16 lg:space-y-28 max-w-7xl mx-auto pb-24 animate-fade-in">
        {/* Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[400px] lg:min-h-[500px]">
           <div className="lg:col-span-8 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-emerald-950 rounded-[4rem] p-10 lg:p-20 flex flex-col justify-center relative overflow-hidden group border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              <div className="relative z-10 max-w-lg">
                 <div className="bg-casino-accent/20 border border-casino-accent/30 text-casino-accent px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest inline-block mb-8 shadow-2xl backdrop-blur-md">Festival Jackpot Live</div>
                 <h2 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-[0.9] italic uppercase -skew-x-12 transform group-hover:scale-105 transition-transform origin-left tracking-tighter">BHARAT KA <br/><span className="text-casino-accent">SABSE BADA</span></h2>
                 <p className="text-emerald-100/60 text-sm lg:text-xl mb-12 font-bold uppercase tracking-[0.3em] italic leading-tight">Virtual matka draws starting every 60 seconds. <br/> Win virtual Lakhs instantly.</p>
                 <Link to="/teenpatti" className="bg-casino-accent text-black px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] inline-block hover:scale-110 hover:bg-white transition-all shadow-[0_20px_60px_rgba(0,231,1,0.3)] active:scale-95">Play Now</Link>
              </div>
              <div className="absolute -right-20 top-0 bottom-0 w-1/2 flex items-center justify-center text-[15rem] lg:text-[30rem] opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]">🏺</div>
           </div>
           
           <div className="lg:col-span-4 bg-[#1a1d23] rounded-[4rem] p-12 border border-white/10 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-casino-accent/5 to-transparent pointer-events-none"></div>
              <div className="text-8xl mb-8 transform group-hover:rotate-12 transition-transform drop-shadow-[0_0_40px_rgba(0,231,1,0.2)]">💎</div>
              <h3 className="text-3xl font-black text-white mb-3 italic uppercase transform -skew-x-12 tracking-tight">VIP Elite Pass</h3>
              <p className="text-slate-500 text-[11px] font-black uppercase mb-10 tracking-[0.4em]">Wager Lakhs to Unlock Perks</p>
              <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner p-1">
                <div className="h-full bg-casino-accent animate-pulse rounded-full shadow-[0_0_15px_rgba(0,231,1,0.5)]" style={{ width: '74%' }}></div>
              </div>
              <button className="mt-10 text-[11px] font-black text-casino-accent hover:text-white transition-colors uppercase tracking-[0.5em] italic">Progress Details</button>
           </div>
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-10">
             <div className="flex items-center gap-8">
                <div className="w-3.5 h-16 bg-casino-accent rounded-full shadow-[0_0_30px_rgba(0,231,1,0.7)]"></div>
                <div>
                  <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic transform -skew-x-12 tracking-tighter">MATKA <span className="text-casino-accent">PREMIUM</span></h2>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] mt-3 italic">Mathematically Perfect Indian Simulation</p>
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 lg:gap-12">
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