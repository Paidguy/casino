import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Crash from './pages/Crash';
import Dice from './pages/Dice';
import Roulette from './pages/Roulette';
import Slots from './pages/Slots';
import Mines from './pages/Mines';
import Plinko from './pages/Plinko';
import Blackjack from './pages/Blackjack';
import Coinflip from './pages/Coinflip';
import Fairness from './pages/Fairness';
import TeenPatti from './pages/TeenPatti';
import Matka from './pages/Matka';
import Admin from './pages/Admin';
import Wheel from './pages/Wheel';
import Baccarat from './pages/Baccarat';
import Keno from './pages/Keno';
import Transactions from './pages/Transactions';
import Statistics from './pages/Statistics';
import { engine } from './services/engine';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Simple Error Boundary to catch render crashes (blank screens)
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleHardReset = () => {
      // Aggressive clear
      try {
          localStorage.clear();
          sessionStorage.clear();
      } catch(e) {}
      engine.hardReset();
      // Force reload ignoring cache
      window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6 text-center font-sans">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-black text-rose-500 mb-2 uppercase">System Malfunction</h1>
          <p className="text-slate-400 mb-8 max-w-md">The game engine encountered a critical data corruption. This usually happens when local data is outdated.</p>
          <button 
            onClick={this.handleHardReset}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Hard Reset & Repair
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/crash" element={<Crash />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/mines" element={<Mines />} />
          <Route path="/plinko" element={<Plinko />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/coinflip" element={<Coinflip />} />
          <Route path="/fairness" element={<Fairness />} />
          <Route path="/teenpatti" element={<TeenPatti />} />
          <Route path="/matka" element={<Matka />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/wheel" element={<Wheel />} />
          <Route path="/baccarat" element={<Baccarat />} />
          <Route path="/keno" element={<Keno />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;