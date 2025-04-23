// src/features/property/pages/PropertyListPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate }   from 'react-router-dom';
import { getHostProperties, deleteProperty } from '../propertyService';
import PropertyCard     from '../components/PropertyCard';
import type { Property } from '../types'
import { useAuth }       from '../../auth/AuthContext'

export default function PropertyListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string>()

  const fetchProperties = async () => {
    if (!user) { setError('You must be logged in.'); return }
    setLoading(true)
    try   { setProperties(await getHostProperties(user.id)) }
    catch { setError('Failed to load your listings.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProperties() }, [user])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return
    await deleteProperty(id)
    fetchProperties()
  }

  return (
  <div className="host-dashboard" >
    {/* ─── header + button ─── */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <h1 className="text-3xl font-bold">Your Listings</h1>
      <button
        className="btn-primary"
        onClick={() => navigate('/host/properties/new')}
      >
        + New Listing
      </button>
    </div>

      {loading && <p>Loading…</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p className="text-gray-600">No listings yet.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <section className="property-section bg-transparent p-0">
          {/* reuse the exact same grid you have on HomePage */}
          <div className="property-grid">
            {properties.map(p => (
              <PropertyCard
                key={p._id}
                property={p}
                onEdit={id => navigate(`/host/properties/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}