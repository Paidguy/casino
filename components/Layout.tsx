
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
    { label: 'Matka Lobby', to: '/', icon: '🎰' },
    { label: 'Rocket Crash', to: '/crash', icon: '🚀' },
    { label: 'Ball Plinko', to: '/plinko', icon: '🟢' },
    { label: 'Gold Mines', to: '/mines', icon: '💣' },
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
    engine.deposit(amount, 'UPI Instant');
    audio.playWin();
    setAmountInput('');
    setWalletTab('HISTORY');
  };

  const executeWithdraw = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    try {
      engine.withdraw(amount, 'Crypto Withdrawal');
      audio.playLoss();
      setAmountInput('');
      setWalletTab('HISTORY');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#07080a] text-slate-300 font-sans overflow-hidden selection:bg-[#00e701]/30">
      <MarketingOverlay />
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1116] border-r border-white/5 flex flex-col shrink-0 z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-[#00e701] rounded-xl flex items-center justify-center text-black font-black text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,231,1,0.3)]">S</div>
             <div className="flex flex-col">
               <span className="text-white font-black text-xl tracking-tighter leading-none">STAKE<span className="text-[#00e701]">.IND</span></span>
               <span className="text-[9px] font-black text-[#00e701] uppercase tracking-[0.2em] mt-1">LUCKY BOOKIE</span>
             </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Premium Games</div>
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
          
          <div className="px-4 py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Account</div>
          <Link to="/fairness" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:text-white transition-colors">⚖️ Fairness & RTP</Link>
          {session.isAdmin && <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#00e701] font-black animate-pulse">🛠 Admin Terminal</Link>}
        </nav>

        <div className="p-4 bg-black/10 border-t border-white/5">
           <div className="bg-[#1a1d23] p-4 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-tighter">
                 <span>VIP PROGRESS (SILVER)</span>
                 <span>{Math.min(100, (session.totalWagered / 50000) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#00e701] to-emerald-300" style={{ width: `${Math.min(100, (session.totalWagered / 50000) * 100)}%` }}></div>
              </div>
              {session.balance < 1 && (
                <button onClick={handleBailout} className="w-full py-2.5 bg-rose-600/20 text-rose-500 border border-rose-500/50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                  Request Free Play
                </button>
              )}
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative min-w-0 pr-0 xl:pr-72">
        <header className="h-20 bg-[#0f1116]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 z-40">
           <div className="flex items-center gap-6">
              <div className="bg-[#07080a] pl-5 pr-2 py-1.5 rounded-xl border border-white/10 flex items-center gap-6 shadow-2xl">
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-black shadow-[0_0_15px_rgba(250,204,21,0.3)]">₹</div>
                    <span className="text-white font-mono font-black text-lg tabular-nums">
                       {session.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                 </div>
                 <button 
                  onClick={() => { setShowWallet(true); audio.playClick(); }}
                  className="bg-[#00e701] hover:bg-[#00e701]/90 text-black px-6 py-2.5 rounded-lg text-xs font-black uppercase transition-all shadow-[0_4px_15px_rgba(0,231,1,0.2)] active:translate-y-0.5"
                 >
                  Wallet
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <div className="text-sm font-black text-white italic transform -skew-x-6">{session.username}</div>
                 <div className="text-[10px] font-bold text-[#00e701] uppercase tracking-widest">Bookie Exclusive</div>
              </div>
              <div 
                className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-white/10 flex items-center justify-center text-white font-black cursor-pointer hover:border-[#00e701] transition-all rotate-3 hover:rotate-0 shadow-lg"
                onClick={() => engine.toggleAdmin()}
              >
                 {session.username[0]}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#07080a]">
           {children}
        </main>
      </div>

      <LiveFeed />

      {/* Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex flex-col md:flex-row h-[500px]">
                 <div className="w-full md:w-1/3 bg-[#0f1116] border-r border-white/5 p-8 flex flex-col justify-between">
                    <div className="space-y-2">
                        <button onClick={() => setWalletTab('DEPOSIT')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${walletTab === 'DEPOSIT' ? 'bg-[#00e701] text-black shadow-[0_0_20px_rgba(0,231,1,0.3)]' : 'text-slate-500 hover:text-white'}`}>Deposit</button>
                        <button onClick={() => setWalletTab('WITHDRAW')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${walletTab === 'WITHDRAW' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-white'}`}>Withdraw</button>
                        <button onClick={() => setWalletTab('HISTORY')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${walletTab === 'HISTORY' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}>History</button>
                    </div>
                    <button onClick={() => setShowWallet(false)} className="w-full text-center py-3 text-[10px] font-black text-slate-700 uppercase hover:text-white transition-colors">Close Terminal</button>
                 </div>
                 
                 <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    {walletTab === 'DEPOSIT' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl">📥</div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Instant Refill</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Supports UPI, Net Banking, and Crypto</p>
                            </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Simulated Amount (₹)</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black">₹</span>
                              <input 
                                type="number" 
                                value={amountInput} 
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-10 py-4 text-white font-mono font-black text-xl outline-none focus:border-[#00e701] transition-all"
                              />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[500, 2500, 10000].map(v => (
                            <button key={v} onClick={() => setAmountInput(v.toString())} className="bg-white/5 py-3 rounded-xl text-xs font-black hover:bg-white/10 transition-all border border-white/5 hover:border-[#00e701]/30">₹{v.toLocaleString()}</button>
                          ))}
                        </div>
                        
                        <button onClick={executeDeposit} className="w-full py-5 bg-[#00e701] text-black font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(0,231,1,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Complete Refill</button>
                        <p className="text-[9px] text-slate-600 text-center uppercase font-bold tracking-tight italic bg-black/30 p-2 rounded-lg">Funds are virtual and strictly for the simulation game.</p>
                      </div>
                    )}

                    {walletTab === 'WITHDRAW' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 text-2xl">📤</div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter">Claim Payout</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-rose-500/50">Processing time: Instant (Simulated)</p>
                            </div>
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Withdrawal Amount</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black">₹</span>
                              <input 
                                type="number" 
                                value={amountInput} 
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-10 py-4 text-white font-mono font-black text-xl outline-none focus:border-rose-500 transition-all"
                              />
                          </div>
                        </div>
                        
                        <button onClick={executeWithdraw} className="w-full py-5 bg-rose-600 text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.2)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Process Withdrawal</button>
                        <p className="text-[9px] text-rose-900 text-center uppercase font-black tracking-widest mt-4 border border-rose-900/20 p-2 rounded-lg">Simulation only. Credits cannot be converted to real currency.</p>
                      </div>
                    )}

                    {walletTab === 'HISTORY' && (
                      <div className="space-y-4 animate-fade-in h-full flex flex-col">
                        <h2 className="text-xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter mb-4">Banking History</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                           {session.transactions.length === 0 ? (
                             <div className="text-center py-20 text-slate-700 font-bold italic uppercase tracking-widest text-xs">No activity yet...</div>
                           ) : (
                             session.transactions.map(tx => (
                               <div key={tx.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                         {tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' ? '↓' : '↑'}
                                     </div>
                                     <div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' ? 'text-emerald-400' : 'text-rose-500'}`}>{tx.type}</div>
                                        <div className="text-[9px] text-slate-600 font-bold">{new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString()}</div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className={`text-md font-black font-mono tracking-tighter ${tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' ? 'text-white' : 'text-rose-500'}`}>
                                       {tx.type === 'DEPOSIT' || tx.type === 'BAILOUT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                     </div>
                                     <div className="text-[9px] text-slate-700 uppercase font-black tracking-tighter">{tx.method}</div>
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

      {/* Bailout Modal */}
      {bailoutMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#1a1d23] w-full max-w-md rounded-[3rem] border border-white/10 p-12 text-center shadow-[0_0_150px_rgba(0,231,1,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00e701] to-emerald-400"></div>
              <div className="text-9xl mb-10 transform hover:scale-110 transition-transform cursor-help">🤡</div>
              <h2 className="text-3xl font-black text-white mb-4 italic transform -skew-x-12 uppercase tracking-tighter">Pity Payout</h2>
              <p className="text-slate-400 mb-12 italic text-sm leading-relaxed px-6 opacity-80">"{bailoutMsg}"</p>
              <button 
                onClick={() => setBailoutMsg(null)}
                className="w-full py-5 bg-[#00e701] text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_10px_40px_rgba(0,231,1,0.3)] text-sm"
              >
                Accept Charity
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
