import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import SearchBar, { type SearchParams } from './components/SearchBar';
import './SearchPage.css'; // Import the new CSS file

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

// --- Map Configuration ---
const mapContainerStyle = {
  width: '100%',
  height: '100%', // Map will fill its container height
};

const defaultCenter = {
  lat: 33.6846, // Irvine, CA default
  lng: -117.8265
};

// Define map options for a cleaner look
const mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
};

const libraries: ("places")[] = ['places'];

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- Ref to store map instance ---
  const mapRef = useRef<google.maps.Map | null>(null);

  // --- Load Google Maps API ---
  const { isLoaded, loadError: mapLoadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY || "",
    libraries,
  });
  
  // --- Callback to get map instance ---
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map; // Store the map instance
  }, []);

  // --- Callback for map cleanup ---
  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // --- handleSearch function ---
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

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

      // --- Auto Zoom/Center Logic (Fit Bounds) ---
      if (mapRef.current && data.length > 0) {
        if (data.length === 1) {
          // If only one result, center on it with a reasonable zoom
          mapRef.current.setCenter({
            lat: data[0].location.coordinates.coordinates[1],
            lng: data[0].location.coordinates.coordinates[0]
          });
          mapRef.current.setZoom(14); // Zoom level for single result
        } else {
          // If multiple results, calculate bounds and fit
          const bounds = new google.maps.LatLngBounds();
          data.forEach((property: Property) => {
            bounds.extend({
              lat: property.location.coordinates.coordinates[1],
              lng: property.location.coordinates.coordinates[0]
            });
          });
          mapRef.current.fitBounds(bounds);
        }
      } else if (mapRef.current) {
         // No results, reset map view
         mapRef.current.setCenter(defaultCenter);
         mapRef.current.setZoom(11); // Reset zoom
      }

    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- State for selected marker (for InfoWindow) ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // --- Main Render ---
  return (
    <div className="search-page-container">
      {/* Header with navigation */}
      <header className="search-page-header">
        <nav className="search-page-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/search" className="nav-link active">Search</a>
          <a href="/login" className="nav-link">Login</a>
        </nav>
      </header>

      {/* Search Bar Section */}
      <section className="search-bar-container">
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Main Content Area (Map + Results) */}
      <main className="search-content">
        {/* Map Container */}
        <div className="map-container">
          {mapLoadError && <div className="map-error">Error loading map.</div>}
          {!isLoaded && !mapLoadError && <div className="map-loading">Loading Map...</div>}
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={11}
              options={mapOptions}
              onLoad={onMapLoad}
              onUnmount={onMapUnmount}
            >
              {results.map((property) => (
                <Marker
                  key={property._id}
                  position={{
                    lat: property.location.coordinates.coordinates[1],
                    lng: property.location.coordinates.coordinates[0]
                  }}
                  title={property.title}
                  onClick={() => {
                    setSelectedProperty(property);
                    mapRef.current?.panTo({
                      lat: property.location.coordinates.coordinates[1],
                      lng: property.location.coordinates.coordinates[0]
                    });
                    console.log("Clicked property:", property.title);
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        {/* Results Container */}
        <div className="results-container">
          <h2 className="results-title">
            {loading ? 'Searching...' : 
             error ? 'Error' :
             results.length > 0 ? `${results.length} Properties Found` : 'No Properties Found'}
          </h2>
          
          {error && <p className="error-message">Error: {error}</p>}
          
          {!loading && !error && results.length === 0 && (
            <p className="no-results-message">No properties found matching your criteria. Try adjusting your search filters.</p>
          )}
          
          {!loading && !error && results.length > 0 && (
            <div className="results-grid">
              {results.map((property) => (
                <div 
                  key={property._id} 
                  className="property-card"
                  onClick={() => {
                    setSelectedProperty(property);
                    mapRef.current?.panTo({
                      lat: property.location.coordinates.coordinates[1],
                      lng: property.location.coordinates.coordinates[0]
                    });
                  }}
                >
                  {property.images && property.images.length > 0 && (
                    <img src={property.images[0]} alt={property.title} className="property-image"/>
                  )}
                  <div className="property-details">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">{property.location.city}, {property.location.state}</p>
                    <p className="property-price">${property.price} <span className="price-period">/ night</span></p>
                    <p className="property-type">{property.propertyType} · {property.rooms} Rooms</p>
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
