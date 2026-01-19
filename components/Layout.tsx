import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

const LiveTicker = () => (
  <div className="h-10 lg:h-12 bg-black border-b border-bet-accent/30 overflow-hidden flex items-center shrink-0 z-[100] relative">
    <div className="flex animate-marquee whitespace-nowrap py-1">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="mx-16 text-[11px] lg:text-[14px] font-black uppercase tracking-[0.2em] text-bet-accent">
          💎 SATTA DHAMAKA: KALYAN FIX PANNA OUT NOW • WITHDRAWAL SPEED: 30 SECONDS • DIRECT OFFICE RESULT 100% GUARANTEE • 
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
    { label: 'Matka Lobby', to: '/', icon: '🏰' },
    { label: 'Kalyan Bazar', to: '/matka', icon: '🏺' },
    { label: 'Udaan Aviator', to: '/crash', icon: '🚀' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
    { label: 'Royal Slots', to: '/slots', icon: '🎰' },
    { label: 'Shubh Chakra', to: '/wheel', icon: '🎡' },
    { label: 'Kanchas (Mines)', to: '/mines', icon: '🧨' },
    { label: 'Admin Panel', to: '/admin', icon: '👑' },
  ];

  const markets = [
    { name: 'Kalyan Open', status: 'LIVE', color: 'text-bet-success' },
    { name: 'Milan Day', status: 'FIXED', color: 'text-bet-accent' },
    { name: 'Rajdhani', status: 'CLOSED', color: 'text-slate-500' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-white overflow-hidden font-jakarta">
      <LiveTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[490] lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-bet-900 border-r border-bet-accent/10 transition-transform duration-300 z-[500] flex flex-col shrink-0`}>
          <div className="h-16 lg:h-24 flex items-center px-8 border-b border-bet-accent/10 shrink-0 bg-black/20">
             <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center text-black font-black text-3xl shadow-xl">S</div>
                <div className="text-white font-black text-2xl tracking-tighter uppercase italic bazar-font">SATTA<span className="text-bet-accent">BOSS</span></div>
             </Link>
          </div>
          
          <div className="p-6">
             <div className="bg-black/40 rounded-3xl p-5 border border-bet-accent/20 space-y-4 shadow-xl">
                <p className="text-[10px] font-black text-bet-accent uppercase tracking-widest px-1">Market Radar</p>
                {markets.map(m => (
                  <div key={m.name} className="flex justify-between items-center text-[12px] font-bold">
                    <span className="text-slate-300">{m.name}</span>
                    <span className={`${m.color} animate-pulse`}>{m.status}</span>
                  </div>
                ))}
             </div>
          </div>

          <nav className="flex-1 p-5 space-y-2 overflow-y-auto no-scrollbar">
             {menu.map(item => (
               <Link 
                 key={item.to} to={item.to} 
                 onClick={() => { audio.playClick(); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[13px] transition-all group ${location.pathname === item.to ? 'bg-bet-accent text-black shadow-xl scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
               >
                  <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                  <span className="bazar-font tracking-widest">{item.label}</span>
               </Link>
             ))}
          </nav>
          
          <div className="p-6 border-t border-bet-accent/10 bg-black/20 shrink-0">
             <button onClick={() => engine.resetBalance()} className="w-full py-4 bg-bet-800 rounded-2xl text-[12px] font-black uppercase text-bet-accent border border-bet-accent/20 hover:bg-bet-accent hover:text-black transition-all">Clear Session</button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 relative h-full">
           <header className="h-16 lg:h-24 bg-bet-900/90 backdrop-blur-2xl border-b border-bet-accent/10 flex items-center justify-between px-6 lg:px-16 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-5 lg:hidden">
                 <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center text-3xl bg-bet-accent text-black rounded-xl">☰</button>
                 <span className="text-bet-accent font-black italic text-xl bazar-font">SATTA BOSS</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                 <div className="bg-bet-success/10 px-5 py-3 rounded-full border border-bet-success/20 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-bet-success animate-pulse rounded-full shadow-[0_0_12px_#16a34a]"></span>
                    <span className="text-[12px] font-black text-bet-success uppercase tracking-widest">Kalyan Server: Secure & Direct</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-10">
                 <div className="bg-black/60 px-6 lg:px-10 py-4 rounded-[2rem] border-2 border-bet-accent/20 flex items-center gap-6 lg:gap-12 shadow-2xl">
                    <div className="flex flex-col text-right">
                       <span className="text-[10px] lg:text-[11px] font-black text-bet-accent uppercase leading-none mb-1.5 tracking-tighter">Your Wallet</span>
                       <span className="text-lg lg:text-3xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.balance).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                      className="gold-gradient text-black px-8 lg:px-12 py-4 rounded-xl text-[12px] lg:text-[14px] font-black uppercase tracking-[0.1em] hover:scale-110 shadow-xl"
                    >
                      Deposit
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

      {showDeposit && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-bet-900 w-full max-w-md rounded-[3rem] overflow-hidden border-4 border-bet-accent shadow-2xl relative animate-fade-in">
              <div className="p-10 lg:p-14 border-b border-bet-accent/20 flex justify-between items-center bg-black/40">
                 <div>
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none bazar-font">Instant <span className="text-bet-accent">Cash</span></h2>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Direct UPI Deposit (No Middleman)</p>
                 </div>
                 <button onClick={() => setShowDeposit(false)} className="w-12 h-12 bg-bet-accent rounded-full text-black text-2xl flex items-center justify-center hover:bg-white transition-colors">✕</button>
              </div>
              <div className="p-10 lg:p-14 space-y-6">
                 <div className="grid grid-cols-2 gap-5">
                    {[10000, 50000, 100000, 500000].map(amt => (
                       <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-8 bg-bet-800 hover:bg-bet-accent hover:text-black border-2 border-bet-accent/30 rounded-[2.5rem] text-xl font-black text-white transition-all shadow-xl active:scale-95">₹{amt.toLocaleString()}</button>
                    ))}
                 </div>
                 <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Khaiwal Trusted Terminals</p>
                    <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                       <div className="w-16 h-10 bg-[#6739B7] rounded-xl flex items-center justify-center text-[10px] font-black text-white">PhonePe</div>
                       <div className="w-16 h-10 bg-[#00B9F1] rounded-xl flex items-center justify-center text-[10px] font-black text-white">Paytm</div>
                       <div className="w-16 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-blue-600">GooglePay</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};