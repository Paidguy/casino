import React, { useState, useEffect } from 'react';
import { engine, formatINR } from '../services/engine';
import { Send } from 'lucide-react';

const USERS = [
  'Vikram_MumbaiVIP',
  'Raja_SattaKing',
  'Aarav_DelhiHigh',
  'KalyanBoss_07',
  'Kabir_PuneBookie',
  'Nawab_Lucknow',
  'Rohit_Indore',
  'Suresh_Surat',
  'Deepak_Jaipur',
];

const GAMES = [
  'Aviator Crash',
  'Kalyan Matka',
  'Mines Tijori',
  'Plinko 1000x',
  'Teen Patti Royal',
  'Andar Bahar',
  'Royal Roulette',
];

const SAMPLE_MESSAGES = [
  'Bhai Aviator 18.5x uda abhi! Cashout kiya ₹45,000!',
  'Kalyan Open 148-3 pass! Aaj Jodi 37 pakka hai.',
  'Mines 3-bomb setup pe lagatar 6 bar sona nikla.',
  'UPI withdrawal 30 second mein HDFC account mein aa gaya.',
  'Teen Patti mein Trail aaya 5x bhav mila!',
  'Andar Bahar mein Bahar pe ₹5,000 double ho gaya.',
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

    const interval = setInterval(() => {
      setBets((prev) => [createSimulatedBet(Date.now()), ...prev].slice(0, 20));
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const createSimulatedBet = (seed: number) => {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const game = GAMES[Math.floor(Math.random() * GAMES.length)];
    const wager = [200, 500, 1000, 2500, 5000, 10000, 25000][Math.floor(Math.random() * 7)];
    const won = Math.random() > 0.45;
    const mult = won ? +(1.5 + Math.random() * 8.5).toFixed(2) : 0;
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const session = engine.getSession();
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        user: session.username,
        content: chatInput.trim(),
        time: 'Now',
        isSelf: true,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1322] w-full">
      <div className="grid grid-cols-2 gap-1 p-2 bg-[#070b14] border-b border-[#24324f] shrink-0">
        <button
          onClick={() => setTab('BETS')}
          className={`py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
            tab === 'BETS' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Live Bookie Feed
        </button>
        <button
          onClick={() => setTab('CHAT')}
          className={`py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
            tab === 'CHAT' ? 'bg-[#f59e0b] text-[#070b14]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Punters Adda ({messages.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {tab === 'BETS' ? (
          bets.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#131c31] border border-[#24324f] text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{item.game}</div>
                <div className="text-[11px] text-[#94a3b8] truncate">{item.user}</div>
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
              <div key={msg.id} className="bg-[#131c31] p-2.5 rounded-xl border border-[#24324f] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${msg.isSelf ? 'text-[#fbbf24]' : 'text-white'}`}>
                    {msg.user}
                  </span>
                  <span className="text-[10px] text-[#64748b]">{msg.time}</span>
                </div>
                <p className="text-[#94a3b8] leading-relaxed break-words">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {tab === 'CHAT' && (
        <form onSubmit={handleSendChat} className="p-2.5 bg-[#070b14] border-t border-[#24324f] flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Share a tip in Punters Adda..."
            className="flex-1 bg-[#131c31] border border-[#24324f] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#f59e0b]"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] rounded-xl flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};