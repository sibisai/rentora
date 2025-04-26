// src/components/NavBar.tsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth }         from '../features/auth/AuthContext';
import '../styles/index.css';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div className="top-banner">
        {/* logo / home */}
        <Link to="/" className="title">rentora</Link>

        {/* nav links */}
        <nav>
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/search">Browse</NavLink></li>
            {user && <li><NavLink to="/host/properties">My Listings</NavLink></li>}
          </ul>
        </nav>

        {/* auth controls */}
        {!user ? (
          <Link to="/login" className="login-button">
            Login
          </Link>
        ) : (
          <div className="auth-info">
            <span className="user-email">{user.email}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}