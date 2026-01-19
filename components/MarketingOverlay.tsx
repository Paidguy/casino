import React, { useState, useEffect } from 'react';
import { audio } from '../services/audio';
import { engine } from '../services/engine';

export const MarketingOverlay = () => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showRakebackBar, setShowRakebackBar] = useState(true);
    const [systemGlitch, setSystemGlitch] = useState<'NONE' | 'ERROR' | 'RESOLVED'>('NONE');
    const [rakebackAmount, setRakebackAmount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const seen = localStorage.getItem('stake_welcome_v1');
            if (!seen) {
                setShowWelcome(true);
                audio.playWin(); 
            }
        }, 2000);

        const glitchTimer = setInterval(() => {
            if (Math.random() > 0.95) {
                setSystemGlitch('ERROR');
                audio.playLoss();
                setTimeout(() => {
                    setSystemGlitch('RESOLVED');
                    audio.playWin();
                    setTimeout(() => setSystemGlitch('NONE'), 4000);
                }, 3000);
            }
        }, 60000);

        const rakebackInterval = setInterval(() => {
            setRakebackAmount(engine.getSession().rakebackBalance);
        }, 1000);

        return () => { clearTimeout(timer); clearInterval(glitchTimer); clearInterval(rakebackInterval); }
    }, []);

    const closeWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem('stake_welcome_v1', 'true');
        audio.playClick();
    };

    const claimRakeback = () => {
        if (rakebackAmount <= 0) return;
        engine.claimRakeback();
        audio.playWin();
    };

    return (
        <>
            {systemGlitch !== 'NONE' && (
                <div className="fixed top-24 right-8 z-[200] w-80 lg:w-96 animate-fade-in">
                    {systemGlitch === 'ERROR' ? (
                        <div className="bg-rose-950/95 border-2 border-rose-500 p-6 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)] backdrop-blur-xl flex items-center gap-5">
                            <div className="animate-ping text-3xl">⚠</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic bazar-font">Server Load...</h4>
                                <p className="text-[10px] text-rose-200 font-bold opacity-80 uppercase tracking-widest">Matka Nodes Overloaded.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-950/95 border-2 border-bet-success p-6 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-center gap-5 cursor-pointer hover:scale-105 transition-transform">
                            <div className="text-3xl">💎</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic tracking-widest bazar-font">Dhamaka Reward</h4>
                                <p className="text-[9px] text-bet-success font-black uppercase tracking-tighter">Connection stable. Free chips added.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showRakebackBar && (
                <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-r from-bet-chakra via-bet-chakra to-bet- chakra p-3 flex flex-col md:flex-row items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10">
                    <div className="flex items-center gap-4 px-4 lg:px-10 mb-2 md:mb-0">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/5 rounded-full flex items-center justify-center text-lg animate-bounce">🎁</div>
                         <div className="flex flex-col">
                            <span className="font-black text-white text-sm lg:text-lg italic uppercase -skew-x-12 leading-none bazar-font">PUNTER RAKEBACK DHAMAKA</span>
                            <span className="text-[7px] lg:text-[8px] font-black text-white/40 uppercase tracking-widest">Wager credits to build your instant cashback</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-8 px-4 lg:px-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase">Pending:</span>
                            <span className="text-lg lg:text-xl font-black text-bet-accent tabular-nums tracking-tighter">₹{rakebackAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={claimRakeback} 
                            disabled={rakebackAmount <= 0}
                            className={`px-8 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${rakebackAmount > 0 ? 'bg-bet-accent text-black hover:scale-110 active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                        >
                            Claim
                        </button>
                        <button onClick={() => setShowRakebackBar(false)} className="text-white/20 hover:text-white transition-colors font-black text-sm ml-2">✕</button>
                    </div>
                </div>
            )}

            {showWelcome && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-bet-900 w-full max-w-xl rounded-[3rem] lg:rounded-[4rem] border-2 border-bet-saffron shadow-[0_0_150px_rgba(255,153,51,0.2)] relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-48 bg-gradient-to-b from-bet-saffron/20 to-transparent"></div>
                        <div className="p-10 lg:p-16 text-center relative z-10">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-bet-saffron to-bet-accent rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center mx-auto mb-8 lg:mb-10 text-4xl lg:text-5xl shadow-2xl animate-pulse rotate-12 transition-transform">
                                👑
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white italic mb-4 uppercase transform -skew-x-12 tracking-tighter bazar-font">
                                PUNTER'S <span className="text-bet-saffron">DHAMAKA</span>
                            </h2>
                            <p className="text-slate-400 mb-10 lg:mb-12 font-bold uppercase tracking-widest leading-relaxed opacity-80 text-xs lg:text-sm">
                                Swagat hai, Punter! Claim your <span className="text-bet-saffron">₹1,00,000</span> virtual Satta bonus <br/> and start dominating the Kalyan tables.
                            </p>
                            <div className="space-y-4">
                                <button onClick={closeWelcome} className="w-full py-5 lg:py-6 bg-bet-saffron text-black font-black text-xl rounded-[1.5rem] lg:rounded-[2rem] shadow-xl uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all bazar-font">
                                    Claim Now
                                </button>
                                <button onClick={() => setShowWelcome(false)} className="text-slate-700 text-[8px] lg:text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest mt-4">
                                    I am already a Satta King
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};