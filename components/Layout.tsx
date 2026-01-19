
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession, Transaction } from '../types';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { MarketingOverlay } from './MarketingOverlay';
import { LiveFeed } from './LiveFeed';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [bailoutMsg, setBailoutMsg] = useState<string | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [walletTab, setWalletTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');
  const [amountInput, setAmountInput] = useState('1000');
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => setSession(engine.getSession()), 200);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { label: 'Casino Lobby', to: '/', icon: '🎰' },
    { label: 'Matka Crash', to: '/crash', icon: '🚀' },
    { label: 'Ball Plinko', to: '/plinko', icon: '🟢' },
    { label: 'Bomb Mines', to: '/mines', icon: '💣' },
    { label: 'Blackjack', to: '/blackjack', icon: '🃏' },
    { label: 'Roulette', to: '/roulette', icon: '🎡' },
    { label: 'High Dice', to: '/dice', icon: '🎲' },
    { label: 'Coinflip', to: '/coinflip', icon: '📀' },
  ];

  const handleBailout = () => {
    const msg = engine.requestBailout();
    setBailoutMsg(msg);
    audio.playWin();
  };

  const executeDeposit = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    engine.deposit(amount, 'UPI Transfer (Simulated)');
    audio.playWin();
    setAmountInput('');
    setWalletTab('HISTORY');
  };

  const executeWithdraw = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    try {
      engine.withdraw(amount, 'Net Banking (Simulated)');
      audio.playLoss();
      setAmountInput('');
      setWalletTab('HISTORY');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#07080a] text-slate-300 font-sans overflow-hidden">
      <MarketingOverlay />
      
      {/* Sidebar - Stake.IND Style */}
      <aside className="w-64 bg-[#0f1116] border-r border-white/5 flex flex-col shrink-0 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-[#00e701] rounded-xl flex items-center justify-center text-black font-black text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,231,1,0.3)]">S</div>
             <div className="flex flex-col">
               <span className="text-white font-black text-xl tracking-tighter leading-none italic uppercase -skew-x-12">STAKE<span className="text-[#00e701]">.IND</span></span>
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Authentic Matka</span>
             </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Premium Collection</div>
          {menu.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => audio.playClick()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${
                location.pathname === item.to 
                  ? 'bg-white/5 text-white shadow-inner' 
                  : 'hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <span className="text-lg opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          
          <div className="px-4 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Transparency</div>
          <Link to="/fairness" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:text-white transition-colors italic">⚖️ Fairness Verification</Link>
          {session.isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#00e701] font-black animate-pulse">🛠 Admin Shell</Link>}
        </nav>

        <div className="p-4 bg-black/10 border-t border-white/5">
           <div className="bg-[#1a1d23] p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-tighter uppercase">
                 <span>VIP PROGRESS (Level 1)</span>
                 <span>{Math.min(100, (session.totalWagered / 50000) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#00e701] to-emerald-300 shadow-[0_0_10px_rgba(0,231,1,0.5)]" style={{ width: `${Math.min(100, (session.totalWagered / 50000) * 100)}%` }}></div>
              </div>
              {session.balance < 1 && (
                <button onClick={handleBailout} className="w-full py-2.5 bg-rose-600/10 text-rose-500 border border-rose-500/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                  Request Free Play
                </button>
              )}
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative min-w-0 pr-0 xl:pr-72">
        <header className="h-20 bg-[#0f1116]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 z-40">
           <div className="flex items-center gap-8">
              <div className="bg-[#07080a] pl-5 pr-2 py-1.5 rounded-2xl border border-white/10 flex items-center gap-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#00e701] rounded-lg flex items-center justify-center text-black text-[10px] font-black shadow-[0_0_15px_rgba(0,231,1,0.4)]">₹</div>
                    <span className="text-white font-mono font-black text-xl tabular-nums tracking-tighter">
                       {session.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                 </div>
                 <button 
                  onClick={() => { setShowWallet(true); audio.playClick(); }}
                  className="bg-[#00e701] hover:bg-[#00e701]/90 text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl active:scale-95"
                 >
                  Wallet
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <div className="text-sm font-black text-white italic transform -skew-x-12 uppercase">{session.username}</div>
                 <div className="text-[10px] font-bold text-[#00e701] uppercase tracking-[0.2em]">Verified Punter</div>
              </div>
              <div 
                className="w-12 h-12 rounded-2xl bg-[#1a1d23] border border-white/10 flex items-center justify-center text-white font-black cursor-pointer hover:border-[#00e701] transition-all rotate-3 hover:rotate-0 shadow-lg group"
                onClick={() => engine.toggleAdmin()}
              >
                 <span className="group-hover:scale-110 transition-transform">{session.username[0]}</span>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#07080a] relative">
           {children}
        </main>
      </div>

      <LiveFeed />

      {/* Wallet Terminal Modal */}
      {showWallet && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden scale-100 animate-fade-in-up">
              <div className="flex flex-col md:flex-row h-[550px]">
                 <div className="w-full md:w-1/3 bg-[#0f1116] border-r border-white/5 p-10 flex flex-col justify-between">
                    <div className="space-y-3">
                        <button onClick={() => setWalletTab('DEPOSIT')} className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'DEPOSIT' ? 'bg-[#00e701] text-black shadow-[0_0_30px_rgba(0,231,1,0.3)]' : 'text-slate-500 hover:text-white'}`}>Deposit Cash</button>
                        <button onClick={() => setWalletTab('WITHDRAW')} className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'WITHDRAW' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-white'}`}>Withdraw ₹</button>
                        <button onClick={() => setWalletTab('HISTORY')} className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${walletTab === 'HISTORY' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}>History</button>
                    </div>
                    <button onClick={() => setShowWallet(false)} className="w-full text-center py-4 text-[10px] font-black text-slate-700 uppercase hover:text-white tracking-widest transition-colors">Terminate Session</button>
                 </div>
                 
                 <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                    {walletTab === 'DEPOSIT' && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 text-3xl shadow-inner">📥</div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Instant Refill</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Simulated Net Banking / UPI</p>
                            </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-3 block tracking-[0.2em]">Transaction Amount (₹)</label>
                          <div className="relative group">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black group-focus-within:text-[#00e701] transition-colors">₹</span>
                              <input 
                                type="number" 
                                value={amountInput} 
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl px-12 py-5 text-white font-mono font-black text-2xl outline-none focus:border-[#00e701] focus:ring-4 focus:ring-[#00e701]/10 transition-all shadow-inner"
                              />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {[1000, 5000, 25000].map(v => (
                            <button key={v} onClick={() => setAmountInput(v.toString())} className="bg-white/5 py-4 rounded-2xl text-[10px] font-black hover:bg-white/10 transition-all border border-white/5 hover:border-[#00e701]/30">₹{v.toLocaleString()}</button>
                          ))}
                        </div>
                        
                        <button onClick={executeDeposit} className="w-full py-6 bg-[#00e701] text-black font-black text-lg rounded-3xl shadow-[0_15px_40px_rgba(0,231,1,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Confirm Transaction</button>
                        <p className="text-[9px] text-slate-600 text-center uppercase font-black tracking-tighter italic border border-white/5 p-4 rounded-2xl bg-black/20">Educational Platform: Virtual credits carry no real-world monetary value.</p>
                      </div>
                    )}

                    {walletTab === 'WITHDRAW' && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8 text-rose-500">
                            <div className="w-14 h-14 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center text-rose-500 text-3xl shadow-inner">📤</div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Claim Payout</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Processing: Estimated Instant</p>
                            </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-3 block tracking-[0.2em]">Withdrawal Sum</label>
                          <div className="relative group">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black group-focus-within:text-rose-500 transition-colors">₹</span>
                              <input 
                                type="number" 
                                value={amountInput} 
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl px-12 py-5 text-white font-mono font-black text-2xl outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
                              />
                          </div>
                        </div>
                        
                        <button onClick={executeWithdraw} className="w-full py-6 bg-rose-600 text-white font-black text-lg rounded-3xl shadow-[0_15px_40px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Execute Cashout</button>
                        <p className="text-[9px] text-rose-900 text-center uppercase font-black tracking-widest mt-6 border border-rose-900/10 p-4 rounded-2xl bg-rose-950/5">This is a simulation. Credits cannot be redeemed for fiat or crypto.</p>
                      </div>
                    )}

                    {walletTab === 'HISTORY' && (
                      <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter mb-6">Banking Ledger</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                           {session.transactions.length === 0 ? (
                             <div className="text-center py-20 text-slate-800 font-black italic uppercase tracking-[0.3em] text-[10px]">No transaction history recorded.</div>
                           ) : (
                             session.transactions.map(tx => (
                               <div key={tx.id} className="bg-black/50 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all shadow-sm">
                                  <div className="flex items-center gap-5">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-inner ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' || tx.type === 'RAKEBACK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                         {tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' || tx.type === 'RAKEBACK' ? '↓' : '↑'}
                                     </div>
                                     <div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' || tx.type === 'RAKEBACK' ? 'text-emerald-400' : 'text-rose-500'}`}>{tx.type}</div>
                                        <div className="text-[9px] text-slate-600 font-bold opacity-60">{new Date(tx.timestamp).toLocaleString()}</div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className={`text-lg font-black font-mono tracking-tighter ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' || tx.type === 'RAKEBACK' ? 'text-white' : 'text-rose-500'}`}>
                                       {tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' || tx.type === 'RAKEBACK' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                     </div>
                                     <div className="text-[10px] text-slate-700 uppercase font-black tracking-tighter italic">{tx.method}</div>
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

      {/* Break Bailout Sarcasm Modal */}
      {bailoutMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-md animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-lg rounded-[3.5rem] border border-white/10 p-16 text-center shadow-[0_0_150px_rgba(0,231,1,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00e701] to-emerald-400 group-hover:h-3 transition-all"></div>
              <div className="text-[10rem] mb-12 transform hover:scale-110 transition-transform cursor-help grayscale group-hover:grayscale-0">🤡</div>
              <h2 className="text-4xl font-black text-white mb-6 italic transform -skew-x-12 uppercase tracking-tighter">Charity Recipient</h2>
              <p className="text-slate-400 mb-14 italic text-lg leading-relaxed px-10 opacity-80 border-l-2 border-[#00e701]/20">"{bailoutMsg}"</p>
              <button 
                onClick={() => setBailoutMsg(null)}
                className="w-full py-6 bg-[#00e701] text-black font-black rounded-3xl uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_15px_50px_rgba(0,231,1,0.4)] text-md active:translate-y-1"
              >
                Accept Shame
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
