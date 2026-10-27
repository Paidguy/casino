import React, { useState, useEffect } from 'react';
import { engine, formatINR } from '../services/engine';
import { LeaderboardEntry, BetResult } from '../types';

const LIVE_PLAYERS = [
  { user: 'Vikram_Mumbai', game: 'Aviator Crash', wager: 25000, mult: 4.85, won: true },
  { user: 'Rohan_Bengaluru', game: 'Kalyan Matka', wager: 5000, mult: 95.0, won: true },
  { user: 'Aarav_Delhi', game: 'Gold Mines', wager: 10000, mult: 3.12, won: true },
  { user: 'Karan_Hyderabad', game: 'Teen Patti Poker', wager: 15000, mult: 5.0, won: true },
  { user: 'Kabir_Pune', game: 'Plinko 1000x', wager: 2000, mult: 29.0, won: true },
  { user: 'Aditya_Jaipur', game: 'Andar Bahar', wager: 8000, mult: 2.0, won: true },
  { user: 'Rohit_Indore', game: 'European Roulette', wager: 4000, mult: 36.0, won: true },
];

export const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'LIVE_TICKER' | 'MY_BETS' | 'HIGH_ROLLERS'>('LIVE_TICKER');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myBets, setMyBets] = useState<BetResult[]>([]);
  const [liveFeedRows, setLiveFeedRows] = useState(LIVE_PLAYERS);

  useEffect(() => {
    const sync = () => {
      const s = engine.getSession();
      setMyBets(s.history || []);
      setLeaders(engine.getLeaderboard());
    };
    sync();
    const unsub = engine.subscribe(() => sync());

    const timer = setInterval(() => {
      const sample = LIVE_PLAYERS[Math.floor(Math.random() * LIVE_PLAYERS.length)];
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
    <section className="bg-[#0d1322] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-[#070b14] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#0d1322] p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setTab('LIVE_TICKER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'LIVE_TICKER' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            All Live Bets
          </button>
          <button
            onClick={() => setTab('MY_BETS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'MY_BETS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            My Bets ({myBets.length})
          </button>
          <button
            onClick={() => setTab('HIGH_ROLLERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              tab === 'HIGH_ROLLERS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            VIP Leaderboard
          </button>
        </div>
        <div className="text-xs text-[#94a3b8]">
          SHA-256 Provably Fair · Instant INR Settlement
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {tab === 'LIVE_TICKER' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold text-right">Bet Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Multiplier</th>
                <th className="px-5 py-3 font-semibold text-right">Payout (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Outcome</th>
                <th className="px-4 py-3 font-semibold text-right">Bet Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Multiplier</th>
                <th className="px-5 py-3 font-semibold text-right">Payout (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myBets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#64748b]">
                    No bets placed yet. Select any game above to start playing!
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
            <thead className="bg-[#0d1322] text-[#94a3b8] border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold">VIP Tier</th>
                <th className="px-4 py-3 font-semibold text-right">Total Wagered</th>
                <th className="px-5 py-3 font-semibold text-right">Best Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
