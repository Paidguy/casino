import React, { useState, useEffect } from 'react';

const USERS = ['Punter_King', 'Mumbai_Don', 'Tiger_Satta', 'Gully_Boss', 'Bazar_Master', 'Rohan_Punter', 'Suresh_Kalyan', 'Bhai_Mumbai', 'Amit_Satta', 'Gali_King'];
const GAMES = ['Kalyan', 'Udaan', 'Slots', 'Chakra', '3-Patti'];
const MESSAGES = [
    "Kalyan panna fix hai!",
    "Bhaari profit dhamaka! 💰",
    "Admin bhai leak number do!",
    "Punter power! 🚀",
    "Instant withdrawal done.",
    "Luck favor kar raha hai aaj.",
    "Loss cover game chalu hai.",
    "Best Matka site ever."
];

const TabButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all bazar-font ${active ? 'bg-bet-primary text-bet-950 shadow-inner' : 'bg-bet-950 text-slate-600 hover:text-slate-300'}`}
    >
        {label}
    </button>
);

export const LiveFeed = () => {
    const [tab, setTab] = useState<'BETS' | 'CHAT'>('BETS');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        setItems(Array(12).fill(null).map(() => generateItem(tab)));

        const interval = setInterval(() => {
            setItems(prev => [generateItem(tab), ...prev].slice(0, 20));
        }, tab === 'BETS' ? 1400 : 5000);

        return () => clearInterval(interval);
    }, [tab]);

    const generateItem = (type: 'BETS' | 'CHAT') => {
        const user = USERS[Math.floor(Math.random() * USERS.length)] + '_' + Math.floor(Math.random() * 999);
        
        if (type === 'CHAT') {
            return {
                id: Math.random(),
                user,
                content: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
                level: Math.floor(Math.random() * 99) + 1
            };
        } else {
            const won = Math.random() > 0.6;
            const amount = Math.floor(Math.random() * 8000) + 200;
            const mult = (Math.random() * 12 + 1).toFixed(1);
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
        <div className="flex flex-col h-full bg-bet-900 border-l border-white/10 w-full">
            {/* Header removed as it is handled by Layout container */}
            
            <div className="flex border-b border-white/10 shrink-0">
                <TabButton active={tab === 'BETS'} onClick={() => setTab('BETS')} label="Live Satta" />
                <TabButton active={tab === 'CHAT'} onClick={() => setTab('CHAT')} label="Punter Chat" />
            </div>
            
            <div className="flex-1 overflow-y-hidden relative">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 no-scrollbar pb-20">
                    {items.map(item => (
                        <div key={item.id} className="animate-fade-in">
                            {tab === 'CHAT' ? (
                                <div className="text-[11px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-bet-secondary text-[8px] px-1.5 py-0.5 rounded text-white font-black uppercase">Lvl {item.level}</span>
                                        <span className="font-black text-slate-300 bazar-font tracking-wider">{item.user}</span>
                                    </div>
                                    <div className="text-slate-400 bg-black/40 p-2.5 rounded-xl rounded-tl-none border border-white/5 font-bold leading-relaxed">
                                        {item.content}
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex justify-between items-center p-3 rounded-xl border transition-all ${item.won ? 'bg-bet-primary/5 border-bet-primary/20' : 'bg-bet-950 border-white/5 opacity-70'}`}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-black text-white uppercase bazar-font tracking-[0.1em]">{item.game}</span>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase">{item.user}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono text-[10px] font-black ${item.won ? 'text-bet-primary' : 'text-slate-500'}`}>
                                            {item.won ? `+₹${(item.amount * item.mult).toFixed(0)}` : `-₹${item.amount}`}
                                        </div>
                                        {item.won && <div className="text-[8px] text-bet-accent font-black uppercase tracking-widest">{item.mult}x</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bet-900 to-transparent pointer-events-none"></div>
            </div>

            {tab === 'CHAT' && (
                <div className="p-3 bg-bet-950/80 border-t border-white/10 backdrop-blur-xl shrink-0">
                    <div className="relative">
                        <input type="text" placeholder="Msg..." className="w-full bg-black border border-white/10 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-bet-primary transition-all placeholder:text-slate-700 font-bold" />
                        <button className="absolute right-3 top-2.5 text-bet-primary hover:text-white transition-colors">
                             <span className="text-xs">➤</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};