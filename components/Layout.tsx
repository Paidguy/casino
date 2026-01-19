import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';

const JackpotTicker = () => (
  <div className="h-7 lg:h-8 bg-black/80 border-b border-white/10 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="mx-16 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-bet-accent">
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
    { label: 'Home', to: '/', icon: '🏠' },
    { label: 'Satta', to: '/matka', icon: '🏺' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Aviator', to: '/crash', icon: '✈️' },
    { label: 'Wheel', to: '/wheel', icon: '🎡' },
    { label: 'Mines', to: '/mines', icon: '🧨' },
    { label: 'Account', to: '/admin', icon: '👤' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden">
      <JackpotTicker />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <div 
          className={`fixed inset-0 z-[1000] lg:hidden transition-all duration-300 ${sidebarOpen ? 'bg-black/90 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className={`w-72 h-full bg-bet-900 border-r border-white/10 flex flex-col p-6 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
             <div className="text-white font-black text-2xl italic tracking-tighter uppercase mb-10 border-b border-white/5 pb-4">
                SATTA<span className="text-bet-accent">KING</span>
             </div>
             <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {menu.map(m => (
                  <Link 
                    key={m.to} to={m.to} 
                    onClick={() => { setSidebarOpen(false); audio.playClick(); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === m.to ? 'bg-bet-primary text-white' : 'text-slate-400 hover:bg-bet-800'}`}
                  >
                    <span className="text-xl">{m.icon}</span> {m.label}
                  </Link>
                ))}
             </nav>
             <button onClick={() => setSidebarOpen(false)} className="mt-4 p-4 bg-bet-800 rounded-xl text-[10px] font-black uppercase text-slate-500">Close</button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-bet-900/40 border-r border-white/5 flex-col shrink-0">
          <div className="h-20 flex items-center px-8 border-b border-white/5">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-bet-accent rounded-lg flex items-center justify-center text-black font-black text-xl">S</div>
                <div className="text-white font-black text-lg tracking-tighter uppercase italic">SATTA<span className="text-bet-accent">KING</span></div>
             </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => audio.playClick()}
                 className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${location.pathname === item.to ? 'bg-bet-primary text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
               >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
               </Link>
             ))}
          </nav>
          <div className="p-6 border-t border-white/5 bg-black/10">
             <div className="bg-bet-800/50 p-3 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Level Progress</div>
                <div className="h-1 bg-black rounded-full overflow-hidden">
                   <div className="h-full bg-bet-accent" style={{ width: '60%' }}></div>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
           <header className="h-16 lg:h-20 bg-bet-900/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-10 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-3 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-2xl">☰</button>
                 <span className="text-bet-accent font-black italic">SK</span>
              </div>

              <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                 <span className="w-1.5 h-1.5 bg-bet-success animate-pulse rounded-full"></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Stable</span>
              </div>

              <div className="flex items-center gap-3 lg:gap-6">
                 <div className="bg-black/40 px-3 lg:px-5 py-1.5 rounded-xl border border-white/10 flex items-center gap-4 shadow-lg">
                    <div className="flex flex-col text-right">
                       <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-0.5">Balance</span>
                       <span className="text-sm lg:text-lg font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setShowDeposit(true)} 
                      className="bg-bet-accent text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                    >
                      Add
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-10 no-scrollbar">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
           </main>

           {/* Mobile Bottom Bar */}
           <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bet-900/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center z-[500] safe-bottom">
              {menu.slice(0, 5).map(m => (
                <Link 
                  key={m.to} to={m.to} 
                  className={`flex flex-col items-center gap-1 transition-all ${location.pathname === m.to ? 'text-bet-accent' : 'text-slate-500 opacity-60'}`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{m.label.split(' ')[0]}</span>
                </Link>
              ))}
           </nav>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
           <div className="bg-bet-900 w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <div>
                   <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Instant <span className="text-bet-accent">Deposit</span></h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Direct Bank & UPI Transfer</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-10 h-10 bg-white/5 rounded-full text-white text-xl flex items-center justify-center">✕</button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-3 gap-3">
                    {[1000, 5000, 10000, 25000, 50000, 100000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-4 bg-bet-800 hover:bg-bet-700 border border-white/10 rounded-xl text-xs font-black text-white transition-all">+₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
                 <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-bet-success/10 flex items-center justify-center text-bet-success text-xs font-black">✓</div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secured via Bharat-API-6 Nodes</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};