import React, { useState, useRef, useCallback } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import './SearchBar.css';


export interface SearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // Optional: radius in miles
  checkIn: string;
  checkOut: string;
  minPrice: string; // Send as strings for URL params
  maxPrice: string;
  propertyType: string;
}

// --- Props for the SearchBar component ---
interface SearchBarProps {
  onSearch: (params: SearchParams) => void; // Expects the SearchParams object
}

// --- Google Maps Libraries needed ---
const libraries: ('places')[] = ['places'];

export default function SearchBar({ onSearch }: SearchBarProps) {
  // --- State for individual filter fields ---
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [minPrice, setMinPrice] = useState(''); // Use strings for input values
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isMaxPriceInvalid, setIsMaxPriceInvalid] = useState(false); // State to track invalid max price

  // --- State specifically for the location selected via Autocomplete ---
  const [selectedLocation, setSelectedLocation] = useState<{
    lat?: number;
    lng?: number;
    address?: string; // Optional: store formatted address
  }>({});

  // --- Refs for Autocomplete interaction ---
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input field

  // --- Load Google Maps API Script ---
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "", // Get key from environment
    libraries: libraries,
  });

  // --- Callback when Autocomplete library loads ---
  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocompleteInstance;
  }, []);

  // --- Callback when a place is selected from Autocomplete dropdown ---
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        // Valid place selected, update state
        setSelectedLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        });
        // Update the input field visually (optional but good UX)
         if (inputRef.current && place.formatted_address) {
            inputRef.current.value = place.formatted_address;
         }
      } else {
        // Invalid place or no geometry, clear location state
        console.log('Selected place does not have geometry.');
        setSelectedLocation({});
        if (inputRef.current) {
           inputRef.current.value = ''; // Clear input field too
        }
      }
    }
  };

  // --- Function triggered when the Search button is clicked ---
  const handleSearch = () => {
    // Basic date validation
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    // Construct the parameters object to send to SearchPage
    const searchParams: SearchParams = {
      checkIn,
      checkOut,
      minPrice: minPrice || "0", // Default if empty
      maxPrice: maxPrice || "10000", // Default if empty, adjust as needed
      propertyType,
    };

    // Add location data ONLY if a valid place was selected
    if (selectedLocation.lat && selectedLocation.lng) {
      searchParams.latitude = selectedLocation.lat;
      searchParams.longitude = selectedLocation.lng;
      searchParams.radius = 15; // Set a default search radius (e.g., 15 miles)
    } else if (inputRef.current?.value) {
        // Handle case where user typed but didn't select a valid place
        alert("Please select a location from the suggestions.");
        return; // Stop the search if location typed but not selected
    }

    // Call the onSearch prop passed down from SearchPage
    onSearch(searchParams);
  };

  // --- Render loading/error states for Google Maps ---
  if (loadError) {
    return <div>Error loading map services. Please check your API key and internet connection.</div>;
  }

  // --- Main Render ---
  return (
    <div className="search-bar">
      <h2 className="search-title">Find your stay</h2>

      <div className="search-row">
        {/* Location Input with Autocomplete */}
        <div className="search-field location-field">
          <label className="search-label">Location</label>
          {isLoaded ? (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              // Configure Autocomplete options (e.g., restrict search area)
              // options={{ componentRestrictions: { country: "us" } }}
            >
              <input
                type="text"
                ref={inputRef}
                placeholder="Where to?"
                className="search-input"
                // Clear selected location if user manually deletes input text
                onChange={(e) => {
                  if (e.target.value === '') {
                    setSelectedLocation({});
                  }
                }}
              />
            </Autocomplete>
          ) : (
            <input type="text" placeholder="Loading location search..." className="search-input" disabled />
          )}
        </div>

        {/* Check-In Date */}
        <div className="search-field">
          <label className="search-label">Check-In</label>
          <input
            type="date"
            name="checkIn"
            className="search-input"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
          />
        </div>

        {/* Check-Out Date */}
        <div className="search-field">
          <label className="search-label">Check-Out</label>
          <input
            type="date"
            name="checkOut"
            className="search-input"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]} // Min is check-in or today
          />
        </div>
      </div>

      <div className="search-row">
        {/* Min Price(only positive numbers (and only nubmers) */}
      <div className="search-field">
        <label className="search-label">Min Price ($)</label>
        <input
          type="text"
          name="minPrice"
          placeholder="0"
          className="search-input"
          value={minPrice}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setMinPrice(value);
            }
          }}
        />
      </div>

      {/* Max Price (only positive numbers (and only nubmers)) */}
      <div className="search-field">
        <label className="search-label">Max Price ($)</label>
        <input
          type="text"
          name="maxPrice"
          placeholder="Any"
          // className="search-input"
          value={maxPrice}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow positive numbers
            if (/^\d*$/.test(value)) {
              setMaxPrice(value);
              const min = parseInt(minPrice || '0');
              const max = parseInt(value || '0');
              setIsMaxPriceInvalid(max < min);
            }
          }}
          className={`search-input ${isMaxPriceInvalid ? 'input-error' : ''}`}
        />
      </div>

        {/* Property Type */}
        <div className="search-field">
          <label className="search-label">Property Type</label>
          <select
            name="propertyType"
            className="search-input"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="">Any</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Cabin">Cabin</option>
            <option value="Studio">Studio</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Condo">Condo</option>
            <option value="Loft">Loft</option>
            <option value="Mansion">Mansion</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button className="search-button" onClick={handleSearch} disabled={!isLoaded}>
        {isLoaded ? 'Search' : 'Loading...'}
      </button>
    </div>
  );
}