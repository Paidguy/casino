import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { MarketingOverlay } from './MarketingOverlay';
import { LiveFeed } from './LiveFeed';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [showWallet, setShowWallet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [walletTab, setWalletTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');
  const [amountInput, setAmountInput] = useState('1000');
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setSession(engine.getSession()), 500);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { label: 'Lobby', to: '/', icon: '🎰' },
    { label: 'Satta Matka', to: '/matka', icon: '🏺' },
    { label: 'Teen Patti', to: '/teenpatti', icon: '🎴' },
    { label: 'Matka Crash', to: '/crash', icon: '🚀' },
    { label: 'Plinko', to: '/plinko', icon: '🟢' },
    { label: 'Mines', to: '/mines', icon: '💣' },
    { label: 'Blackjack', to: '/blackjack', icon: '🃏' },
    { label: 'Roulette', to: '/roulette', icon: '🎡' },
    { label: 'Dice', to: '/dice', icon: '🎲' },
    { label: 'Coinflip', to: '/coinflip', icon: '🪙' },
  ];

  const deposit = () => {
    const amount = parseFloat(amountInput);
    if (!isNaN(amount) && amount > 0) {
      engine.deposit(amount, 'UPI Transfer (Mock)');
      audio.playWin();
      setAmountInput('');
      setWalletTab('HISTORY');
    }
  };

  const withdraw = () => {
    const amount = parseFloat(amountInput);
    if (!isNaN(amount) && amount > 0) {
      try {
        engine.withdraw(amount, 'Bank Payout (Mock)');
        audio.playLoss();
        setAmountInput('');
        setWalletTab('HISTORY');
      } catch (e: any) { alert(e.message); }
    }
  };

  return (
    <div className="flex h-screen bg-[#07080a] text-slate-400 font-sans overflow-hidden">
      <MarketingOverlay />
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 w-60 bg-[#0f1116] border-r border-white/5 flex flex-col z-[100] transition-transform duration-300 lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-casino-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(0,231,1,0.3)]">S</div>
             <div className="flex flex-col leading-none">
               <span className="text-white font-black text-xl italic uppercase -skew-x-12 tracking-tighter">STAKE<span className="text-casino-accent">.IND</span></span>
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Diamond Matka</span>
             </div>
          </Link>
          <button className="lg:hidden text-white bg-white/5 p-2 rounded-lg" onClick={() => setShowSidebar(false)}>✕</button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Original Games</div>
          {menu.map(item => (
            <Link key={item.to} to={item.to} onClick={() => { audio.playClick(); setShowSidebar(false); }} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${location.pathname === item.to ? 'bg-white/5 text-white shadow-inner border border-white/5' : 'hover:bg-white/[0.02] hover:text-white'}`}>
              <span className={`text-lg ${location.pathname === item.to ? 'opacity-100 scale-110' : 'opacity-40'} transition-transform`}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-6 mx-4" />
          <Link to="/fairness" onClick={() => setShowSidebar(false)} className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">⚖️ Fairness</Link>
          {session.isAdmin && (
            <Link to="/admin" onClick={() => setShowSidebar(false)} className="flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-casino-accent hover:text-white transition-colors animate-pulse">🛠 Admin</Link>
          )}
        </nav>

        <div className="p-4 bg-black/10 border-t border-white/5">
           <div className="bg-[#1a1d23] p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                 <span>VIP PROGRESS</span>
                 <span className="text-casino-accent">LV. 3</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-casino-accent shadow-[0_0_8px_rgba(0,231,1,0.5)]" style={{ width: '68%' }}></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 lg:pr-72">
        <header className="h-16 lg:h-20 glass flex items-center justify-between px-6 lg:px-10 z-[60]">
           <div className="flex items-center gap-4">
              <button className="lg:hidden text-white bg-white/5 p-2 rounded-lg" onClick={() => setShowSidebar(true)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <div className="bg-[#07080a] pl-4 pr-1.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-4 lg:gap-8 shadow-xl">
                 <div className="flex items-center gap-2">
                    <span className="text-casino-accent font-black text-sm">₹</span>
                    <span className="text-white font-mono font-black text-sm lg:text-base tabular-nums tracking-tighter">
                       {session.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                 </div>
                 <button onClick={() => setShowWallet(true)} className="bg-casino-accent text-black px-4 lg:px-8 py-2 rounded-lg text-[9px] font-black uppercase transition-all shadow-md active:scale-95 tracking-widest hover:bg-white">Wallet</button>
              </div>
           </div>
           
           <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right hidden sm:block leading-tight">
                 <div className="text-xs font-black text-white italic uppercase -skew-x-6">{session.username}</div>
                 <div className="text-[9px] font-bold text-casino-accent uppercase tracking-widest mt-0.5">High Roller</div>
              </div>
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-[#1a1d23] border border-white/10 flex items-center justify-center text-white font-black cursor-pointer hover:border-casino-accent transition-all shadow-lg active:scale-90" onClick={() => engine.toggleAdmin()}>
                 {session.username[0]}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-32">
           {children}
        </main>
      </div>

      <LiveFeed />

      {/* Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
                 <div className="w-full md:w-40 bg-[#0f1116] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between">
                    <div className="flex md:flex-col gap-2">
                        <button onClick={() => setWalletTab('DEPOSIT')} className={`flex-1 md:w-full text-center md:text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'DEPOSIT' ? 'bg-casino-accent text-black shadow-lg' : 'text-slate-500'}`}>Deposit</button>
                        <button onClick={() => setWalletTab('WITHDRAW')} className={`flex-1 md:w-full text-center md:text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'WITHDRAW' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Withdraw</button>
                        <button onClick={() => setWalletTab('HISTORY')} className={`flex-1 md:w-full text-center md:text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'HISTORY' ? 'bg-white/10 text-white border border-white/10 shadow-inner' : 'text-slate-500'}`}>Ledger</button>
                    </div>
                    <button onClick={() => setShowWallet(false)} className="w-full text-center py-4 text-[9px] font-black text-slate-700 uppercase hover:text-white transition-colors tracking-widest hidden md:block">Close</button>
                 </div>
                 
                 <div className="flex-1 p-8 lg:p-10 overflow-y-auto custom-scrollbar">
                    {walletTab === 'DEPOSIT' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl lg:text-3xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Add Virtual Credits</h2>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase block tracking-widest">Wager Amount (₹)</label>
                          <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 text-white font-mono font-black text-2xl outline-none focus:border-casino-accent transition-all" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {[1000, 5000, 25000].map(v => (
                             <button key={v} onClick={() => setAmountInput(v.toString())} className="bg-white/5 py-3 rounded-xl text-[10px] font-black hover:bg-white/10 border border-white/5 transition-all">₹{v.toLocaleString()}</button>
                           ))}
                        </div>
                        <button onClick={deposit} className="w-full py-4 bg-casino-accent text-black font-black text-lg rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Confirm Deposit</button>
                      </div>
                    )}
                    
                    {walletTab === 'WITHDRAW' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl lg:text-3xl font-black text-rose-500 italic transform -skew-x-12 uppercase tracking-tighter">Claim Payout</h2>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase block tracking-widest">Payout Amount (₹)</label>
                          <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 text-white font-mono font-black text-2xl outline-none focus:border-rose-500 transition-all" />
                        </div>
                        <button onClick={withdraw} className="w-full py-4 bg-rose-600 text-white font-black text-lg rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Transfer to Bank</button>
                      </div>
                    )}

                    {walletTab === 'HISTORY' && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Transaction Ledger</h2>
                        <div className="space-y-2">
                           {session.transactions.length === 0 ? (
                             <div className="text-center py-20 text-slate-800 italic uppercase font-black tracking-widest text-[10px]">No entries found.</div>
                           ) : (
                             session.transactions.map(tx => (
                               <div key={tx.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${tx.type === 'DEPOSIT' ? 'text-casino-accent' : 'text-rose-500'}`}>
                                       {tx.type === 'DEPOSIT' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                      <div className={`text-[9px] font-black uppercase tracking-widest ${tx.type === 'DEPOSIT' ? 'text-casino-accent' : 'text-rose-500'}`}>{tx.type}</div>
                                      <div className="text-[8px] text-slate-600 font-bold">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="font-black text-white font-mono text-sm tracking-tighter">₹{tx.amount.toLocaleString()}</div>
                                     <div className="text-[8px] text-slate-700 uppercase font-bold">{tx.method}</div>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};