
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [bailoutMsg, setBailoutMsg] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setSession(engine.getSession()), 200);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { label: 'Casino Lobby', to: '/', icon: '🎰' },
    { label: 'Crash Game', to: '/crash', icon: '🚀' },
    { label: 'Plinko', to: '/plinko', icon: '🟢' },
    { label: 'Mines', to: '/mines', icon: '💣' },
    { label: 'Blackjack', to: '/blackjack', icon: '🃏' },
    { label: 'Roulette', to: '/roulette', icon: '🎡' },
    { label: 'Dice', to: '/dice', icon: '🎲' },
    { label: 'Coinflip', to: '/coinflip', icon: '📀' },
  ];

  const handleBailout = () => {
    const msg = engine.requestBailout();
    setBailoutMsg(msg);
    audio.playWin();
  };

  return (
    <div className="flex h-screen bg-[#07080a] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar - Pro Punter Style */}
      <aside className="w-60 bg-[#0f1116] border-r border-white/5 flex flex-col shrink-0 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-9 h-9 bg-[#00e701] rounded-lg flex items-center justify-center text-black font-black text-xl group-hover:scale-110 transition-transform">S</div>
             <span className="text-white font-black text-xl tracking-tighter">STAKE<span className="text-[#00e701]">.IND</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Main Games</div>
          {menu.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => audio.playClick()}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-bold transition-all group ${
                location.pathname === item.to 
                  ? 'bg-white/5 text-white' 
                  : 'hover:bg-white/[0.02] hover:text-white'
              }`}
            >
              <span className="opacity-50 group-hover:opacity-100">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          
          <div className="px-4 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Security</div>
          <Link to="/fairness" className="flex items-center gap-3 px-4 py-2 text-sm hover:text-white">⚖️ Fairness</Link>
          {session.isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-[#00e701]">🛠 Admin Panel</Link>}
        </nav>

        <div className="p-4 bg-black/20 border-t border-white/5">
           <div className="bg-[#1a1d23] p-3 rounded-lg border border-white/5 space-y-3">
              <div className="flex justify-between text-[10px] font-black text-slate-500">
                 <span>VIP PROGRESS</span>
                 <span>{Math.min(100, (session.totalWagered / 50000) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden">
                 <div className="h-full bg-[#00e701]" style={{ width: `${Math.min(100, (session.totalWagered / 50000) * 100)}%` }}></div>
              </div>
              {session.balance < 1 && (
                <button onClick={handleBailout} className="w-full py-2 bg-rose-600 text-white rounded text-[10px] font-black uppercase animate-pulse">
                  Get Free Credits
                </button>
              )}
           </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 bg-[#0f1116]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-40">
           <div className="flex items-center gap-4">
              <div className="bg-[#07080a] pl-4 pr-1 py-1 rounded-lg border border-white/5 flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">💰</span>
                    <span className="text-white font-mono font-bold text-sm">
                       ${session.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                 </div>
                 <button className="bg-[#00e701] hover:bg-[#00e701]/80 text-black px-4 py-1.5 rounded-md text-xs font-black uppercase transition-all shadow-lg">Wallet</button>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="text-right">
                 <div className="text-xs font-black text-white">{session.username}</div>
                 <div className="text-[10px] font-bold text-[#00e701]">BRONZE VIP</div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/5 flex items-center justify-center text-white font-black cursor-pointer hover:border-[#00e701] transition-all"
                onClick={() => engine.toggleAdmin()}
              >
                 {session.username[0]}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {children}
        </main>
      </div>

      {/* Bailout Modal */}
      {bailoutMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-md rounded-2xl border border-white/10 p-8 text-center shadow-[0_0_100px_rgba(0,231,1,0.1)]">
              <div className="text-7xl mb-6 grayscale hover:grayscale-0 transition-all cursor-help">🤡</div>
              <h2 className="text-2xl font-black text-white mb-4 italic transform -skew-x-12">PLAYER PITFALL</h2>
              <p className="text-slate-400 mb-8 italic text-sm leading-relaxed">"{bailoutMsg}"</p>
              <button 
                onClick={() => setBailoutMsg(null)}
                className="w-full py-4 bg-[#00e701] text-black font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-transform"
              >
                I'm a loser, reload me
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
