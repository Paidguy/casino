import React, { useState, useEffect } from 'react';
import { audio } from '../services/audio';

export const MarketingOverlay = () => {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [showSticky, setShowSticky] = useState(true);
    const [systemGlitch, setSystemGlitch] = useState<'NONE' | 'ERROR' | 'RESOLVED'>('NONE');

    useEffect(() => {
        const timer = setTimeout(() => {
            const seen = localStorage.getItem('welcome_seen');
            if (!seen) {
                setShowWelcome(true);
                audio.playWin(); 
            }
        }, 1500);

        // Random "System Error" dark pattern
        const glitchTimer = setTimeout(() => {
             setSystemGlitch('ERROR');
             audio.playLoss(); // Alarming sound
             setTimeout(() => {
                 setSystemGlitch('RESOLVED');
                 audio.playWin(); // Relief sound
             }, 3000);
        }, 15000 + Math.random() * 20000); // Happens between 15-35s

        return () => { clearTimeout(timer); clearTimeout(glitchTimer); }
    }, []);

    const closeWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem('welcome_seen', 'true');
        setShowDeposit(true);
    };

    return (
        <>
            {/* System Glitch Notification */}
            {systemGlitch !== 'NONE' && (
                <div className="fixed top-20 right-4 z-[200] w-80 animate-slide-in-right">
                    {systemGlitch === 'ERROR' ? (
                        <div className="bg-rose-900/90 border-l-4 border-rose-500 p-4 rounded shadow-2xl backdrop-blur flex items-start gap-3">
                            <div className="animate-pulse text-2xl">⚠</div>
                            <div>
                                <h4 className="font-bold text-white uppercase text-sm">Network Interruption</h4>
                                <p className="text-xs text-rose-200">Reconnecting to game server...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-900/90 border-l-4 border-emerald-500 p-4 rounded shadow-2xl backdrop-blur flex items-start gap-3 cursor-pointer" onClick={() => setShowDeposit(true)}>
                            <div className="text-2xl">💎</div>
                            <div>
                                <h4 className="font-bold text-white uppercase text-sm">Connection Restored</h4>
                                <p className="text-xs text-emerald-200">Apology Bonus Available: <span className="font-bold underline">Claim Now</span></p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sticky Footer Rakeback */}
            {showSticky && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-2 flex items-center justify-between shadow-2xl border-t border-indigo-400">
                    <div className="flex items-center gap-2 px-4 animate-pulse">
                         <span className="text-xl">🎁</span>
                         <span className="font-bold text-white text-sm md:text-base uppercase tracking-wider">
                             Claim your daily 15% Rakeback now!
                         </span>
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <div className="hidden md:block text-xs text-indigo-200 font-mono">Ends in 04:23:12</div>
                        <button onClick={() => setShowDeposit(true)} className="bg-white text-indigo-700 font-black px-4 py-1 rounded shadow-lg hover:bg-indigo-50 hover:scale-105 transition-transform text-xs md:text-sm uppercase">
                            Claim
                        </button>
                        <button onClick={() => setShowSticky(false)} className="text-white/50 hover:text-white">✕</button>
                    </div>
                </div>
            )}

            {/* Welcome Bonus Modal */}
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-casino-800 w-full max-w-md rounded-2xl border-2 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
                        <div className="p-8 text-center relative z-10">
                            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl animate-bounce">
                                🏆
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-2 uppercase transform -skew-x-6">
                                200% Deposit Bonus
                            </h2>
                            <p className="text-slate-300 mb-6">
                                Exclusive offer for new players! Deposit now and get up to <span className="text-yellow-400 font-bold">$5,000</span> in bonus credits.
                            </p>
                            <div className="space-y-3">
                                <button onClick={closeWelcome} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl shadow-lg uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                    Claim Offer
                                </button>
                                <button onClick={() => setShowWelcome(false)} className="text-slate-500 text-xs hover:text-white underline">
                                    No thanks, I hate free money
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fake Deposit Modal */}
            {showDeposit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-casino-800 w-full max-w-lg rounded-xl border border-casino-700 shadow-2xl">
                         <div className="flex justify-between items-center p-6 border-b border-casino-700 bg-casino-900/50">
                             <h3 className="text-xl font-bold text-white">Wallet</h3>
                             <button onClick={() => setShowDeposit(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
                         </div>
                         <div className="p-6">
                             <div className="grid grid-cols-3 gap-2 mb-6">
                                 <button className="bg-casino-700 text-white py-2 rounded border border-casino-accent">Crypto</button>
                                 <button className="bg-casino-900 text-slate-500 py-2 rounded border border-casino-700">Fiat</button>
                                 <button className="bg-casino-900 text-slate-500 py-2 rounded border border-casino-700">NFTs</button>
                             </div>
                             
                             <div className="bg-casino-900 p-4 rounded-lg border border-casino-700 mb-6 text-center">
                                 <div className="w-48 h-48 bg-white mx-auto mb-4 p-2 rounded">
                                     {/* Fake QR */}
                                     <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LossLimitSimulation')] bg-contain bg-no-repeat bg-center"></div>
                                 </div>
                                 <div className="bg-casino-800 p-2 rounded text-xs font-mono text-slate-400 break-all border border-casino-700 cursor-pointer hover:text-white hover:border-casino-accent" onClick={() => audio.playClick()}>
                                     0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                                 </div>
                                 <p className="text-xs text-rose-400 mt-2 font-bold">⚠ Send only BTC to this address. Credits arrive after 1 confirmation.</p>
                             </div>
                             
                             <button onClick={() => setShowDeposit(false)} className="w-full py-3 bg-casino-accent hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg">
                                 I have made the transfer
                             </button>
                         </div>
                    </div>
                </div>
            )}
        </>
    );
};