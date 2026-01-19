
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { HOUSE_EDGES, GameType } from '../types';

export default function Fairness() {
  const session = engine.getSession();
  const [newSeed, setNewSeed] = useState(session.clientSeed);

  const handleUpdateSeed = () => {
    if (!newSeed) return;
    engine.setClientSeed(newSeed);
    alert('Client Seed updated! Nonce reset to 0.');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-casino-accent/10 border border-casino-accent/20 rounded-full text-casino-accent text-[10px] font-black uppercase tracking-widest mb-6">Deterministic Cryptography</div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 italic transform -skew-x-12 tracking-tighter uppercase">Provably <span className="text-casino-accent">Fair</span></h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Our platform utilizes standard HMAC-SHA256 outcome generation. You can verify every single bet by checking the mathematical relationship between the seeds.
          </p>
        </div>

        {/* The Seeds Section */}
        <div className="bg-[#0f1116] rounded-[3rem] p-10 lg:p-14 border border-white/5 mb-16 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-casino-accent/5 blur-[100px] pointer-events-none"></div>
           <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4 italic uppercase -skew-x-6">
             <span className="w-10 h-10 bg-casino-accent/10 rounded-xl flex items-center justify-center text-xl shadow-inner">🔒</span>
             Active Seed Pair
           </h2>
           
           <div className="grid gap-10 md:grid-cols-2">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Update Client Seed</label>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newSeed} 
                      onChange={(e) => setNewSeed(e.target.value)} 
                      className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm outline-none focus:border-casino-accent transition-all shadow-inner"
                    />
                    <button onClick={handleUpdateSeed} className="bg-casino-accent text-black px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Rotate</button>
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight italic">Changing your seed resets your Nonce and creates a new chain of outcomes.</p>
              </div>
              
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Server Seed (Hashed)</label>
                 <div className="bg-black/50 p-5 rounded-2xl border border-white/5 font-mono text-xs text-slate-400 break-all leading-relaxed">
                    sha256({session.serverSeed.split('').map(() => '*').join('').substring(0, 32)})
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight italic">Revealed only after you generate a new server seed pair.</p>
              </div>

              <div className="md:col-span-2 p-8 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                       <div className="text-[10px] font-black text-slate-600 uppercase mb-1">Nonce</div>
                       <div className="text-3xl font-black text-white font-mono">{session.nonce}</div>
                    </div>
                    <div className="h-10 w-px bg-white/5"></div>
                    <div>
                       <div className="text-[10px] font-black text-slate-600 uppercase mb-1">Next Deterministic Input</div>
                       <div className="text-xs font-black text-casino-accent font-mono truncate max-w-[200px]">{engine.peekNextRandom().toFixed(16)}</div>
                    </div>
                 </div>
                 <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic max-w-xs text-right">
                    Outcome = floor(random * game_range)
                 </div>
              </div>
           </div>
        </div>

        {/* The "Math" Section */}
        <div className="space-y-12">
           <h2 className="text-3xl font-black text-white uppercase italic -skew-x-12 tracking-tighter">House Edge <span className="text-casino-accent">& RTP</span></h2>
           
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Matka Crash', edge: HOUSE_EDGES[GameType.CRASH], formula: '0.99 / (1 - U)', desc: '1% instant bust rate ensures house profit.' },
                { name: 'Ball Plinko', edge: HOUSE_EDGES[GameType.PLINKO], formula: 'Normal Distribution', desc: 'Central bins return < 1x to balance outliers.' },
                { name: 'Teen Patti', edge: HOUSE_EDGES[GameType.TEENPATTI], formula: '52.5% Dealer Bias', desc: 'Slight bias ensures long-term edge.' },
                { name: 'Roulette', edge: HOUSE_EDGES[GameType.ROULETTE], formula: '1/37 Zero Pocket', desc: 'European standard 2.7% mathematical edge.' },
                { name: 'Slots', edge: HOUSE_EDGES[GameType.SLOTS], formula: 'Symbol Weighting', desc: 'High variance volatility with 96% RTP.' },
                { name: 'Mines', edge: HOUSE_EDGES[GameType.MINES], formula: 'Combinatorial Probability', desc: 'Multipliers grow slower than actual risk.' }
              ].map(game => (
                <div key={game.name} className="bg-[#0f1116] p-8 rounded-[2.5rem] border border-white/5 hover:border-casino-accent/30 transition-all group">
                   <h3 className="text-xl font-black text-white mb-1 group-hover:text-casino-accent transition-colors uppercase italic -skew-x-6">{game.name}</h3>
                   <div className="text-[10px] font-black text-casino-accent uppercase tracking-widest mb-6">Edge: {(game.edge * 100).toFixed(2)}%</div>
                   <div className="bg-black p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-500 mb-4">{game.formula}</div>
                   <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{game.desc}</p>
                </div>
              ))}
           </div>

           <div className="bg-rose-500/5 border border-rose-500/20 p-10 rounded-[3rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl pointer-events-none"></div>
              <h3 className="text-xl font-black text-rose-500 mb-4 uppercase italic tracking-widest flex items-center gap-3">
                <span className="animate-pulse">⚠️</span>
                Statistical Reality
              </h3>
              <p className="text-xs text-rose-200/60 leading-loose font-bold uppercase tracking-wide">
                 While deterministic randomness prevents "rigging", the House Edge guarantees that long-term participation will result in a loss of funds. The Law of Large Numbers dictates that actual returns will converge to the theoretical RTP (Return to Player) over a significant sample size.
              </p>
           </div>
        </div>
      </div>
    </Layout>
  );
}
