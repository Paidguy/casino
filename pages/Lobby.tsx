
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { audio } from '../services/audio';

const GameTile = ({ title, to, icon, players, color }: any) => (
  <Link 
    to={to} 
    onClick={() => audio.playClick()} 
    className="relative group overflow-hidden bg-bet-900 border border-white/5 p-6 lg:p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:border-bet-primary shadow-2xl"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.05] group-hover:opacity-20 transition-opacity blur-3xl`}></div>
    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{icon}</div>
    <div className="text-[10px] lg:text-xs font-black uppercase text-white mb-2 tracking-tight group-hover:text-bet-accent transition-colors">{title}</div>
    <div className="bg-bet-success/10 text-bet-success text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-bet-success/20">{players} Playing</div>
  </Link>
);

export default function Lobby() {
  return (
    <Layout>
      <div className="space-y-12 pb-24">
        <section className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] bg-gradient-to-br from-bet-900 via-bet-950 to-black p-8 lg:p-20 shadow-2xl border border-white/5">
           <div className="relative z-10 max-w-4xl space-y-6">
              <h1 className="text-5xl lg:text-9xl font-black text-white italic -skew-x-12 uppercase leading-[0.85] tracking-tighter">
                 BHARAT <br/> <span className="gold-text">KA NO. 1</span> <br/> SATTA PORTAL
              </h1>
              <p className="text-sm lg:text-xl font-bold text-slate-400 uppercase tracking-widest opacity-80 max-w-2xl">
                 High-fidelity Matka draws and professional casino suites powered by HMAC-SHA256 Deterministic Fairness.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                 <Link to="/matka" className="bg-bet-accent text-black px-10 py-4 lg:px-14 lg:py-6 rounded-2xl font-black uppercase text-[10px] lg:text-sm tracking-widest shadow-2xl transition-all">Start Betting</Link>
              </div>
           </div>
        </section>

        <section className="space-y-8">
           <h2 className="text-2xl lg:text-4xl font-black text-white italic -skew-x-6 uppercase tracking-tighter">Pro <span className="text-bet-accent">Suites</span></h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-8">
              <GameTile title="Aviator" to="/crash" icon="✈️" players="4.2k" color="from-rose-500 to-transparent" />
              <GameTile title="Matka" to="/matka" icon="🏺" players="8.1k" color="from-emerald-500 to-transparent" />
              <GameTile title="Wheel" to="/wheel" icon="🎡" players="2.1k" color="from-blue-500 to-transparent" />
              <GameTile title="Baccarat" to="/baccarat" icon="👑" players="1.5k" color="from-indigo-500 to-transparent" />
              <GameTile title="Keno" to="/keno" icon="🎱" players="900" color="from-purple-500 to-transparent" />
              <GameTile title="Mines" to="/mines" icon="🧨" players="1.1k" color="from-yellow-500 to-transparent" />
           </div>
        </section>
      </div>
    </Layout>
  );
}
