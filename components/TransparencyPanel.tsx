import React from 'react';
import { UserSession, HOUSE_EDGES } from '../types';

interface TransparencyPanelProps {
  session: UserSession;
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ session, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-casino-800 w-full max-w-4xl max-h-[90vh] rounded-xl border border-casino-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-casino-700 flex justify-between items-center bg-casino-900/50">
          <div>
            <h2 className="text-2xl font-black text-white">Transparency Mode</h2>
            <p className="text-sm text-slate-400">Understanding the mathematics of defeat</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: The House Edge */}
          <section>
            <h3 className="text-xl font-bold text-casino-accent mb-4">1. The House Edge (The Mathematical Trap)</h3>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Every game in a casino is designed with a mathematical advantage for the house. This is not "rigging" in the sense of cheating; it is built into the payout structure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-casino-900 p-4 rounded-lg border border-casino-700">
                <h4 className="font-bold text-white mb-2">Crash</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Formula: <code className="text-emerald-400">0.99 / (1 - random)</code></p>
                  <p>Effect: The 1% instant crash chance ensures the expected value is negative.</p>
                  <p className="font-mono text-rose-400 mt-2">House Edge: {(HOUSE_EDGES.CRASH * 100)}%</p>
                </div>
              </div>
              <div className="bg-casino-900 p-4 rounded-lg border border-casino-700">
                <h4 className="font-bold text-white mb-2">Roulette (European)</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Numbers: 0 to 36 (37 total)</p>
                  <p>Payout: 35:1 (plus bet back) implies 1/36 odds.</p>
                  <p>Reality: 1/37 odds due to Zero.</p>
                  <p className="font-mono text-rose-400 mt-2">House Edge: {(HOUSE_EDGES.ROULETTE * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Provably Fair */}
          <section className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
            <h3 className="text-xl font-bold text-white mb-4">2. "Provably Fair" (Honest Losses)</h3>
            <p className="text-sm text-slate-300 mb-4">
              Crypto casinos often boast "Provably Fair" systems. This ensures they don't change the outcome after you bet. 
              However, <b>fair randomness still leads to inevitable loss</b> due to the House Edge.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-black/40 p-3 rounded">
                <span className="block text-slate-500 mb-1">Active Client Seed</span>
                <span className="text-emerald-400 break-all">{session.clientSeed}</span>
              </div>
              <div className="bg-black/40 p-3 rounded">
                <span className="block text-slate-500 mb-1">Server Seed Hash</span>
                <span className="text-indigo-400 break-all">sha256(hidden_seed)</span>
              </div>
              <div className="bg-black/40 p-3 rounded">
                <span className="block text-slate-500 mb-1">Next Nonce</span>
                <span className="text-white">{session.nonce + 1}</span>
              </div>
            </div>
          </section>

          {/* Section 3: The Law of Large Numbers */}
          <section>
            <h3 className="text-xl font-bold text-casino-accent mb-4">3. Projected Loss</h3>
            <p className="text-slate-300 mb-4">
              If you continue betting at your current average wager ({Math.floor(session.totalWagered / Math.max(1, session.totalBets))} credits), 
              statistics dictate your balance will degrade.
            </p>
            <div className="bg-casino-900 p-4 rounded-lg border border-casino-700">
               <table className="w-full text-sm text-left">
                 <thead className="text-slate-500 border-b border-casino-700">
                   <tr>
                     <th className="pb-2">Bets Placed</th>
                     <th className="pb-2">Expected Loss (Approx)</th>
                     <th className="pb-2">Probability of Profit</th>
                   </tr>
                 </thead>
                 <tbody className="text-slate-300">
                   <tr className="border-b border-casino-800">
                     <td className="py-2">10</td>
                     <td className="text-rose-400">High Variance (Luck dominates)</td>
                     <td className="text-white">~48%</td>
                   </tr>
                   <tr className="border-b border-casino-800">
                     <td className="py-2">1,000</td>
                     <td className="text-rose-400">~2% of total wagered</td>
                     <td className="text-white">&lt; 15%</td>
                   </tr>
                   <tr>
                     <td className="py-2">100,000</td>
                     <td className="text-rose-400">Mathematical Certainty</td>
                     <td className="text-white">~0.0001%</td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-casino-700 bg-casino-900/50 text-center">
          <p className="text-xs text-slate-500">
            This simulator uses a standard Linear Congruential Generator (LCG) seeded with your session ID to replicate deterministic outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};