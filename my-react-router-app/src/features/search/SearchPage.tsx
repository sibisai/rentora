import React, { useState, useEffect } from 'react'; // Added useEffect for potential initial load
import SearchBar, { type SearchParams } from './components/SearchBar'; // Import SearchParams type

// --- Updated Property Interface to match backend schema ---
// This anticipates the data structure you WILL receive after backend updates
interface Property {
  _id: string; // Use _id from MongoDB
  title: string;
  description: string; // Added description
  location: { // Nested location object
    address?: string;
    city: string;
    state: string;
    zip?: string;
    country?: string;
    // coordinates might be present but not directly displayed here
  };
  price: number;
  images?: string[];
  amenities?: string[];
  propertyType: string;
  rooms: number; // Added rooms
  // Add other fields like hostId if needed for display
}

export default function SearchPage() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State to hold potential errors

  // --- handleSearch now accepts the SearchParams object ---
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null); // Clear previous errors
    setResults([]); // Clear previous results

    // Remove undefined fields before creating query string
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);


    const query = new URLSearchParams(cleanParams).toString();
    console.log("Frontend sending query:", query); // Log the actual query string being sent

    try {
      const res = await fetch(`http://localhost:3001/properties?${query}`);

      if (!res.ok) {
        // Try to parse error message from backend if available
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      // Basic check if the response is an array
      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        throw new Error("Received invalid data format from server.");
      }

      console.log("Data received:", data);
      setResults(data);

    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        {/* Pass the updated handleSearch function */}
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* --- Display Loading, Error, or No Results --- */}
      {loading && <p className="mt-4 text-center text-gray-600">Searching...</p>}
      {error && <p className="mt-4 text-center text-red-600">Error: {error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="mt-4 text-center text-gray-500">No properties found matching your criteria.</p>
      )}

      {/* --- Display Search Results --- */}
      {!loading && !error && results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Example grid layout */}
          {results.map((property) => (
            // Use property._id for the key
            <div key={property._id} className="property-card border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Display first image if available */}
              {property.images && property.images.length > 0 && (
                <img src={property.images[0]} alt={property.title} className="w-full h-48 object-cover" />
              )}
              {/* Card Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate mb-1">{property.title}</h2>
                {/* Updated location display */}
                <p className="text-sm text-gray-600 mb-1">{property.location.city}, {property.location.state}</p>
                <p className="text-base font-medium text-gray-900 mb-2">${property.price} <span className="text-sm font-normal text-gray-500">/ night</span></p>
                <p className="text-xs text-gray-500 italic">{property.propertyType} - {property.rooms} Rooms</p>
                {/* Optional: Display amenities */}
                {/* {property.amenities && property.amenities.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                        {property.amenities.join(', ')}
                    </p>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}