import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UserSession } from '../types';

interface AnalyticsProps {
  session: UserSession;
}

export const Analytics: React.FC<AnalyticsProps> = ({ session }) => {
  // Use last 50 bets for the "Live" chart
  const historyData = [...session.history].reverse().map((bet, index) => ({
    name: index + 1,
    balance: bet.balanceAfter,
  }));

  if (historyData.length === 0) {
      historyData.push({ name: 0, balance: session.startBalance });
  }

  const netProfit = session.balance - session.startBalance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      {/* User Stats Summary */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-casino-800 p-6 rounded-xl border border-casino-700 shadow-xl">
           <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Wagered</div>
           <div className="text-2xl font-mono text-white font-bold">${session.totalWagered.toLocaleString()}</div>
        </div>
        
        <div className="bg-casino-800 p-6 rounded-xl border border-casino-700 shadow-xl">
           <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Profit</div>
           <div className={`text-2xl font-mono font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
             {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
           </div>
        </div>

        <div className="bg-casino-800 p-6 rounded-xl border border-casino-700 shadow-xl">
           <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bets Placed</div>
           <div className="text-2xl font-mono text-white font-bold">{session.totalBets}</div>
        </div>
      </div>

      {/* Main Graph - "Live Balance" */}
      <div className="md:col-span-3 bg-casino-800 p-6 rounded-xl border border-casino-700 shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-bold flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Live Performance
           </h3>
           <div className="flex gap-2">
              <span className="text-xs bg-casino-900 text-slate-400 px-2 py-1 rounded">1H</span>
              <span className="text-xs bg-casino-900 text-slate-400 px-2 py-1 rounded">24H</span>
              <span className="text-xs bg-casino-700 text-white px-2 py-1 rounded">ALL</span>
           </div>
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={12} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                labelFormatter={() => ''}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};