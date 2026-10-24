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
import AndarBahar from './pages/AndarBahar';
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

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    engine.hardReset();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070b14] text-white p-6 text-center font-sans">
          <h1 className="text-3xl font-extrabold text-[#fbbf24] mb-2">Session Reset Required</h1>
          <p className="text-[#94a3b8] mb-6 max-w-md text-sm">
            Local session storage encountered an outdated schema. Click below to restore your ₹25,000 INR wallet.
          </p>
          <button
            onClick={this.handleHardReset}
            className="px-6 py-3 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#070b14] rounded-xl font-extrabold text-sm shadow-lg"
          >
            Repair & Restore ₹25,000 Wallet
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
          <Route path="/andarbahar" element={<AndarBahar />} />
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