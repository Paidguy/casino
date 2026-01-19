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
        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all bazar-font ${active ? 'bg-bet-primary text-bet-950 shadow-inner' : 'bg-bet-950 text-slate-600 hover:text-slate-300'}`}
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
        <div className="hidden lg:flex flex-col w-80 bg-bet-900 border-l border-white/10 h-screen fixed right-0 top-0 z-40 shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
            <div className="h-16 lg:h-20 flex items-center px-8 border-b border-white/10 bg-bet-950/50">
                <span className="text-[12px] font-black text-bet-primary uppercase tracking-[0.3em] italic bazar-font drop-shadow-[0_0_8px_#22d3ee]">Live Bazar Board</span>
            </div>
            
            <div className="flex border-b border-white/10">
                <TabButton active={tab === 'BETS'} onClick={() => setTab('BETS')} label="Live Satta" />
                <TabButton active={tab === 'CHAT'} onClick={() => setTab('CHAT')} label="Punter Chat" />
            </div>
            
            <div className="flex-1 overflow-y-hidden relative">
                <div className="absolute inset-0 overflow-y-auto p-5 space-y-4 no-scrollbar">
                    {items.map(item => (
                        <div key={item.id} className="animate-fade-in">
                            {tab === 'CHAT' ? (
                                <div className="text-[12px]">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <span className="bg-bet-secondary text-[9px] px-1.5 py-0.5 rounded-lg text-white font-black uppercase shadow-lg">Lvl {item.level}</span>
                                        <span className="font-black text-slate-200 bazar-font tracking-widest">{item.user}</span>
                                    </div>
                                    <div className="text-slate-400 bg-black/40 p-3.5 rounded-2xl rounded-tl-none border border-white/10 font-bold leading-relaxed">
                                        {item.content}
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${item.won ? 'bg-bet-primary/5 border-bet-primary/30' : 'bg-bet-950 border-white/5 opacity-80'}`}>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white uppercase bazar-font tracking-[0.15em]">{item.game}</span>
                                        <span className="text-[9px] text-slate-600 font-bold uppercase">{item.user}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono text-[11px] font-black ${item.won ? 'text-bet-primary' : 'text-slate-500'}`}>
                                            {item.won ? `+₹${(item.amount * item.mult).toFixed(0)}` : `-₹${item.amount}`}
                                        </div>
                                        {item.won && <div className="text-[8px] text-bet-accent font-black uppercase tracking-widest mt-1">{item.mult}x Dhamaka</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bet-900 to-transparent pointer-events-none"></div>
            </div>

            {tab === 'CHAT' && (
                <div className="p-5 bg-bet-950/80 border-t border-white/10 backdrop-blur-xl">
                    <div className="relative">
                        <input type="text" placeholder="Apna msg likho punter..." className="w-full bg-black border border-white/10 rounded-[1.5rem] p-4 text-[11px] text-white focus:outline-none focus:border-bet-primary transition-all placeholder:text-slate-700 font-bold shadow-inner" />
                        <button className="absolute right-4 top-3.5 text-bet-primary hover:text-white transition-colors">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};