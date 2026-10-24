import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { UserSession } from '../types';
import { Receipt, Smartphone, CheckCircle2 } from 'lucide-react';

export default function Transactions() {
  const [session, setSession] = useState<UserSession>(engine.getSession());
  const [filter, setFilter] = useState<'ALL' | 'CASHIER' | 'VAULT' | 'REWARDS'>('ALL');

  useEffect(() => {
    return engine.subscribe((s) => setSession(s));
  }, []);

  const filteredTx = (session.transactions || []).filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'CASHIER') return tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW';
    if (filter === 'VAULT') return tx.type === 'VAULT_DEPOSIT' || tx.type === 'VAULT_WITHDRAW';
    if (filter === 'REWARDS') return tx.type === 'RAKEBACK' || tx.type === 'BONUS' || tx.type === 'BAILOUT';
    return true;
  });

  const isPositiveCredit = (type: string) =>
    ['DEPOSIT', 'VAULT_WITHDRAW', 'RAKEBACK', 'BONUS', 'BAILOUT'].includes(type);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#fbbf24] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Receipt className="w-4 h-4" />
              <span>UPI, Paytm & IMPS Ledger</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Khata Passbook & UTR Receipts
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#070b14] border border-[#1e293b] rounded-xl w-fit">
            {[
              { id: 'ALL', label: 'All Entries' },
              { id: 'CASHIER', label: 'UPI / IMPS' },
              { id: 'VAULT', label: 'Tijori Safe' },
              { id: 'REWARDS', label: 'VIP Chhoot' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  filter === t.id
                    ? 'bg-[#f59e0b] text-[#070b14]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="bg-[#0d1322] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl">
          {filteredTx.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#64748b]">
              No matching Khata transactions recorded yet. Use the UPI Cashier in the header to add or withdraw INR.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131c31] text-[#94a3b8] border-b border-[#1e293b]">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Khata ID</th>
                    <th className="px-4 py-3.5 font-semibold">12-Digit UTR</th>
                    <th className="px-4 py-3.5 font-semibold">Type</th>
                    <th className="px-4 py-3.5 font-semibold">Rail / Method</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Amount (₹)</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/70">
                  {filteredTx.map((tx) => {
                    const positive = isPositiveCredit(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-[#131c31]/60">
                        <td className="px-6 py-3.5 font-mono text-[#94a3b8]">{tx.id}</td>
                        <td className="px-4 py-3.5 font-mono text-[#fbbf24]">
                          {tx.utr || '412980341920'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">
                          {tx.type.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3.5 text-[#94a3b8] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#f59e0b]" />
                          <span>{tx.method}</span>
                        </td>
                        <td
                          className={`px-4 py-3.5 text-right font-mono font-bold tabular-nums ${
                            positive ? 'text-[#10b981]' : 'text-white'
                          }`}
                        >
                          {positive ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[#10b981] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-[#94a3b8] tabular-nums">
                          {new Date(tx.timestamp).toLocaleDateString('en-IN')} ·{' '}
                          {new Date(tx.timestamp).toLocaleTimeString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}