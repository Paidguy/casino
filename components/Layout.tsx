
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
    const interval = setInterval(() => setSession(engine.getSession()), 200);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { label: 'Lobby', to: '/', icon: '🎰' },
    { label: 'Crash', to: '/crash', icon: '🚀' },
    { label: 'Plinko', to: '/plinko', icon: '🟢' },
    { label: 'Mines', to: '/mines', icon: '💣' },
    { label: 'Blackjack', to: '/blackjack', icon: '🃏' },
    { label: 'Roulette', to: '/roulette', icon: '🎡' },
    { label: 'Dice', to: '/dice', icon: '🎲' },
  ];

  const deposit = () => {
    const amount = parseFloat(amountInput);
    if (!isNaN(amount) && amount > 0) {
      engine.deposit(amount, 'UPI Transfer');
      audio.playWin();
      setAmountInput('');
      setWalletTab('HISTORY');
    }
  };

  const withdraw = () => {
    const amount = parseFloat(amountInput);
    if (!isNaN(amount) && amount > 0) {
      try {
        engine.withdraw(amount, 'Bank Payout');
        audio.playLoss();
        setAmountInput('');
        setWalletTab('HISTORY');
      } catch (e: any) { alert(e.message); }
    }
  };

  return (
    <div className="flex h-screen bg-[#07080a] text-slate-300 font-sans overflow-hidden">
      <MarketingOverlay />
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0f1116] border-r border-white/5 flex flex-col z-[100] transition-transform lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-casino-accent rounded-xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(0,231,1,0.3)]">S</div>
             <div className="flex flex-col">
               <span className="text-white font-black text-xl italic uppercase -skew-x-12 leading-none">STAKE<span className="text-casino-accent">.IND</span></span>
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Matka Casino</span>
             </div>
          </Link>
          <button className="lg:hidden text-white" onClick={() => setShowSidebar(false)}>✕</button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map(item => (
            <Link key={item.to} to={item.to} onClick={() => { audio.playClick(); setShowSidebar(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${location.pathname === item.to ? 'bg-white/5 text-white shadow-inner' : 'hover:bg-white/[0.03] hover:text-white'}`}>
              <span className="text-lg opacity-60">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-4" />
          <Link to="/fairness" onClick={() => setShowSidebar(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:text-white">⚖️ Fairness</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 lg:pr-72">
        <header className="h-16 lg:h-20 bg-[#0f1116]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-10 z-[60]">
           <div className="flex items-center gap-4">
              <button className="lg:hidden text-white p-2" onClick={() => setShowSidebar(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <div className="bg-[#07080a] pl-4 pr-1 py-1 lg:py-1.5 rounded-2xl border border-white/10 flex items-center gap-4 lg:gap-8 shadow-2xl">
                 <div className="flex items-center gap-2">
                    <span className="text-casino-accent font-black">₹</span>
                    <span className="text-white font-mono font-black text-sm lg:text-lg tabular-nums">
                       {session.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                 </div>
                 <button onClick={() => setShowWallet(true)} className="bg-casino-accent text-black px-4 lg:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl active:scale-95">Wallet</button>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#1a1d23] border border-white/10 flex items-center justify-center text-white font-black cursor-pointer hover:border-casino-accent transition-all shadow-lg" onClick={() => engine.toggleAdmin()}>
                 {session.username[0]}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-24">
           {children}
        </main>
      </div>

      <LiveFeed />

      {/* Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="flex flex-col md:flex-row h-auto md:h-[500px]">
                 <div className="w-full md:w-1/3 bg-[#0f1116] border-r border-white/5 p-8 flex flex-col justify-between">
                    <div className="space-y-2 mb-8 md:mb-0">
                        <button onClick={() => setWalletTab('DEPOSIT')} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${walletTab === 'DEPOSIT' ? 'bg-casino-accent text-black shadow-lg' : 'text-slate-500'}`}>Deposit</button>
                        <button onClick={() => setWalletTab('WITHDRAW')} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${walletTab === 'WITHDRAW' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Withdraw</button>
                        <button onClick={() => setWalletTab('HISTORY')} className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${walletTab === 'HISTORY' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>History</button>
                    </div>
                    <button onClick={() => setShowWallet(false)} className="w-full text-center py-2 text-[10px] font-black text-slate-700 uppercase hover:text-white">Close</button>
                 </div>
                 
                 <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {walletTab === 'DEPOSIT' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase">Instant Deposit</h2>
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Amount (₹)</label>
                          <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-mono font-black text-xl outline-none focus:border-casino-accent transition-all" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {[500, 2000, 10000].map(v => (
                             <button key={v} onClick={() => setAmountInput(v.toString())} className="bg-white/5 py-3 rounded-xl text-xs font-black hover:bg-white/10">₹{v}</button>
                           ))}
                        </div>
                        <button onClick={deposit} className="w-full py-5 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase">Refill Balance</button>
                      </div>
                    )}
                    
                    {walletTab === 'WITHDRAW' && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase text-rose-500">Fast Withdrawal</h2>
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Amount (₹)</label>
                          <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-mono font-black text-xl outline-none focus:border-rose-500 transition-all" />
                        </div>
                        <button onClick={withdraw} className="w-full py-5 bg-rose-600 text-white font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase">Process Payout</button>
                      </div>
                    )}

                    {walletTab === 'HISTORY' && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-black text-white italic transform -skew-x-12 uppercase">Transaction History</h2>
                        <div className="space-y-2">
                           {session.transactions.length === 0 ? (
                             <div className="text-center py-10 text-slate-700 italic text-sm">No activity found.</div>
                           ) : (
                             session.transactions.map(tx => (
                               <div key={tx.id} className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                                  <div>
                                    <div className={`font-black ${tx.type === 'DEPOSIT' ? 'text-casino-accent' : 'text-rose-500'}`}>{tx.type}</div>
                                    <div className="text-[10px] text-slate-600">{new Date(tx.timestamp).toLocaleString()}</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="font-black text-white font-mono">₹{tx.amount.toLocaleString()}</div>
                                     <div className="text-[9px] text-slate-700">{tx.method}</div>
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
