import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine, formatINR } from '../services/engine';
import { GameType } from '../types';
import { Sliders, Calculator, RotateCcw } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState(engine.getSession());

  const [simWinProb, setSimWinProb] = useState<number>(49.5);
  const [simMultiplier, setSimMultiplier] = useState<number>(2.0);

  useEffect(() => {
    return engine.subscribe((s) => setSession(s));
  }, []);

  const updateSetting = (key: string, val: any) => {
    engine.updateAdminSettings({ [key]: val });
  };

  const p = simWinProb / 100;
  const q = 1 - p;
  const b = Math.max(0.01, simMultiplier - 1);
  const expectedValuePerUnit = p * b - q;
  const kellyFraction = Math.max(0, (p * b - q) / b);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#fbbf24] text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              <span>Bookie Risk & Gambling-Math Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              House Edge & Risk Parameters Lab
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => engine.resetBalance()}
              className="px-4 py-2 bg-[#131c31] hover:bg-[#1e293b] border border-[#1e293b] rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#fbbf24]" /> Reset ₹25,000 Khata
            </button>
          </div>
        </header>

        {/* Top Telemetry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs text-[#94a3b8] mb-1">Cumulative House Net</div>
            <div
              className={`text-xl font-extrabold font-mono tabular-nums ${
                session.settings.globalProfit >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
              }`}
            >
              {formatINR(session.settings.globalProfit)}
            </div>
          </div>
          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs text-[#94a3b8] mb-1">Active Nonce</div>
            <div className="text-xl font-extrabold font-mono text-[#fbbf24] tabular-nums">
              {session.nonce}
            </div>
          </div>
          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs text-[#94a3b8] mb-1">RNG Mode</div>
            <div className="text-xl font-extrabold text-white">
              {session.settings.isRigged ? 'Adverse Drift' : 'Fair HMAC'}
            </div>
          </div>
          <div className="bg-[#0d1322] p-5 rounded-2xl border border-[#1e293b]">
            <div className="text-xs text-[#94a3b8] mb-1">Target RTP Baseline</div>
            <div className="text-xl font-extrabold font-mono text-[#10b981] tabular-nums">
              {(session.settings.forcedRTP * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Variance & Kelly Calculator */}
          <div className="space-y-6">
            <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-extrabold text-white">RNG & Variance Simulation</h2>

              <div
                onClick={() => updateSetting('isRigged', !session.settings.isRigged)}
                className="flex items-center justify-between p-4 bg-[#131c31] rounded-xl border border-[#1e293b] cursor-pointer"
              >
                <div>
                  <div className="text-sm font-bold text-white">Adverse Variance Stress Test</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">
                    Simulates a negative tail-risk streak to test bankroll resilience and stop-loss behavior.
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ml-4 ${
                    session.settings.isRigged ? 'bg-[#f43f5e]' : 'bg-[#070b14]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      session.settings.isRigged ? 'left-7' : 'left-1'
                    }`}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#131c31] rounded-xl border border-[#1e293b] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#94a3b8]">Simulated Return to Player (RTP)</span>
                  <span className="font-mono font-bold text-[#fbbf24] tabular-nums">
                    {(session.settings.forcedRTP * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.00"
                  step="0.01"
                  value={session.settings.forcedRTP}
                  onChange={(e) => updateSetting('forcedRTP', Number(e.target.value))}
                  className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
                />
              </div>
            </section>

            {/* Kelly Criterion & EV Calculator */}
            <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#fbbf24]" />
                <span>Expected Value (EV) & Kelly Criterion Calculator</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Win Probability (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="99"
                    value={simWinProb}
                    onChange={(e) => setSimWinProb(Number(e.target.value))}
                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                    Payout Multiplier (×)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.01"
                    value={simMultiplier}
                    onChange={(e) => setSimMultiplier(Number(e.target.value))}
                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#131c31] p-4 rounded-xl border border-[#1e293b] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Expected Value per ₹1,000 Bet:</span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      expectedValuePerUnit >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    }`}
                  >
                    {expectedValuePerUnit >= 0 ? '+' : ''}
                    {formatINR(expectedValuePerUnit * 1000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Optimal Kelly Bankroll Fraction:</span>
                  <span className="font-mono font-bold text-[#fbbf24] tabular-nums">
                    {(kellyFraction * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Module House Edges Table */}
          <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#131c31] border-b border-[#1e293b]">
              <h2 className="text-sm font-extrabold text-white">Game Module House Edges</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#1e293b]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Module</th>
                    <th className="px-4 py-3 font-semibold text-right">House Edge</th>
                    <th className="px-6 py-3 font-semibold text-right">Theoretical RTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {Object.values(GameType).map((type) => {
                    const edge = session.settings.houseEdgeOverrides[type] ?? 0.01;
                    return (
                      <tr key={type} className="hover:bg-[#131c31]/50">
                        <td className="px-6 py-3 font-bold text-white">{type}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#94a3b8] tabular-nums">
                          {(edge * 100).toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 text-right font-mono font-bold text-[#fbbf24] tabular-nums">
                          {((1 - edge) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}