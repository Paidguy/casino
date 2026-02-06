import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAutoBetOptions {
  betAmount: number;
  onBet: () => void;
  gameState: string;
  idleState?: string;
  delayMs?: number;
}

interface UseAutoBetReturn {
  mode: 'MANUAL' | 'AUTO';
  setMode: (mode: 'MANUAL' | 'AUTO') => void;
  autoActive: boolean;
  setAutoActive: (active: boolean) => void;
  autoBetCount: number;
  setAutoBetCount: (count: number) => void;
  autoCashOutAt: number;
  setAutoCashOutAt: (amount: number) => void;
  autoBetsRemaining: number;
  setAutoBetsRemaining: (remaining: number) => void;
  toggleAuto: () => void;
}

/**
 * Custom hook for managing auto-bet functionality across games
 * Provides consistent auto-bet behavior with proper state management
 */
export function useAutoBet({
  betAmount,
  onBet,
  gameState,
  idleState = 'IDLE',
  delayMs = 2000
}: UseAutoBetOptions): UseAutoBetReturn {
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [autoActive, setAutoActive] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoCashOutAt, setAutoCashOutAt] = useState<number>(2.00);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(0);

  // Ref to track state for auto-bet logic without triggering re-renders
  const autoStateRef = useRef({ 
    active: false, 
    count: 0, 
    remaining: 0 
  });

  // Sync ref with state
  useEffect(() => {
    autoStateRef.current = { 
      active: autoActive, 
      count: autoBetCount, 
      remaining: autoBetsRemaining 
    };
  }, [autoActive, autoBetCount, autoBetsRemaining]);

  // Auto-bet loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (autoActive && gameState === idleState) {
      const { count, remaining } = autoStateRef.current;
      
      // Continue if infinite (count === 0) or has remaining bets
      if (count === 0 || remaining > 0) {
        timeout = setTimeout(() => {
          onBet();
          if (count > 0) {
            setAutoBetsRemaining(prev => prev - 1);
          }
        }, delayMs);
      } else {
        // Stop when no more bets remaining
        setAutoActive(false);
      }
    }

    return () => clearTimeout(timeout);
  }, [gameState, autoActive, onBet, idleState, delayMs]);

  // Toggle auto-bet mode
  const toggleAuto = useCallback(() => {
    if (autoActive) {
      setAutoActive(false);
    } else {
      // Initialize remaining bets (999999 for infinite)
      setAutoBetsRemaining(autoBetCount === 0 ? 999999 : autoBetCount);
      setAutoActive(true);
    }
  }, [autoActive, autoBetCount]);

  return {
    mode,
    setMode,
    autoActive,
    setAutoActive,
    autoBetCount,
    setAutoBetCount,
    autoCashOutAt,
    setAutoCashOutAt,
    autoBetsRemaining,
    setAutoBetsRemaining,
    toggleAuto
  };
}
