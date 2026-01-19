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
      <div className="max-w-5xl mx-auto animate-fade-in pb-32">
        <div className="text-center mb-20 lg:mb-32">
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-bet-primary/10 border border-bet-primary/20 rounded-full text-bet-primary text-[11px] font-black uppercase tracking-widest mb-10">
            <span className="w-2 h-2 bg-bet-primary animate-pulse rounded-full"></span>
            Deterministic Cryptography
          </div>
          <h1 className="text-6xl lg:text-9xl font-black text-white mb-8 italic transform -skew-x-12 tracking-tighter uppercase bazar-font leading-none">
            PROVABLY <span className="text-bet-primary drop-shadow-[0_0_15px_#22d3ee]">FAIR</span>
          </h1>
          <p className="text-slate-400 text-sm lg:text-lg font-bold leading-relaxed max-w-3xl mx-auto uppercase tracking-wide opacity-80">
            Every Kalyan draw and Aviator flight is determined by a cryptographically secure HMAC-SHA256 chain. Verify the math, audit the bazar.
          </p>
        </div>

        <div className="bg-bet-900 rounded-[3rem] p-10 lg:p-16 border border-white/10 mb-20 shadow-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-bet-primary/10 blur-[150px] pointer-events-none"></div>
           <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-5 italic uppercase -skew-x-6 bazar-font">
             <span className="w-12 h-12 bg-bet-primary text-bet-950 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🔒</span>
             Active Satta Seeds
           </h2>
           
           <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-5">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Update Client Seed</label>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={newSeed} 
                      onChange={(e) => setNewSeed(e.target.value)} 
                      className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xs lg:text-sm outline-none focus:border-bet-primary transition-all shadow-inner"
                    />
                    <button onClick={handleUpdateSeed} className="bg-bet-primary text-bet-950 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl bazar-font">Rotate</button>
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight italic leading-relaxed">Changing your seed resets the Nonce and forces a new outcome chain from the Bazar Node.</p>
              </div>
              
              <div className="space-y-5">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Server Node Hash</label>
                 <div className="bg-black/50 p-6 rounded-2xl border border-white/10 font-mono text-[10px] lg:text-xs text-bet-secondary break-all leading-relaxed shadow-inner">
                    sha256({session.serverSeed.split('').map(() => '*').join('').substring(0, 32)})
                 </div>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight italic leading-relaxed">This hash proves the result was fixed before you placed your bet.</p>
              </div>

              <div className="md:col-span-2 p-10 bg-black/40 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-10">
                    <div className="text-center">
                       <div className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Active Nonce</div>
                       <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{session.nonce}</div>
                    </div>
                    <div className="h-14 w-px bg-white/10"></div>
                    <div>
                       <div className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Next Seed Entropy</div>
                       <div className="text-xs font-black text-bet-primary font-mono truncate max-w-[180px] lg:max-w-xs">{engine.peekNextRandom().toFixed(16)}</div>
                    </div>
                 </div>
                 <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic text-right bazar-font">
                    Outcome = floor(random * bazar_range)
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-16">
           <h2 className="text-4xl font-black text-white uppercase italic -skew-x-12 tracking-tighter bazar-font">House Edge <span className="text-bet-primary">& RTP Reality</span></h2>
           
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Kalyan Matka', edge: HOUSE_EDGES[GameType.MATKA], formula: 'Weighted Sum', desc: '10% node fee for direct office result payouts.' },
                { name: 'Aviator', edge: HOUSE_EDGES[GameType.CRASH], formula: '0.97 / (1 - U)', desc: '3% instant crash ensures mathematical bank profit.' },
                { name: 'Wheel', edge: HOUSE_EDGES[GameType.WHEEL], formula: 'Normal Distribution', desc: 'Zero pockets balance the high multipliers.' },
                { name: 'Teen Patti', edge: HOUSE_EDGES[GameType.TEENPATTI], formula: '52.5% Dealer Bias', desc: 'Slight bias ensures long-term bazar stability.' },
                { name: 'Slots', edge: HOUSE_EDGES[GameType.SLOTS], formula: 'Symbol Gravity', desc: 'High variance reels with a set 96% return rate.' },
                { name: 'Mines', edge: HOUSE_EDGES[GameType.MINES], formula: 'Combinatorial Risk', desc: 'Step multipliers grow slower than actual risk.' }
              ].map(game => (
                <div key={game.name} className="bg-bet-900 p-10 rounded-[2.5rem] border border-white/5 hover:border-bet-primary/30 transition-all group card-bazar">
                   <h3 className="text-2xl font-black text-white mb-2 group-hover:text-bet-primary transition-colors uppercase italic -skew-x-6 bazar-font">{game.name}</h3>
                   <div className="text-[11px] font-black text-bet-primary uppercase tracking-widest mb-6">Edge: {(game.edge * 100).toFixed(2)}%</div>
                   <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-[9px] text-slate-600 mb-6">{game.formula}</div>
                   <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">{game.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </Layout>
  );
}