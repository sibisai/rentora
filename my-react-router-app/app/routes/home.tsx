import React from 'react';
import { Link } from 'react-router-dom';
import '../app.css';

export default function Home() {
  return (
    <div>
      <header>
        <div className="top-banner">
          <h1 className="title">[placeholder]</h1>
          <nav>
            <ul>
              <li><a href="#">History</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Browse</a></li>
              <li><Link to="/login" className="login-button">Login</Link></li>
            </ul>
          </nav>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search for places..." />
        </div>
      </header>

      <main>
        <div className="hero">
          <div className="hero-overlay">
            <h2>[placeholder]</h2>
          </div>
        </div>
      </main>
    </div>
  );
}
