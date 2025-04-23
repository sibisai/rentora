import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/index.css';
import propertyImage from '../../assets/images/property.jpg';
import SearchBar, { type SearchParams } from '../search/components/SearchBar';
import Header from '../../components/Header';


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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('http://localhost:3001/properties');
        if (!res.ok) throw new Error('Failed to fetch properties');
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

  const handleSearch = (params: SearchParams) => {
    console.log('Search submitted:', params);
    // Optional: filter `properties` here in the future
  };

  return (
    <div>
      <main>
      <div className="hero">
  <div className="hero-overlay">
    <div className="button-links">
      <button 
        className="cssbuttons-io"
        onClick={() => setShowSearch(prev => !prev)}
      >
        <span>
          Start Your Search
          <svg viewBox="0 0 19.9 19.7" xmlns="http://www.w3.org/2000/svg" className="svg-icon search-icon">
            <title>Search Icon</title>
            <desc>A magnifying glass icon.</desc>
            <g stroke="white" fill="none">
              <path d="M18.5 18.3l-5.4-5.4" strokeLinecap="square" />
              <circle r="7" cy="8" cx="8" />
            </g>
          </svg>
        </span>
      </button>
    </div>

    {/* Put animated search bar here */}
    <div className={`search-toggle-wrapper ${showSearch ? 'open' : ''}`}>
      <div className="search-toggle-inner">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  </div>
</div>


  
        <section id="browse" className="property-section">
          <h2>Browse your spots</h2>
          {loading ? (
            <p>Loading properties...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <Link
                  to={`/property-details/${property._id}`}
                  key={property._id}
                  className="property-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
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
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );  
};

export default Home;
