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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="bg-bet-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-3xl flex flex-col overflow-hidden">
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-3xl font-black text-white italic -skew-x-12 uppercase bazar-font">Transparency Mode</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit the House Advantage Matrix</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-bet-danger transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
          
          <section>
            <h3 className="text-xl font-black text-bet-primary mb-5 uppercase italic bazar-font">1. The House Advantage Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <h4 className="font-black text-white text-sm uppercase mb-3 italic">Udaan Aviator</h4>
                <div className="text-[11px] text-slate-400 space-y-2 font-bold leading-relaxed">
                  <p>Model: <code className="text-bet-primary font-mono">e^(0.06 * t)</code></p>
                  <p>Instant Bust: 3% of rounds terminate at 1.00x regardless of RNG.</p>
                  <p className="text-bet-danger font-black mt-3 uppercase tracking-widest">Edge: {(HOUSE_EDGES.CRASH * 100)}%</p>
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <h4 className="font-black text-white text-sm uppercase mb-3 italic">Roulette Board</h4>
                <div className="text-[11px] text-slate-400 space-y-2 font-bold leading-relaxed">
                  <p>Pocket Range: 0 (Green) to 36.</p>
                  <p>Zero Offset: The single zero pocket provides the mathematical drift.</p>
                  <p className="text-bet-danger font-black mt-3 uppercase tracking-widest">Edge: {(HOUSE_EDGES.ROULETTE * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-bet-primary/5 p-8 rounded-[2rem] border border-bet-primary/20">
            <h3 className="text-xl font-black text-white mb-5 uppercase italic bazar-font">2. Provably Fair Execution</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-6 leading-relaxed">
              Cryptographic deterministic chains ensure outcomes are fixed before you play.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="block text-[9px] text-slate-600 mb-1 uppercase font-black">Client Seed</span>
                <span className="text-bet-primary text-[10px] break-all">{session.clientSeed}</span>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="block text-[9px] text-slate-600 mb-1 uppercase font-black">Server Node</span>
                <span className="text-bet-secondary text-[10px] break-all">sha256(HIDDEN)</span>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                <span className="block text-[9px] text-slate-600 mb-1 uppercase font-black">Nonce</span>
                <span className="text-white text-lg font-black">{session.nonce}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
            MATHEMATICAL LITERACY IS THE ONLY PROTECTION. PLAY RESPONSIBLY.
          </p>
        </div>
      </div>
    </div>
  );
};