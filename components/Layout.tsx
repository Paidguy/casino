import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

const JackpotTicker = () => (
  <div className="h-8 lg:h-10 bg-bet-950 border-b border-white/10 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="mx-16 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] text-bet-accent">
          ⚡ DHAMAKA LIVE: KALYAN DRAW IN 42 MINS • BIG WIN: PUNTER_RAJ_99 WON ₹4,40,000 • VIP NODES STATUS: ONLINE • 
        </span>
      ))}
    </div>
  </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [showDeposit, setShowDeposit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const itv = setInterval(() => setSession(engine.getSession()), 1000);
    return () => clearInterval(itv);
  }, []);

  const menu = [
    { label: 'Bazar Lobby', to: '/', icon: '🏮' },
    { label: 'Kalyan Bazar', to: '/matka', icon: '🏺' },
    { label: 'Udaan (Aviator)', to: '/crash', icon: '✈️' },
    { label: 'Jackpot Slots', to: '/slots', icon: '🎰' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Shubh Wheel', to: '/wheel', icon: '🎡' },
    { label: 'Kanchas (Mines)', to: '/mines', icon: '🧨' },
    { label: 'Ball Plinko', to: '/plinko', icon: '🎱' },
    { label: 'Admin Hub', to: '/admin', icon: '⚙️' },
  ];

  const bazars = [
    { name: 'Kalyan', status: 'OPEN', color: 'text-bet-success' },
    { name: 'Milan Day', status: 'OPEN', color: 'text-bet-success' },
    { name: 'Main Bazar', status: 'ACTIVE', color: 'text-bet-primary' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden font-jakarta safe-top safe-bottom">
      <JackpotTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[490] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-bet-900 border-r border-white/10 transition-transform duration-300 z-[500] flex flex-col shrink-0`}>
          <div className="h-16 lg:h-20 flex items-center px-8 border-b border-white/10 shrink-0 bg-bet-950/50">
             <Link to="/" className="flex items-center gap-4">
                <div className="w-10 h-10 saffron-gradient rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(255,107,0,0.5)]">K</div>
                <div className="text-white font-black text-xl tracking-tighter uppercase italic bazar-font">SATTA<span className="text-bet-accent">KING</span></div>
             </Link>
          </div>
          
          <div className="p-6 border-b border-white/10">
             <div className="bg-bet-800 rounded-2xl p-5 border border-white/10 space-y-3 shadow-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Market Pulse</p>
                {bazars.map(b => (
                  <div key={b.name} className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-200">{b.name}</span>
                    <span className={`${b.color} drop-shadow-[0_0_8px_currentColor]`}>{b.status}</span>
                  </div>
                ))}
             </div>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => { audio.playClick(); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[12px] transition-all group ${location.pathname === item.to ? 'bg-bet-primary text-white shadow-xl shadow-bet-primary/20' : 'text-slate-500 hover:bg-white/[0.08] hover:text-white'}`}
               >
                  <span className="text-xl opacity-80 group-hover:opacity-100">{item.icon}</span>
                  <span className="bazar-font tracking-widest">{item.label}</span>
               </Link>
             ))}
          </nav>
          
          <div className="p-6 border-t border-white/10 bg-bet-950 shrink-0">
             <button onClick={() => engine.resetBalance()} className="w-full py-4 bg-bet-800 rounded-2xl text-[11px] font-black uppercase text-slate-400 hover:bg-bet-700 hover:text-white transition-all border border-white/5">Session Reset</button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 relative h-full">
           <header className="h-16 lg:h-20 bg-bet-950/90 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6 lg:px-12 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-5 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center text-3xl bg-white/[0.08] rounded-xl border border-white/10 text-bet-primary">☰</button>
                 <span className="text-bet-saffron font-black italic text-xl bazar-font">KING</span>
              </div>

              <div className="hidden md:flex items-center gap-5">
                 <div className="bg-bet-primary/10 px-5 py-2.5 rounded-full border border-bet-primary/20 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-bet-success animate-pulse rounded-full shadow-[0_0_10px_#22c55e]"></span>
                    <span className="text-[11px] font-black text-bet-primary uppercase tracking-widest">Quantum Satta Engine Active</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-6">
                 <div className="bg-bet-900 px-5 lg:px-7 py-2.5 rounded-2xl border border-white/10 flex items-center gap-5 lg:gap-8 shadow-2xl">
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase leading-none mb-1.5">Matka Pot</span>
                       <span className="text-base lg:text-xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                      className="saffron-gradient text-white px-5 lg:px-7 py-3 rounded-xl text-[11px] lg:text-[12px] font-black uppercase tracking-widest hover:scale-105 shadow-xl shadow-bet-saffron/20"
                    >
                      Deposit
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32 lg:pb-12 no-scrollbar scroll-smooth">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
           </main>
        </div>

        <LiveFeed />
      </div>

      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-bet-900 w-full max-w-md rounded-[3.5rem] overflow-hidden border border-bet-primary/20 shadow-[0_0_100px_rgba(6,182,212,0.15)] relative animate-fade-in">
              <div className="p-10 lg:p-12 border-b border-white/10 flex justify-between items-center bg-bet-950/80">
                 <div>
                   <h2 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-none bazar-font">Fast <span className="text-bet-accent">Deposit</span></h2>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Instant UPI Processing</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-12 h-12 bg-white/[0.08] rounded-full text-white text-2xl flex items-center justify-center border border-white/10 hover:bg-bet-danger transition-colors">✕</button>
              </div>
              <div className="p-10 lg:p-12 space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    {[10000, 50000, 100000, 500000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-7 bg-bet-800 hover:bg-bet-primary border border-white/10 rounded-[2rem] text-base font-black text-white transition-all shadow-xl active:scale-95">₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
                 <div className="mt-10 flex flex-col items-center gap-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Certified Payment Channels</p>
                    <div className="flex gap-6">
                       <div className="w-14 h-8 bg-[#6739B7] rounded-xl flex items-center justify-center text-[8px] font-black text-white shadow-lg">PhonePe</div>
                       <div className="w-14 h-8 bg-[#00B9F1] rounded-xl flex items-center justify-center text-[8px] font-black text-white shadow-lg">Paytm</div>
                       <div className="w-14 h-8 bg-white rounded-xl flex items-center justify-center text-[8px] font-black text-indigo-700 shadow-lg">G-Pay</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};