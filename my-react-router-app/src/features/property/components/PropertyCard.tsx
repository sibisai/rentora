import React from 'react'
import type { Property } from '../types'
import placeholderImg from '../../../assets/images/property.jpg'

type Props = {
  property: Property
  onEdit:   (id: string) => void
  onDelete: (id: string) => void
}

export default function PropertyCard({ property, onEdit, onDelete }: Props) {
  const imgSrc = property.images?.[0] || placeholderImg

  return (
    <div className="property-card flex flex-col overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow">
      <img
        src={imgSrc}
        alt={property.title}
        className="h-48 w-full object-cover"
      />
      <div className="property-info flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
        <div className="flex-1 text-gray-600 mb-4">
          <p>${property.price.toLocaleString()} / night</p>
          <p>{property.rooms} {property.rooms === 1 ? 'room' : 'rooms'}</p>
        </div>
        <div className="mt-auto flex space-x-2">
          <button
            onClick={() => onEdit(property._id!)}
            className="btn-secondary flex-1"
          >Edit</button>
          <button
            onClick={() => onDelete(property._id!)}
            className="btn-danger flex-1"
          >Delete</button>
        </div>
      </div>
    </div>
  )
}