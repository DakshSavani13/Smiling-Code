import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code2, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isRoom = location.pathname.startsWith('/room/');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isRoom) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Code2 size={18} />
          </div>
          <span>Smiling Code</span>
        </Link>

        {/* Nav links */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <div className="navbar-avatar" style={{ background: user.avatarColor }}>
                {user.username[0].toUpperCase()}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}>
                <LogIn size={15} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={14} /> Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
