import React, { useEffect, useState } from 'react';
import { gameEngine } from '../services/engine';
import { ArrowDownLeft, ArrowUpRight, Lock, Gift } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [state, setState] = useState(gameEngine.getState());

  useEffect(() => {
    return gameEngine.subscribe(() => setState({ ...gameEngine.getState() }));
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Wallet & Vault Ledger</h1>
          <p className="text-sm text-slate-400">
            Complete history of your INR deposits, withdrawals, vault transfers, and VIP rewards.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#111927] px-4 py-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-slate-400">Wallet Balance</div>
            <div className="text-base font-mono font-black text-white">
              ₹{Math.floor(state.balance).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#111927] px-4 py-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] uppercase font-bold text-amber-400">Vault Balance</div>
            <div className="text-base font-mono font-black text-amber-400">
              ₹{Math.floor(state.vaultBalance).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111927] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b101b] text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Method & Reference</th>
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {state.transactions.map((tx) => {
                const isOutflow = tx.type === 'WITHDRAW' || tx.type === 'VAULT_DEPOSIT';
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                      {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                      {tx.type === 'WITHDRAW' && <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                      {tx.type.includes('VAULT') && <Lock className="w-4 h-4 text-amber-400" />}
                      {(tx.type === 'BAILOUT' || tx.type === 'BONUS' || tx.type === 'RAKEBACK') && (
                        <Gift className="w-4 h-4 text-sky-400" />
                      )}
                      <span>{tx.type.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-200 font-medium">{tx.method || 'Instant INR Transfer'}</div>
                      {tx.utr && (
                        <div className="text-[11px] font-mono text-slate-500">UTR #{tx.utr}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-5 font-mono font-bold text-right ${
                        isOutflow ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isOutflow ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};