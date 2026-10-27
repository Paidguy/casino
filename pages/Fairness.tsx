import React, { useState } from 'react';
import {
  gameEngine,
  sha256Sync,
  hmacSha256Sync,
  generateProvablyFairFloats,
} from '../services/engine';
import { ShieldCheck, RefreshCw, Lock, Calculator, Cpu } from 'lucide-react';

export const Fairness: React.FC = () => {
  const [state, setState] = useState(gameEngine.getState());
  const [newSeed, setNewSeed] = useState(state.seeds.clientSeed);
  const [rotated, setRotated] = useState(false);

  // Interactive Verifier State
  const [verifyServerSeed, setVerifyServerSeed] = useState('e3b0c44298fc1c149afbf4c8996fb924');
  const [verifyClientSeed, setVerifyClientSeed] = useState(state.seeds.clientSeed);
  const [verifyNonce, setVerifyNonce] = useState<number>(0);
  const [webCryptoVerified, setWebCryptoVerified] = useState<boolean>(false);

  const handleRotate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeed.trim()) return;
    const res = gameEngine.rotateSeeds(newSeed.trim());
    if (res?.revealedServerSeed) {
      setVerifyServerSeed(res.revealedServerSeed);
    }
    setState({ ...gameEngine.getState() });
    setRotated(true);
    setTimeout(() => setRotated(false), 2500);
  };

  const verifyWithWebCrypto = async () => {
    try {
      const enc = new TextEncoder();
      const key = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(verifyServerSeed),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await window.crypto.subtle.sign(
        'HMAC',
        key,
        enc.encode(`${verifyClientSeed}:${verifyNonce}:0`)
      );
      const hex = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const engineHex = hmacSha256Sync(verifyServerSeed, `${verifyClientSeed}:${verifyNonce}:0`);
      if (hex === engineHex) {
        setWebCryptoVerified(true);
        setTimeout(() => setWebCryptoVerified(false), 3000);
      }
    } catch (e) {}
  };

  const sampleFloat =
    generateProvablyFairFloats(verifyServerSeed, verifyClientSeed, verifyNonce, 1)[0] ?? 0;
  const sampleCommitment = sha256Sync(verifyServerSeed);
  const sampleHmac = hmacSha256Sync(verifyServerSeed, `${verifyClientSeed}:${verifyNonce}:0`);
  const sampleCrash =
    sampleFloat < 0.01 ? 1.0 : Math.min(10000, Number((0.99 / (1 - sampleFloat)).toFixed(2)));
  const sampleDice = Number((sampleFloat * 100).toFixed(2));
  const sampleRoulette = Math.floor(sampleFloat * 37);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" /> Provably Fair Cryptographic Audit
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Every round uses 100% client-side RFC 2104 HMAC-SHA256 (`HMAC_SHA256(serverSeed, clientSeed:nonce:cursor)`) with 4-byte uniform float extraction.
        </p>
      </div>

      {/* Active Seed Pair */}
      <div className="bg-[#111927] p-6 rounded-2xl border border-white/10 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Active Server Seed (SHA-256 Commitment Hash)
          </label>
          <div className="bg-[#0b101b] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-emerald-400 break-all flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            {state.seeds.serverSeedHash}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Active Client Seed
            </label>
            <div className="bg-[#0b101b] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white">
              {state.seeds.clientSeed}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Nonce (Rounds Played with Seed)
            </label>
            <div className="bg-[#0b101b] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-amber-400 font-bold">
              #{state.seeds.nonce}
            </div>
          </div>
        </div>

        <form onSubmit={handleRotate} className="pt-4 border-t border-white/10 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Rotate Client Seed Pair & Reveal Server Seed
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newSeed}
              onChange={(e) => setNewSeed(e.target.value)}
              placeholder="Enter custom client seed..."
              className="flex-1 bg-[#0b101b] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Rotate Seed Pair
            </button>
          </div>
          {rotated && (
            <div className="text-xs text-emerald-400 font-semibold">
              Seed pair rotated! Unhashed Server Seed loaded into the verifier below.
            </div>
          )}
        </form>
      </div>

      {/* Interactive Outcome Calculator */}
      <div className="bg-[#111927] p-6 rounded-2xl border border-white/10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Interactive HMAC-SHA256 Outcome Verifier
            </h2>
          </div>
          <button
            type="button"
            onClick={verifyWithWebCrypto}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            {webCryptoVerified
              ? 'Cross-Verified with Browser WebCrypto API ✓'
              : 'Cross-Verify with Browser WebCrypto API'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Unhashed Server Seed
            </label>
            <input
              type="text"
              value={verifyServerSeed}
              onChange={(e) => setVerifyServerSeed(e.target.value)}
              className="w-full bg-[#0b101b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Client Seed
            </label>
            <input
              type="text"
              value={verifyClientSeed}
              onChange={(e) => setVerifyClientSeed(e.target.value)}
              className="w-full bg-[#0b101b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Nonce
            </label>
            <input
              type="number"
              min={0}
              value={verifyNonce}
              onChange={(e) => setVerifyNonce(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0b101b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="bg-[#0b101b] p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs gap-4">
            <span className="text-slate-400 shrink-0">SHA-256(serverSeed)</span>
            <span className="font-mono text-slate-300 truncate">{sampleCommitment}</span>
          </div>
          <div className="flex justify-between text-xs gap-4">
            <span className="text-slate-400 shrink-0">HMAC-SHA256(`client:nonce:0`)</span>
            <span className="font-mono text-emerald-400 truncate">{sampleHmac}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">4-Byte Normalized Float `r ∈ [0, 1)`</span>
            <span className="font-mono font-bold text-amber-400">{sampleFloat.toFixed(9)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0b101b] p-3.5 rounded-xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Aviator Crash Point</div>
            <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">{sampleCrash.toFixed(2)}×</div>
          </div>
          <div className="bg-[#0b101b] p-3.5 rounded-xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Classic Dice Roll</div>
            <div className="text-lg font-mono font-black text-white mt-0.5">{sampleDice.toFixed(2)}</div>
          </div>
          <div className="bg-[#0b101b] p-3.5 rounded-xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">European Roulette Pocket</div>
            <div className="text-lg font-mono font-black text-amber-400 mt-0.5">#{sampleRoulette}</div>
          </div>
        </div>
      </div>

      {/* Rotated Seed History */}
      {state.seedHistory && state.seedHistory.length > 0 && (
        <div className="bg-[#111927] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Revealed Server Seed History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b101b] text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Unhashed Server Seed</th>
                  <th className="py-3 px-4">Client Seed</th>
                  <th className="py-3 px-4">Bets</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {state.seedHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 text-emerald-400">{item.serverSeed}</td>
                    <td className="py-3 px-4 text-slate-300">{item.clientSeed}</td>
                    <td className="py-3 px-4 text-amber-400">#{item.totalBets}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setVerifyServerSeed(item.serverSeed);
                          setVerifyClientSeed(item.clientSeed);
                          setVerifyNonce(0);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-sans font-bold"
                      >
                        Load in Verifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};