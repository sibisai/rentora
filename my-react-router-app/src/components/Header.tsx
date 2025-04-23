import React from "react";
import { Link } from "react-router-dom";
import "../styles/index.css";
import "./header.css";

const Header: React.FC = () => {
  const userEmail = localStorage.getItem("userEmail");
  const isLoggedIn = Boolean(userEmail);
  const initial = userEmail?.charAt(0).toUpperCase() || "";

  return (
    <header className="header">
      <div className="top-banner">
        {/* Logo Button */}
        <div className="logo-container">
          <Link to="/" className="logo button2">Homiee</Link>
        </div>

        {/* Center Navigation */}
        <nav className="nav-container">
          <ul className="nav-list">
            <li><Link to="/account" className="nav-link">Account</Link></li>
            <li><Link to="/contact" className="nav-link">Contact</Link></li>
            <li><Link to="/services" className="nav-link">Services</Link></li>
            <li><Link to="/#browse" className="nav-link">Browse</Link></li>
            <li><Link to="/host/properties" className="nav-link">Host</Link></li>
          </ul>
        </nav>

        {/* Right Side - Cart + Login or Avatar */}
        <div className="auth-container">
          <Link to="/cart" className="CartBtn">
            <span className="IconContainer">
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="rgb(17, 17, 17)" className="icon">
                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411.2c3 0 5.4 2.4 5.4 5.4V48c0 1.1-0.1 2.2-0.5 3.2L528 448c-4.4 22.4-24 38.4-47 38.4H144c-26.5 0-48-21.5-48-48V48H24C10.7 48 0 37.3 0 24z" />
              </svg>
            </span>
            <p className="text">Cart</p>
          </Link>

          {isLoggedIn ? (
            <div className="user-avatar">{initial}</div>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
