import React, { useState } from 'react';
import SearchBar, { type SearchParams } from './components/SearchBar';
import './SearchPage.css';

// --- Interfaces ---
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
      coordinates: [number, number]; // [longitude, latitude]
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
  const cityTrimmed = city.trim().toLowerCase();
  const stateTrimmed = state.trim().toLowerCase();
  
  if (cityTrimmed === stateTrimmed) {
    if (country) {
      const countryTrimmed = country.trim().toLowerCase();
      return countryTrimmed === cityTrimmed ? city : `${city}, ${country}`;
    }
    return city;
  }
  return `${city}, ${state}`;
}

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // --- handleSearch function ---
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    setActiveFilter('all');

    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => { 
      if (value !== undefined && value !== null && value !== '') { 
        acc[key] = value; 
      } 
      return acc; 
    }, {} as Record<string, any>);
    
    const query = new URLSearchParams(cleanParams).toString();
    console.log("Frontend sending query:", query);

    try {
      const res = await fetch(`http://localhost:3001/properties?${query}`);
      if (!res.ok) { throw new Error('Fetch failed'); }
      const data = await res.json();
      if (!Array.isArray(data)) { throw new Error('Invalid data'); }

      console.log("Data received:", data);
      setResults(data as Property[]);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on active filter
  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(property => property.propertyType === activeFilter);

  // Get unique property types for filter buttons
  const propertyTypes = ['all', ...new Set(results.map(property => property.propertyType))];

  // --- Main Render ---
  return (
    <div className="search-page-container">

      {/* Search Bar Section */}
      <section className="search-bar-container">
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Main Content Area (Results only) */}
      <main className="search-content">
        {/* Results Container */}
        <div className="results-container">
          <div className="results-header">
            <h2 className="results-title">
              {loading ? 'Searching...' : 
               error ? 'Error' :
               filteredResults.length > 0 ? `${filteredResults.length} Properties Found` : 'No Properties Found'}
            </h2>
            
            {/* Property type filters - only show when we have results */}
            {results.length > 0 && (
              <div className="filter-container">
                <p className="filter-label">Filter by:</p>
                <div className="filter-buttons">
                  {propertyTypes.map(type => (
                    <button 
                      key={type} 
                      className={`filter-button ${activeFilter === type ? 'active' : ''}`}
                      onClick={() => setActiveFilter(type)}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {error && <p className="error-message">Error: {error}</p>}
          
          {!loading && !error && results.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🏠</div>
              <p className="no-results-message">No properties found matching your criteria.</p>
              <p className="no-results-suggestion">Try adjusting your search filters or exploring different locations.</p>
            </div>
          )}
          
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching for properties...</p>
            </div>
          )}
          
          {!loading && !error && filteredResults.length > 0 && (
            <div className="results-grid">
              {filteredResults.map((property) => (
                <div 
                  key={property._id} 
                  className="property-card"
                >
                  <div className="property-image-container">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="property-image"/>
                    ) : (
                      <div className="property-image-placeholder">No image available</div>
                    )}
                    <div className="property-type-badge">{property.propertyType}</div>
                  </div>
                  <div className="property-details">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">
                      {formatLocation(property.location)}
                    </p>
                    <div className="property-info">
                      <p className="property-rooms">{property.rooms} {property.rooms === 1 ? 'Room' : 'Rooms'}</p>
                      {property.description && (
                        <p className="property-description">{property.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="property-footer">
                      <p className="property-price">${property.price} <span className="price-period">/ night</span></p>
                      <button className="view-details-button">View Details</button>
                    </div>
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="property-amenities">
                        <p className="amenities-title">Top amenities</p>
                        <div className="amenities-list">
                          {property.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="amenity-tag">{amenity}</span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="amenity-tag more-tag">+{property.amenities.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;