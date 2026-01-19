
import React from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, color, tag, provider }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()}
    className="group relative bg-[#0f1116] rounded-xl overflow-hidden border border-white/5 hover:border-[#00e701] transition-all hover:-translate-y-2 shadow-xl flex flex-col"
  >
    <div className={`aspect-square flex items-center justify-center text-7xl relative overflow-hidden bg-gradient-to-br ${color}`}>
       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
       <span className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{icon}</span>
       {tag && <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#00e701] text-[8px] font-black text-black rounded uppercase tracking-widest z-10">{tag}</div>}
    </div>
    <div className="p-4">
       <div className="text-white font-black text-sm group-hover:text-[#00e701] transition-colors uppercase italic">{title}</div>
       <div className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">{provider || 'STAKE ORIGINALS'}</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-12 max-w-7xl mx-auto pb-20">
        {/* Featured Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-gradient-to-br from-[#064e3b] to-[#065f46] rounded-3xl p-10 flex flex-col justify-center relative overflow-hidden group border border-white/5 shadow-2xl">
              <div className="relative z-10 max-w-xs">
                 <h2 className="text-4xl font-black text-white mb-2 leading-none italic uppercase -skew-x-12 transform">LUCKY MATKA</h2>
                 <p className="text-emerald-100/60 text-sm mb-6 font-bold uppercase tracking-widest">Instant draws every 60 seconds.</p>
                 <Link to="/crash" className="bg-[#00e701] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest inline-block hover:bg-white transition-all shadow-xl">Join the Draw</Link>
              </div>
              <div className="absolute -right-10 top-0 bottom-0 w-1/2 flex items-center justify-center text-[10rem] opacity-10 pointer-events-none group-hover:scale-110 group-hover:-rotate-12 transition-transform">🏺</div>
           </div>
           
           <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-3xl p-10 flex flex-col justify-center relative overflow-hidden group border border-white/5 shadow-2xl">
              <div className="relative z-10 max-w-xs">
                 <h2 className="text-4xl font-black text-white mb-2 leading-none italic uppercase -skew-x-12 transform">HIGH ROLLER</h2>
                 <p className="text-blue-100/60 text-sm mb-6 font-bold uppercase tracking-widest">Exclusively for VIP Diamond tier.</p>
                 <Link to="/fairness" className="bg-white text-blue-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest inline-block hover:scale-105 transition-all shadow-xl">Explore VIP</Link>
              </div>
              <div className="absolute -right-10 top-0 bottom-0 w-1/2 flex items-center justify-center text-[10rem] opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform">💎</div>
           </div>
        </div>

        {/* Stake Originals Section */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
             <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-[#00e701] rounded-full shadow-[0_0_15px_rgba(0,231,1,0.5)]"></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight italic transform -skew-x-6">Original <span className="text-[#00e701]">Book</span></h2>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 bg-[#0f1116] rounded-xl flex items-center justify-center text-white border border-white/5 hover:border-[#00e701] transition-all">←</button>
                <button className="w-10 h-10 bg-[#0f1116] rounded-xl flex items-center justify-center text-white border border-white/5 hover:border-[#00e701] transition-all">→</button>
             </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
             <GameCard title="Crash" to="/crash" icon="🚀" color="from-rose-500/20 to-rose-600/10" tag="Live" />
             <GameCard title="Plinko" to="/plinko" icon="🟢" color="from-[#00e701]/20 to-[#00e701]/5" />
             <GameCard title="Mines" to="/mines" icon="💣" color="from-yellow-500/20 to-yellow-600/10" />
             <GameCard title="Blackjack" to="/blackjack" icon="🃏" color="from-blue-500/20 to-blue-600/10" />
             <GameCard title="Dice" to="/dice" icon="🎲" color="from-indigo-500/20 to-indigo-600/10" />
             <GameCard title="Roulette" to="/roulette" icon="🎡" color="from-purple-500/20 to-purple-600/10" />
             <GameCard title="Slots" to="/slots" icon="7️⃣" color="from-orange-500/20 to-orange-600/10" />
             <GameCard title="Coinflip" to="/coinflip" icon="📀" color="from-slate-500/20 to-slate-600/10" />
          </div>
        </section>

        {/* Live Community Feed */}
        <section className="bg-[#0f1116] rounded-3xl p-10 border border-white/5 shadow-inner">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                 <div className="text-5xl font-black text-white mb-2 tracking-tighter">$84,192,401</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Wagered (24H)</div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="text-5xl font-black text-[#00e701] mb-2 tracking-tighter">14,204</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Online Now</div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="text-5xl font-black text-emerald-500 mb-2 tracking-tighter">99.98%</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">RNG Integrity</div>
              </div>
           </div>
        </section>
      </div>
    </Layout>
  );
}
