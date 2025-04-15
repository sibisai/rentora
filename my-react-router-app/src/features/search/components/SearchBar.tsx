import React, { useState } from 'react';
import './SearchBar.css';

interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
}

export default function SearchBar({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    minPrice: 0,
    maxPrice: 1000,
    propertyType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="search-bar">
      <h2 className="search-title">Find your stay</h2>
  
      <div className="search-row">
        <div className="search-field">
          <label className="search-label">Location</label>
          <input
            name="location"
            placeholder="Where to?"
            className="search-input"
            value={filters.location}
            onChange={handleChange}
          />
        </div>
        <div className="search-field">
          <label className="search-label">Check-In</label>
          <input
            type="date"
            name="checkIn"
            className="search-input"
            value={filters.checkIn}
            onChange={handleChange}
          />
        </div>
        <div className="search-field">
          <label className="search-label">Check-Out</label>
          <input
            type="date"
            name="checkOut"
            className="search-input"
            value={filters.checkOut}
            onChange={handleChange}
          />
        </div>
      </div>
  
      <div className="search-row">
        <div className="search-field">
          <label className="search-label">Min Price</label>
          <input
            type="number"
            name="minPrice"
            placeholder="0"
            className="search-input"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </div>
        <div className="search-field">
          <label className="search-label">Max Price</label>
          <input
            type="number"
            name="maxPrice"
            placeholder="1000"
            className="search-input"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>
        <div className="search-field">
          <label className="search-label">Property Type</label>
          <select
            name="propertyType"
            className="search-input"
            value={filters.propertyType}
            onChange={handleChange}
          >
            <option value="">Select type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="cabin">Cabin</option>
            <option value="studio">Studio</option>
            <option value="villa">Villa</option>
            <option value="townhouse">Townhouse</option>
            <option value="condo">Condo</option>
            <option value="loft">Loft</option>
            <option value="mansion">Mansion</option>
          </select>
        </div>
      </div>
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
  );  

}
