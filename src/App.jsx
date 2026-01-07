import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MapPin, List, History } from 'lucide-react';
import './styles/index.css';

import MapView from './components/MapView';

const Home = () => (
  <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
    <MapView />

    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      width: '90%',
      maxWidth: '500px'
    }}>
      <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '1.25rem', margin: 0 }}>Menu Recommendation</h1>
      </div>
    </div>
  </div>
);

const HistoryPage = () => <div className="container"><h2>History</h2></div>;
const MyList = () => <div className="container"><h2>My Favorite List</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation Bar - Mockup */}
      <nav className="glass-panel" style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '560px',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        zIndex: 100
      }}>
        <button style={{ color: 'var(--color-primary)' }}><MapPin /></button>
        <button style={{ color: 'var(--color-text-muted)' }}><History /></button>
        <button style={{ color: 'var(--color-text-muted)' }}><list /></button>
      </nav>
    </Router>
  );
}

export default App;
