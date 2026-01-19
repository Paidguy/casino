import React, { useState, useEffect } from 'react';
import { audio } from '../services/audio';

export const MarketingOverlay = () => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [systemGlitch, setSystemGlitch] = useState<'NONE' | 'ERROR' | 'RESOLVED'>('NONE');

    useEffect(() => {
        const timer = setTimeout(() => {
            const seen = localStorage.getItem('stake_welcome_v1');
            if (!seen) {
                setShowWelcome(true);
                audio.playWin(); 
            }
        }, 1500);

        const glitchTimer = setInterval(() => {
            if (Math.random() > 0.96) {
                setSystemGlitch('ERROR');
                audio.playLoss();
                setTimeout(() => {
                    setSystemGlitch('RESOLVED');
                    audio.playWin();
                    setTimeout(() => setSystemGlitch('NONE'), 3000);
                }, 2500);
            }
        }, 50000);

        return () => { clearTimeout(timer); clearInterval(glitchTimer); }
    }, []);

    const closeWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem('stake_welcome_v1', 'true');
        audio.playClick();
    };

    return (
        <>
            {/* System Status Alerts */}
            {systemGlitch !== 'NONE' && (
                <div className="fixed top-28 right-8 z-[200] w-80 lg:w-96 animate-fade-in">
                    {systemGlitch === 'ERROR' ? (
                        <div className="bg-rose-950/95 border-2 border-bet-danger p-6 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.4)] backdrop-blur-3xl flex items-center gap-5">
                            <div className="animate-ping text-3xl">🚫</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic bazar-font">Node Jammed</h4>
                                <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">Market load high. Please wait.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-950/95 border-2 border-bet-success p-6 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.4)] backdrop-blur-3xl flex items-center gap-5 cursor-pointer">
                            <div className="text-3xl">✅</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic bazar-font tracking-widest">All Clear</h4>
                                <p className="text-[10px] text-bet-success font-black uppercase tracking-widest">Bazar connection stable. Play on.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Welcome Punter Modal */}
            {showWelcome && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-bet-900 w-full max-w-2xl rounded-[4rem] border-2 border-bet-primary shadow-[0_0_120px_rgba(34,211,238,0.25)] relative overflow-hidden">
                        <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-bet-primary/15 to-transparent"></div>
                        <div className="p-14 lg:p-20 text-center relative z-10">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-bet-primary to-bet-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-5xl lg:text-7xl shadow-2xl animate-pulse cyan-glow">
                                🏮
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-white italic mb-6 uppercase transform -skew-x-12 tracking-tighter bazar-font leading-none">
                                NAMASTE <span className="text-bet-primary">PUNTER!</span>
                            </h2>
                            <p className="text-slate-300 mb-12 font-bold uppercase tracking-[0.15em] leading-relaxed opacity-90 text-sm lg:text-lg">
                                Ready for Bhaari Profit? Your <span className="text-bet-primary">₹1,00,000</span> virtual Satta bonus <br/> is waiting. Kalyan draw starts soon!
                            </p>
                            <div className="space-y-5">
                                <button onClick={closeWelcome} className="w-full py-7 lg:py-10 bg-bet-primary text-bet-950 font-black text-2xl lg:text-4xl rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bazar-font cyan-glow">
                                    Start Playing
                                </button>
                                <button onClick={() => setShowWelcome(false)} className="text-slate-600 text-[11px] lg:text-[13px] font-black hover:text-white transition-colors uppercase tracking-widest mt-6">
                                    Continue as Satta Expert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};