import React, { useState } from 'react';
import SearchBar from './components/SearchBar';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  propertyType: string;
}

export default function SearchPage() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters: any) => {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`http://localhost:3001/api/properties?${query}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
      <SearchBar onSearch={handleSearch} />

      </div>

      {loading && <p className="mt-4 text-gray-600">Searching...</p>}

      <div className="mt-6 space-y-4">
        {results.map((property) => (
          <div key={property.id} className="property-card">
            <h2 className="text-xl font-semibold text-pink-700">{property.title}</h2>
            <p className="text-sm text-gray-600">{property.location}</p>
            <p className="text-sm text-gray-800">${property.price} / night</p>
            <p className="text-sm text-gray-500 italic">{property.propertyType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
