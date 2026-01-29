import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { LiveFeed } from './LiveFeed';
import { MarketingOverlay } from './MarketingOverlay';

// --- Atomic Components for Performance ---

const MemoizedTicker = memo(() => (
  <div className="h-7 bg-black border-b border-white/5 overflow-hidden flex items-center shrink-0 z-[1200] relative">
    <div className="flex animate-marquee whitespace-nowrap will-change-transform">
      {[...Array(8)].map((_, i) => (
        <span key={i} className="mx-16 text-[9px] font-black uppercase tracking-[0.4em] text-bet-primary drop-shadow-[0_0_8px_#22d3ee]">
          🔥 KALYAN BAZAR: 143-8 FIX • DHAMAKA: PUNTER_RAJ WON ₹8.5L • WITHDRAWAL SPEED: 30S • MADE BY @PAIDGUY • 
        </span>
      ))}
    </div>
  </div>
));

// Isolated Wallet Widget - Only this component re-renders on balance changes
const WalletWidget = () => {
    const [balance, setBalance] = useState(engine.getSession().balance);
    const [showDeposit, setShowDeposit] = useState(false);
    const [customDeposit, setCustomDeposit] = useState('');

    useEffect(() => {
        return engine.subscribe((s) => setBalance(s.balance));
    }, []);

    return (
        <>
            <div className="flex items-center gap-2 lg:gap-4">
                <div className="bg-bet-900/80 px-3 py-1.5 lg:px-4 rounded-xl border border-white/10 flex items-center gap-3 lg:gap-6 shadow-xl">
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-slate-600 uppercase mb-0.5 tracking-tighter hidden sm:block">Matka Wallet</span>
                        <span className="text-xs lg:text-lg font-black text-white tabular-nums tracking-tighter">₹{Math.floor(balance).toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => { setShowDeposit(true); audio.playClick(); }} 
                        className="bg-bet-primary text-bet-950 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all bazar-font shadow-lg"
                    >
                        Refill
                    </button>
                </div>
            </div>

            {showDeposit && (
                <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-bet-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden border border-bet-primary/30 shadow-3xl relative will-change-transform">
                        <div className="p-6 lg:p-8 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase leading-none bazar-font tracking-widest">Instant <span className="text-bet-primary">Cash</span></h2>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authorized Gateway @paidguy</p>
                            </div>
                            <button onClick={() => setShowDeposit(false)} className="w-8 h-8 bg-white/5 rounded-full text-white text-lg flex items-center justify-center hover:bg-bet-danger transition-colors">✕</button>
                        </div>
                        <div className="p-6 lg:p-8 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {[10000, 50000, 100000, 500000].map(amt => (
                                    <button key={amt} onClick={() => { engine.deposit(amt, 'UPI'); setShowDeposit(false); audio.playWin(); }} className="py-4 bg-bet-800 hover:bg-bet-primary hover:text-bet-950 border border-white/10 rounded-xl text-sm lg:text-base font-black text-white transition-all active:scale-95">₹{amt.toLocaleString()}</button>
                                ))}
                            </div>
                            <div className="relative pt-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black mt-1">₹</span>
                                <input 
                                    type="number" 
                                    value={customDeposit} 
                                    onChange={(e) => setCustomDeposit(e.target.value)}
                                    placeholder="Custom Amount"
                                    className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-20 py-4 text-white font-black outline-none focus:border-bet-primary transition-all placeholder:text-slate-700 placeholder:font-bold"
                                />
                                <button 
                                    onClick={() => { 
                                        const amt = parseInt(customDeposit);
                                        if (amt > 0) {
                                            engine.deposit(amt, 'UPI'); 
                                            setShowDeposit(false); 
                                            setCustomDeposit('');
                                            audio.playWin(); 
                                        }
                                    }}
                                    className="absolute right-2 top-2 bottom-2 bg-bet-primary text-bet-950 px-4 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const SidebarItem = memo(({ item, active, onClick }: { item: any, active: boolean, onClick: () => void }) => (
    <Link 
      to={item.to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-[10px] transition-all group mb-0.5 ${active ? 'bg-bet-primary text-bet-950 shadow-lg cyan-glow' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
    >
      <span className="text-base group-hover:scale-110 transition-transform w-5 text-center">{item.icon}</span>
      <span className="uppercase tracking-widest leading-none mt-0.5">{item.label}</span>
    </Link>
));

const MemoizedSidebar = memo(({ open, setOpen, location }: { open: boolean, setOpen: (o: boolean) => void, location: any }) => {
    const gameCategories = [
        {
            name: "Live Bazar",
            items: [
                { label: 'Market Lobby', to: '/', icon: '🏰' },
                { label: 'Kalyan Matka', to: '/matka', icon: '🏺' },
                { label: 'Teen Patti', to: '/teenpatti', icon: '🃏' },
                { label: 'Baccarat', to: '/baccarat', icon: '🤵' },
            ]
        },
        {
            name: "Pro Originals",
            items: [
                { label: 'Aviator', to: '/crash', icon: '🚀' },
                { label: 'Mines', to: '/mines', icon: '🧨' },
                { label: 'Plinko', to: '/plinko', icon: '🎱' },
                { label: 'Dice', to: '/dice', icon: '🎲' },
                { label: 'Wheel', to: '/wheel', icon: '🎡' },
                { label: 'Keno', to: '/keno', icon: '🔢' },
                { label: 'Coinflip', to: '/coinflip', icon: '🪙' },
            ]
        },
        {
            name: "Classic Casino",
            items: [
                { label: 'Slots', to: '/slots', icon: '🎰' },
                { label: 'Roulette', to: '/roulette', icon: '🎯' },
                { label: 'Blackjack', to: '/blackjack', icon: '♠️' },
            ]
        }
    ];

    const systemMenu = [
        { label: 'My Statistics', to: '/statistics', icon: '📈' },
        { label: 'Ledger', to: '/transactions', icon: '📜' },
        { label: 'Fairness', to: '/fairness', icon: '🔒' },
        { label: 'Pit Boss', to: '/admin', icon: '👤' },
    ];

    return (
        <>
            <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-bet-900 border-r border-white/5 transition-transform duration-300 z-[1100] flex flex-col shrink-0 shadow-2xl lg:shadow-none will-change-transform`}>
                <div className="h-14 lg:h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-black/20">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-bet-primary to-bet-secondary rounded-lg flex items-center justify-center text-white font-black text-lg shadow-xl animate-pulse-neon">S</div>
                        <div className="text-white font-black text-lg tracking-tighter uppercase italic bazar-font">SATTA<span className="text-bet-primary">KING</span></div>
                    </Link>
                    <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500 text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {gameCategories.map((cat, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="px-3 mb-2 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">{cat.name}</div>
                            <div className="space-y-0.5">
                                {cat.items.map(item => (
                                    <SidebarItem key={item.to} item={item} active={location.pathname === item.to} onClick={() => { audio.playClick(); setOpen(false); }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-3 bg-black/20 border-t border-white/5 space-y-0.5 shrink-0">
                    <div className="px-3 mb-2 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">System</div>
                    {systemMenu.map(item => (
                        <SidebarItem key={item.to} item={item} active={location.pathname === item.to} onClick={() => { audio.playClick(); setOpen(false); }} />
                    ))}
                </div>
                
                <div className="p-4 border-t border-white/5 bg-bet-950/50 shrink-0">
                    <div className="bg-bet-900 rounded-xl p-3 border border-white/5 mb-3 flex items-center justify-between">
                        <div className="overflow-hidden">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Developer</p>
                            <p className="text-[10px] text-bet-primary font-black uppercase leading-none truncate">@paidguy</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-bet-success animate-pulse shadow-[0_0_10px_#22c55e] shrink-0 ml-2"></div>
                    </div>
                    <button onClick={() => engine.resetBalance()} className="w-full py-2.5 bg-bet-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:bg-bet-danger hover:text-white transition-all border border-white/5">Destroy Session</button>
                </div>
            </aside>
            {open && (
                <div className="fixed inset-0 bg-black/80 z-[1000] lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)}></div>
            )}
        </>
    );
});

// Memoized Live Feed container to prevent rerenders when Layout changes
const MemoizedLiveFeed = memo(() => <LiveFeed />);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  const location = useLocation();
  const isLobby = location.pathname === '/';

  return (
    <div className="flex flex-col h-full w-full bg-bet-950 text-slate-100 overflow-hidden font-jakarta selection:bg-bet-primary selection:text-bet-950">
      <MemoizedTicker />
      <MarketingOverlay />
      
      <div className="flex flex-1 overflow-hidden relative">
        <MemoizedSidebar open={sidebarOpen} setOpen={setSidebarOpen} location={location} />

        <div className="flex-1 flex flex-col min-w-0 bg-bet-950 relative h-full">
           <header className="h-14 lg:h-16 bg-bet-950/95 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-3 lg:px-8 shrink-0 sticky top-0 z-[50]">
              <div className="flex items-center gap-3">
                 <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center text-lg bg-bet-900 border border-white/10 rounded-xl hover:bg-bet-primary hover:text-bet-950 transition-all lg:hidden">☰</button>
                 <div className="hidden sm:flex items-center gap-4">
                    <div className="bg-bet-success/10 px-3 py-1.5 rounded-lg border border-bet-success/20 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-bet-success rounded-full animate-pulse"></span>
                       <span className="text-[9px] font-black text-bet-success uppercase tracking-widest">Secure Node</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                 {/* Balance Widget is isolated here */}
                 <WalletWidget />
                 
                 <button 
                  onClick={() => setShowIntel(!showIntel)}
                  className={`w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center text-lg rounded-xl border transition-all ${showIntel ? 'bg-bet-primary text-bet-950 border-bet-primary' : 'bg-bet-900 border-white/10 text-slate-500'}`}
                 >
                   📊
                 </button>
              </div>
           </header>

           <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
              <div className={`${isLobby ? 'max-w-6xl' : 'max-w-6xl'} mx-auto p-3 sm:p-4 lg:p-8 pb-32 lg:pb-8`}>
                {children}
              </div>
           </main>
        </div>

        <div className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-bet-900 border-l border-white/10 transition-transform duration-300 z-[1200] will-change-transform ${showIntel ? 'translate-x-0' : 'translate-x-full pointer-events-none shadow-none'}`}>
           <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
              <span className="text-[10px] font-black text-bet-primary uppercase tracking-[0.3em] bazar-font">Live Intel Board</span>
              <button onClick={() => setShowIntel(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">✕</button>
           </div>
           <div className="h-full overflow-hidden pb-14">
             <MemoizedLiveFeed />
           </div>
        </div>
      </div>
    </div>
  );
};