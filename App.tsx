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

const App: React.FC = () => {
  return (
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
      </Routes>
    </HashRouter>
  );
};

export default App;