import React, { useState, useEffect } from 'react';
import { engine, formatINR } from '../services/engine';
import { audio } from '../services/audio';
import { Send } from 'lucide-react';

const USERS = [
  'Vikram_Mumbai',
  'Rohan_Bengaluru',
  'Aarav_Delhi',
  'Karan_Hyderabad',
  'Kabir_Pune',
  'Aditya_Jaipur',
  'Rohit_Indore',
  'Suresh_Surat',
  'Deepak_Chennai',
];

const GAMES = [
  'Aviator Crash',
  'Gold Mines',
  'Plinko 1000x',
  'European Roulette',
  'Teen Patti Poker',
  'Andar Bahar',
  'Kalyan Matka',
];

const SAMPLE_MESSAGES = [
  'Just cashed out Aviator at 18.5x for ₹45,000!',
  'Gold Mines 3-bomb setup is hitting cleanly today.',
  'Instant UPI withdrawal arrived in my HDFC account in 30 seconds.',
  'Hit Three of a Kind in Teen Patti for a 5x bonus payout!',
  'Andar Bahar matched on the 3rd card, smooth double up.',
  'Plinko 16-row High Risk just dropped into the 130x bucket!',
];

const QUICK_REACTIONS = [
  '🔥 Big Win!',
  '💰 Instant Cashout!',
  '🚀 10x Aviator!',
  '👑 Lucky Streak!',
];

export const LiveFeed: React.FC = () => {
  const [tab, setTab] = useState<'BETS' | 'CHAT'>('BETS');
  const [bets, setBets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const initialBets = Array.from({ length: 12 }, (_, idx) => createSimulatedBet(idx));
    setBets(initialBets);

    const initialMsgs = SAMPLE_MESSAGES.map((text, idx) => ({
      id: `msg_${idx}`,
      user: USERS[idx % USERS.length],
      content: text,
      time: 'Just now',
    }));
    setMessages(initialMsgs);

    let lastSeenBetId = engine.getSession().history[0]?.id;

    const unsub = engine.subscribe((s) => {
      const latest = s.history[0];
      if (latest && latest.id !== lastSeenBetId) {
        lastSeenBetId = latest.id;
        const won = latest.payoutAmount >= latest.betAmount && latest.payoutMultiplier > 0;
        setBets((prev) =>
          [
            {
              id: latest.id,
              user: `${s.username} (You)`,
              game: latest.gameType,
              wager: latest.betAmount,
              mult: latest.payoutMultiplier,
              payout: latest.payoutAmount,
              won,
              isSelf: true,
            },
            ...prev,
          ].slice(0, 22)
        );
      }
    });

    const interval = setInterval(() => {
      setBets((prev) => [createSimulatedBet(Date.now()), ...prev].slice(0, 22));
    }, 2200);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const createSimulatedBet = (seed: number) => {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const game = GAMES[Math.floor(Math.random() * GAMES.length)];
    const wager = [200, 500, 1000, 2500, 5000, 10000, 25000][Math.floor(Math.random() * 7)];
    const won = Math.random() > 0.42;
    const mult = won ? +(1.5 + Math.random() * 9.5).toFixed(2) : 0;
    return {
      id: `${seed}_${Math.random()}`,
      user,
      game,
      wager,
      mult,
      payout: +(wager * mult).toFixed(2),
      won,
    };
  };

  const postMessage = (text: string) => {
    if (!text.trim()) return;
    audio.playClick();
    const session = engine.getSession();
    setMessages((prev) => [
      {
        id: `user_${Date.now()}`,
        user: session.username,
        content: text.trim(),
        time: 'Now',
        isSelf: true,
      },
      ...prev,
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    postMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1322] w-full">
      <div className="grid grid-cols-2 gap-1 p-2 bg-[#070b14] border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setTab('BETS')}
          className={`py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
            tab === 'BETS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Live Bets
        </button>
        <button
          type="button"
          onClick={() => setTab('CHAT')}
          className={`py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
            tab === 'CHAT' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          VIP Chat ({messages.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {tab === 'BETS' ? (
          bets.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                item.isSelf
                  ? 'bg-[#131c31] border-[#f59e0b]/60'
                  : 'bg-[#131c31]/80 border-white/10'
              }`}
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{item.game}</div>
                <div className={`text-[11px] truncate ${item.isSelf ? 'text-[#fbbf24] font-bold' : 'text-[#94a3b8]'}`}>
                  {item.user}
                </div>
              </div>
              <div className="text-right font-mono tabular-nums shrink-0">
                <div className={item.won ? 'text-[#10b981] font-extrabold' : 'text-[#64748b]'}>
                  {item.won ? `+${formatINR(item.payout, 0)}` : `-${formatINR(item.wager, 0)}`}
                </div>
                <div className="text-[11px] text-[#fbbf24]">{item.mult.toFixed(2)}×</div>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-2.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-xl border text-xs ${
                  msg.isSelf
                    ? 'bg-[#131c31] border-[#f59e0b]/50'
                    : 'bg-[#131c31]/80 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${msg.isSelf ? 'text-[#fbbf24]' : 'text-white'}`}>
                    {msg.user}
                  </span>
                  <span className="text-[10px] text-[#64748b]">{msg.time}</span>
                </div>
                <p className="text-[#cbd5e1] leading-relaxed break-words">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {tab === 'CHAT' && (
        <div className="bg-[#070b14] border-t border-white/10 p-2.5 space-y-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_REACTIONS.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={() => postMessage(reaction)}
                className="px-2.5 py-1 rounded-lg bg-[#131c31] hover:bg-[#1d2a47] border border-white/10 text-[11px] font-bold text-[#fbbf24] whitespace-nowrap shrink-0"
              >
                {reaction}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Write a message to chat..."
              className="flex-1 bg-[#131c31] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#f59e0b]"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] rounded-xl flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};