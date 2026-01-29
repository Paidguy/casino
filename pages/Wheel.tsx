import React, { useState, useEffect, useRef } from 'react';
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

  // Auto Bet State
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);
  
  const autoRef = useRef({ active: false, count: 0, remaining: 0 });

  useEffect(() => {
    autoRef.current = { active: autoActive, count: autoBetCount, remaining: autoBetsRemaining };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  const spin = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) {
        if (autoRef.current.active) setAutoActive(false);
        return;
    }
    setSpinning(true);
    setResult(null);
    audio.playBet();
    audio.playSpin();

    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const targetSeg = WHEEL_SEGMENTS[randomIndex];
    
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetRotationForSegment = 360 - (randomIndex * segmentAngle);
    
    // For auto, we spin faster (2 rotations) vs 5 for manual
    const extraSpins = 360 * (mode === 'AUTO' ? 2 : 5);
    
    const currentRotationMod = rotation % 360;
    let diff = targetRotationForSegment - currentRotationMod;
    if (diff < 0) diff += 360;
    
    const newRotation = rotation + extraSpins + diff;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(targetSeg);
      if (targetSeg.multi > 0) audio.playWin();
      else audio.playLoss();
      engine.placeBet(GameType.WHEEL, betAmount, targetSeg.multi, `Wheel landed on ${targetSeg.label}`);
    }, mode === 'AUTO' ? 2000 : 4000);
  };

  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      // Only proceed if auto is active AND we are NOT spinning
      if (autoActive && !spinning) {
          const { count, remaining } = autoRef.current;
          
          if (engine.getSession().balance < betAmount) {
              setAutoActive(false);
              return;
          }

          if (count === 0 || remaining > 0) {
              timeout = setTimeout(() => {
                  spin();
                  if (count > 0) setAutoBetsRemaining(prev => prev - 1);
              }, 1000); // 1s wait after spin end
          } else {
              setAutoActive(false);
          }
      }
      return () => clearTimeout(timeout);
  }, [autoActive, spinning]);

  const toggleAuto = () => {
      if (autoActive) {
          setAutoActive(false);
      } else {
          setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
          setAutoActive(true);
          if (!spinning) spin(); 
      }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8 lg:gap-12">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 text-3xl lg:text-4xl text-bet-accent drop-shadow-xl">▼</div>
           <div 
             className={`w-full h-full rounded-full border-8 border-bet-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-transform cubic-bezier(0.15, 0, 0.15, 1)`}
             style={{ 
               transform: `rotate(${rotation}deg)`, 
               transitionDuration: mode === 'AUTO' ? '2000ms' : '4000ms',
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
           
           <div className="flex bg-black/40 p-1 rounded-xl">
              <button onClick={() => setMode('MANUAL')} disabled={autoActive} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'MANUAL' ? 'bg-bet-800 text-white shadow' : 'text-slate-500'}`}>Manual</button>
              <button onClick={() => setMode('AUTO')} disabled={autoActive} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${mode === 'AUTO' ? 'bg-bet-primary text-bet-950 shadow' : 'text-slate-500'}`}>Auto</button>
           </div>

           <div className="flex flex-col gap-4">
              <input 
                type="number" value={betAmount} 
                onChange={e => setBetAmount(Number(e.target.value))} 
                disabled={spinning || autoActive}
                className="flex-1 bg-black border border-white/10 p-4 rounded-xl text-white font-black text-xl outline-none" 
              />
              
              {mode === 'AUTO' && (
                 <input 
                    type="number" value={autoBetCount} placeholder="Spins (0=Inf)"
                    onChange={e => setAutoBetCount(Number(e.target.value))} 
                    disabled={autoActive}
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-black text-lg outline-none" 
                 />
              )}

              {!autoActive ? (
                <button onClick={spin} disabled={spinning} className="bg-bet-accent text-black px-12 py-4 rounded-xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Spin</button>
              ) : (
                <button onClick={toggleAuto} className="bg-bet-danger text-white px-12 py-4 rounded-xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">Stop Auto ({autoBetsRemaining === 999999 ? '∞' : autoBetsRemaining})</button>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
}