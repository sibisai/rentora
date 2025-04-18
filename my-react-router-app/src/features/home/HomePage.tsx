import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/index.css';
import propertyImage from '../../assets/images/property.jpg';

interface Property {
  _id: string;
  title: string;
  description: string;
  location: {
    address?: string;
    city: string;
    state: string;
    zip?: string;
    country?: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  price: number;
  images?: string[];
  amenities?: string[];
  propertyType: string;
  rooms: number;
  hostId?: string;
  createdAt?: string;
  updatedAt?: string;
}

function formatLocation(location: Property["location"]): string {
  const { city, state, country } = location;
  const cityTrim = city.trim();
  const stateTrim = state.trim();
  // If the city and state are the same, then use the country (if available) or just the city.
  if (cityTrim.toLowerCase() === stateTrim.toLowerCase()) {
    if (country && country.trim().toLowerCase() !== cityTrim.toLowerCase()) {
      return `${cityTrim}, ${country}`;
    }
    return cityTrim;
  }
  return `${cityTrim}, ${stateTrim}`;
}

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Replace with your actual backend endpoint
        const res = await fetch('http://localhost:3001/properties'); 
        if (!res.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div>
      <header>
        <div className="top-banner">
          <h1 className="title">[placeholder]</h1>
          <nav>
            <ul>
              <li><Link to="#" className="nav-link">History</Link></li>
              <li><Link to="/contact" className="nav-link">Contact</Link></li>
              <li><Link to="#" className="nav-link">Services</Link></li>
              <li><Link to="#" className="nav-link">Browse</Link></li>
              <li><Link to="/login" className="login-button">Login</Link></li>
            </ul>
          </nav>
        </div>
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
          {loading ? (
            <p>Loading properties...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <div key={property._id} className="property-card">
                  <img 
                    src={property.images && property.images.length > 0 ? property.images[0] : propertyImage} 
                    alt={property.title}
                  />
                  <div className="property-info">
                    <h3>{formatLocation(property.location)}</h3>
                    <p>{property.description}</p>
                    <p className="price">
                      <span className="price-amount">${property.price.toLocaleString()}</span> per night
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;