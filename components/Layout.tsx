import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

const MarketTicker = () => (
  <div className="h-8 bg-black border-b border-white/5 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-12 text-[10px] font-black uppercase tracking-[0.4em] text-bet-primary drop-shadow-[0_0_8px_#22d3ee]">
          🔥 KALYAN BAZAR: 143-8 FIX • DHAMAKA: PUNTER_RAJ WON ₹8.5L • WITHDRAWAL SPEED: 30S • MADE BY @PAIDGUY • 
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
    { label: 'Market Lobby', to: '/', icon: '🏰' },
    { label: 'Kalyan Bazar', to: '/matka', icon: '🏺' },
    { label: 'Udaan Aviator', to: '/crash', icon: '🚀' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Satta Slots', to: '/slots', icon: '🎰' },
    { label: 'Shubh Wheel', to: '/wheel', icon: '🎡' },
    { label: 'Fairness Audit', to: '/fairness', icon: '🔒' },
    { label: 'Pit Boss', to: '/admin', icon: '👤' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden font-jakarta selection:bg-bet-primary selection:text-bet-950">
      <MarketTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[490] lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Navigation Sidebar (Fixed Width) */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-bet-900 border-r border-white/5 transition-transform duration-300 z-[500] flex flex-col shrink-0`}>
          <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 bg-black/20">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-bet-primary to-bet-secondary rounded-lg flex items-center justify-center text-white font-black text-xl shadow-xl animate-pulse-neon">S</div>
                <div className="text-white font-black text-xl tracking-tighter uppercase italic bazar-font">SATTA<span className="text-bet-primary">KING</span></div>
             </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => { audio.playClick(); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[12px] transition-all group ${location.pathname === item.to ? 'bg-bet-primary text-bet-950 shadow-xl cyan-glow scale-[1.02]' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
               >
                  <span className="text-xl group-hover:rotate-12 transition-transform">{item.icon}</span>
                  <span className="bazar-font tracking-widest leading-none">{item.label}</span>
               </Link>
             ))}
          </nav>
          
          <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
             <div className="bg-bet-950/60 rounded-xl p-3 border border-white/10 mb-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Created By</p>
                <p className="text-[10px] text-bet-primary font-black uppercase">@paidguy</p>
             </div>
             <button onClick={() => engine.resetBalance()} className="w-full py-3 bg-bet-800 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-bet-danger hover:text-white transition-all border border-white/5">Destroy Session</button>
          </div>
        </aside>

        {/* Tri-Column Content Stage */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Content Area (Spacious Middle Column) */}
          <div className="flex-1 flex flex-col min-w-0 bg-bet-950 relative">
             <header className="h-16 lg:h-20 bg-bet-950/90 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-[50]">
                <div className="flex items-center gap-4 lg:hidden">
                   <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-2xl bg-bet-primary text-bet-950 rounded-lg shadow-lg">☰</button>
                   <span className="text-bet-primary font-black italic text-lg bazar-font">KING</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                   <div className="bg-bet-primary/5 px-5 py-2.5 rounded-full border border-bet-primary/20 flex items-center gap-3">
                      <span className="w-2 h-2 bg-bet-success animate-pulse rounded-full shadow-[0_0_10px_#22c55e]"></span>
                      <span className="text-[11px] font-black text-bet-primary uppercase tracking-widest">Mumbai Server: Verified @paidguy</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                   <div className="bg-bet-900/80 px-5 lg:px-8 py-2.5 rounded-2xl border border-white/10 flex items-center gap-6 lg:gap-10 shadow-2xl">
                      <div className="flex flex-col text-right">
                         <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1 tracking-tighter">Matka Wallet</span>
                         <span className="text-base lg:text-xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">₹{Math.floor(session.balance).toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                        className="bg-bet-primary text-bet-950 px-6 lg:px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] hover:scale-105 shadow-xl transition-all bazar-font"
                      >
                        Refill
                      </button>
                   </div>
                </div>
             </header>

             {/* Dynamic Body Content */}
             <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-40 lg:pb-10 no-scrollbar scroll-smooth">
                <div className="max-w-6xl mx-auto min-h-full">
                  {children}
                </div>
             </main>
          </div>

          {/* Right Column (Intel Feed - Only on XL Screens to avoid clutter) */}
          <div className="hidden 2xl:block w-80 shrink-0 h-full border-l border-white/5 bg-bet-900/50 backdrop-blur-xl">
             <LiveFeed />
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-bet-900 w-full max-w-md rounded-[3rem] overflow-hidden border-2 border-bet-primary/30 shadow-3xl relative">
              <div className="p-10 border-b border-white/10 flex justify-between items-center bg-black/40">
                 <div>
                   <h2 className="text-3xl font-black text-white italic uppercase leading-none bazar-font">Instant <span className="text-bet-primary">Refill</span></h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Authorized By @paidguy Node</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-10 h-10 bg-white/5 rounded-full text-white text-xl flex items-center justify-center hover:bg-bet-danger transition-colors">✕</button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    {[10000, 50000, 100000, 500000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-6 bg-bet-800 hover:bg-bet-primary hover:text-bet-950 border border-white/10 rounded-2xl text-lg font-black text-white transition-all shadow-xl active:scale-95">₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};