// src/features/property/pages/PropertyDetailsPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../../components/Header'
import { getProperty } from '../propertyService'
import type { Property } from '../types'
import '../styles/PropertyDetailsPage.css'

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isSingleOpen, setIsSingleOpen] = useState(false)
  const [modalImg, setModalImg] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const p = await getProperty(id)
        setProperty(p)
      } catch (err: any) {
        setError('Could not load property.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const openSingle = (img: string) => {
    setModalImg(img)
    setIsSingleOpen(true)
  }
  const openGallery = () => setIsGalleryOpen(true)
  const closeAll = () => {
    setIsSingleOpen(false)
    setIsGalleryOpen(false)
  }

  if (loading) return <p className="text-center mt-8">Loading…</p>
  if (error)   return <p className="text-center mt-8 text-red-500">{error}</p>
  if (!property) return null

  const images = property.images?.length ? property.images : [property.images?.[0] || '']

  return (
    <>
      <Header />

      <section className="property-section">
        <div className="property-header-row">
          <h2 className="property-title">{property.title}</h2>
        </div>

        <div className="property-gallery-wrapper">
          <div className="main-photo" onClick={() => openSingle(images[0])}>
            <img src={images[0]} alt="Main" />
          </div>

          <div className="grid-photo-group">
            {images.slice(1, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Photo ${i + 1}`}
                onClick={() => openSingle(img)}
              />
            ))}
            {images.length > 4 && (
              <div className="photo-with-button">
                <img
                  src={images[4]}
                  alt="Photo 5"
                  onClick={() => openSingle(images[4])}
                />
                <button className="show-all-btn" onClick={openGallery}>
                  Show all photos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Single Image Modal */}
        {isSingleOpen && (
          <div className="modal-overlay" onClick={closeAll}>
            <img src={modalImg} alt="Full View" className="modal-img" />
          </div>
        )}

        {/* Full Gallery Modal */}
        {isGalleryOpen && (
          <div className="gallery-overlay">
            <div className="gallery-header">
              <button className="close-gallery" onClick={closeAll}>
                ×
              </button>
            </div>
            <div className="gallery-grid">
              {images.map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx}`} />
              ))}
            </div>
          </div>
        )}

        <div className="property-info">
          <h3>
            Entire home in{' '}
            {property.location.city}, {property.location.state}
          </h3>
          <h5>
            {property.description}
          </h5>
          <p>
            {property.rooms} rooms
          </p>

          <strong>What this place offers:</strong>
          <ul>
            {property.amenities?.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          <div className="price-box">
            ${property.price.toLocaleString()} per night
          </div>

          <button className="nav-button mt-4">Reserve</button>
        </div>
      </section>
    </>
  )
}