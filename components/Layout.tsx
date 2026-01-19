
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [showWallet, setShowWallet] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const itv = setInterval(() => setSession(engine.getSession()), 1000);
    return () => clearInterval(itv);
  }, []);

  const menu = [
    { label: 'Lobby', to: '/', icon: '🏮' },
    { label: 'Matka Draw', to: '/matka', icon: '🏺' },
    { label: 'Matka Crash', to: '/crash', icon: '⚡' },
    { label: 'Ball Plinko', to: '/plinko', icon: '💎' },
    { label: 'Gold Mines', to: '/mines', icon: '🧨' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
  ];

  return (
    <div className="flex h-screen bg-casino-950 text-slate-400 overflow-hidden font-sans">
      <MarketingOverlay />
      <LiveFeed />

      {/* Modern Sidebar */}
      <aside className="w-20 lg:w-64 bg-casino-900 border-r border-white/5 flex flex-col z-50 transition-all duration-500">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
           <Link to="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-casino-accent rounded-xl flex items-center justify-center text-black font-black shadow-neon-green transform hover:rotate-12 transition-transform">S</div>
              <span className="hidden lg:block text-white font-black italic uppercase -skew-x-12 text-xl tracking-tighter">STAKE<span className="text-casino-accent">.IND</span></span>
           </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
           {menu.map(item => (
             <Link 
               key={item.to} to={item.to} 
               onClick={() => audio.playClick()}
               className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${location.pathname === item.to ? 'bg-white/5 text-white border border-white/5' : 'hover:bg-white/[0.02] hover:text-white'}`}
             >
                <span className="text-xl opacity-60 group-hover:opacity-100">{item.icon}</span>
                <span className="hidden lg:block text-xs font-black uppercase tracking-widest">{item.label}</span>
             </Link>
           ))}
        </nav>

        <div className="p-4 border-t border-white/5">
           <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">
                 <span>VIP</span>
                 <span className="text-casino-accent italic">Level 3</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-casino-accent" style={{ width: '64%' }}></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
         <header className="h-24 px-8 lg:px-12 flex items-center justify-between border-b border-white/5 bg-casino-900/50 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center gap-6">
               <div className="bg-black/60 pl-6 pr-2 py-2 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
                  <div className="flex items-center gap-2">
                     <span className="text-casino-accent font-black">₹</span>
                     <span className="text-white font-mono font-bold text-lg tabular-nums tracking-tighter">
                        {session.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                     </span>
                  </div>
                  <button onClick={() => setShowWallet(true)} className="bg-casino-accent text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-neon-green active:scale-95 transition-all">Wallet</button>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden md:block text-right">
                  <div className="text-white font-black text-sm italic uppercase -skew-x-6">{session.username}</div>
                  <div className="text-[9px] font-bold text-casino-accent uppercase tracking-[0.3em]">VIP Platinum</div>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black cursor-pointer hover:border-casino-accent transition-all" onClick={() => engine.toggleAdmin()}>
                  {session.username[0]}
               </div>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 lg:pr-80">
            {children}
         </div>
      </main>

      {/* Simple Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
           <div className="glass-card w-full max-w-lg rounded-[3rem] p-12 border-white/10 relative shadow-[0_0_100px_rgba(0,0,0,1)]">
              <button onClick={() => setShowWallet(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">✕</button>
              <h2 className="text-4xl font-black text-white italic -skew-x-12 uppercase mb-10 tracking-tighter">Finance <span className="text-casino-accent">Hub</span></h2>
              
              <div className="space-y-8">
                 <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Available Balance</div>
                    <div className="text-4xl font-mono font-black text-white italic tracking-tighter">₹{session.balance.toLocaleString()}</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { engine.deposit(10000, 'Simulated'); setShowWallet(false); audio.playWin(); }} className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white">Deposit</button>
                    <button className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-30 cursor-not-allowed text-white">Withdraw</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
