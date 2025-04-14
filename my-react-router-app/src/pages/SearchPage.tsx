import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

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
    // Replace with your actual API endpoint
    // For example: `http://localhost:3001/api/properties?${query}`
    // Make sure to handle CORS if you're calling a different domain or port
    const res = await fetch(`http://localhost:3001/api/properties?${query}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Find your stay 🏡</h1>
      <SearchBar onSearch={handleSearch} />

      {loading && <p className="mt-4">Searching...</p>}

      <div className="mt-6 space-y-4">
        {results.map((property) => (
          <div key={property.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{property.title}</h2>
            <p className="text-sm text-gray-600">{property.location}</p>
            <p className="text-sm text-gray-800">${property.price} / night</p>
            <p className="text-sm text-gray-500 italic">{property.propertyType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

