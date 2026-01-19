import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

const JackpotTicker = () => (
  <div className="h-6 lg:h-8 bg-black/80 border-b border-white/5 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="mx-16 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-bet-accent/80">
          🔥 NEW JACKPOT: USER_4481 WON ₹8,50,290 • WITHDRAWAL SPEED: 3m • INSTANT UPI SETTLEMENT • 
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
    { label: 'Lobby', to: '/', icon: '🏠' },
    { label: 'Satta', to: '/matka', icon: '🏺' },
    { label: 'Aviator', to: '/crash', icon: '✈️' },
    { label: 'Slots', to: '/slots', icon: '🎰' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Wheel', to: '/wheel', icon: '🎡' },
    { label: 'Mines', to: '/mines', icon: '🧨' },
    { label: 'Plinko', to: '/plinko', icon: '🎱' },
    { label: 'Fairness', to: '/fairness', icon: '⚖️' },
    { label: 'Admin', to: '/admin', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden font-inter safe-top safe-bottom">
      <JackpotTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[490] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-bet-900 border-r border-white/5 transition-transform duration-300 z-[500] flex flex-col shrink-0`}>
          <div className="h-16 lg:h-20 flex items-center px-8 border-b border-white/5 shrink-0">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bet-accent rounded-lg flex items-center justify-center text-black font-black text-lg">S</div>
                <div className="text-white font-black text-base tracking-tighter uppercase italic">SATTA<span className="text-bet-accent">KING</span></div>
             </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => { audio.playClick(); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`flex items-center gap-4 px-5 py-3 rounded-xl font-bold text-xs transition-all group ${location.pathname === item.to ? 'bg-bet-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
               >
                  <span className="text-base opacity-60 group-hover:opacity-100">{item.icon}</span>
                  <span>{item.label}</span>
               </Link>
             ))}
          </nav>
          <div className="p-6 border-t border-white/5 bg-black/10 shrink-0">
             <button onClick={() => engine.resetBalance()} className="w-full py-3 bg-bet-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:bg-bet-700 transition-colors">Reset Session</button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
           <header className="h-16 lg:h-20 bg-bet-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-3 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-xl bg-white/5 rounded-lg">☰</button>
                 <span className="text-bet-accent font-black italic text-sm">SK PRO</span>
              </div>

              <div className="hidden md:flex items-center gap-3">
                 <div className="bg-black/20 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-bet-success animate-pulse rounded-full"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nodes Online</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                 <div className="bg-black/40 px-3 lg:px-4 py-1.5 rounded-xl border border-white/5 flex items-center gap-3 lg:gap-4 shadow-lg">
                    <div className="flex flex-col text-right">
                       <span className="text-[7px] lg:text-[8px] font-black text-slate-500 uppercase leading-none mb-1">Balance</span>
                       <span className="text-xs lg:text-base font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                      className="bg-bet-accent text-black px-3 lg:px-4 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-md"
                    >
                      Deposit
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32 lg:pb-8 no-scrollbar scroll-smooth">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
           </main>
        </div>

        {/* Activity Feed (Desktop Only) */}
        <LiveFeed />
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-bet-900 w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative animate-fade-in">
              <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <div>
                   <h2 className="text-xl lg:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Vip <span className="text-bet-accent">Deposit</span></h2>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Instant UPI Processing</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-10 h-10 bg-white/5 rounded-full text-white text-lg flex items-center justify-center">✕</button>
              </div>
              <div className="p-6 lg:p-8 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    {[10000, 50000, 100000, 500000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-5 bg-bet-800 hover:bg-bet-700 border border-white/5 rounded-2xl text-xs font-black text-white transition-all shadow-sm active:scale-95">₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
                 <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-widest mt-4">Safe & Secure End-to-End Encryption</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};