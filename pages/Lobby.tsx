
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameCard = ({ title, to, icon, color, tag, provider }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()}
    className="group relative bg-[#0f1116] rounded-3xl overflow-hidden border border-white/5 hover:border-[#00e701] transition-all hover:-translate-y-4 shadow-2xl flex flex-col"
  >
    <div className={`aspect-square flex items-center justify-center text-8xl relative overflow-hidden bg-gradient-to-br ${color} transition-all duration-700`}>
       <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors"></div>
       <span className="transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">{icon}</span>
       {tag && (
        <div className="absolute top-5 left-5 px-3 py-1 bg-[#00e701] text-[10px] font-black text-black rounded-lg uppercase tracking-widest z-10 shadow-lg animate-bounce">
          {tag}
        </div>
       )}
    </div>
    <div className="p-6 bg-gradient-to-b from-[#1a1d23] to-[#0f1116] border-t border-white/5">
       <div className="text-white font-black text-lg group-hover:text-[#00e701] transition-colors uppercase italic tracking-tighter transform group-hover:skew-x-[-15deg]">{title}</div>
       <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1 opacity-40 group-hover:opacity-100 transition-opacity">STAKE ORIGINALS</div>
    </div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-20 max-w-7xl mx-auto pb-40">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[450px]">
           <div className="lg:col-span-8 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-emerald-950 rounded-[4rem] p-20 flex flex-col justify-center relative overflow-hidden group border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              <div className="relative z-10 max-w-lg">
                 <div className="bg-[#00e701]/20 border border-[#00e701]/30 text-[#00e701] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block mb-8 shadow-xl backdrop-blur-md">
                    Seasonal Event Live
                 </div>
                 <h2 className="text-7xl font-black text-white mb-6 leading-[0.85] italic uppercase -skew-x-12 transform group-hover:scale-105 transition-transform origin-left tracking-tighter">
                   LUCKY MATKA <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e701] to-emerald-300">JACKPOT</span>
                 </h2>
                 <p className="text-emerald-100/60 text-xl mb-12 font-bold uppercase tracking-widest italic leading-tight">
                    Experience the ultimate adrenaline <br/> with multipliers up to 10,000x.
                 </p>
                 <div className="flex flex-wrap gap-5">
                    <Link to="/crash" className="bg-[#00e701] text-black px-12 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.3em] inline-block hover:bg-white transition-all shadow-2xl hover:scale-110 active:scale-95">Bet Rocket</Link>
                    <Link to="/fairness" className="bg-white/5 backdrop-blur-xl text-white px-10 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all">Explore RTP</Link>
                 </div>
              </div>
              <div className="absolute -right-32 top-0 bottom-0 w-1/2 flex items-center justify-center text-[26rem] opacity-[0.03] pointer-events-none group-hover:scale-150 group-hover:-rotate-12 transition-transform duration-[2000ms]">🏺</div>
           </div>
           
           <div className="lg:col-span-4 bg-[#1a1d23] rounded-[4rem] p-12 border border-white/10 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
              <div className="text-8xl mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-[0_0_30px_rgba(255,184,0,0.3)]">🏆</div>
              <h3 className="text-3xl font-black text-white mb-3 italic uppercase transform -skew-x-12 tracking-tighter">ROYALTY PASS</h3>
              <p className="text-slate-500 text-xs font-black uppercase mb-10 tracking-[0.2em] opacity-80 leading-relaxed">Wager credits to unlock <br/>exclusive VIP rewards</p>
              <div className="w-full h-3 bg-black rounded-full overflow-hidden mb-10 border border-white/5 shadow-inner p-0.5">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-200 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: '68%' }}></div>
              </div>
              <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-all shadow-lg">Level Status</button>
           </div>
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
             <div className="flex items-center gap-8">
                <div className="w-4 h-14 bg-gradient-to-b from-[#00e701] to-emerald-800 rounded-full shadow-[0_0_25px_rgba(0,231,1,0.6)]"></div>
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic transform -skew-x-12">THE <span className="text-[#00e701]">BOOKIE'S CHOICE</span></h2>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Mathematical perfection in every bet</p>
                </div>
             </div>
             <div className="flex gap-4">
                <button className="w-14 h-14 bg-[#0f1116] rounded-3xl flex items-center justify-center text-white border border-white/5 hover:border-[#00e701] transition-all hover:scale-110 active:scale-90 shadow-xl group">
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                </button>
                <button className="w-14 h-14 bg-[#0f1116] rounded-3xl flex items-center justify-center text-white border border-white/5 hover:border-[#00e701] transition-all hover:scale-110 active:scale-90 shadow-xl group">
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-10">
             <GameCard title="Rocket Crash" to="/crash" icon="🚀" color="from-rose-600/20 to-rose-950/30" tag="Live" />
             <GameCard title="Ball Plinko" to="/plinko" icon="🟢" color="from-emerald-600/20 to-[#00e701]/10" />
             <GameCard title="Gem Mines" to="/mines" icon="💣" color="from-yellow-600/20 to-orange-900/30" tag="Hot" />
             <GameCard title="Pro Blackjack" to="/blackjack" icon="🃏" color="from-blue-600/20 to-indigo-900/30" />
             <GameCard title="High Dice" to="/dice" icon="🎲" color="from-indigo-600/20 to-violet-900/30" />
             <GameCard title="Wheel Roulette" to="/roulette" icon="🎡" color="from-purple-600/20 to-fuchsia-950/30" />
             <GameCard title="Ultra Slots" to="/slots" icon="7️⃣" color="from-orange-600/20 to-amber-950/30" />
             <GameCard title="Fast Coinflip" to="/coinflip" icon="📀" color="from-slate-600/20 to-zinc-950/30" />
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-[#0f1116] rounded-[4rem] p-24 border border-white/5 shadow-inner relative overflow-hidden group">
           <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:25px_25px] group-hover:scale-110 transition-transform duration-[3000ms]"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
              <div className="flex flex-col items-center text-center">
                 <div className="text-7xl font-black text-white mb-5 tracking-tighter tabular-nums drop-shadow-2xl">₹92,401,811</div>
                 <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic transform skew-x-[-15deg] opacity-60">24H TRADING VOLUME</div>
              </div>
              <div className="flex flex-col items-center text-center">
                 <div className="text-7xl font-black text-[#00e701] mb-5 tracking-tighter tabular-nums drop-shadow-[0_0_40px_rgba(0,231,1,0.2)]">15,920</div>
                 <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic transform skew-x-[-15deg] opacity-60">ACTIVE PUNTERS</div>
              </div>
              <div className="flex flex-col items-center text-center">
                 <div className="text-7xl font-black text-emerald-500 mb-5 tracking-tighter tabular-nums drop-shadow-2xl">99.99%</div>
                 <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] italic transform skew-x-[-15deg] opacity-60">FAIRNESS INTEGRITY</div>
              </div>
           </div>
        </section>
      </div>
    </Layout>
  );
}
