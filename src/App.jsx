import { useState } from 'react';
import LandingPage from './components/LandingPage';
import IkoyiInterface from './components/restaurants/IkoyiInterface';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'ikoyi'

  return (
    <div className="min-h-screen bg-bg-primary font-main text-text-primary">
      {currentView === 'landing' && (
        <LandingPage onSelect={(brand) => setCurrentView(brand)} />
      )}

      {currentView === 'ikoyi' && (
        <div className="animate-[fadeSlideIn_0.5s_ease-out] w-full min-h-screen pt-[50px] pb-[50px]">
          <IkoyiInterface onBack={() => setCurrentView('landing')} />
        </div>
      )}
    </div>
  );
}

export default App;
