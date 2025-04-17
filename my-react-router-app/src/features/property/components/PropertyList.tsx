// src/features/property/components/PropertyList.tsx
import React from 'react';
import type { Property } from '../types';

type Props = {
  properties: Property[];
  onEdit:   (id: string) => void;
  onDelete: (id: string) => void;
};

export default function PropertyList({ properties, onEdit, onDelete }: Props) {
  if (!properties.length) return <p>No listings yet.</p>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Rooms</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {properties.map(p => (
          <tr key={p._id}>
            <td>{p.title}</td>
            <td>${p.price}</td>
            <td>{p.rooms}</td>
            <td className="space-x-2">
              <button onClick={() => onEdit(p._id!)} className="btn-secondary">
                Edit
              </button>
              <button
                onClick={() => onDelete(p._id!)}
                className="btn-danger"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}