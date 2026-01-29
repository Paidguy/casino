import React, { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

const WHEEL_SEGMENTS = [
  { label: '1.5x', multi: 1.5, color: '#3b82f6' },
  { label: '0x', multi: 0, color: '#1e293b' },
  { label: '2.0x', multi: 2, color: '#10b981' },
  { label: '0x', multi: 0, color: '#1e293b' },
  { label: '3.0x', multi: 3, color: '#facc15' },
  { label: '0x', multi: 0, color: '#1e293b' },
  { label: '1.5x', multi: 1.5, color: '#3b82f6' },
  { label: '0x', multi: 0, color: '#1e293b' },
  { label: '10.0x', multi: 10, color: '#ec4899' },
  { label: '0x', multi: 0, color: '#1e293b' },
];

export default function Wheel() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);

  const spin = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin();

    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const targetSeg = WHEEL_SEGMENTS[randomIndex];
    
    // Each segment is 36 degrees. Target is mid-segment.
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const extraSpins = 3600; // 10 full spins
    const targetAngle = 360 - (randomIndex * segmentAngle);
    const newRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(targetSeg);
      if (targetSeg.multi > 0) audio.playWin();
      else audio.playLoss();
      engine.placeBet(GameType.WHEEL, betAmount, targetSeg.multi, `Wheel landed on ${targetSeg.label}`);
    }, 4000);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8 lg:gap-12">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 text-3xl lg:text-4xl text-bet-accent drop-shadow-xl">▼</div>
           <div 
             className="w-full h-full rounded-full border-8 border-bet-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
             style={{ 
               transform: `rotate(${rotation}deg)`, 
               background: `conic-gradient(#3b82f6 0% 10%, #1e293b 10% 20%, #10b981 20% 30%, #1e293b 30% 40%, #facc15 40% 50%, #1e293b 50% 60%, #3b82f6 60% 70%, #1e293b 70% 80%, #ec4899 80% 90%, #1e293b 90% 100%)` 
             }}
           >
              {WHEEL_SEGMENTS.map((seg, i) => (
                <div key={i} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${i * 36 + 18}deg) translateY(-110px) lg:translateY(-120px)` }}>
                   <span className="text-white font-black text-[10px] lg:text-sm rotate-90">{seg.label}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-bet-900 w-full max-w-lg p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-white/5 space-y-6">
           <div className="text-center h-10 lg:h-12">
              {result && (
                <div className={`text-2xl lg:text-3xl font-black uppercase italic ${result.multi > 0 ? 'text-bet-success' : 'text-slate-500'}`}>
                  {result.multi > 0 ? `Won ₹${(betAmount * result.multi).toLocaleString()}!` : 'Bust'}
                </div>
              )}
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="number" value={betAmount} 
                onChange={e => setBetAmount(Number(e.target.value))} 
                disabled={spinning}
                className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl outline-none" 
              />
              <button onClick={spin} disabled={spinning} className="bg-bet-accent text-black px-12 py-4 rounded-xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Spin</button>
           </div>
        </div>
      </div>
    </Layout>
  );
}