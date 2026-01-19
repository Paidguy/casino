import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

const LiveTicker = () => (
  <div className="h-9 lg:h-11 bg-bet-950 border-b border-white/10 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-16 text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.3em] text-bet-primary">
          🔥 BAZAR DHAMAKA: KALYAN FIX JODI RELEASED • BIG WIN: PUNTER_SAHIL WON ₹7,20,000 • WITHDRAWAL SPEED: 2 MINS • 
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
    { label: '3-Patti (Royal)', to: '/teenpatti', icon: '🃏' },
    { label: 'Maha Slots', to: '/slots', icon: '🎰' },
    { label: 'Chakra Wheel', to: '/wheel', icon: '🎡' },
    { label: 'Kanchas (Mines)', to: '/mines', icon: '🧨' },
    { label: 'Pit Boss (Admin)', to: '/admin', icon: '👤' },
  ];

  const markets = [
    { name: 'Kalyan', time: '04:00 PM', status: 'OPEN', color: 'text-bet-success' },
    { name: 'Milan Day', time: '02:30 PM', status: 'OPEN', color: 'text-bet-success' },
    { name: 'Main Bazar', time: '09:00 PM', status: 'CLOSED', color: 'text-slate-500' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden font-jakarta">
      <LiveTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[490] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-bet-900 border-r border-white/5 transition-transform duration-300 z-[500] flex flex-col shrink-0`}>
          <div className="h-16 lg:h-20 flex items-center px-8 border-b border-white/5 shrink-0 bg-bet-950/40">
             <Link to="/" className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-bet-primary to-bet-secondary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg cyan-glow">S</div>
                <div className="text-white font-black text-xl tracking-tighter uppercase italic bazar-font">SATTA<span className="text-bet-primary">KING</span></div>
             </Link>
          </div>
          
          <div className="p-6">
             <div className="bg-bet-950/50 rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Market Radar</p>
                {markets.map(m => (
                  <div key={m.name} className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-300">{m.name}</span>
                    <span className={`${m.color} drop-shadow-[0_0_8px_currentColor]`}>{m.status}</span>
                  </div>
                ))}
             </div>
          </div>

          <nav className="flex-1 p-5 space-y-2 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => { audio.playClick(); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[12px] transition-all group ${location.pathname === item.to ? 'bg-bet-primary text-bet-950 shadow-xl cyan-glow scale-[1.02]' : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'}`}
               >
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="bazar-font tracking-widest">{item.label}</span>
               </Link>
             ))}
          </nav>
          
          <div className="p-6 border-t border-white/5 bg-bet-950 shrink-0">
             <button onClick={() => engine.resetBalance()} className="w-full py-4 bg-bet-800 rounded-2xl text-[11px] font-black uppercase text-slate-400 hover:bg-bet-700 hover:text-white transition-all">Clear Session</button>
          </div>
        </aside>

        {/* Main Interface */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
           <header className="h-16 lg:h-22 bg-bet-950/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 lg:px-12 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-5 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center text-3xl bg-white/[0.08] rounded-xl border border-white/10 text-bet-primary">☰</button>
                 <span className="text-bet-primary font-black italic text-xl bazar-font">BHARAT</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                 <div className="bg-bet-primary/5 px-5 py-3 rounded-full border border-bet-primary/20 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-bet-success animate-pulse rounded-full shadow-[0_0_12px_#22c55e]"></span>
                    <span className="text-[11px] font-black text-bet-primary uppercase tracking-widest">Kalyan Server: Secure</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-8">
                 <div className="bg-bet-900 px-6 lg:px-8 py-3 rounded-[1.5rem] border border-white/10 flex items-center gap-6 lg:gap-10 shadow-2xl">
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase leading-none mb-1.5">Punter Pot</span>
                       <span className="text-base lg:text-2xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                      className="bg-bet-primary text-bet-950 px-6 lg:px-10 py-3.5 rounded-xl text-[11px] lg:text-[13px] font-black uppercase tracking-[0.15em] hover:scale-105 shadow-xl cyan-glow"
                    >
                      Add Cash
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-36 lg:pb-12 no-scrollbar scroll-smooth">
              <div className="max-w-7xl mx-auto animate-fade-in">
                {children}
              </div>
           </main>
        </div>

        <LiveFeed />
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-bet-900 w-full max-w-md rounded-[3rem] overflow-hidden border border-bet-primary/20 shadow-2xl relative animate-fade-in">
              <div className="p-10 lg:p-14 border-b border-white/5 flex justify-between items-center bg-bet-950/80">
                 <div>
                   <h2 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase leading-none bazar-font">Instant <span className="text-bet-primary">Cash-In</span></h2>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Direct UPI To Bazar Node</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-12 h-12 bg-white/[0.08] rounded-full text-white text-2xl flex items-center justify-center border border-white/10 hover:bg-bet-danger transition-colors">✕</button>
              </div>
              <div className="p-10 lg:p-14 space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    {[10000, 50000, 100000, 500000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-8 bg-bet-800 hover:bg-bet-primary hover:text-bet-950 border border-white/10 rounded-[2.5rem] text-lg font-black text-white transition-all shadow-xl active:scale-95">₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
                 <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">Matka Certified Terminals</p>
                    <div className="flex gap-8 opacity-40 hover:opacity-100 transition-opacity">
                       <div className="w-16 h-10 bg-[#6739B7] rounded-xl flex items-center justify-center text-[9px] font-black text-white shadow-lg">PhonePe</div>
                       <div className="w-16 h-10 bg-[#00B9F1] rounded-xl flex items-center justify-center text-[9px] font-black text-white shadow-lg">Paytm</div>
                       <div className="w-16 h-10 bg-white rounded-xl flex items-center justify-center text-[9px] font-black text-indigo-700 shadow-lg">G-Pay</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};