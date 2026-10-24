import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { engine, generateProvablyFairFloats, sha256Sync } from '../services/engine';
import { HOUSE_EDGES, GameType } from '../types';
import { ShieldCheck, RefreshCw, Calculator, CheckCircle2 } from 'lucide-react';

export default function Fairness() {
  const [session, setSession] = useState(engine.getSession());
  const [newSeed, setNewSeed] = useState(session.clientSeed);
  const [rotationNotice, setRotationNotice] = useState<string | null>(null);

  const [verifyGame, setVerifyGame] = useState<GameType>(GameType.CRASH);
  const [verifyServerSeed, setVerifyServerSeed] = useState('e3b0c44298fc1c149afbf4c8996fb924');
  const [verifyClientSeed, setVerifyClientSeed] = useState(session.clientSeed);
  const [verifyNonce, setVerifyNonce] = useState<number>(0);

  useEffect(() => {
    return engine.subscribe((s) => setSession(s));
  }, []);

  const handleRotateSeed = () => {
    const res = engine.rotateSeedPair(newSeed);
    setVerifyServerSeed(res.revealedServerSeed);
    setVerifyClientSeed(session.clientSeed);
    setVerifyNonce(Math.max(0, session.nonce - 1));
    setRotationNotice(
      `Seed pair rotated. Previous Server Seed revealed (${res.revealedServerSeed.substring(0, 12)}...) and loaded into the verifier below.`
    );
    setTimeout(() => setRotationNotice(null), 6000);
  };

  const floats = generateProvablyFairFloats(verifyServerSeed, verifyClientSeed, verifyNonce, 1);
  const r = floats[0];
  const computedHash = sha256Sync(verifyServerSeed);

  const getVerifiedOutcome = () => {
    switch (verifyGame) {
      case GameType.DICE:
        return `Roll: ${(r * 100).toFixed(2)}`;
      case GameType.CRASH: {
        const edge = 0.01;
        const crash = r < edge ? 1.0 : Math.min(10000, Math.max(1.0, +((1 - edge) / (1 - r)).toFixed(2)));
        return `Aviator Multiplier: ${crash.toFixed(2)}×`;
      }
      case GameType.ROULETTE:
        return `Winning Pocket: ${Math.floor(r * 37)}`;
      case GameType.MATKA: {
        const res = engine.getSattaMatkaResult(r);
        return `Panna ${res.cards}-${res.jodi}-${res.closeCards}`;
      }
      case GameType.COINFLIP:
        return `Side: ${r >= 0.5 ? 'HEADS' : 'TAILS'}`;
      default:
        return `Normalized Float: ${r.toFixed(8)}`;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#10b981] text-xs font-extrabold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 Cryptographic Determinism</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Provably Fair System & Seed Verifier
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1 max-w-2xl leading-relaxed">
              Every Aviator flight, Matka Panna draw, and Teen Patti shoe is generated deterministically from your Client Seed, our blinded Server Seed, and an incrementing Nonce.
            </p>
          </div>
        </header>

        {rotationNotice && (
          <div className="px-4 py-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{rotationNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Seed Management */}
          <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#fbbf24]" />
              <span>Active Seed Pair</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                Active Client Seed
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSeed}
                  onChange={(e) => setNewSeed(e.target.value)}
                  className="flex-1 bg-[#070b14] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-[#f59e0b]"
                />
                <button
                  onClick={handleRotateSeed}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#070b14] font-extrabold text-xs rounded-xl whitespace-nowrap"
                >
                  Rotate Seed Pair
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">
                Active Server Seed (SHA-256 Hashed)
              </label>
              <div className="bg-[#070b14] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#94a3b8] break-all">
                {session.serverSeedHash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#131c31] p-3.5 rounded-xl border border-[#1e293b]">
                <span className="block text-xs text-[#94a3b8]">Current Nonce</span>
                <span className="text-lg font-mono font-bold text-[#fbbf24] tabular-nums">
                  {session.nonce}
                </span>
              </div>
              <div className="bg-[#131c31] p-3.5 rounded-xl border border-[#1e293b]">
                <span className="block text-xs text-[#94a3b8]">Rotated Seeds</span>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {session.seedHistory?.length || 0}
                </span>
              </div>
            </div>
          </section>

          {/* Interactive Outcome Verifier */}
          <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#fbbf24]" />
              <span>Interactive Outcome Verifier</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Game</label>
                <select
                  value={verifyGame}
                  onChange={(e) => setVerifyGame(e.target.value as GameType)}
                  className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  {Object.values(GameType).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Nonce</label>
                <input
                  type="number"
                  min="0"
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                Unblinded Server Seed
              </label>
              <input
                type="text"
                value={verifyServerSeed}
                onChange={(e) => setVerifyServerSeed(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Client Seed</label>
              <input
                type="text"
                value={verifyClientSeed}
                onChange={(e) => setVerifyClientSeed(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>

            <div className="bg-[#131c31] p-4 rounded-xl border border-[#1e293b] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Server Seed SHA-256:</span>
                <span className="text-white truncate max-w-[200px]">{computedHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Float Output [0, 1):</span>
                <span className="text-white tabular-nums">{r.toFixed(10)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1e293b]">
                <span className="text-[#94a3b8] font-sans font-semibold">Verified Outcome:</span>
                <span className="text-[#10b981] font-bold">{getVerifiedOutcome()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Revealed Seed History */}
        {session.seedHistory && session.seedHistory.length > 0 && (
          <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#131c31] border-b border-[#1e293b]">
              <h3 className="text-sm font-extrabold text-white">Revealed Server Seeds</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#1e293b]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Revealed Server Seed</th>
                    <th className="px-4 py-3 font-semibold">Client Seed</th>
                    <th className="px-4 py-3 font-semibold text-right">Bets Placed</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {session.seedHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#131c31]/50">
                      <td className="px-6 py-3 font-mono text-white">{item.serverSeed}</td>
                      <td className="px-4 py-3 font-mono text-[#94a3b8]">{item.clientSeed}</td>
                      <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                        {item.totalBets}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => {
                            setVerifyServerSeed(item.serverSeed);
                            setVerifyClientSeed(item.clientSeed);
                            setVerifyNonce(0);
                          }}
                          className="text-[#fbbf24] hover:underline font-bold"
                        >
                          Load in Verifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* House Edge & Theoretical RTP Table */}
        <section className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6">
          <h3 className="text-base font-extrabold text-white mb-4">
            Published Game House Edges & Theoretical RTP
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.values(GameType).map((game) => {
              const edge = HOUSE_EDGES[game] ?? 0.01;
              const rtp = (1 - edge) * 100;
              return (
                <div
                  key={game}
                  className="bg-[#131c31] p-4 rounded-xl border border-[#1e293b] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-white">{game}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      Edge: {(edge * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sm text-[#fbbf24] tabular-nums">
                    {rtp.toFixed(2)}% RTP
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}