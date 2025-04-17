// src/features/property/pages/EditPropertyPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams }     from 'react-router-dom'
import PropertyForm                   from '../components/PropertyForm'
import { getProperty, updateProperty }from '../propertyService'
import type { FormValues }            from '../types'
import { useAuth }                    from '../../auth/AuthContext'
import '../styles/property-forms.css'

const EditPropertyPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>()
  const nav      = useNavigate()
  const { user } = useAuth()

  const [initialData, setInitialData] = useState<FormValues & { _id: string } | null>(null)
  const [loading,    setLoading]     = useState(true)
  const [error,      setError]       = useState<string>()

// put this just above the useEffect (or in ../types if you prefer)
type LocationFromAPI = {
  address?:  string
  city?:     string
  state?:    string
  zip?:      string
  country?:  string
  coordinates?:
    | [number, number]                        // already flat
    | { type: 'Point'; coordinates: [number, number] }  // GeoJSON
}

useEffect(() => {
  if (!id) return;

  getProperty(id)
    .then(prop => {
      const loc = (prop.location ?? {}) as LocationFromAPI

      const raw = loc.coordinates
      const point: [number, number] =
        Array.isArray(raw)
          ? raw                       // already [lng, lat]
          : (raw as any)?.coordinates ?? [0, 0]

      setInitialData({
        _id:          prop._id ?? id,
        title:        prop.title,
        description:  prop.description,
        price:        prop.price,
        rooms:        prop.rooms,
        propertyType: prop.propertyType,
        amenities:    prop.amenities ?? [],
        images:       prop.images    ?? [],
        hostId:       prop.hostId,
        location: {
          address : loc.address  ?? '',
          city    : loc.city     ?? '',
          state   : loc.state    ?? '',
          zip     : loc.zip      ?? '',
          country : loc.country  ?? '',
          coordinates: point,           // ✅ flat tuple
        },
      })
    })
    .catch(() => setError('Could not load this listing.'))
    .finally(() => setLoading(false))
}, [id])

  const handleSave = async (values: FormValues) => {
    // we've already guarded id with ! in useEffect, but still check user
    if (!id || !user) return

    // assert id is string with !
    await updateProperty(id!, { ...values, hostId: user.id })
    nav('/host/properties')
  }

  if (loading)      return <p>Loading…</p>
  if (error)        return <p className="text-red-500">{error}</p>
  if (!initialData) return null

  return (
    <div className="page-container">
      <div className="card">
        <h1>Edit Listing</h1>
        <PropertyForm initialValues={initialData} onSubmit={handleSave} />
      </div>
    </div>
  )
}

export default EditPropertyPage