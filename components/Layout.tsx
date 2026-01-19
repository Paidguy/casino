
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';

const JackpotTicker = () => (
  <div className="h-8 bg-bet-950 border-b border-white/5 overflow-hidden flex items-center shrink-0 select-none">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-8 text-[9px] font-bold uppercase tracking-wider text-bet-accent">
          🔥 JACKPOT WIN: USER_4421 won ₹12,40,290 on KALYAN NIGHT • INSTANT WITHDRAWAL SUCCESSFUL VIA UPI • WELCOME BONUS 500% ACTIVE • 
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
    { label: 'Plinko', to: '/plinko', icon: '🏀' },
    { label: 'Fairness', to: '/fairness', icon: '⚖️' },
    { label: 'Account', to: '/admin', icon: '👤' },
  ];

  return (
    <div className="flex h-[100dvh] bg-bet-950 text-slate-300 overflow-hidden flex-col">
      <JackpotTicker />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`fixed inset-0 z-[200] bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className={`w-72 h-full bg-bet-900 border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 bg-bet-accent rounded-xl flex items-center justify-center text-black font-black text-xl">S</div>
               <div className="text-white font-black text-2xl italic tracking-tighter">SATTAKING</div>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
              {menu.map(m => (
                <Link 
                  key={m.to} to={m.to} 
                  onClick={() => { setSidebarOpen(false); audio.playClick(); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === m.to ? 'bg-bet-primary text-white shadow-lg' : 'hover:bg-bet-800'}`}
                >
                  <span className="text-xl">{m.icon}</span> {m.label}
                </Link>
              ))}
            </nav>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="mt-8 py-4 bg-bet-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400"
            >
              Close Menu
            </button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 bg-bet-900 border-r border-white/5 flex-col shrink-0">
          <div className="h-20 flex items-center px-8 border-b border-white/5">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bet-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(250,204,21,0.2)]">S</div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg leading-none tracking-tighter uppercase italic">SATTA<span className="text-bet-accent">KING</span></span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Bharat's No. 1 Portal</span>
                </div>
             </Link>
          </div>

          <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => audio.playClick()}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${location.pathname === item.to ? 'bg-bet-primary text-white shadow-xl translate-x-1' : 'hover:bg-bet-800'}`}
               >
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span>{item.label}</span>
               </Link>
             ))}
          </nav>

          <div className="p-8 border-t border-white/5 bg-bet-950">
             <div className="bg-bet-900 p-5 rounded-2xl border border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">VIP Status</div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                   <div className="h-full bg-bet-accent" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-widest">
                   <span>Bronze</span>
                   <span className="text-bet-accent">Silver</span>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Interface */}
        <div className="flex-1 flex flex-col relative min-w-0 h-full">
           {/* Global App Header */}
           <header className="h-16 lg:h-20 bg-bet-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-12 shrink-0 sticky top-0 z-50">
              <div className="flex items-center gap-3 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-2xl text-white focus:outline-none">☰</button>
                 <span className="text-bet-accent font-black italic text-lg tracking-tighter leading-none">SK</span>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="hidden lg:flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-bet-success animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network: STABLE</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 lg:gap-8">
                 <div className="bg-bet-950 px-4 py-1.5 lg:px-8 lg:py-2.5 rounded-2xl border border-white/10 flex items-center gap-4 lg:gap-8 shadow-inner">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-3">
                       <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase leading-none">Balance</span>
                       <span className="text-xs lg:text-xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString('en-IN')}</span>
                    </div>
                    <button 
                      onClick={() => setShowDeposit(true)} 
                      className="bg-bet-accent text-black px-3 py-1 lg:px-6 lg:py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      Deposit
                    </button>
                 </div>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto p-4 lg:p-12 pb-32 lg:pb-12 no-scrollbar scroll-smooth">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
           </main>

           {/* Adaptive Mobile Nav */}
           <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bet-900/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-20 px-2 z-[100] safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {menu.slice(0, 5).map(m => (
                <Link key={m.to} to={m.to} onClick={() => audio.playClick()} className={`flex flex-col items-center gap-1.5 flex-1 py-2 ${location.pathname === m.to ? 'text-bet-accent' : 'text-slate-500'}`}>
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{m.label.split(' ')[0]}</span>
                </Link>
              ))}
           </nav>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
           <div className="bg-bet-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl my-auto">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-bet-800">
                 <div>
                   <h2 className="text-2xl font-black text-white italic -skew-x-12 tracking-tighter uppercase">Instant <span className="text-bet-accent">Deposit</span></h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Bharat's Trusted Nodes</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-10 h-10 bg-black/20 rounded-full text-white text-xl flex items-center justify-center focus:outline-none">✕</button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { engine.deposit(5000, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="p-6 border-2 border-bet-primary rounded-3xl flex flex-col items-center gap-3 bg-bet-primary/10 transition-all hover:scale-[1.02]">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-8 invert" />
                       <span className="text-[10px] font-black uppercase text-bet-primary tracking-[0.2em]">UPI Pay</span>
                    </button>
                    <button className="p-6 border border-white/5 rounded-3xl flex flex-col items-center gap-3 opacity-40 grayscale cursor-not-allowed">
                       <span className="text-3xl">🏛️</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Banking</span>
                    </button>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Recharge Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                       {[1000, 5000, 10000, 25000, 50000, 100000].map(amt => (
                          <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-4 bg-bet-800 hover:bg-bet-700 border border-white/5 rounded-2xl text-xs font-black text-white transition-all">+₹{amt.toLocaleString()}</button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-bet-success/10 flex items-center justify-center text-bet-success">✓</div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Auto-Settlement Active via Secure Nodes</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
