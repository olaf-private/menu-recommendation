import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { MapPin, List, History, LogIn, LogOut } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { loginAnonymously, logout } from './services/authService';
import './styles/index.css';

import MapView from './components/MapView';
import HistoryPage from './pages/HistoryPage';

// Simple Navigation Component
const BottomNav = ({ user }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 40px)',
      maxWidth: '560px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.8rem 1rem',
      zIndex: 100
    }}>
      <Link to="/" style={{ color: isActive('/') ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
        <MapPin size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>지도</span>
      </Link>
      <Link to="/history" style={{ color: isActive('/history') ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
        <History size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>방문기록</span>
      </Link>
      <Link to="/mylist" style={{ color: isActive('/mylist') ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
        <List size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>찜한목록</span>
      </Link>

      {user ? (
        <button onClick={logout} style={{ color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <LogOut size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>로그아웃</span>
        </button>
      ) : (
        <button onClick={loginAnonymously} style={{ color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <LogIn size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>시작하기</span>
        </button>
      )}
    </nav>
  );
};

const Home = ({ user }) => (
  <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
    <MapView user={user} />

    {/* Header removed and moved to MapView for unified layout */}

    {/* Version Footer - High Visibility Mode */}
    <div style={{
      position: 'absolute',
      bottom: '100px', // Raised above nav
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      pointerEvents: 'none',
      opacity: 0.8
    }}>
      <span style={{
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        fontFamily: 'monospace'
      }}>
        v{__APP_VERSION__}
      </span>
    </div>
  </div>
);

import MyListPage from './pages/MyListPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#fff' }}>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/history" element={<HistoryPage user={user} />} />
        <Route path="/mylist" element={<MyListPage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav user={user} />
    </Router>
  );
}

export default App;
