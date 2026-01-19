
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { engine } from '../services/engine';
import { audio } from '../services/audio';
import { GameType } from '../types';

export default function Crash() {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (gameState !== 'RUNNING') return;
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const seconds = elapsed / 1000;
    const newMultiplier = Math.pow(1.06, seconds);

    if (newMultiplier >= crashPoint) {
      setMultiplier(crashPoint);
      setGameState('CRASHED');
      audio.playLoss();
      engine.placeBet(GameType.CRASH, betAmount, () => ({ multiplier: 0, outcome: `Bust @ ${crashPoint.toFixed(2)}x` }));
      setHistory(prev => [crashPoint, ...prev].slice(0, 8));
    } else {
      setMultiplier(newMultiplier);
      drawCurve(newMultiplier);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const drawCurve = (m: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#00e701';
    ctx.moveTo(0, h);
    const endX = Math.min(w, (m - 1) * 200);
    const endY = h - Math.min(h, (m - 1) * 50);
    ctx.quadraticCurveTo(w / 2, h, endX, endY);
    ctx.stroke();
    // Head marker
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00e701';
  };

  useEffect(() => {
    if (gameState === 'RUNNING') requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, crashPoint]);

  const start = () => {
    if (betAmount > engine.getSession().balance || betAmount <= 0) return;
    audio.playBet();
    const point = engine.getCrashPoint(engine.peekNextRandom());
    setCrashPoint(point);
    setGameState('RUNNING');
    setMultiplier(1.00);
    startTimeRef.current = 0;
  };

  const cashOut = () => {
    if (gameState !== 'RUNNING') return;
    const finalMult = multiplier;
    setGameState('CASHED_OUT');
    audio.playWin();
    engine.placeBet(GameType.CRASH, betAmount, () => ({ multiplier: finalMult, outcome: `Win @ ${finalMult.toFixed(2)}x` }));
    setHistory(prev => [crashPoint, ...prev].slice(0, 8));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 bg-[#0f1116] p-6 rounded-3xl border border-white/5 flex flex-col gap-6 shadow-2xl shrink-0">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bet Amount (₹)</label>
          <div className="relative">
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-black border border-white/10 px-4 py-3 rounded-xl text-white font-mono font-black text-lg focus:border-casino-accent outline-none" disabled={gameState === 'RUNNING'} />
            <div className="absolute right-2 top-2 flex gap-1">
               <button onClick={() => setBetAmount(betAmount / 2)} className="bg-white/5 px-2 py-1 rounded text-[10px] font-black">1/2</button>
               <button onClick={() => setBetAmount(betAmount * 2)} className="bg-white/5 px-2 py-1 rounded text-[10px] font-black">2x</button>
            </div>
          </div>
          {gameState === 'RUNNING' ? (
            <button onClick={cashOut} className="w-full py-5 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all">Cashout (₹{(betAmount * multiplier).toFixed(2)})</button>
          ) : (
            <button onClick={start} className="w-full py-5 bg-casino-accent text-black font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-all">Play Matka</button>
          )}
          <div className="border-t border-white/5 pt-6 mt-auto">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Previous Draws</h4>
            <div className="flex flex-wrap gap-2">
               {history.map((h, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-black border ${h >= 2 ? 'text-casino-accent border-casino-accent/20 bg-casino-accent/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>{h.toFixed(2)}x</div>
               ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0f1116] rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] lg:min-h-[550px] shadow-inner p-10">
           <canvas ref={canvasRef} width={800} height={500} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />
           <div className={`text-6xl lg:text-9xl font-black tabular-nums transition-colors duration-300 ${gameState === 'CRASHED' ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
              {multiplier.toFixed(2)}x
           </div>
           {gameState === 'CRASHED' && <div className="text-xl lg:text-2xl font-black text-rose-500 uppercase tracking-[0.5em] mt-8 animate-bounce">Draw Busted!</div>}
           {gameState === 'CASHED_OUT' && <div className="text-xl lg:text-2xl font-black text-casino-accent uppercase tracking-[0.5em] mt-8 animate-bounce">Jackpot Won!</div>}
        </div>
      </div>
    </Layout>
  );
}
