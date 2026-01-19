import React, { useState, useEffect } from 'react';

const USERS = ['CryptoKing', 'Whale_007', 'SatoshiN', 'ElonM', 'DogeLover', 'MoonBoy', 'HODLer', 'LuckyStrike', 'BetGod', 'AnonUser'];
const GAMES = ['Plinko', 'Crash', 'Slots', 'Roulette', 'Blackjack'];
const MESSAGES = [
    "Rigged? I think not! 🤑",
    "Someone loan me 5k pls",
    "Just hit 1000x on Plinko!!!",
    "LFG!!!!",
    "Withdrawals are instant here, love it.",
    "Anyone want signals?",
    "RIP my balance lol",
    "Easy money today"
];

const TabButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${active ? 'bg-casino-800 text-white border-b-2 border-casino-accent' : 'bg-casino-900 text-slate-500 hover:text-slate-300'}`}
    >
        {label}
    </button>
);

export const LiveFeed = () => {
    const [tab, setTab] = useState<'BETS' | 'CHAT'>('BETS');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        // Initial population
        setItems(Array(10).fill(null).map(() => generateItem(tab)));

        const interval = setInterval(() => {
            setItems(prev => [generateItem(tab), ...prev].slice(0, 20));
        }, tab === 'BETS' ? 800 : 3000);

        return () => clearInterval(interval);
    }, [tab]);

    const generateItem = (type: 'BETS' | 'CHAT') => {
        const user = USERS[Math.floor(Math.random() * USERS.length)] + Math.floor(Math.random() * 99);
        
        if (type === 'CHAT') {
            return {
                id: Math.random(),
                user,
                content: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                level: Math.floor(Math.random() * 100)
            };
        } else {
            const won = Math.random() > 0.5;
            const amount = Math.floor(Math.random() * 500) + 10;
            const mult = (Math.random() * 10 + 1).toFixed(2);
            return {
                id: Math.random(),
                user,
                game: GAMES[Math.floor(Math.random() * GAMES.length)],
                amount,
                mult,
                won
            };
        }
    };

    return (
        <div className="hidden xl:flex flex-col w-72 bg-casino-900 border-l border-casino-800 h-[calc(100vh-64px)] fixed right-0 top-16 z-40">
            <div className="flex border-b border-casino-800">
                <TabButton active={tab === 'BETS'} onClick={() => setTab('BETS')} label="High Rollers" />
                <TabButton active={tab === 'CHAT'} onClick={() => setTab('CHAT')} label="Global Chat" />
            </div>
            
            <div className="flex-1 overflow-y-hidden relative">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {items.map(item => (
                        <div key={item.id} className="animate-fade-in-down">
                            {tab === 'CHAT' ? (
                                <div className="text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-casino-700 text-xs px-1 rounded text-slate-300">{item.level}</span>
                                        <span className="font-bold text-slate-300">{item.user}</span>
                                    </div>
                                    <div className="text-slate-400 bg-casino-800 p-2 rounded-lg rounded-tl-none border border-casino-700">
                                        {item.content}
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex justify-between items-center p-2 rounded border ${item.won ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-casino-800 border-casino-700'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white">{item.game}</span>
                                        <span className="text-[10px] text-slate-500">{item.user}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono text-sm font-bold ${item.won ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {item.won ? `+${(item.amount * item.mult).toFixed(0)}` : `-${item.amount}`}
                                        </div>
                                        {item.won && <div className="text-[10px] text-emerald-600">{item.mult}x</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-casino-900 to-transparent pointer-events-none"></div>
            </div>

            {tab === 'CHAT' && (
                <div className="p-3 bg-casino-800 border-t border-casino-700">
                    <div className="relative">
                        <input type="text" placeholder="Type a message..." className="w-full bg-casino-900 border border-casino-700 rounded p-2 text-sm text-white focus:outline-none focus:border-casino-accent" />
                        <button className="absolute right-2 top-2 text-casino-accent hover:text-white">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};