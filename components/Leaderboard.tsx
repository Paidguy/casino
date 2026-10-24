import React, { useState, useEffect } from 'react';
import { engine, formatINR } from '../services/engine';
import { LeaderboardEntry, BetResult } from '../types';

const LIVE_PUNTERS = [
  { user: 'Vikram_MumbaiVIP', game: 'Aviator Crash', wager: 25000, mult: 4.85, won: true },
  { user: 'Raja_SattaKing', game: 'Kalyan Matka', wager: 5000, mult: 95.0, won: true },
  { user: 'Aarav_DelhiHigh', game: 'Mines Tijori', wager: 10000, mult: 3.12, won: true },
  { user: 'KalyanBoss_07', game: 'Teen Patti Royal', wager: 15000, mult: 5.0, won: true },
  { user: 'Kabir_PuneBookie', game: 'Plinko 1000x', wager: 2000, mult: 29.0, won: true },
  { user: 'Nawab_Lucknow', game: 'Andar Bahar', wager: 8000, mult: 2.0, won: true },
  { user: 'Rohit_Indore', game: 'Royal Roulette', wager: 4000, mult: 36.0, won: true },
];

export const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'LIVE_TICKER' | 'MY_BETS' | 'HIGH_ROLLERS'>('LIVE_TICKER');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myBets, setMyBets] = useState<BetResult[]>([]);
  const [liveFeedRows, setLiveFeedRows] = useState(LIVE_PUNTERS);

  useEffect(() => {
    const sync = () => {
      const s = engine.getSession();
      setMyBets(s.history || []);
      setLeaders(engine.getLeaderboard());
    };
    sync();
    const unsub = engine.subscribe(() => sync());

    const timer = setInterval(() => {
      const sample = LIVE_PUNTERS[Math.floor(Math.random() * LIVE_PUNTERS.length)];
      const stakes = [500, 1000, 2500, 5000, 10000, 25000];
      const wager = stakes[Math.floor(Math.random() * stakes.length)];
      const won = Math.random() > 0.38;
      const mult = won ? +(1.5 + Math.random() * 14).toFixed(2) : 0;
      setLiveFeedRows((prev) => [
        { ...sample, wager, mult, won },
        ...prev.slice(0, 9),
      ]);
    }, 2800);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="bg-[#0d1322] rounded-2xl border border-[#24324f] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-[#070b14] border-b border-[#24324f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#0d1322] p-1 rounded-xl border border-[#24324f] w-fit">
          <button
            onClick={() => setTab('LIVE_TICKER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'LIVE_TICKER' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Live Exchange Bets
          </button>
          <button
            onClick={() => setTab('MY_BETS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'MY_BETS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            My Khata Bets ({myBets.length})
          </button>
          <button
            onClick={() => setTab('HIGH_ROLLERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'HIGH_ROLLERS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Maharaja VIP Leaderboard
          </button>
        </div>
        <div className="text-xs text-[#94a3b8]">
          SHA-256 Verified Bookie Ledger · Instant INR Settlement
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {tab === 'LIVE_TICKER' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#24324f]">
              <tr>
                <th className="px-5 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Punter</th>
                <th className="px-4 py-3 font-semibold text-right">Lagaya (Stake)</th>
                <th className="px-4 py-3 font-semibold text-right">Bhav (Odds)</th>
                <th className="px-5 py-3 font-semibold text-right">Payout (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {liveFeedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#131c31]/60 transition-colors">
                  <td className="px-5 py-3 font-bold text-white">{row.game}</td>
                  <td className="px-4 py-3 text-[#94a3b8]">{row.user}</td>
                  <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                    {formatINR(row.wager)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#fbbf24] font-bold tabular-nums">
                    {row.mult.toFixed(2)}×
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-mono font-extrabold tabular-nums ${
                      row.won ? 'text-[#10b981]' : 'text-[#64748b]'
                    }`}
                  >
                    {row.won ? `+${formatINR(row.wager * row.mult)}` : formatINR(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === 'MY_BETS' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#24324f]">
              <tr>
                <th className="px-5 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Outcome</th>
                <th className="px-4 py-3 font-semibold text-right">Stake (INR)</th>
                <th className="px-4 py-3 font-semibold text-right">Multiplier</th>
                <th className="px-5 py-3 font-semibold text-right">Payout (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {myBets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#64748b]">
                    No bets placed in your Khata yet. Pick any game above to start playing!
                  </td>
                </tr>
              ) : (
                myBets.slice(0, 15).map((bet) => {
                  const won = bet.payoutAmount >= bet.betAmount && bet.payoutMultiplier > 0;
                  return (
                    <tr key={bet.id} className="hover:bg-[#131c31]/60 transition-colors">
                      <td className="px-5 py-3 font-bold text-white">{bet.gameType}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{bet.outcome}</td>
                      <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                        {formatINR(bet.betAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#fbbf24] font-bold tabular-nums">
                        {bet.payoutMultiplier.toFixed(2)}×
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-mono font-extrabold tabular-nums ${
                          won ? 'text-[#10b981]' : 'text-[#64748b]'
                        }`}
                      >
                        {won ? `+${formatINR(bet.payoutAmount)}` : formatINR(0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-[#24324f]">
              <tr>
                <th className="px-5 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Punter</th>
                <th className="px-4 py-3 font-semibold">Maharaja Tier</th>
                <th className="px-4 py-3 font-semibold text-right">Total Wagered</th>
                <th className="px-5 py-3 font-semibold text-right">Peak Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {leaders.map((entry, idx) => (
                <tr
                  key={entry.username}
                  className={`hover:bg-[#131c31]/60 ${entry.isPlayer ? 'bg-[#131c31]' : ''}`}
                >
                  <td className="px-5 py-3 font-mono font-bold text-[#fbbf24] tabular-nums">
                    #{idx + 1}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {entry.username} {entry.isPlayer && <span className="text-[#10b981] ml-1">(You)</span>}
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">{entry.vipTier}</td>
                  <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                    {formatINR(entry.wagered)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-[#10b981] tabular-nums">
                    {entry.maxMultiplier.toFixed(2)}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
