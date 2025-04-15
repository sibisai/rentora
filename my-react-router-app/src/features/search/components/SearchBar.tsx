import React, { useState } from 'react';

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

// 
  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-4">
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* location */}
        <input
          name="location"
          placeholder="Location"
          className="border p-2 rounded"
          value={filters.location}
          onChange={handleChange}
        />
        {/* date */}
        <input
          type="date"
          name="checkIn"
          className="border p-2 rounded"
          value={filters.checkIn}
          onChange={handleChange}
        />
        <input
          type="date"
          name="checkOut"
          className="border p-2 rounded"
          value={filters.checkOut}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* cost */}
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          className="border p-2 rounded"
          value={filters.minPrice}
          onChange={handleChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          className="border p-2 rounded"
          value={filters.maxPrice}
          onChange={handleChange}
        />
        <select
          name="propertyType"
          className="border p-2 rounded"
          value={filters.propertyType}
          onChange={handleChange}
        >
            {/* types of housing */}
          <option value="">Property Type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="cabin">Cabin</option>
          <option value="studio">Studio</option>
          <option value="villa">Villa</option>
          <option value="townhouse">Townhouse</option>
          <option value="condo">Condo</option>
          <option value="loft">Mansion</option>
        </select>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}
