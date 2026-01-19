import React, { useState, useEffect } from 'react';

const USERS = ['SattaMaster_01', 'Mumbai_Don', 'Kalyan_Tiger', 'Gali_King', 'Bazar_Specialist', 'Punter_Rohan', 'Lucky_Suresh', 'Bhai_786', 'Jackpot_Amit', 'Gully_Boy'];
const GAMES = ['Kalyan', 'Udaan', 'Slots', 'Chakra', 'Teen Patti'];
const MESSAGES = [
    "Kalyan ki panna dikhao bhai!",
    "Bazar Dhamaka! 💰",
    "1000x jackpot lag gaya!",
    "LFG Punter Team! 🚀",
    "Instant withdrawal node working great.",
    "Bhai signals hai kya?",
    "Aaj luck saath nahi hai...",
    "Easy Matka win today!"
];

const TabButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-colors bazar-font ${active ? 'bg-bet-800 text-white border-b-2 border-bet-accent' : 'bg-bet-900 text-slate-600 hover:text-slate-300'}`}
    >
        {label}
    </button>
);

export const LiveFeed = () => {
    const [tab, setTab] = useState<'BETS' | 'CHAT'>('BETS');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        setItems(Array(10).fill(null).map(() => generateItem(tab)));

        const interval = setInterval(() => {
            setItems(prev => [generateItem(tab), ...prev].slice(0, 20));
        }, tab === 'BETS' ? 1200 : 4000);

        return () => clearInterval(interval);
    }, [tab]);

    const generateItem = (type: 'BETS' | 'CHAT') => {
        const user = USERS[Math.floor(Math.random() * USERS.length)] + '_' + Math.floor(Math.random() * 99);
        
        if (type === 'CHAT') {
            return {
                id: Math.random(),
                user,
                content: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                level: Math.floor(Math.random() * 50) + 1
            };
        } else {
            const won = Math.random() > 0.65;
            const amount = Math.floor(Math.random() * 5000) + 100;
            const mult = (Math.random() * 8 + 1).toFixed(1);
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
        <div className="hidden lg:flex flex-col w-72 bg-bet-900 border-l border-white/5 h-screen fixed right-0 top-0 z-40">
            <div className="h-16 lg:h-20 flex items-center px-6 border-b border-white/5 bg-black/20">
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic bazar-font">Bazar Live Board</span>
            </div>
            
            <div className="flex border-b border-white/5">
                <TabButton active={tab === 'BETS'} onClick={() => setTab('BETS')} label="Satta Feed" />
                <TabButton active={tab === 'CHAT'} onClick={() => setTab('CHAT')} label="Punter Chat" />
            </div>
            
            <div className="flex-1 overflow-y-hidden relative">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 custom-scrollbar no-scrollbar">
                    {items.map(item => (
                        <div key={item.id} className="animate-fade-in">
                            {tab === 'CHAT' ? (
                                <div className="text-[11px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-bet-chakra text-[8px] px-1 py-0.5 rounded text-white font-black uppercase">Lvl {item.level}</span>
                                        <span className="font-black text-slate-300 bazar-font tracking-wide">{item.user}</span>
                                    </div>
                                    <div className="text-slate-400 bg-black/30 p-2.5 rounded-xl rounded-tl-none border border-white/5 font-medium">
                                        {item.content}
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${item.won ? 'bg-bet-saffron/5 border-bet-saffron/20' : 'bg-black/20 border-white/5'}`}>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white uppercase bazar-font tracking-wider">{item.game}</span>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase">{item.user}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono text-[10px] font-black ${item.won ? 'text-bet-success' : 'text-slate-600'}`}>
                                            {item.won ? `+₹${(item.amount * item.mult).toFixed(0)}` : `-₹${item.amount}`}
                                        </div>
                                        {item.won && <div className="text-[7px] text-bet-accent font-black uppercase tracking-tighter">{item.mult}x Hit</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bet-900 to-transparent pointer-events-none"></div>
            </div>

            {tab === 'CHAT' && (
                <div className="p-4 bg-black/40 border-t border-white/5">
                    <div className="relative">
                        <input type="text" placeholder="Apna msg likho..." className="w-full bg-black border border-white/10 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-bet-saffron transition-all placeholder:text-slate-700 font-bold" />
                        <button className="absolute right-3 top-2.5 text-bet-saffron hover:text-white transition-colors">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};