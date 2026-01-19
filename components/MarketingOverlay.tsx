
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

        // Simulated high-intensity "Bookie" glitches
        const glitchTimer = setInterval(() => {
            if (Math.random() > 0.9) {
                setSystemGlitch('ERROR');
                audio.playLoss();
                setTimeout(() => {
                    setSystemGlitch('RESOLVED');
                    audio.playWin();
                    setTimeout(() => setSystemGlitch('NONE'), 4000);
                }, 3000);
            }
        }, 45000);

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
        alert(`Claimed ₹${rakebackAmount.toFixed(2)} in VIP Rakeback!`);
    };

    return (
        <>
            {/* System Glitch Simulation */}
            {systemGlitch !== 'NONE' && (
                <div className="fixed top-24 right-8 z-[200] w-96 animate-fade-in-up">
                    {systemGlitch === 'ERROR' ? (
                        <div className="bg-rose-950/95 border-2 border-rose-500 p-6 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)] backdrop-blur-xl flex items-center gap-5">
                            <div className="animate-ping text-3xl">⚠</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic">Lagging Server...</h4>
                                <p className="text-xs text-rose-200 font-bold opacity-80">Synchronizing your bets with Matka API.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-950/95 border-2 border-[#00e701] p-6 rounded-3xl shadow-[0_0_50px_rgba(0,231,1,0.3)] backdrop-blur-xl flex items-center gap-5 cursor-pointer hover:scale-105 transition-transform">
                            <div className="text-3xl">💎</div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm italic tracking-widest">Network Stabilized</h4>
                                <p className="text-[10px] text-[#00e701] font-black uppercase tracking-tighter">Compensation Bonus added to balance.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sticky High-Conversion Rakeback Banner */}
            {showRakebackBar && (
                <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#00e701] via-emerald-400 to-[#00e701] p-3 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t-2 border-white/20">
                    <div className="flex items-center gap-6 px-10">
                         <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-xl animate-bounce">🎁</div>
                         <div className="flex flex-col">
                            <span className="font-black text-black text-lg italic uppercase -skew-x-12 leading-none">VIP RAKEBACK LIVE</span>
                            <span className="text-[9px] font-black text-black/60 uppercase tracking-widest">Wager credits to build your instant cashback</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-8 px-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-black/40 uppercase">Pending:</span>
                            <span className="text-xl font-black text-black tabular-nums tracking-tighter">₹{rakebackAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={claimRakeback} 
                            disabled={rakebackAmount <= 0}
                            className={`px-10 py-2.5 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${rakebackAmount > 0 ? 'bg-black text-[#00e701] hover:scale-110 active:scale-95' : 'bg-black/20 text-black/20 cursor-not-allowed'}`}
                        >
                            Claim
                        </button>
                        <button onClick={() => setShowRakebackBar(false)} className="text-black/30 hover:text-black transition-colors font-black text-xl ml-4">✕</button>
                    </div>
                </div>
            )}

            {/* Premium Welcome Bonus Modal */}
            {showWelcome && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-fade-in">
                    <div className="bg-[#0f1116] w-full max-w-xl rounded-[4rem] border-2 border-[#00e701] shadow-[0_0_150px_rgba(0,231,1,0.2)] relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-48 bg-gradient-to-b from-[#00e701]/20 to-transparent"></div>
                        <div className="p-16 text-center relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-2xl animate-pulse rotate-12 group-hover:rotate-0 transition-transform">
                                👑
                            </div>
                            <h2 className="text-5xl font-black text-white italic mb-4 uppercase transform -skew-x-12 tracking-tighter">
                                PUNTER'S <span className="text-[#00e701]">REWARD</span>
                            </h2>
                            <p className="text-slate-400 mb-12 font-bold uppercase tracking-widest leading-relaxed opacity-80">
                                Claim your <span className="text-[#00e701]">₹1,00,000</span> virtual onboarding <br/> bonus to dominate the Matka tables today.
                            </p>
                            <div className="space-y-4">
                                <button onClick={closeWelcome} className="w-full py-6 bg-[#00e701] text-black font-black text-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,231,1,0.3)] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all">
                                    Claim ₹1 Lakh
                                </button>
                                <button onClick={() => setShowWelcome(false)} className="text-slate-700 text-[10px] font-black hover:text-white transition-colors uppercase tracking-widest mt-4">
                                    Dismiss (I have too much money)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
