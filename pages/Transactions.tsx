import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { UserSession } from '../types';

export default function Transactions() {
  const [session, setSession] = useState<UserSession>(engine.getSession());

  useEffect(() => {
    const itv = setInterval(() => setSession(engine.getSession()), 2000);
    return () => clearInterval(itv);
  }, []);

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'DEPOSIT': return 'text-bet-success bg-bet-success/10 border-bet-success/30';
          case 'WITHDRAW': return 'text-bet-danger bg-bet-danger/10 border-bet-danger/30';
          case 'RAKEBACK': return 'text-bet-primary bg-bet-primary/10 border-bet-primary/30';
          case 'BAILOUT': return 'text-bet-accent bg-bet-accent/10 border-bet-accent/30';
          case 'BONUS': return 'text-bet-secondary bg-bet-secondary/10 border-bet-secondary/30';
          default: return 'text-slate-500 bg-white/5 border-white/10';
      }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
         <header className="border-b border-white/5 pb-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white italic transform -skew-x-12 uppercase tracking-tighter bazar-font leading-none mb-2">
                Cashier <span className="text-bet-primary">Ledger</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Official Satta Node Transaction History</p>
         </header>

         <div className="bg-bet-900 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden min-h-[500px]">
             {session.transactions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[500px] text-slate-600">
                     <div className="text-6xl mb-4">🧾</div>
                     <div className="text-2xl font-black uppercase italic bazar-font">No Transactions Found</div>
                     <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Make a deposit to start your ledger.</p>
                 </div>
             ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">ID Reference</th>
                                <th className="px-6 py-6">Type</th>
                                <th className="px-6 py-6">Method</th>
                                <th className="px-6 py-6 text-right">Amount</th>
                                <th className="px-6 py-6 text-center">Status</th>
                                <th className="px-8 py-6 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {session.transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-mono text-xs font-bold text-slate-400">{tx.id}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getTypeColor(tx.type)}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-[11px] font-bold text-white uppercase">{tx.method}</div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className={`text-sm font-black font-mono tabular-nums ${['DEPOSIT', 'BAILOUT', 'RAKEBACK', 'BONUS'].includes(tx.type) ? 'text-bet-success' : 'text-white'}`}>
                                            {['DEPOSIT', 'BAILOUT', 'RAKEBACK', 'BONUS'].includes(tx.type) ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                                            {new Date(tx.timestamp).toLocaleDateString()} <span className="opacity-50">|</span> {new Date(tx.timestamp).toLocaleTimeString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
         </div>
      </div>
    </Layout>
  );
}