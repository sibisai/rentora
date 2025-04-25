// src/features/home/Home.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/index.css'
import propertyImage from '../../assets/images/property.jpg'
import SearchBar, { type SearchParams } from '../search/components/SearchBar'
import Header from '../../components/Header'

interface Property {
  _id: string
  title: string
  description: string
  location: {
    address?: string
    city: string
    state: string
    zip?: string
    country?: string
    coordinates: {
      type: 'Point'
      coordinates: [number, number]
    }
  }
  price: number
  images?: string[]
  amenities?: string[]
  propertyType: string
  rooms: number
  hostId?: string
  createdAt?: string
  updatedAt?: string
}

const API = import.meta.env.VITE_API_URL;

function formatLocation(location: Property['location']): string {
  const { city, state, country } = location
  const c = city.trim(), s = state.trim()
  if (c.toLowerCase() === s.toLowerCase()) {
    if (country && country.trim().toLowerCase() !== c.toLowerCase()) {
      return `${c}, ${country}`
    }
    return c
  }
  return `${c}, ${s}`
}

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Fetch helper: optional `query` to append to the URL
  const fetchAndSet = useCallback(async (query?: string) => {
    setLoading(true)
    setError('')
    try {
      const url = query
        ? `${API}/properties?${query}`
        : `${API}/properties`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data: Property[] = await res.json()
      setProperties(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount, fetch all properties
  useEffect(() => {
    fetchAndSet()
  }, [fetchAndSet])

  // Called by SearchBar → builds a query string and re-fetches
  const handleSearch = (params: SearchParams) => {
    // drop empty values
    const clean: Record<string,string> = {}
    Object.entries(params).forEach(([k,v]) => {
      if (v != null && v !== '') clean[k] = String(v)
    })
    const qs = new URLSearchParams(clean).toString()
    fetchAndSet(qs)
  }

  return (
    <div>
      <Header />

      <div className="hero">
        <div className="hero-overlay">
          <div className="button-links">
            <button
              className="cssbuttons-io"
              onClick={() => setShowSearch(v => !v)}
            >
              <span>
                Start Your Search
                <svg viewBox="0 0 19.9 19.7" xmlns="http://www.w3.org/2000/svg"
                     className="svg-icon search-icon">
                  <title>Search Icon</title>
                  <g stroke="white" fill="none">
                    <path d="M18.5 18.3l-5.4-5.4" strokeLinecap="square" />
                    <circle r="7" cy="8" cx="8" />
                  </g>
                </svg>
              </span>
            </button>
          </div>
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
          <p>Loading properties…</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="property-grid">
            {properties.map(p => (
              <Link
                key={p._id}
                to={`/properties/${p._id}`}
                className="property-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={p.images?.[0] ?? propertyImage}
                  alt={p.title}
                />
                <div className="property-info">
                  <h3>{formatLocation(p.location)}</h3>
                  <p>{p.description}</p>
                  <p className="price">
                    <span className="price-amount">
                      ${p.price.toLocaleString()}
                    </span> per night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home