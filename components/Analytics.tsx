import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UserSession } from '../types';

interface AnalyticsProps {
  session: UserSession;
}

export const Analytics: React.FC<AnalyticsProps> = ({ session }) => {
  // Safety check: Ensure history exists and is an array before mapping
  const safeHistory = (session && Array.isArray(session.history)) ? session.history : [];
  
  const historyData = [...safeHistory].reverse().map((bet, index) => ({
    name: index + 1,
    balance: typeof bet.balanceAfter === 'number' ? bet.balanceAfter : 0,
  }));

  if (historyData.length === 0) {
      historyData.push({ name: 0, balance: session.startBalance || 0 });
  }

  const netProfit = (session.balance || 0) - (session.startBalance || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      <div className="md:col-span-1 space-y-4">
        <div className="bg-bet-900 p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
           <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Wagered</div>
           <div className="text-2xl font-black text-white tabular-nums tracking-tighter">₹{Math.floor(session.totalWagered || 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-bet-900 p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
           <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Profit</div>
           <div className={`text-2xl font-black tabular-nums tracking-tighter ${netProfit >= 0 ? 'text-bet-primary' : 'text-bet-danger'}`}>
             {netProfit >= 0 ? '+' : ''}₹{Math.floor(netProfit).toLocaleString()}
           </div>
        </div>

        <div className="bg-bet-900 p-6 rounded-[1.5rem] border border-white/5 shadow-xl">
           <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Bets Placed</div>
           <div className="text-2xl font-black text-white tabular-nums tracking-tighter">{session.totalBets || 0}</div>
        </div>
      </div>

      <div className="md:col-span-3 bg-bet-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-black italic uppercase text-sm bazar-font flex items-center gap-3">
             <span className="w-2.5 h-2.5 rounded-full bg-bet-primary animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
             Live Performance Chart
           </h3>
           <div className="flex gap-2">
              <span className="text-[9px] bg-black/40 text-slate-500 px-3 py-1 rounded-full font-black border border-white/5">FULL SESSION</span>
           </div>
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Balance']}
                labelFormatter={() => ''}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#22d3ee" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 6, fill: '#fff', strokeWidth: 2, stroke: '#22d3ee' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};