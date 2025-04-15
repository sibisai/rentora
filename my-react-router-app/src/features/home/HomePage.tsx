import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/index.css';
import propertyImage from '../../assets/images/property.jpg';

export default function Home() {
  return (
    <div>
      <header>
        <div className="top-banner">
          <h1 className="title">[placeholder]</h1>
          <nav>
            <ul>
              <li><Link to="#" className="nav-link">History</Link></li>
              <li><Link to="#" className="nav-link">Contact</Link></li>
              <li><Link to="#" className="nav-link">Services</Link></li>
              <li><Link to="#" className="nav-link">Browse</Link></li>
              <li><Link to="/login" className="login-button">Login</Link></li>
            </ul>
          </nav>
        </div>

        {/* <div className="search-bar">
          <input type="text" placeholder="Search for places..." />
        </div> */}
      </header>

      <main>
  <div className="hero">
    <div className="hero-overlay">
      <h2>Your Perfect Stay</h2>
      <div className="button-links">
        <Link to="/account" className="nav-button">Account</Link>
        <Link to="/cart" className="nav-button">Cart</Link>
        <Link to="/property-details" className="nav-button">Property Details</Link>
        <Link to="/search" className="nav-button">Search</Link>
      </div>
    </div>
  </div>

  <section className="property-section">
  <h2>Browse your spots</h2>
  <div className="property-grid">
  {[...Array(20)].map((_, i) => (
  <div key={i} className="property-card">
    <img src={propertyImage} alt={`Property ${i}`} />
    <div className="property-info">
      <h3>City Name, State</h3>
      <p>Mountain and garden views</p>
      <p className="price">
  <span className="price-amount">${(500 + i * 50).toLocaleString()}</span> per 5 nights
</p>
    </div>
  </div>
))}
</div>
</section>

</main>

    </div>
  );
}
