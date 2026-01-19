
import React from 'react';
// Fix: Layout is a named export, not a default export.
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { HOUSE_EDGES, GameType } from '../types';

export default function Fairness() {
  const session = engine.getSession();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Provably Fair</h1>
          <p className="text-slate-400 text-lg">
            Our system uses verified cryptography to ensure every game result is random and immutable.
          </p>
        </div>

        {/* The Seeds Section - Standard Casino Stuff */}
        <div className="bg-casino-800 rounded-xl p-8 border border-casino-700 mb-12">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             Active Client Seed Pair
           </h2>
           
           <div className="grid gap-6 md:grid-cols-2">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Client Seed</label>
                 <div className="bg-casino-900 p-4 rounded border border-casino-700 font-mono text-sm text-white break-all">
                    {session.clientSeed}
                 </div>
                 <p className="text-xs text-slate-500 mt-2">You can change this seed at any time to verify randomness.</p>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Server Seed (Hashed)</label>
                 <div className="bg-casino-900 p-4 rounded border border-casino-700 font-mono text-sm text-white break-all">
                    sha256(*********************)
                 </div>
                 <p className="text-xs text-slate-500 mt-2">Revealed only after you rotate your seed pair.</p>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nonce</label>
                 <div className="bg-casino-900 p-4 rounded border border-casino-700 font-mono text-sm text-white">
                    {session.nonce}
                 </div>
              </div>
           </div>
        </div>

        {/* The "Truth" Section - Disguised as Math Explanations */}
        <div className="space-y-8">
           <h2 className="text-2xl font-bold text-white">Game Mathematics & House Edge</h2>
           <p className="text-slate-400">
             Every game includes a mathematical advantage for the platform known as the House Edge (HE) or Return to Player (RTP). This ensures the sustainable operation of the platform.
           </p>

           <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-casino-800 p-6 rounded-xl border border-casino-700">
                 <h3 className="text-lg font-bold text-white mb-2">Crash</h3>
                 <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400">House Edge</span>
                    <span className="text-emerald-400 font-mono">{(HOUSE_EDGES[GameType.CRASH] * 100).toFixed(2)}%</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    The multiplier is generated using <code>0.99 / (1 - U)</code>. This means 1 out of every 100 rounds is guaranteed to crash instantly at 1.00x, securing the mathematical edge.
                 </p>
              </div>

              <div className="bg-casino-800 p-6 rounded-xl border border-casino-700">
                 <h3 className="text-lg font-bold text-white mb-2">Roulette</h3>
                 <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400">House Edge</span>
                    <span className="text-emerald-400 font-mono">{(HOUSE_EDGES[GameType.ROULETTE] * 100).toFixed(2)}%</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    Standard European Roulette. The presence of the Green Zero (0) reduces the odds of Red/Black from 50% to 48.6%, creating the edge.
                 </p>
              </div>
              
              <div className="bg-casino-800 p-6 rounded-xl border border-casino-700">
                 <h3 className="text-lg font-bold text-white mb-2">Slots</h3>
                 <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400">House Edge</span>
                    <span className="text-emerald-400 font-mono">{(HOUSE_EDGES[GameType.SLOTS] * 100).toFixed(2)}%</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    Symbol weighting is uneven. Near-misses (2 matching symbols) occur statistically more often than true random chance to enhance engagement, though payouts remain strictly bound by RTP.
                 </p>
              </div>

              <div className="bg-casino-800 p-6 rounded-xl border border-casino-700">
                 <h3 className="text-lg font-bold text-white mb-2">Blackjack</h3>
                 <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400">House Edge</span>
                    <span className="text-emerald-400 font-mono">~0.5% (Perfect Play)</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                    While Blackjack offers the best odds, player error significantly increases the effective house edge. Dealer always wins on push (except Blackjack) in many variants, or simply acts last.
                 </p>
              </div>
           </div>

           <div className="bg-rose-900/10 border border-rose-500/20 p-6 rounded-xl mt-8">
              <h3 className="text-rose-500 font-bold mb-2">Mathematical Reality</h3>
              <p className="text-sm text-rose-300 leading-relaxed">
                 While short-term variance allows for significant wins, the Law of Large Numbers dictates that over an infinite number of bets, the actual return will converge to the expected return (RTP). Since RTP is always &lt; 100%, long-term participation mathematically results in a loss of funds proportional to the House Edge.
              </p>
           </div>
        </div>
      </div>
    </Layout>
  );
}
