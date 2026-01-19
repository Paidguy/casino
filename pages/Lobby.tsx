
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';
import { Leaderboard } from '../components/Leaderboard';

const GameCard = ({ title, to, icon, color, tag }: any) => (
  <Link to={to} onClick={() => audio.playClick()} className="group relative bg-[#0f1116] rounded-3xl overflow-hidden border border-white/5 hover:border-casino-accent transition-all hover:-translate-y-2 shadow-xl flex flex-col">
    <div className={`aspect-square flex items-center justify-center text-6xl lg:text-8xl relative overflow-hidden bg-gradient-to-br ${color}`}>
       <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
       <span className="transform group-hover:scale-125 transition-transform duration-500 drop-shadow-2xl">{icon}</span>
       {tag && <div className="absolute top-4 left-4 px-2 py-0.5 bg-casino-accent text-[9px] font-black text-black rounded uppercase tracking-widest z-10">{tag}</div>}
    </div>
    <div className="p-4 lg:p-6 bg-gradient-to-b from-[#1a1d23] to-[#0f1116] border-t border-white/5">
       <div className="text-white font-black text-sm lg:text-lg group-hover:text-casino-accent transition-colors uppercase italic transform group-hover:skew-x-[-12deg]">{title}</div>
       <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Stake Originals</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-12 lg:space-y-20 max-w-7xl mx-auto pb-20">
        {/* Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[300px] lg:min-h-[400px]">
           <div className="lg:col-span-8 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-emerald-950 rounded-[3rem] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden group border border-white/10 shadow-2xl">
              <div className="relative z-10 max-w-md">
                 <h2 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight italic uppercase -skew-x-12 transform group-hover:scale-105 transition-transform origin-left">LUCKY MATKA <br/><span className="text-casino-accent">JACKPOT</span></h2>
                 <p className="text-emerald-100/60 text-sm lg:text-lg mb-8 font-bold uppercase tracking-widest italic">Huge wins on standard matka draws.</p>
                 <Link to="/crash" className="bg-casino-accent text-black px-8 py-4 rounded-2xl font-black uppercase text-xs lg:text-sm tracking-widest inline-block hover:scale-110 transition-all shadow-2xl active:scale-95">Bet Matka</Link>
              </div>
              <div className="absolute -right-20 top-0 bottom-0 w-1/2 flex items-center justify-center text-[15rem] lg:text-[25rem] opacity-[0.03] pointer-events-none group-hover:scale-150 transition-transform duration-1000">🏺</div>
           </div>
           
           <div className="lg:col-span-4 bg-[#1a1d23] rounded-[3rem] p-10 border border-white/10 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-2xl">
              <div className="text-6xl mb-6 transform group-hover:rotate-12 transition-transform">💎</div>
              <h3 className="text-2xl font-black text-white mb-2 italic uppercase transform -skew-x-12">VIP Rewards</h3>
              <p className="text-slate-500 text-xs font-black uppercase mb-8 tracking-widest">Wager credits to level up</p>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-casino-accent animate-pulse" style={{ width: '65%' }}></div>
              </div>
           </div>
        </div>

        {/* Game Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
             <div className="flex items-center gap-6">
                <div className="w-2 lg:w-3 h-10 lg:h-12 bg-casino-accent rounded-full shadow-[0_0_15px_rgba(0,231,1,0.5)]"></div>
                <h2 className="text-2xl lg:text-4xl font-black text-white uppercase italic transform -skew-x-12">Original <span className="text-casino-accent">Games</span></h2>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-10">
             <GameCard title="Matka Crash" to="/crash" icon="🚀" color="from-rose-600/20 to-rose-950/20" tag="Live" />
             <GameCard title="Ball Plinko" to="/plinko" icon="🟢" color="from-emerald-600/20 to-casino-accent/10" />
             <GameCard title="Gold Mines" to="/mines" icon="💣" color="from-yellow-600/20 to-orange-900/20" tag="Hot" />
             <GameCard title="Blackjack" to="/blackjack" icon="🃏" color="from-blue-600/20 to-indigo-900/20" />
             <GameCard title="High Dice" to="/dice" icon="🎲" color="from-indigo-600/20 to-violet-900/20" />
             <GameCard title="Wheel Roulette" to="/roulette" icon="🎡" color="from-purple-600/20 to-fuchsia-950/20" />
          </div>
        </section>

        <Leaderboard />
      </div>
    </Layout>
  );
}
