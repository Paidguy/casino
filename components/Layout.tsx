import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';

const JackpotTicker = () => (
  <div className="h-7 lg:h-8 bg-black/60 border-b border-white/5 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-12 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-bet-accent">
          🔥 RECENT WIN: USER_9281 WON ₹4,20,000 ON KALYAN NIGHT • UPI WITHDRAWAL PROCESSED • 500% BONUS ACTIVE • 
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
    { label: 'Satta Bazar', to: '/matka', icon: '🏺' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Aviator', to: '/crash', icon: '✈️' },
    { label: 'Mines', to: '/mines', icon: '🧨' },
    { label: 'Account', to: '/admin', icon: '👤' },
  ];

  return (
    <div className="flex flex-col h-full w-full relative z-10">
      <JackpotTicker />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar */}
        <div 
          className={`fixed inset-0 z-[200] transition-all duration-300 lg:hidden ${sidebarOpen ? 'bg-black/80 backdrop-blur-sm pointer-events-auto opacity-100' : 'bg-transparent pointer-events-none opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className={`w-72 h-full bg-bet-900 p-6 flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
               <div className="w-10 h-10 bg-bet-accent rounded-xl flex items-center justify-center text-black font-black text-xl">S</div>
               <div className="text-white font-black text-2xl tracking-tighter uppercase italic">SATTA<span className="text-bet-accent">KING</span></div>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {menu.map(m => (
                <Link 
                  key={m.to} to={m.to} 
                  onClick={() => { setSidebarOpen(false); audio.playClick(); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === m.to ? 'bg-bet-primary text-white shadow-lg' : 'text-slate-400 hover:bg-bet-800'}`}
                >
                  <span className="text-xl">{m.icon}</span> {m.label}
                </Link>
              ))}
            </nav>
            <button onClick={() => setSidebarOpen(false)} className="mt-4 p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest bg-black/20 rounded-xl">Close Menu</button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 bg-bet-900/50 backdrop-blur-xl border-r border-white/5 flex-col shrink-0">
          <div className="h-20 flex items-center px-8 border-b border-white/5">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bet-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(251,191,36,0.2)]">S</div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg leading-none tracking-tighter uppercase italic">SATTA<span className="text-bet-accent">KING</span></span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">BHARAT NO. 1 PORTAL</span>
                </div>
             </Link>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => audio.playClick()}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${location.pathname === item.to ? 'bg-bet-primary text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}
               >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
               </Link>
             ))}
          </nav>

          <div className="p-8 border-t border-white/5 bg-black/20">
             <div className="bg-bet-800 p-4 rounded-2xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Punter Level</div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                   <div className="h-full bg-bet-accent" style={{ width: '45%' }}></div>
                </div>
             </div>
          </div>
        </aside>

        {/* Content Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
           {/* Header */}
           <header className="h-16 lg:h-20 bg-bet-900/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-4 lg:px-12 shrink-0 z-40 sticky top-0">
              <div className="flex items-center gap-3 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="p-2 text-2xl text-white">☰</button>
                 <span className="text-bet-accent font-black italic text-lg tracking-tighter">SK</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                 <span className="w-1.5 h-1.5 rounded-full bg-bet-success animate-pulse"></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Node-6 Status: Normal</span>
              </div>

              <div className="flex items-center gap-4 lg:gap-8">
                 <div className="bg-black/40 px-3 lg:px-6 py-1.5 rounded-2xl border border-white/10 flex items-center gap-4 lg:gap-6 shadow-lg">
                    <div className="flex flex-col text-right">
                       <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Total Balance</span>
                       <span className="text-sm lg:text-xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setShowDeposit(true)} 
                      className="bg-bet-accent text-black px-4 lg:px-6 py-1.5 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                      Deposit
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-4 lg:p-12 pb-32 lg:pb-12 no-scrollbar relative z-10">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
           </main>

           {/* Mobile Bottom Nav */}
           <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-bet-900/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 z-[150] safe-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              {menu.slice(0, 5).map(m => (
                <Link 
                  key={m.to} to={m.to} 
                  className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${location.pathname === m.to ? 'text-bet-accent scale-110' : 'text-slate-500 opacity-60'}`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{m.label.split(' ')[0]}</span>
                </Link>
              ))}
           </nav>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
           <div className="bg-bet-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] my-auto relative">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <div>
                   <h2 className="text-2xl font-black text-white italic -skew-x-12 tracking-tighter uppercase">Instant <span className="text-bet-accent">Recharge</span></h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verified UPI Gateways</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-10 h-10 bg-white/5 rounded-full text-white text-xl flex items-center justify-center">✕</button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { engine.deposit(5000, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="p-6 border-2 border-bet-primary rounded-3xl flex flex-col items-center gap-3 bg-bet-primary/10 transition-all hover:brightness-125">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-8 invert" />
                       <span className="text-[10px] font-black uppercase text-bet-primary tracking-[0.2em]">UPI Pay</span>
                    </button>
                    <div className="p-6 border border-white/5 rounded-3xl flex flex-col items-center gap-3 opacity-20 grayscale cursor-not-allowed">
                       <span className="text-3xl">🏦</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Net Banking</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Select Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                       {[500, 2000, 5000, 10000, 25000, 50000].map(amt => (
                          <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-4 bg-bet-800 hover:bg-bet-700 border border-white/10 rounded-2xl text-xs font-black text-white transition-all">+₹{amt.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-bet-success/10 flex items-center justify-center text-bet-success text-xs font-black animate-pulse">✓</div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Encrypted Transaction Hash: SEC-DRAW-PRO-922</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};